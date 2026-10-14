import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getConversations, getMessages, sendMessage, startConversation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Chat = () => {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(conversationId || null);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  const loadConversations = () =>
    getConversations().then((res) => setConversations(res.data.data || [])).catch(() => {});

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));

    // Start conversation from product page
    const productId = searchParams.get('productId');
    const otherUserId = searchParams.get('otherUserId');
    if (productId && otherUserId) {
      startConversation({ productId, otherUserId })
        .then((res) => {
          setActive(res.data.data._id);
          navigate(`/chat/${res.data.data._id}`, { replace: true });
          loadConversations();
        })
        .catch((err) => toast.error(err.response?.data?.message || 'Could not start chat'));
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    getMessages(active).then((res) => setMessages(res.data.data || [])).catch(() => {});

    const token = localStorage.getItem('relife_token');
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;
    socket.emit('join_conversation', active);
    socket.on('new_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      loadConversations();
    });
    return () => {
      socket.emit('leave_conversation', active);
      socket.disconnect();
    };
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    try {
      const res = await sendMessage(active, text.trim());
      setMessages((prev) => [...prev, res.data.data]);
      setText('');
      loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Send failed');
    }
  };

  const otherName = (c) => {
    const other = c.participants?.find((p) => p._id !== user?.id && p._id !== user?._id);
    return other?.name || 'User';
  };

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1>Messages</h1>
      </div>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 480 }}>
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p>No conversations yet. Start from a product page.</p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => { setActive(c._id); navigate(`/chat/${c._id}`); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.875rem 1rem',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  background: active === c._id ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div className="flex-between">
                  <strong style={{ fontSize: '0.9rem' }}>{otherName(c)}</strong>
                  {c.unread > 0 && <span className="badge badge-green">{c.unread}</span>}
                </div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>{c.product?.name}</p>
                <p className="text-muted" style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMessage}
                </p>
              </button>
            ))
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!active ? (
            <div className="empty-state" style={{ flex: 1 }}><p>Select a conversation</p></div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {messages.map((m) => {
                  const mine = m.sender?._id === user?.id || m.sender?._id === user?._id || m.sender === user?.id;
                  return (
                    <div key={m._id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 12,
                        background: mine ? 'var(--primary)' : '#f1f5f9',
                        color: mine ? 'white' : 'inherit',
                      }}>
                        <p style={{ fontSize: '0.9rem' }}>{m.text}</p>
                        <p style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 2 }}>
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <input className="form-control" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
                <button type="submit" className="btn btn-primary">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 700px) { .card { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
};

export default Chat;
