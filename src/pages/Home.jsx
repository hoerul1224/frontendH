import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="hero">
      <div className="hero-bar hero-bar-dark"></div>
      <div className="hero-bar hero-bar-light"></div>
      <div className="hero-dot-accent"></div>

      <div className="hero-dots hero-dots-tl"></div>
      <div className="hero-dots hero-dots-bl"></div>

      <div className="hero-content">
        <p className="hero-tagline">Lebih Peduli, Lebih Sehat dengan</p>
        <h1 className="hero-title"><span className="hero-title-thin">my</span>PDG+</h1>
        <p className="hero-subtitle">Aplikasi Kesehatan Perwira PT Perta Daya Gas</p>
        <div className="hero-actions">
          <Link to="/login" className="hero-btn hero-btn-primary">Masuk</Link>
          <Link to="/register" className="hero-btn hero-btn-outline">Daftar</Link>
        </div>
      </div>

      <div className="hero-icon">
        <svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
          <path d="M120 12 L215 48 L215 125 C215 185 172 228 120 248 C68 228 25 185 25 125 L25 48 Z"
                fill="#5aa9e6" />
          <path d="M120 26 L200 56 L200 125 C200 178 164 216 120 234 C76 216 40 178 40 125 L40 56 Z"
                fill="#eaf2fb" />
          <rect x="100" y="95" width="40" height="110" rx="8" fill="#5aa9e6" />
          <rect x="65" y="130" width="110" height="40" rx="8" fill="#5aa9e6" />
          <g transform="translate(150, 55)">
            <rect x="0" y="18" width="16" height="46" rx="4" fill="white" />
            <rect x="-15" y="33" width="46" height="16" rx="4" fill="white" />
          </g>
          <g transform="translate(15, 155)">
            <rect x="0" y="18" width="16" height="46" rx="4" fill="white" />
            <rect x="-15" y="33" width="46" height="16" rx="4" fill="white" />
          </g>
        </svg>
      </div>

      <div className="hero-swirl hero-swirl-br"></div>
    </div>
  );
}