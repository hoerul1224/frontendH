import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  const fetchTickets = async () => {
    setLoading(true);
    const res = await API.get('/tickets');
    setTickets(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/tickets', form);
    setForm({ title: '', description: '', priority: 'medium' });
    fetchTickets();
  };

  const statusColor = {
    open: '#3b82f6',
    in_progress: '#f59e0b',
    resolved: '#10b981',
    closed: '#6b7280',
  };

  const filteredTickets = statusFilter === 'all'
    ? tickets
    : tickets.filter((t) => t.status === statusFilter);

  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  return (
    <div className="container">
      <h1>{role === 'admin' ? 'Dashboard Tiket' : 'Tiket Saya'}</h1>

      {role === 'admin' ? (
        <div className="stats-grid">
          <div className="stat-card" style={{ borderColor: statusColor.open }}>
            <span className="stat-number">{stats.open}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-card" style={{ borderColor: statusColor.in_progress }}>
            <span className="stat-number">{stats.in_progress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card" style={{ borderColor: statusColor.resolved }}>
            <span className="stat-number">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
          <div className="stat-card" style={{ borderColor: statusColor.closed }}>
            <span className="stat-number">{stats.closed}</span>
            <span className="stat-label">Closed</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="ticket-form">
          <input name="title" placeholder="Judul masalah" value={form.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Deskripsi masalah" value={form.description} onChange={handleChange} required />
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low Priority</option>
            <option value="medium">Middle Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button type="submit">Buat Tiket</button>
        </form>
      )}

      {role === 'admin' && (
        <div className="filter-bar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sort-select">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Memuat...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="empty-state">Belum ada tiket.</p>
      ) : (
        <ul className="ticket-list">
          {filteredTickets.map((t) => (
            <li key={t._id} className="ticket-card">
              <Link to={`/tickets/${t._id}`} className="ticket-link">
                <div className="ticket-header">
                  <h3>{t.title}</h3>
                  <span className="status-badge" style={{ backgroundColor: statusColor[t.status] }}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="ticket-meta">
                  Dibuat oleh: {t.createdBy?.email} · Prioritas: {t.priority}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}