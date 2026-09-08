import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function RiwayatKonsultasi() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await API.get('/consultation');
      setRecords(res.data);
    } catch (err) {
      console.error('Gagal ambil riwayat konsultasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = async (recordId, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));

    setUploadingId(recordId);
    try {
      await API.post(`/consultation/${recordId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchData();
    } catch (err) {
      console.error('Gagal upload file:', err);
      alert('Gagal upload file. Coba lagi.');
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Riwayat Konsultasi</h1>
        <p className="user-subgreeting">Catatan konsultasi kesehatanmu</p>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : records.length === 0 ? (
          <p className="empty-state">Belum ada riwayat konsultasi.</p>
        ) : (
          <div className="consult-list">
            {records.map((r) => (
              <div key={r._id} className="consult-card">
                <div className="consult-card-header">
                  <span className="consult-date">{new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  {r.doctorName && <span className="consult-doctor">dr. {r.doctorName}</span>}
                </div>
                <div className="consult-section">
                  <h4>Keluhan</h4>
                  <p>{r.complaint || '-'}</p>
                </div>
                <div className="consult-section">
                  <h4>Diagnosis</h4>
                  <p>{r.diagnosis || '-'}</p>
                </div>
                <div className="consult-section">
                  <h4>Rekomendasi</h4>
                  <p>{r.recommendation || '-'}</p>
                </div>

                <div className="consult-section">
                  <h4>Lampiran</h4>
                  {r.attachments && r.attachments.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0 8px' }}>
                      {r.attachments.map((att, i) => (
                        <li key={i}>
                          <a href={`${API_BASE}${att.path}`} target="_blank" rel="noopener noreferrer">
                            {att.originalName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: '4px 0 8px' }}>Belum ada file.</p>
                  )}
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(r._id, e)}
                    disabled={uploadingId === r._id}
                  />
                  {uploadingId === r._id && <span style={{ marginLeft: 8 }}>Mengupload...</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}