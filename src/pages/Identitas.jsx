import { useState, useEffect } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function Identitas() {
  const [form, setForm] = useState({
    perwiraId: '', username: '', email: '',
    fullName: '', dateOfBirth: '', gender: '',
    workLocation: '', department: '', employmentStatus: '', jobTitle: '',
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        setForm({
          perwiraId: res.data.perwiraId || '',
          username: res.data.username || '',
          email: res.data.email || '',
          fullName: res.data.fullName || '',
          dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.slice(0, 10) : '',
          gender: res.data.gender || '',
          workLocation: res.data.workLocation || '',
          department: res.data.department || '',
          employmentStatus: res.data.employmentStatus || '',
          jobTitle: res.data.jobTitle || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { perwiraId, username, email, ...payload } = form;
      await API.put('/auth/me', payload);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan perubahan');
    }
  };

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Identitas</h1>
        <p className="user-subgreeting">Data diri kamu</p>

        {loading ? (
          <p className="empty-state">Memuat...</p>
        ) : (
          <form onSubmit={handleSubmit} className="identitas-form">
            <div className="login-field">
              <label>Perwira ID</label>
              <input value={form.perwiraId} disabled />
            </div>
            <div className="login-field">
              <label>Nama Perwira</label>
              <input value={form.username} disabled />
            </div>
            <div className="login-field">
              <label>Email</label>
              <input value={form.email} disabled />
            </div>

            <div className="login-field">
              <label>Nama Lengkap</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>

            <div className="login-field">
              <label>Tempat Tanggal Lahir</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
            </div>

            <div className="login-field">
              <label>Jenis Kelamin</label>
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Male">Pria</option>
                <option value="Female">Wanita</option>
              </select>
            </div>

            <div className="login-field">
              <label>Lokasi Kerja</label>
              <select name="workLocation" value={form.workLocation} onChange={handleChange} required>
                <option value="">Pilih lokasi</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Bali">Bali</option>
                <option value="Semarang">Semarang</option>
                <option value="Sorong">Sorong</option>
              </select>
            </div>

            <div className="login-field">
              <label>Department</label>
              <select name="department" value={form.department} onChange={handleChange} required>
                <option value="">Pilih department</option>
                <option value="BoD">BOD</option>
                <option value="Keuangan & Dukungan Bisnis">Keuangan & Dukungan Bisnis</option>
                <option value="Pemeliharaan & Enjiniring">Operasi, Pemeliharaan dan Enjiniring</option>
                <option value="QHSSE & Manajemen Risiko">QHSSE & Manajemen Risiko</option>
                <option value="Sekretaris Perusahaan">Sekretaris Perusahaan</option>
                <option value="Audit Executive">Audit Executive</option>
              </select>
            </div>

            <div className="login-field">
              <label>Status Pekerja</label>
              <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange} required>
                <option value="">Pilih status</option>
                <option value="Direksi & Manajemen">Direksi & Manajemen</option>
                <option value="PWTT">PWTT</option>
                <option value="PWT">PWT</option>
                <option value="TKJP">TKJP</option>
              </select>
            </div>

            <div className="login-field">
              <label>Jabatan</label>
              <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
            </div>

            {error && <p className="error-message">{error}</p>}
            {saved && <p className="success-message">Identitas berhasil diperbarui.</p>}

            <button type="submit" className="login-submit-btn">Simpan Perubahan</button>
          </form>
        )}
      </div>
    </div>
  );
}