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

const BASE_URL = 'https://cloud-doc-production.up.railway.app';

function FileList({ refreshKey, token }) {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  const fetchFiles = () => {
    axios
      .get(`${BASE_URL}/files`, {
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
      .get(`${BASE_URL}/download/${encodeURIComponent(filename)}`, {
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
      .get(`${BASE_URL}/preview/${encodeURIComponent(filename)}`, {
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
      .delete(`${BASE_URL}/files/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(fetchFiles)
      .catch(() => alert('Delete failed'));
  };

  const clearAccesses = () => {
    if (!window.confirm('Are you sure you want to clear all shared accesses?')) return;
    axios
      .delete(`${BASE_URL}/clear-shared-accesses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => alert(res.data.message))
      .catch(() => alert('Failed to clear shared accesses'));
  };

  const shareFile = (filename) => {
    axios
      .get(`${BASE_URL}/download/${encodeURIComponent(filename)}`, {
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
        `${BASE_URL}/share-folder`,
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
            border: '2px solid #7B3FF2',
            outline: 'none',
            marginRight: '0.5rem',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            boxShadow: '0 0 6px rgba(123, 63, 242, 0.4)',
            fontSize: '1rem',
            width: '280px',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#5200d6';
            e.currentTarget.style.boxShadow = '0 0 10px 2px rgba(82, 0, 214, 0.7)';
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
            background: 'linear-gradient(90deg, #7B3FF2 0%, #5200d6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 8px 2px rgba(123, 63, 242, 0.8)',
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
          background: 'linear-gradient(90deg, #ff4d4d 0%, #cc0000 100%)',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 0 10px 2px rgba(255, 77, 77, 0.8)',
          transition: 'background 0.3s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(90deg, #cc0000 0%, #ff4d4d 100%)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(90deg, #ff4d4d 0%, #cc0000 100%)';
        }}
      >
        Clear All Shared Accesses{' '}
        <img
          src={recycleBinIcon}
          alt="Clear Shared"
          style={{ marginBottom: '-0.2rem', marginLeft: '0.3rem', width: '18px', height: '18px' }}
        />
      </button>

      {/* File List Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <thead style={{ backgroundColor: '#7B3FF2', color: 'white' }}>
          <tr>
            <th style={{ padding: '10px' }}>File Name</th>
            <th>Preview</th>
            <th>Download</th>
            <th>Delete</th>
            <th>Share Link</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#555' }}>
                {message || 'Loading...'}
              </td>
            </tr>
          )}
          {files.map((file) => (
            <tr key={file} style={{ borderBottom: '1px solid #ddd' }}>
              <td
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
                onClick={() => downloadFile(file)}
                title={`Download ${file}`}
              >
                <img
                  src={getIcon(file)}
                  alt="File Icon"
                  style={{ width: '24px', height: '24px' }}
                />
                {file}
              </td>
              <td style={{ textAlign: 'center' }}>
                <button
                  onClick={() => previewFile(file)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Preview"
                >
                  <img src={eyeIcon} alt="Preview" style={{ width: '20px', height: '20px' }} />
                </button>
              </td>
              <td style={{ textAlign: 'center' }}>
                <button
                  onClick={() => downloadFile(file)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Download"
                >
                  <img src={shareIcon} alt="Download" style={{ width: '20px', height: '20px' }} />
                </button>
              </td>
              <td style={{ textAlign: 'center' }}>
                <button
                  onClick={() => deleteFile(file)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Delete"
                >
                  <img
                    src={recycleBinIcon}
                    alt="Delete"
                    style={{ width: '20px', height: '20px' }}
                  />
                </button>
              </td>
              <td style={{ textAlign: 'center' }}>
                <button
                  onClick={() => shareFile(file)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Copy Share Link"
                >
                  <img
                    src={shareIcon}
                    alt="Share"
                    style={{ width: '20px', height: '20px' }}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileList;
