import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoPdg from '../assets/logo-pdg.png';

export default function UserNavbar() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (menu) => setOpenMenu(openMenu === menu ? null : menu);

  return (
    <nav className="user-navbar">
      <div className="user-navbar-brand">
        <Link to="/dashboard">
          <img src={logoPdg} alt="Perta Daya Gas" className="navbar-logo" />
        </Link>
      </div>
      <div className="user-navbar-links">
        <Link to="/dashboard" className="user-navbar-link">Dashboard</Link>

        <div className="user-navbar-dropdown">
          <button className="user-navbar-link" onClick={() => toggleMenu('health')}>Health</button>
          {openMenu === 'health' && (
            <div className="user-dropdown-menu">
              <Link to="/health/dcu" onClick={() => setOpenMenu(null)}>DCU</Link>
              <Link to="/health/mcu" onClick={() => setOpenMenu(null)}>MCU</Link>
              <Link to="/health/mini-mcu" onClick={() => setOpenMenu(null)}>Mini MCU</Link>
              <Link to="/health/riwayat-konsultasi" onClick={() => setOpenMenu(null)}>Riwayat Konsultasi</Link>
              <Link to="/health/body-composition" onClick={() => setOpenMenu(null)}>Body Composition</Link>
            </div>
          )}
        </div>

        <div className="user-navbar-dropdown">
          <button className="user-navbar-link" onClick={() => toggleMenu('profile')}>Profile</button>
          {openMenu === 'profile' && (
            <div className="user-dropdown-menu">
              <Link to="/profile/identitas" onClick={() => setOpenMenu(null)}>Identitas</Link>
              <Link to="/profile/ganti-password" onClick={() => setOpenMenu(null)}>Ganti Password</Link>
            </div>
          )}
        </div>

        <span className="navbar-user">{email}</span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}