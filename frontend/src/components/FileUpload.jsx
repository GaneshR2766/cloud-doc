import { useState } from 'react';
import axios from 'axios';
import uploadIcon from "../assets/upload.png";
import chooseIcon from "../assets/choose.png";




function FileUpload({ onUploadSuccess, token }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    axios
      .post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setMessage('Upload successful');
        onUploadSuccess();
      })
      .catch((error) => {
        console.error(error);
        setMessage('Upload failed');
      });
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div>
        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} />
<label
  htmlFor="fileInput"
  style={{
    backgroundColor: '#00308F', // vibrant dark blue
    color: '#fff',
    padding: '0.6rem 1.5rem',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 0 8px 2px rgba(0, 48, 143, 0.7)', // blue glow effect
    transition: 'box-shadow 0.3s ease',
  }}
  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(0, 48, 143, 1)'}
  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 8px 2px rgba(0, 48, 143, 0.7)'}
>
  Browse{' '}
  <img
    src={chooseIcon} // 👈 make sure this import exists
    alt="Choose"
    style={{
      width: '16px',
      height: '16px',
    }}
  />
</label>


<button
  onClick={handleUpload}
  style={{
    marginLeft: '1rem',
    backgroundColor: '#00308F', // same as Browse
    fontWeight: 'bold',
    color: '#fff',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 0 8px 2px rgba(0, 48, 143, 0.7)', // glow effect same color
    transition: 'box-shadow 0.3s ease',
  }}
  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(0, 48, 143, 1)')}
  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 8px 2px rgba(0, 48, 143, 0.7)')}
>
  Upload{' '}
  <img
    src={uploadIcon} // Make sure to import it at the top
    alt="Upload"
    style={{
      marginTop: '-2rem',
      paddingLeft: '0.2rem',
      width: '18px',
      height: '18px',
    }}
  />
</button>



      </div>

      <p style={{ color: '#038de3', fontWeight: 500, fontSize: '0.9rem' }}>
        {file ? file.name : 'No file chosen'}
      </p>
      <p
        style={{
          color: message.toLowerCase().includes('failed') ? 'red' : '#038de3',
          fontWeight: 'bold',
        }}
      >
        {message}
      </p>
    </div>
  );
}

export default FileUpload;
