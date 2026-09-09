import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function ManageMCU() {
  const today = new Date();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [tableSearch, setTableSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  const [form, setForm] = useState({
    date: '', examLocation: '', workStatus: '',
    diagnosis1: '', diagnosis2: '', diagnosis3: '',
    fitnessStatus: '', recommendation: '',
  });
  const [saved, setSaved] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (day) params.day = day;
      const res = await API.get('/mcu/admin', { params });
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
      const res = await API.get('/auth/users');
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
    await API.post(`/mcu/admin/${selectedUser._id}`, form);
    setSaved(true);
    setForm({ date: '', examLocation: '', workStatus: '', diagnosis1: '', diagnosis2: '', diagnosis3: '', fitnessStatus: '', recommendation: '' });
    setSelectedUser(null);
    setSearch('');
    fetchRecords();
  };

  const handleVerify = async (recordId) => {
    setVerifyingId(recordId);
    try {
      await API.put(`/mcu/admin/${recordId}/verify`);
      fetchRecords();
    } catch (err) {
      console.error('Gagal verifikasi:', err);
      alert('Gagal memverifikasi dokumen. Coba lagi.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAdminUpload = (recordId, file) => {
    if (!file) return;
    setUploadingId(recordId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await API.put(`/mcu/admin/${recordId}/followup`, {
          followUpDocument: reader.result,
        });
        fetchRecords();
      } catch (err) {
        console.error('Gagal upload bukti tindak lanjut:', err);
        alert('Gagal mengunggah dokumen. Coba lagi.');
      } finally {
        setUploadingId(null);
      }
    };
    reader.readAsDataURL(file);
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

  const filteredRecords = tableSearch.trim()
    ? records.filter((r) =>
        (r.user?.fullName || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
        (r.user?.email || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
        (r.user?.perwiraId || '').toLowerCase().includes(tableSearch.toLowerCase())
      )
    : records;

  const sortedRecords = [...filteredRecords].sort((a, b) => {
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

  const followUpLabel = {
    belum_verifikasi: 'Belum Verifikasi',
    terverifikasi: 'Terverifikasi',
  };

  const followUpBadgeClass = (v) =>
    `fitness-badge fitness-badge-${v === 'terverifikasi' ? 'laik' : 'laik_dengan_catatan'}`;

  const fitnessBadgeClass = (v) => `fitness-badge fitness-badge-${v || 'none'}`;

  return (
    <>
      <UserNavbar />
      <div className="container-wide">
        <h1>MCU Perwira</h1>

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-add-dcu" onClick={() => setShowForm(!showForm)}>
            + MCU
          </button>
          <input
            type="text"
            placeholder="Cari nama / Perwira ID..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 30, border: 'none', minWidth: 240 }}
          />
        </div>

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

            <input name="diagnosis1" placeholder="Diagnosis 1" value={form.diagnosis1} onChange={handleChange} />
            <input name="diagnosis2" placeholder="Diagnosis 2" value={form.diagnosis2} onChange={handleChange} />
            <input name="diagnosis3" placeholder="Diagnosis 3" value={form.diagnosis3} onChange={handleChange} />

            <select name="fitnessStatus" value={form.fitnessStatus} onChange={handleChange} required>
              <option value="">Pilih Keterangan</option>
              <option value="laik">Laik Kerja</option>
              <option value="laik_dengan_catatan">Laik Kerja dengan Catatan</option>
              <option value="tidak_laik">Tidak Laik Kerja</option>
            </select>
            <textarea name="recommendation" placeholder="Catatan / Rekomendasi untuk pekerja" value={form.recommendation} onChange={handleChange} />
            <button type="submit">Submit</button>
            {saved && <p className="success-message">Data MCU berhasil disimpan.</p>}
          </form>
        )}

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : sortedRecords.length === 0 ? (
          <p className="empty-state">Belum ada data MCU untuk periode ini.</p>
        ) : (
          <div className="lab-table-wrapper" style={{ marginTop: 24 }}>
            <table className="lab-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('date')} className="sortable-th">Tanggal{sortArrow('date')}</th>
                  <th onClick={() => toggleSort('name')} className="sortable-th">Nama{sortArrow('name')}</th>
                  <th>Lokasi</th>
                  <th>Status Pekerja</th>
                  <th>Diagnosis 1</th>
                  <th>Diagnosis 2</th>
                  <th>Diagnosis 3</th>
                  <th>Keterangan</th>
                  <th>Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                    <td>{r.user?.fullName || r.user?.email || '-'}</td>
                    <td>{r.examLocation || '-'}</td>
                    <td>{r.workStatus || '-'}</td>
                    <td>{r.diagnosis1 || '-'}</td>
                    <td>{r.diagnosis2 || '-'}</td>
                    <td>{r.diagnosis3 || '-'}</td>
                    <td><span className={fitnessBadgeClass(r.fitnessStatus)}>{fitnessLabel[r.fitnessStatus] || '-'}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', minWidth: 150 }}>
                        <span className={followUpBadgeClass(r.followUpStatus)}>
                          {followUpLabel[r.followUpStatus] || 'Belum Verifikasi'}
                        </span>

                        {r.followUpDocument && (
                      
                       <a href={r.followUpDocument}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, color: '#8ecbff' }}
                      >
                        Lihat Dokumen
                      </a>
                    )}

                        {r.followUpStatus !== 'terverifikasi' && (
                          <label className="btn-edit-table" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            {uploadingId === r._id
                              ? 'Mengunggah...'
                              : r.followUpDocument
                              ? 'Upload Ulang'
                              : 'Upload Bukti'}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleAdminUpload(r._id, e.target.files[0])}
                              style={{ display: 'none' }}
                              disabled={uploadingId === r._id}
                            />
                          </label>
                        )}

                        {r.followUpDocument && r.followUpStatus !== 'terverifikasi' && (
                          <button
                            type="button"
                            onClick={() => handleVerify(r._id)}
                            disabled={verifyingId === r._id}
                            className="btn-edit-table"
                            style={{ background: '#10b981', color: 'white' }}
                          >
                            {verifyingId === r._id ? 'Memverifikasi...' : 'Verifikasi'}
                          </button>
                        )}
                      </div>
                    </td>
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