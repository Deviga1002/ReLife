import { useEffect, useState } from 'react';
import { getMyRewards, getLeaderboard } from '../services/api';
import { Award, Trophy, Leaf } from 'lucide-react';

const Rewards = () => {
  const [data, setData] = useState(null);
  const [board, setBoard] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyRewards(), getLeaderboard({ limit: 20 })])
      .then(([r, l]) => {
        setData(r.data.data);
        setBoard(l.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="container empty-state"><p>Could not load rewards</p></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Rewards</h1>
        <p>Points, badges & community leaderboard</p>
      </div>

      <div className="grid grid-3 mb-4">
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Award size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{data.points}</p>
          <p className="text-muted">Current Points</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Leaf size={28} color="#16a34a" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{data.totalEarned}</p>
          <p className="text-muted">Total Earned</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <Trophy size={28} color="#0f766e" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{data.currentBadge?.name || 'No badge yet'}</p>
          <p className="text-muted">
            {data.nextBadge ? `Next: ${data.nextBadge.name} (${data.pointsToNext} pts)` : 'Max tier'}
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {['overview', 'history', 'leaderboard', 'badges'].map((t) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <p className="text-muted mb-2">
            Points are awarded only after verified completed activities (donations, recycle, verified pickups). Creating a listing alone does not earn points.
          </p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Completed donation: 100 pts (owner)</li>
            <li>Completed recycle: 80 pts</li>
            <li>Completed repair: 50 pts</li>
            <li>Verified pickup: +10 bonus</li>
          </ul>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          {data.history?.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No points earned yet. Complete sustainable activities to earn rewards.</p></div>
          ) : (
            data.history.map((h) => (
              <div key={h._id} className="flex-between" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight: 500 }}>{h.description}</p>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(h.createdAt).toLocaleString()} · {h.type}</p>
                </div>
                <span style={{ fontWeight: 700, color: h.points > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                  {h.points > 0 ? '+' : ''}{h.points}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="card">
          {board.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No rankings yet.</p></div>
          ) : (
            board.map((row) => (
              <div key={row.id} className="flex-between" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                  <span className="badge badge-green">#{row.rank}</span>
                  <div>
                    <strong>{row.name}</strong>
                    {row.badge && <p className="text-muted" style={{ fontSize: '0.8rem' }}>{row.badge}</p>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{row.points} pts</strong>
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>{row.activityCount} activities</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'badges' && (
        <div className="grid grid-3">
          {data.allBadges?.map((b) => {
            const earned = data.earnedKeys?.includes(b.key);
            return (
              <div key={b.key} className="card" style={{ padding: '1.25rem', opacity: earned ? 1 : 0.55, borderColor: earned ? 'var(--primary)' : undefined }}>
                <Trophy size={24} color={earned ? '#f59e0b' : '#94a3b8'} style={{ marginBottom: 8 }} />
                <strong>{b.name}</strong>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{b.description}</p>
                {b.minPoints > 0 && <p style={{ fontSize: '0.8rem' }}>{b.minPoints}+ points</p>}
                {earned && <span className="badge badge-green mt-1">Earned</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Rewards;
