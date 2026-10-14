import { useEffect, useCallback, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Professional "Continue with Google" button.
 * Uses Google Identity Services when VITE_GOOGLE_CLIENT_ID is set.
 * Shows the same UI when not configured; click then shows a helpful toast.
 */
const GoogleButton = ({ onSuccess, onError, text = 'Continue with Google', disabled = false }) => {
  const hiddenBtnRef = useRef(null);
  const initialized = useRef(false);

  const handleCredential = useCallback(
    (response) => {
      if (response?.credential && onSuccess) {
        onSuccess(response.credential);
      }
    },
    [onSuccess]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initialized.current) return;

    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
      });
      // Render a hidden official button we can programmatically click
      if (hiddenBtnRef.current) {
        window.google.accounts.id.renderButton(hiddenBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          type: 'standard',
        });
        initialized.current = true;
      }
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', init);
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = init;
        document.body.appendChild(script);
      }
    }
  }, [handleCredential]);

  const handleClick = () => {
    if (disabled) return;

    if (!GOOGLE_CLIENT_ID) {
      if (onError) {
        onError(
          'Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to frontend .env and GOOGLE_CLIENT_ID to backend .env.'
        );
      }
      return;
    }

    // Click the hidden Google button
    const iframeBtn = hiddenBtnRef.current?.querySelector('div[role="button"]');
    if (iframeBtn) {
      iframeBtn.click();
    } else if (window.google?.accounts?.id) {
      // Fallback: prompt One Tap / account chooser
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Try clicking again after short delay
          setTimeout(() => {
            const btn = hiddenBtnRef.current?.querySelector('div[role="button"]');
            if (btn) btn.click();
            else if (onError) onError('Could not open Google sign-in. Check Client ID and authorized origins.');
          }, 300);
        }
      });
    } else if (onError) {
      onError('Google script still loading. Please try again in a moment.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden GIS button for actual OAuth */}
      <div ref={hiddenBtnRef} style={{ position: 'absolute', left: -9999, opacity: 0, pointerEvents: 'none' }} />

      {/* Visible custom button matching sample design */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '10px 16px',
          background: '#ffffff',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: "'Roboto', 'Inter', system-ui, sans-serif",
          fontSize: '14px',
          fontWeight: 500,
          color: '#3c4043',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'background 0.15s, box-shadow 0.15s',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = '#f8f9fa';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        }}
      >
        {/* Official-style Google "G" logo */}
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
            fill="#EA4335"
          />
        </svg>
        <span>{text}</span>
      </button>
    </div>
  );
};

export default GoogleButton;
