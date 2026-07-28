import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function HealthCheckDetail() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { role } = useAuth();
  const navigate = useNavigate();

  const fetchRecord = async () => {
    const res = await API.get(`/healthchecks/${id}`);
    setRecord(res.data);
    setNewStatus(res.data.status);
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handleStatusSubmit = async () => {
    await API.put(`/healthchecks/${id}`, { status: newStatus });
    navigate('/healthchecks');
  };

  const handleDelete = async () => {
    await API.delete(`/healthchecks/${id}`);
    navigate('/healthchecks');
  };

  if (!record) return <p className="empty-state">Memuat...</p>;

  return (
    <div className="container">
      <h1>{record.patientName}</h1>
      <p className="ticket-meta">
        Tanggal: {new Date(record.checkupDate).toLocaleDateString('id-ID')} · Status: {record.status === 'waiting' ? 'Menunggu' : 'Selesai'}
      </p>

      <div className="user-table-wrapper" style={{ padding: '16px 20px', marginTop: '16px' }}>
        <p><strong>Tekanan Darah:</strong> {record.bloodPressure || '-'}</p>
        <p><strong>Suhu Tubuh:</strong> {record.temperature ? `${record.temperature} °C` : '-'}</p>
        <p><strong>Detak Jantung:</strong> {record.heartRate ? `${record.heartRate} bpm` : '-'}</p>
        <p><strong>Berat Badan:</strong> {record.weight ? `${record.weight} kg` : '-'}</p>
        <p><strong>Tinggi Badan:</strong> {record.height ? `${record.height} cm` : '-'}</p>
        <p><strong>Catatan:</strong> {record.notes || '-'}</p>
      </div>

      {role === 'admin' && (
        <div className="admin-controls">
          <label>Ubah Status: </label>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="waiting">Menunggu</option>
            <option value="done">Selesai</option>
          </select>
          <button className="btn-submit" onClick={handleStatusSubmit}>Simpan</button>
          <button className="btn-delete" onClick={handleDelete}>Hapus Data</button>
        </div>
      )}
    </div>
  );
}