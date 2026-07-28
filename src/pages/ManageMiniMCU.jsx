import { useState, useEffect } from 'react';
import API from '../api';

export default function ManageMiniMCU() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ date: '', complaint: '', gdp: '', gds: '', uricAcid: '', cholesterolTotal: '' });
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
      const res = await API.get(`/mini-mcu/admin/${userId}`);
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
    await API.post(`/mini-mcu/admin/${selectedUserId}`, form);
    setSaved(true);
    setForm({ date: '', complaint: '', gdp: '', gds: '', uricAcid: '', cholesterolTotal: '' });
    fetchRecords(selectedUserId);
  };

  return (
    <div className="container-wide">
      <h1>Kelola Mini MCU</h1>

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
            <input name="complaint" placeholder="Keluhan" value={form.complaint} onChange={handleChange} />
            <input name="gdp" type="number" step="0.1" placeholder="Gula Darah Puasa" value={form.gdp} onChange={handleChange} />
            <input name="gds" type="number" step="0.1" placeholder="Gula Darah Sewaktu" value={form.gds} onChange={handleChange} />
            <input name="uricAcid" type="number" step="0.1" placeholder="Asam Urat" value={form.uricAcid} onChange={handleChange} />
            <input name="cholesterolTotal" type="number" step="0.1" placeholder="Kolesterol Total" value={form.cholesterolTotal} onChange={handleChange} />
            <button type="submit">Tambah Data</button>
            {saved && <p className="success-message">Data mini MCU berhasil disimpan.</p>}
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
                    <th>Tanggal</th><th>Keluhan</th>
                    <th>GDP</th><th>Ket.</th>
                    <th>GDS</th><th>Ket.</th>
                    <th>Asam Urat</th><th>Ket.</th>
                    <th>Kolesterol</th><th>Ket.</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                      <td>{r.complaint || '-'}</td>
                      <td>{r.gdp ?? '-'}</td><td>{r.gdpLabel}</td>
                      <td>{r.gds ?? '-'}</td><td>{r.gdsLabel}</td>
                      <td>{r.uricAcid ?? '-'}</td><td>{r.uricAcidLabel}</td>
                      <td>{r.cholesterolTotal ?? '-'}</td><td>{r.cholesterolLabel}</td>
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