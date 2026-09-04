import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({
    perwiraId: '', fullName: '', username: '', dateOfBirth: '', gender: '',
    workLocation: '', department: '', employmentStatus: '', jobTitle: '', workClassification: '', email: '',
    password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    try {
      const { confirmPassword, ...payload } = form;
      await API.post('/auth/register', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
    }
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <span className="register-brand">myPDG+</span>
        <Link to="/" className="register-back-link">← Kembali ke Home</Link>
      </div>

      <div className="register-body">
        <h2 className="register-title">Daftar Perwira Baru</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Berhasil! Mengalihkan ke login...</p>}

        <form onSubmit={handleSubmit} className="register-grid">
          <div className="register-field">
            <label>Perwira ID</label>
            <input name="perwiraId" placeholder="MK1800000" value={form.perwiraId} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label>Lokasi Kerja</label>
            <select name="workLocation" value={form.workLocation} onChange={handleChange} required>
              <option value="">Pilih lokasi</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bali">Bali</option>
              <option value="Semarang">Semarang</option>
              <option value="Sorong">Sorong</option>
            </select>
          </div>

          <div className="register-field">
            <label>Password Baru</label>
            <input type="password" name="password" placeholder="..." value={form.password} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label>Nama Lengkap</label>
            <input name="fullName" placeholder="Nama lengkap" value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="register-field">
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

          <div className="register-field">
  <label>Konfirmasi Password Baru</label>
  <input type="password" name="confirmPassword" placeholder="..." value={form.confirmPassword} onChange={handleChange} required />
</div>

          <div className="register-field">
            <label>Nama Panggilan Perwira</label>
            <input name="username" placeholder="Nama Panggilan Perwira" value={form.username} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label>Jabatan</label>
            <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange} required>
              <option value="">Pilih status</option>
              <option value="Direksi & Manajemen">Direksi & Manajemen</option>
              <option value="PWTT">PWTT</option>
              <option value="PWT">PWT</option>
              <option value="TKJP">TKJP</option>
            </select>
          </div>

          <div className="register-field">
            <label>Klasifikasi Pekerjaan</label>
            <select name="workClassification" value={form.workClassification} onChange={handleChange} required>
              <option value="">Pilih klasifikasi</option>
              <option value="Plant">Plant</option>
              <option value="Komorbid">Komorbid</option>
              <option value="Security & CSO">Security & CSO</option>
              <option value="Driver">Driver</option>
              <option value="Health">Health</option>
              <option value="Office">Office</option>
            </select>
          </div>

          <div className="register-field">
            <label>Tanggal Lahir</label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
          </div>

          <div className="register-field">
            <label>Email</label>
            <input type="email" name="email" placeholder="nama@mitrakerja.pertamina.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="register-field register-submit-cell">
            <button type="submit" className="register-submit-btn">Submit</button>
          </div>

          <div className="register-field">
            <label>Jenis Kelamin</label>
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Male">Pria</option>
              <option value="Female">Wanita</option>
            </select>
          </div>

          <div className="register-field">
            <label>Jabatan</label>
            <input name="jobTitle" placeholder="Masukkan job title" value={form.jobTitle} onChange={handleChange} required />
          </div>

          <div></div>
        </form>

        <p style={{ marginTop: 24, color: 'white' }}>
          Sudah punya akun? <Link to="/login" style={{ color: '#8ecbff' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}