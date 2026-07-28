import { useState, useEffect } from 'react';
import API from '../api';

export default function ManageMCU() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [form, setForm] = useState({ healthDegree: '', diagnosis: '', workFitness: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/mcu/admin/${selectedUserId}/${year}`);
        setForm({
          healthDegree: res.data?.healthDegree || '',
          diagnosis: res.data?.diagnosis || '',
          workFitness: res.data?.workFitness || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [selectedUserId, year]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    await API.post(`/mcu/admin/${selectedUserId}`, { year, ...form });
    setSaved(true);
  };

  return (
    <div className="container-wide">
      <h1>Kelola MCU User</h1>

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
        <div className="dcu-date-field">
          <label>Tahun</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {!selectedUserId ? (
        <p className="empty-state">Pilih user dulu untuk mengisi data MCU.</p>
      ) : loading ? (
        <p className="empty-state">Memuat...</p>
      ) : (
        <form onSubmit={handleSubmit} className="ticket-form">
          <textarea name="healthDegree" placeholder="Derajat Kesehatan" value={form.healthDegree} onChange={handleChange} />
          <textarea name="diagnosis" placeholder="Diagnosis MCU" value={form.diagnosis} onChange={handleChange} />
          <select name="workFitness" value={form.workFitness} onChange={handleChange} required>
            <option value="">Pilih Kelaikan Kerja</option>
            <option value="laik">Laik Kerja</option>
            <option value="laik_dengan_catatan">Laik Kerja dengan Catatan</option>
            <option value="tidak_laik">Tidak Laik Kerja</option>
          </select>
          <button type="submit">Simpan &amp; Setujui</button>
          {saved && <p className="success-message">Data MCU berhasil disimpan dan langsung tampil ke user.</p>}
        </form>
      )}
    </div>
  );
}