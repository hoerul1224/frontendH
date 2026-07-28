import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function RiwayatKonsultasi() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}