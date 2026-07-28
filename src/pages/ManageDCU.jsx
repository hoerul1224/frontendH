import { useState, useEffect } from 'react';
import API from '../api';

export default function ManageDCU() {
  const today = new Date();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ date: '', systolic: '', diastolic: '', heartRate: '', temperature: '', oxygenSaturation: '' });
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
      const res = await API.get(`/dcu/admin/${userId}`, { params: { month, year } });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) fetchRecords(selectedUserId);
  }, [selectedUserId, month, year]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    await API.post(`/dcu/admin/${selectedUserId}`, form);
    setSaved(true);
    setForm({ date: '', systolic: '', diastolic: '', heartRate: '', temperature: '', oxygenSaturation: '' });
    fetchRecords(selectedUserId);
  };

  return (
    <div className="container-wide">
      <h1>Kelola DCU (Daily Check Up)</h1>

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
          <label>Bulan</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
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
        <p className="empty-state">Pilih user dulu untuk menambah data DCU.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="ticket-form">
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
            <input name="systolic" type="number" placeholder="Sistolik" value={form.systolic} onChange={handleChange} />
            <input name="diastolic" type="number" placeholder="Diastolik" value={form.diastolic} onChange={handleChange} />
            <input name="heartRate" type="number" placeholder="Detak Jantung (bpm)" value={form.heartRate} onChange={handleChange} />
            <input name="temperature" type="number" step="0.1" placeholder="Temperatur Tubuh (°C)" value={form.temperature} onChange={handleChange} />
            <input name="oxygenSaturation" type="number" placeholder="Saturasi Oksigen (%)" value={form.oxygenSaturation} onChange={handleChange} />
            <button type="submit">Tambah Data</button>
            {saved && <p className="success-message">Data DCU berhasil disimpan.</p>}
          </form>

          {loading ? (
            <p className="empty-state">Memuat riwayat...</p>
          ) : records.length === 0 ? (
            <p className="empty-state">Belum ada data DCU untuk periode ini.</p>
          ) : (
            <div className="user-table-wrapper" style={{ marginTop: 24 }}>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Tanggal</th><th>Sistolik</th><th>Diastolik</th>
                    <th>Detak Jantung</th><th>Temperatur</th><th>Saturasi O2</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                      <td>{r.systolic ?? '-'}</td>
                      <td>{r.diastolic ?? '-'}</td>
                      <td>{r.heartRate ?? '-'}</td>
                      <td>{r.temperature ?? '-'}</td>
                      <td>{r.oxygenSaturation ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}