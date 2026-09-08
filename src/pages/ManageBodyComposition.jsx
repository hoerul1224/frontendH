import { useState, useEffect } from 'react';
import API from '../api';
import UserNavbar from '../components/UserNavbar';

export default function ManageBodyComposition() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
  date: '', weight: '', height: '', bodyFatPercent: '', muscleMass: '', visceralFat: '',
});
  const [saved, setSaved] = useState(false);

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get('/body-composition/admin');
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
    await API.post(`/body-composition/admin/${selectedUser._id}`, form);
    setSaved(true);
    setForm({ date: '', weight: '', height: '', bodyFatPercent: '', muscleMass: '', visceralFat: '' });
    setSelectedUser(null);
    setSearch('');
    fetchAllRecords();
  };

  return (
    <>
      <UserNavbar />
      <div className="container-wide">
        <h1>Body Composition Perwira</h1>

        <button className="btn-add-dcu" onClick={() => setShowForm(!showForm)}>
          + Body Composition
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
            <input name="weight" type="number" step="0.1" placeholder="Berat Badan (kg)" value={form.weight} onChange={handleChange} required />
            <input name="height" type="number" step="0.1" placeholder="Tinggi Badan (cm)" value={form.height} onChange={handleChange} required />
            <input name="bodyFatPercent" type="number" step="0.1" placeholder="Body Fat (%)" value={form.bodyFatPercent} onChange={handleChange} />
            <input name="muscleMass" type="number" step="0.1" placeholder="Massa Otot (kg)" value={form.muscleMass} onChange={handleChange} />
            <input name="visceralFat" type="number" step="0.1" placeholder="Visceral Fat" value={form.visceralFat} onChange={handleChange} />
            <button type="submit">Tambah Data</button>
            {saved && <p className="success-message">Data body composition berhasil disimpan.</p>}
          </form>
        )}

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : allRecords.length === 0 ? (
          <p className="empty-state">Belum ada data body composition.</p>
        ) : (
          <div className="lab-table-wrapper" style={{ marginTop: 24 }}>
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Nama</th><th>Berat</th><th>Tinggi</th><th>BMI</th>
                  <th>Body Fat</th><th>Massa Otot</th><th>Visceral Fat</th><th>Air Tubuh</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                    <td>{r.user?.fullName || r.user?.email || '-'}</td>
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
      </div>
    </>
  );
}