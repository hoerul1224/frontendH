import { useState, useEffect } from 'react';
import API from '../api';

export default function ManageBodyComposition() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    date: '', weight: '', height: '', bodyFatPercent: '', muscleMass: '', visceralFat: '', bodyWaterPercent: '',
  });
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
      const res = await API.get(`/body-composition/admin/${userId}`);
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
    await API.post(`/body-composition/admin/${selectedUserId}`, form);
    setSaved(true);
    setForm({ date: '', weight: '', height: '', bodyFatPercent: '', muscleMass: '', visceralFat: '', bodyWaterPercent: '' });
    fetchRecords(selectedUserId);
  };

  return (
    <div className="container-wide">
      <h1>Kelola Body Composition</h1>

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
        <p className="empty-state">Pilih user dulu untuk menambah data.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="ticket-form">
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
            <input name="weight" type="number" step="0.1" placeholder="Berat Badan (kg)" value={form.weight} onChange={handleChange} required />
            <input name="height" type="number" step="0.1" placeholder="Tinggi Badan (cm)" value={form.height} onChange={handleChange} required />
            <input name="bodyFatPercent" type="number" step="0.1" placeholder="Body Fat (%)" value={form.bodyFatPercent} onChange={handleChange} />
            <input name="muscleMass" type="number" step="0.1" placeholder="Massa Otot (kg)" value={form.muscleMass} onChange={handleChange} />
            <input name="visceralFat" type="number" step="0.1" placeholder="Visceral Fat" value={form.visceralFat} onChange={handleChange} />
            <input name="bodyWaterPercent" type="number" step="0.1" placeholder="Air Tubuh (%)" value={form.bodyWaterPercent} onChange={handleChange} />
            <button type="submit">Tambah Data</button>
            {saved && <p className="success-message">Data body composition berhasil disimpan.</p>}
          </form>

          {loading ? (
            <p className="empty-state">Memuat riwayat...</p>
          ) : records.length === 0 ? (
            <p className="empty-state">Belum ada riwayat untuk user ini.</p>
          ) : (
            <div className="user-table-wrapper" style={{ marginTop: 24 }}>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Tanggal</th><th>Berat</th><th>Tinggi</th><th>BMI</th>
                    <th>Body Fat</th><th>Massa Otot</th><th>Visceral Fat</th><th>Air Tubuh</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                      <td>{r.weight}</td>
                      <td>{r.height}</td>
                      <td>{r.bmi}</td>
                      <td>{r.bodyFatPercent ?? '-'}</td>
                      <td>{r.muscleMass ?? '-'}</td>
                      <td>{r.visceralFat ?? '-'}</td>
                      <td>{r.bodyWaterPercent ?? '-'}</td>
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