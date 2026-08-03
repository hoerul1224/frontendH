import { useState, useEffect } from 'react';
import API from '../api';
import UserNavbar from '../components/UserNavbar';

export default function ManageConsultation() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ date: '', doctorName: '', complaint: '', diagnosis: '', recommendation: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const fetchRecords = async (userId) => {
    setLoading(true);
    try {
      const res = await API.get(`/consultation/admin/${userId}`);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) fetchRecords(selectedUserId);
  }, [selectedUserId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    await API.post(`/consultation/admin/${selectedUserId}`, form);
    setSaved(true);
    setForm({ date: '', doctorName: '', complaint: '', diagnosis: '', recommendation: '' });
    fetchRecords(selectedUserId);
  };

  return (
    <div className="container-wide">
      <h1>Kelola Riwayat Konsultasi</h1>

      <div className="mcu-admin-picker">
        <div className="dcu-date-field">
          <label>Pilih User</label>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            <option value="">-- Pilih user --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.fullName || u.email}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedUserId ? (
        <p className="empty-state">Pilih user dulu untuk menambah riwayat konsultasi.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="ticket-form">
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
            <input name="doctorName" placeholder="Nama Dokter" value={form.doctorName} onChange={handleChange} />
            <textarea name="complaint" placeholder="Keluhan" value={form.complaint} onChange={handleChange} />
            <textarea name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} />
            <textarea name="recommendation" placeholder="Rekomendasi/Catatan" value={form.recommendation} onChange={handleChange} />
            <button type="submit">Tambah Riwayat</button>
            {saved && <p className="success-message">Riwayat konsultasi berhasil disimpan.</p>}
          </form>

          {loading ? (
            <p className="empty-state">Memuat riwayat...</p>
          ) : records.length === 0 ? (
            <p className="empty-state">Belum ada riwayat untuk user ini.</p>
          ) : (
            <ul className="ticket-list" style={{ marginTop: 24 }}>
              {records.map((r) => (
                <li key={r._id} className="ticket-card">
                  <div style={{ padding: '16px 20px' }}>
                    <div className="ticket-header">
                      <h3>{new Date(r.date).toLocaleDateString('id-ID')}</h3>
                      {r.doctorName && <span className="ticket-meta">dr. {r.doctorName}</span>}
                    </div>
                    <p className="ticket-meta">Keluhan: {r.complaint || '-'}</p>
                    <p className="ticket-meta">Diagnosis: {r.diagnosis || '-'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}