import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/auth/register', { email, password, phone, location, jabatan });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
    }
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Berhasil! Mengalihkan ke login...</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="tel" placeholder="Nomor Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="text" placeholder="Lokasi" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input type="text" placeholder="Jabatan" value={jabatan} onChange={(e) => setJabatan(e.target.value)} required />
        <button type="submit">Daftar</button>
      </form>
      <p>Sudah punya akun? <Link to="/login">Login</Link></p>
    </div>
  );
}