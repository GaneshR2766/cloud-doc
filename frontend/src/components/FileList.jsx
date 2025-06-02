import { useState, useEffect } from 'react';
import axios from 'axios';
import shareIcon from "../assets/share.png";
import eyeIcon from "../assets/eye.png";
import recycleBinIcon from "../assets/recycle-bin.png";
import shareFolderIcon from "../assets/sharefolder.png";
import cancelIcon from "../assets/cancel.png";
import imageIcon from "../assets/image.png";
import videoIcon from "../assets/video.png";
import wordpdfIcon from "../assets/wordpdf.png";
import audioIcon from "../assets/audio.png";
import zipIcon from "../assets/zip.png";
import otherdocIcon from "../assets/otherdoc.png";

function FileList({ refreshKey, token }) {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  const fetchFiles = () => {
    axios
      .get('http://127.0.0.1:5000/files', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const fetched = response.data.files || [];
        setFiles(fetched);
        setMessage(fetched.length ? '' : 'No files found');
      })
      .catch(() => {
        setFiles([]);
        setMessage('Failed to fetch files');
      });
  };

  const getIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return imageIcon;
    if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) return videoIcon;
    if (['pdf', 'doc', 'docx'].includes(ext)) return wordpdfIcon;
    if (['mp3', 'wav'].includes(ext)) return audioIcon;
    if (['zip', 'rar', '7z'].includes(ext)) return zipIcon;
    return otherdocIcon;
  };

  const downloadFile = (filename) => {
    axios
      .get(`http://127.0.0.1:5000/download/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.url) window.open(res.data.url, '_blank');
        else alert('Failed to get download link');
      })
      .catch(() => alert('Download failed'));
  };

  const previewFile = (filename) => {
    axios
      .get(`http://127.0.0.1:5000/preview/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.url) window.open(res.data.url, '_blank');
        else alert('Failed to get preview link');
      })
      .catch(() => alert('Preview failed'));
  };

  const deleteFile = (filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;
    axios
      .delete(`http://127.0.0.1:5000/files/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(fetchFiles)
      .catch(() => alert('Delete failed'));
  };

  const clearAccesses = () => {
    if (!window.confirm('Are you sure you want to clear all shared accesses?')) return;
    axios
      .delete('http://127.0.0.1:5000/clear-shared-accesses', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => alert(res.data.message))
      .catch(() => alert('Failed to clear shared accesses'));
  };

  const shareFile = (filename) => {
    axios
      .get(`http://127.0.0.1:5000/download/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.url) {
          navigator.clipboard.writeText(res.data.url);
          alert('Share Link copied to clipboard!\nLink will expire in 24 hours');
        } else {
          alert('Failed to generate shareable link');
        }
      })
      .catch(() => alert('Sharing failed'));
  };

  const shareFolder = () => {
    if (!shareEmail.trim()) {
      setShareMsg('Please enter a valid email');
      return;
    }
    axios
      .post(
        'http://127.0.0.1:5000/share-folder',
        { shared_with_email: shareEmail.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setShareMsg(res.data.message || 'Folder shared'))
      .catch((err) => {
        const msg = err.response?.data?.error || 'Failed to share';
        setShareMsg(msg);
      });
  };

  useEffect(() => {
    if (token) fetchFiles();
  }, [token, refreshKey]);

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Your Files are Safe here</h2>
      <h3 style={{ marginBottom: '1rem' }}>To Download your files click them</h3>

      {/* Share Folder UI */}
      <div style={{ marginBottom: '1.5rem' }}>
<style>
  {`
  @keyframes glowPulse {
    0%, 100% {
      box-shadow: 0 0 8px 2px rgba(123, 63, 242, 0.8);
    }
    50% {
      box-shadow: 0 0 16px 6px rgba(123, 63, 242, 1);
    }
  }
  `}
</style>

<input
  type="email"
  placeholder="Enter email to share folder"
  value={shareEmail}
  onChange={(e) => setShareEmail(e.target.value)}
  style={{
    padding: '0.59rem 0.75rem',
    borderRadius: '6px',
    border: '2px solid #7B3FF2',        // electric purple border
    outline: 'none',
    marginRight: '0.5rem',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 0 6px rgba(123, 63, 242, 0.4)',  // subtle purple glow
    fontSize: '1rem',
    width: '280px',
  }}
  onFocus={e => {
    e.currentTarget.style.borderColor = '#5200d6'; // darker purple on focus
    e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(82, 0, 214, 0.7)'; // stronger purple glow on focus
  }}
  onBlur={e => {
    e.currentTarget.style.borderColor = '#7B3FF2';
    e.currentTarget.style.boxShadow = '0 0 6px rgba(123, 63, 242, 0.4)';
  }}
/>

<button
  onClick={shareFolder}
  style={{
    padding: '0.5rem 0.75rem',
    marginLeft:'0.5rem',
    background: 'linear-gradient(90deg, #7B3FF2 0%, #5200d6 100%)',  // purple gradient
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 0 8px 2px rgba(123, 63, 242, 0.8)', // bright purple glow
    transition: 'background 0.3s ease, box-shadow 0.6s ease-in-out',
    animation: 'glowPulse 2.5s ease-in-out infinite',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = 'linear-gradient(90deg, #5200d6 0%, #7B3FF2 100%)';
    e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(123, 63, 242, 1)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'linear-gradient(90deg, #7B3FF2 0%, #5200d6 100%)';
    e.currentTarget.style.boxShadow = '0 0 8px 2px rgba(123, 63, 242, 0.8)';
  }}
>
  Share Folder{' '}
  <img
    src={shareFolderIcon}
    alt="Share Folder"
    style={{ marginBottom: '-0.2rem', marginLeft: '0.3rem', width: '18px', height: '18px' }}
  />
</button>





        {shareMsg && <p style={{ marginTop: '0.5rem', color: '#666' }}>{shareMsg}</p>}
      </div>

      {/* Clear All Shared Accesses Button */}
<button
  onClick={clearAccesses}
  style={{
    marginBottom: '1.5rem',
    background: 'linear-gradient(90deg, #ff4d4d 0%, #cc0000 100%)', // red gradient
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 0 8px 2px rgba(255, 77, 77, 0.8)', // red glow
    transition: 'background 0.3s ease, box-shadow 0.6s ease-in-out',
    animation: 'glowPulseRed 2.5s ease-in-out infinite',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = 'linear-gradient(90deg, #cc0000 0%, #ff4d4d 100%)';
    e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(255, 77, 77, 1)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'linear-gradient(90deg, #ff4d4d 0%, #cc0000 100%)';
    e.currentTarget.style.boxShadow = '0 0 8px 2px rgba(255, 77, 77, 0.8)';
  }}
>
  Clear All Shared Accesses
  <img
    src={cancelIcon}
    alt="Cancel"
    style={{ marginLeft: '0.5rem', marginTop: '0.1rem', width: '18px', height: '18px' }}
  />
</button>

<style>
  {`
  @keyframes glowPulseRed {
    0%, 100% {
      box-shadow: 0 0 8px 2px rgba(255, 77, 77, 0.8);
    }
    50% {
      box-shadow: 0 0 16px 6px rgba(255, 77, 77, 1);
    }
  }
  `}
</style>


      {/* File list */}
      {files.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {files.map((f) => (
            <li
  key={f.name}
  style={{
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    border: '1px solid #eee',
    borderRadius: '8px',
    cursor: 'default',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.backgroundColor = '#f0f8ff'; // light blue bg on hover
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.3)';
    e.currentTarget.style.cursor = 'pointer'; // pointer cursor on hover over li
  }}
  onMouseLeave={e => {
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.boxShadow = '';
    e.currentTarget.style.cursor = 'default';
  }}
>
  <span
    style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center' }}
    onClick={() => downloadFile(f.name)}
    title="Click to download"
        onMouseEnter={e => {
      e.currentTarget.style.color = '#1890ff'; // blue text on hover
      const img = e.currentTarget.querySelector('img');
      if (img) {
        img.style.filter = 'brightness(1.2)'; // brighten icon
        img.style.transform = 'scale(1.1)'; // scale up icon slightly
        img.style.transition = 'transform 0.3s ease, filter 0.3s ease';
      }
      e.currentTarget.style.textDecoration = 'underline'; // underline text
    }}
    onMouseLeave={e => {
      e.currentTarget.style.color = '';
      const img = e.currentTarget.querySelector('img');
      if (img) {
        img.style.filter = '';
        img.style.transform = '';
      }
      e.currentTarget.style.textDecoration = 'none';
    }}
  >
    <img
      src={getIcon(f.name)}
      alt="file icon"
      style={{ width: '20px', height: '20px', verticalAlign: 'middle', marginRight: '8px' }}
    />
    <strong style={{color:'grey'}}>{f.name}</strong>
  </span>

  <span style={{ color: '#666', fontSize: '0.9rem', marginRight: '1rem' }}>
    {f.size} KB • {f.modified}
  </span>

  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <button
      onClick={() => previewFile(f.name)}
      style={{
        padding: '0.3rem 0.6rem',
        background: '#1890ff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 0 6px rgba(24, 144, 255, 0.6)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#1366cc';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(19, 102, 204, 0.9)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#1890ff';
        e.currentTarget.style.boxShadow = '0 0 6px rgba(24, 144, 255, 0.6)';
      }}
    >
      <img src={eyeIcon} alt="Preview" style={{ width: '16px', height: '16px' }} />
      Preview
    </button>

    <button
      onClick={() => shareFile(f.name)}
      style={{
        padding: '0.3rem 0.6rem',
        background: '#52c41a',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 0 6px rgba(82, 196, 26, 0.6)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#3e8e14';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(62, 142, 20, 0.9)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#52c41a';
        e.currentTarget.style.boxShadow = '0 0 6px rgba(82, 196, 26, 0.6)';
      }}
    >
      <img src={shareIcon} alt="Share" style={{ width: '16px', height: '16px' }} />
      Share
    </button>

    <button
      onClick={() => deleteFile(f.name)}
      style={{
        padding: '0.3rem 0.6rem',
        background: '#ff4d4f',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 0 6px rgba(255, 77, 79, 0.6)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#d9363e';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(217, 54, 62, 0.9)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#ff4d4f';
        e.currentTarget.style.boxShadow = '0 0 6px rgba(255, 77, 79, 0.6)';
      }}
    >
      <img src={recycleBinIcon} alt="Delete" style={{ width: '16px', height: '16px' }} />
      Delete
    </button>
  </div>
</li>

          ))}
        </ul>
      ) : (
        <p style={{ color: '#999' }}>{message || 'Loading files...'}</p>
      )}
    </div>
  );
}

export default FileList;
