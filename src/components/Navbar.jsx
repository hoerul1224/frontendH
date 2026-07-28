import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoPdg from '../assets/logo-pdg.png';

export default function Navbar() {
  const { token, email, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();
const hiddenPaths = ['/', '/dashboard'];
const isHidden = hiddenPaths.includes(location.pathname) || location.pathname.startsWith('/health/');
if (isHidden) return null;

  const brandLink = role === 'admin' ? '/healthchecks' : '/';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={brandLink}>
          <img src={logoPdg} alt="Perta Daya Gas" className="navbar-logo" />
        </Link>
      </div>
      <div className="navbar-links">
        {token ? (
          <>
            {role === 'admin' && <Link to="/users">Users</Link>}
            {role === 'admin' && <Link to="/admin/mcu">Kelola MCU</Link>}
            {role === 'admin' && <Link to="/admin/body-composition">Body Composition</Link>}
            {role === 'admin' && <Link to="/admin/consultation">Riwayat Konsultasi</Link>}
            {role === 'admin' && <Link to="/admin/dcu">Kelola DCU</Link>}
            {role === 'admin' && <Link to="/admin/mini-mcu">Mini MCU</Link>}
            <span className="navbar-user">{email}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}