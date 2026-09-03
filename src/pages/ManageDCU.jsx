import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function ManageDCU() {
  const today = new Date();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
  date: '', complaint: '', examLocation: '', workStatus: '', attendanceStatus: '',
  systolic: '', diastolic: '', heartRate: '', temperature: '', oxygenSaturation: '',
  romberg: '', fitnessStatus: '',
});
  const [saved, setSaved] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (day) params.day = day;
      const res = await API.get('/dcu/admin', { params });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [day, month, year]);

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
    setForm((f) => ({ ...f, workStatus: f.workStatus || u.employmentStatus || '' }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await API.post(`/dcu/admin/${selectedUser._id}`, form);
    setSaved(true);
    setForm({ date: '', complaint: '', examLocation: '', workStatus: '', attendanceStatus: '', systolic: '', diastolic: '', heartRate: '', temperature: '', oxygenSaturation: '', romberg: '', fitnessStatus: '' });
    setSelectedUser(null);
    setSearch('');
    fetchRecords();
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getSortValue = (r, key) => {
    if (key === 'date') return new Date(r.date).getTime();
    if (key === 'name') return (r.user?.fullName || r.user?.email || '').toLowerCase();
    return r[key] ?? -Infinity;
  };

  const sortedRecords = [...records].sort((a, b) => {
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const sortArrow = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  const fitnessLabel = {
    laik: 'Laik Kerja',
    laik_dengan_catatan: 'Laik Kerja dengan Catatan',
    tidak_laik: 'Tidak Laik Kerja',
  };

  const fitnessBadgeClass = (v) => `fitness-badge fitness-badge-${v || 'none'}`;

  return (
    <>
      <UserNavbar />
      <div className="container-wide">
        <h1>DCU Perwira</h1>

        <div className="dcu-date-picker">
          <div className="dcu-date-field">
            <label>Tanggal</label>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">Semua</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="dcu-date-field">
            <label>Bulan</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Semua</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="dcu-date-field">
            <label>Tahun</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Semua</option>
              {Array.from({ length: 5 }, (_, i) => today.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <button className="btn-add-dcu" onClick={() => setShowForm(!showForm)}>
          + DCU
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

            {selectedUser && (
              <input value={selectedUser.jobTitle || '-'} disabled placeholder="Jabatan (otomatis)" />
            )}

            <select name="examLocation" value={form.examLocation} onChange={handleChange} required>
              <option value="">Pilih Lokasi Pemeriksaan</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bali">Bali</option>
              <option value="Semarang">Semarang</option>
              <option value="Sorong">Sorong</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <input name="date" type="date" value={form.date} onChange={handleChange} required />

            <select name="workStatus" value={form.workStatus} onChange={handleChange} required>
              <option value="">Pilih Status Pekerja</option>
              <option value="Direksi & Manajemen">Direksi & Manajemen</option>
              <option value="PWTT">PWTT</option>
              <option value="PWT">PWT</option>
              <option value="TKJP">TKJP</option>
              <option value="Tamu">Tamu</option>
            </select>

            <select name="attendanceStatus" value={form.attendanceStatus} onChange={handleChange} required>
  <option value="">Pilih Status Kehadiran</option>
  <option value="Bekerja">Bekerja</option>
  <option value="Izin">Izin</option>
  <option value="Sakit">Sakit</option>
  <option value="Libur">Libur</option>
  <option value="Dinas">Dinas</option>
</select>

            <input name="complaint" placeholder="Keluhan" value={form.complaint} onChange={handleChange} />
            <input name="systolic" type="number" placeholder="Sistolik (mmHg)" value={form.systolic} onChange={handleChange} />
            <input name="diastolic" type="number" placeholder="Diastolik (mmHg)" value={form.diastolic} onChange={handleChange} />
            <input name="heartRate" type="number" placeholder="Detak Jantung (x/m)" value={form.heartRate} onChange={handleChange} />
            <input name="temperature" type="number" step="0.1" placeholder="Temperatur Tubuh (°C)" value={form.temperature} onChange={handleChange} />
            <input name="oxygenSaturation" type="number" placeholder="Saturasi Oksigen (%)" value={form.oxygenSaturation} onChange={handleChange} />

            <select name="romberg" value={form.romberg} onChange={handleChange}>
              <option value="">Romberg Test</option>
              <option value="Negatif">Negatif</option>
              <option value="Positif">Positif</option>
            </select>

            <select name="fitnessStatus" value={form.fitnessStatus} onChange={handleChange} required>
              <option value="">Pilih Keterangan</option>
              <option value="laik">Laik Kerja</option>
              <option value="laik_dengan_catatan">Laik Kerja dengan Catatan</option>
              <option value="tidak_laik">Tidak Laik Kerja</option>
            </select>

            <button type="submit">Submit</button>
            {saved && <p className="success-message">Data DCU berhasil disimpan.</p>}
          </form>
        )}

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : sortedRecords.length === 0 ? (
          <p className="empty-state">Belum ada data DCU untuk periode ini.</p>
        ) : (
          <div className="lab-table-wrapper" style={{ marginTop: 24 }}>
            <table className="lab-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('date')} className="sortable-th">Tanggal{sortArrow('date')}</th>
                  <th onClick={() => toggleSort('name')} className="sortable-th">Nama{sortArrow('name')}</th>
                  <th>Lokasi</th>
                  <th>Status Pekerja</th>
                  <th>Kehadiran</th>
                  <th>Keluhan</th>
                  <th onClick={() => toggleSort('systolic')} className="sortable-th">Sistolik{sortArrow('systolic')}</th>
                  <th onClick={() => toggleSort('diastolic')} className="sortable-th">Diastolik{sortArrow('diastolic')}</th>
                  <th onClick={() => toggleSort('heartRate')} className="sortable-th">Detak Jantung{sortArrow('heartRate')}</th>
                  <th onClick={() => toggleSort('temperature')} className="sortable-th">Temperatur{sortArrow('temperature')}</th>
                  <th onClick={() => toggleSort('oxygenSaturation')} className="sortable-th">Saturasi O2{sortArrow('oxygenSaturation')}</th>
                  <th>Romberg</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                    <td>{r.user?.fullName || r.user?.email || '-'}</td>
                    <td>{r.examLocation || '-'}</td>
                    <td>{r.workStatus || '-'}</td>
                    <td>{r.attendanceStatus || '-'}</td>
                    <td>{r.complaint || '-'}</td>
                    <td>{r.systolic ?? '-'}</td>
                    <td>{r.diastolic ?? '-'}</td>
                    <td>{r.heartRate ?? '-'}</td>
                    <td>{r.temperature ?? '-'}</td>
                    <td>{r.oxygenSaturation ?? '-'}</td>
                    <td>{r.romberg || '-'}</td>
                    <td><span className={fitnessBadgeClass(r.fitnessStatus)}>{fitnessLabel[r.fitnessStatus] || '-'}</span></td>
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