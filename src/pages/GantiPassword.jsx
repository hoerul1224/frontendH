import { useState } from 'react';
import UserNavbar from '../components/UserNavbar';
import API from '../api';

export default function GantiPassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Password baru dan konfirmasi tidak sama');
      return;
    }

    try {
      await API.put('/auth/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengubah password');
    }
  };

  return (
    <div className="user-page">
      <UserNavbar />
      <div className="user-page-content">
        <h1 className="user-greeting">Ganti Password</h1>
        <p className="user-subgreeting">Perbarui password akunmu</p>

        <form onSubmit={handleSubmit} className="identitas-form" style={{ maxWidth: 420 }}>
          <div className="login-field">
            <label>Password Lama</label>
            <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} required />
          </div>

          <div className="login-field">
            <label>Password Baru</label>
            <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} required />
          </div>

          <div className="login-field">
            <label>Konfirmasi Password Baru</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">Password berhasil diubah.</p>}

          <button type="submit" className="login-submit-btn">Ubah Password</button>
        </form>
      </div>
    </div>
  );
}