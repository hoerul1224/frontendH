import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function HealthChecks() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    patientName: '', checkupDate: '', bloodPressure: '',
    temperature: '', heartRate: '', weight: '', height: '', notes: '',
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  const fetchRecords = async () => {
    setLoading(true);
    const res = await API.get('/healthchecks');
    setRecords(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/healthchecks', form);
    setForm({
      patientName: '', checkupDate: '', bloodPressure: '',
      temperature: '', heartRate: '', weight: '', height: '', notes: '',
    });
    fetchRecords();
  };

  const statusColor = { waiting: '#f59e0b', done: '#10b981' };

  const filteredRecords = statusFilter === 'all'
    ? records
    : records.filter((r) => r.status === statusFilter);

  const stats = {
    waiting: records.filter((r) => r.status === 'waiting').length,
    done: records.filter((r) => r.status === 'done').length,
    total: records.length,
  };

  return (
    <div className="container">
      <h1>{role === 'admin' ? 'Lebih Peduli, Lebih Sehat dengan My PDG+' : 'Pemeriksaan Saya'}</h1>

      {role === 'admin' && (
  <div className="stats-grid">
    <div className="stat-card" style={{ borderColor: '#4f46e5' }}>
      <span className="stat-number">{stats.total}</span>
      <span className="stat-label">Total Pemeriksaan</span>
    </div>
    <div className="stat-card" style={{ borderColor: statusColor.waiting }}>
      <span className="stat-number">{stats.waiting}</span>
      <span className="stat-label">Menunggu</span>
    </div>
    <div className="stat-card" style={{ borderColor: statusColor.done }}>
      <span className="stat-number">{stats.done}</span>
      <span className="stat-label">Selesai</span>
    </div>
  </div>
)}

<form onSubmit={handleSubmit} className="ticket-form">
  <input name="patientName" placeholder="Nama Pasien" value={form.patientName} onChange={handleChange} required />
  <input name="checkupDate" type="date" value={form.checkupDate} onChange={handleChange} required />
  <input name="bloodPressure" placeholder="Tekanan Darah (misal: 120/80)" value={form.bloodPressure} onChange={handleChange} />
  <input name="temperature" type="number" step="0.1" placeholder="Suhu Tubuh (°C)" value={form.temperature} onChange={handleChange} />
  <input name="heartRate" type="number" placeholder="Detak Jantung (bpm)" value={form.heartRate} onChange={handleChange} />
  <input name="weight" type="number" placeholder="Berat Badan (kg)" value={form.weight} onChange={handleChange} />
  <input name="height" type="number" placeholder="Tinggi Badan (cm)" value={form.height} onChange={handleChange} />
  <textarea name="notes" placeholder="Catatan tambahan" value={form.notes} onChange={handleChange} />
  <button type="submit">Buat Pemeriksaan</button>
</form>

      {role === 'admin' && (
        <div className="filter-bar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sort-select">
            <option value="all">Semua Status</option>
            <option value="waiting">Menunggu</option>
            <option value="done">Selesai</option>
          </select>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Memuat...</p>
      ) : filteredRecords.length === 0 ? (
        <p className="empty-state">Belum ada data pemeriksaan.</p>
      ) : (
        <ul className="ticket-list">
          {filteredRecords.map((r) => (
            <li key={r._id} className="ticket-card">
              <Link to={`/healthchecks/${r._id}`} className="ticket-link">
                <div className="ticket-header">
                  <h3>{r.patientName}</h3>
                  <span className="status-badge" style={{ backgroundColor: statusColor[r.status] }}>
                    {r.status === 'waiting' ? 'Menunggu' : 'Selesai'}
                  </span>
                </div>
                <p className="ticket-meta">
                  Tanggal: {new Date(r.checkupDate).toLocaleDateString('id-ID')} · Dicatat oleh: {r.createdBy?.email}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}