import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import logo from './assets/logo.png';
import userIcon from './assets/user.png';
import logoutIcon from './assets/logout.png';
import { jwtDecode } from 'jwt-decode';


function App() {
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <GoogleOAuthProvider clientId="63389166319-2hlnfvdnpg2e2od34v6ma9c64ito2ne8.apps.googleusercontent.com">
      <div
        style={{
          position: 'relative',
          width: '1280px',
          minHeight: '100vh',
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
      >
        {/* Logo fixed at top left */}
        <div style={{ position: 'absolute', top: '0.5rem', left: '1rem' }}>
          <img
            src={logo}
            alt="CloudDoc Logo"
            style={{ width: '250px', height: 'auto' }}
          />
        </div>

        {/* Login / Logout fixed at top right */}
        <div
          style={{
            position: 'absolute',
            top: '0.8rem',
            right: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 1000,
          }}
        >
          {!token ? (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const idToken = credentialResponse.credential;
                const decoded = jwtDecode(idToken);
                setToken(idToken);
                setUserInfo(decoded);
                console.log('Logged in. User info:', decoded);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'grey',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src={userInfo?.picture || userIcon}
                  alt="User"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                  }}
                />
                <p
                  style={{
                    fontSize: '1.2rem',
                    color: 'white',
                    margin: 0,
                    fontWeight: '500',
                  }}
                >
                  {userInfo?.name || 'USER'}
                </p>
              </div>

              <button
                onClick={() => {
                  setToken(null);
                  setUserInfo(null);
                }}
                style={{
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  border: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 0 6px rgba(255, 77, 79, 0.6)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d93638';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(217, 54, 56, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff4d4f';
                  e.currentTarget.style.boxShadow = '0 0 6px rgba(255, 77, 79, 0.6)';
                }}
              >
                <img
                  src={logoutIcon}
                  alt="Logout"
                  style={{ width: '18px', height: '18px' }}
                />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Header Section */}
        <div style={{ textAlign: 'center', paddingTop: '0.2rem' }}>
          <h1
            style={{
              fontSize: '3.5rem',
              color: '#000',
              margin: '0 0 -0.2rem 0',
            }}
          >
            CloudDoc
          </h1>
          <p style={{ fontSize: '2rem', color: 'gray', margin: '0 1rem' }}>
            Smart & Secure File Storage
          </p>
        </div>

        {/* Main content: only when logged in */}
        {token && (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <FileUpload token={token} onUploadSuccess={handleUploadSuccess} />
            <hr style={{ margin: '2rem 0' }} />
            <FileList token={token} refreshKey={refreshKey} />
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
