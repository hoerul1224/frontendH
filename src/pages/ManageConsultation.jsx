import { useState, useEffect } from 'react';
import API from '../api';
import UserNavbar from '../components/UserNavbar';
import { useSearchParams } from 'react-router-dom';


export default function ManageConsultation() {
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get('readonly') === '1';
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ date: '', doctorName: '', complaint: '', diagnosis: '', recommendation: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  useEffect(() => {
  const uid = searchParams.get('userId');
  if (uid) setSelectedUserId(uid);
}, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedUserId) return;
  if (editingId) {
    await API.put(`/consultation/admin/record/${editingId}`, form);
  } else {
    await API.post(`/consultation/admin/${selectedUserId}`, form);
  }
  setSaved(true);
  setEditingId(null);
  setForm({ date: '', doctorName: '', complaint: '', diagnosis: '', recommendation: '' });
  fetchRecords(selectedUserId);
};

const handleEditClick = (record) => {
  setEditingId(record._id);
  setForm({
    date: record.date ? record.date.slice(0, 10) : '',
    doctorName: record.doctorName || '',
    complaint: record.complaint || '',
    diagnosis: record.diagnosis || '',
    recommendation: record.recommendation || '',
  });
  setSaved(false);
};

const handleCancelEdit = () => {
  setEditingId(null);
  setForm({ date: '', doctorName: '', complaint: '', diagnosis: '', recommendation: '' });
};

  return (
    <div className="container-wide">
      <h1>Kelola Riwayat Konsultasi</h1>

            {!isReadOnly && (
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
      )}

      {!selectedUserId ? (
        <p className="empty-state">Pilih user dulu untuk menambah riwayat konsultasi.</p>
      ) : (
        <>
                              {(!isReadOnly || editingId) && (
            <form onSubmit={handleSubmit} className="ticket-form">
              <input name="date" type="date" value={form.date} onChange={handleChange} required />
              <input name="doctorName" placeholder="Nama Dokter" value={form.doctorName} onChange={handleChange} />
              <textarea name="complaint" placeholder="Keluhan" value={form.complaint} onChange={handleChange} />
              <textarea name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} />
              <textarea name="recommendation" placeholder="Rekomendasi/Catatan" value={form.recommendation} onChange={handleChange} />
              <button type="submit">{editingId ? 'Simpan Perubahan' : 'Tambah Riwayat'}</button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
                  Batal
                </button>
              )}
              {saved && <p className="success-message">Riwayat konsultasi berhasil disimpan.</p>}
            </form>
          )}

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

    {r.attachments && r.attachments.length > 0 && (
      <div style={{ marginTop: 8 }}>
        <p className="ticket-meta" style={{ marginBottom: 4 }}>Lampiran dari user:</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {r.attachments.map((att, i) => (
            <li key={i}>
              <a href={`${API_BASE}${att.path}`} target="_blank" rel="noopener noreferrer">
                {att.originalName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}

            <button type="button" onClick={() => handleEditClick(r)} style={{ marginTop: 8 }}>
      Edit
    </button>
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