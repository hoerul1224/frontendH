import { useState, useEffect } from 'react';
import API from '../api';
import UserNavbar from '../components/UserNavbar';

export default function ManageMiniMCU() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({ date: '', complaint: '', gdp: '', gds: '', uricAcid: '', cholesterolTotal: '' });
  const [saved, setSaved] = useState(false);

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get('/mini-mcu/admin');
      setAllRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecords();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await API.get('/auth/users/list');
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const filteredUsers = search.trim()
    ? users.filter((u) =>
        (u.perwiraId || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.fullName || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handlePickUser = (u) => {
    setSelectedUser(u);
    setSearch(`${u.perwiraId || '-'} — ${u.fullName || u.email}`);
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await API.post(`/mini-mcu/admin/${selectedUser._id}`, form);
    setSaved(true);
    setForm({ date: '', complaint: '', gdp: '', gds: '', uricAcid: '', cholesterolTotal: '' });
    setSelectedUser(null);
    setSearch('');
    fetchAllRecords();
  };

  return (
    <>
      <UserNavbar />
      <div className="container-wide">
        <h1>Kelola Mini MCU</h1>

        <button className="btn-add-dcu" onClick={() => setShowForm(!showForm)}>
          + Mini MCU
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="ticket-form" style={{ marginTop: 16 }}>
            <div className="autocomplete-wrapper">
              <input
                placeholder="Perwira ID / Nama Lengkap (isi salah satu)"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedUser(null); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                required
              />
              {showSuggestions && filteredUsers.length > 0 && (
                <div className="autocomplete-suggestions">
                  {filteredUsers.map((u) => (
                    <div key={u._id} className="autocomplete-item" onClick={() => handlePickUser(u)}>
                      {u.perwiraId || '-'} — {u.fullName || u.email}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input name="date" type="date" value={form.date} onChange={handleChange} required />
            <input name="complaint" placeholder="Keluhan" value={form.complaint} onChange={handleChange} />
            <input name="gdp" type="number" step="0.1" placeholder="Gula Darah Puasa" value={form.gdp} onChange={handleChange} />
            <input name="gds" type="number" step="0.1" placeholder="Gula Darah Sewaktu" value={form.gds} onChange={handleChange} />
            <input name="uricAcid" type="number" step="0.1" placeholder="Asam Urat" value={form.uricAcid} onChange={handleChange} />
            <input name="cholesterolTotal" type="number" step="0.1" placeholder="Kolesterol Total" value={form.cholesterolTotal} onChange={handleChange} />
            <button type="submit">Tambah Data</button>
            {saved && <p className="success-message">Data mini MCU berhasil disimpan.</p>}
          </form>
        )}

        {loading ? (
          <p className="empty-state">Memuat riwayat...</p>
        ) : allRecords.length === 0 ? (
          <p className="empty-state">Belum ada data mini MCU.</p>
        ) : (
          <div className="lab-table-wrapper" style={{ marginTop: 24 }}>
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Nama</th><th>Keluhan</th>
                  <th>GDP</th><th>Ket.</th>
                  <th>GDS</th><th>Ket.</th>
                  <th>Asam Urat</th><th>Ket.</th>
                  <th>Kolesterol</th><th>Ket.</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                    <td>{r.user?.fullName || r.user?.email || '-'}</td>
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
      </div>
    </>
  );
}