import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const { email, role } = useAuth();
  const navigate = useNavigate();

  const fetchTicket = async () => {
    const res = await API.get(`/tickets/${id}`);
    setTicket(res.data);
    setNewStatus(res.data.status);
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusSubmit = async () => {
    await API.put(`/tickets/${id}`, { status: newStatus });
    navigate('/tickets');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    await API.post(`/tickets/${id}/comments`, { text: comment });
    setComment('');
    fetchTicket();
  };

  const handleDelete = async () => {
    await API.delete(`/tickets/${id}`);
    navigate('/tickets');
  };

  if (!ticket) return <p className="empty-state">Memuat...</p>;

  return (
    <div className="container">
      <h1>{ticket.title}</h1>
      <p className="ticket-meta">
        Dibuat oleh: {ticket.createdBy?.email} · Prioritas: {ticket.priority} · Status: {ticket.status.replace('_', ' ')}
      </p>
      <p>{ticket.description}</p>

      {role === 'admin' && (
        <div className="admin-controls">
          <label>Ubah Status: </label>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button className="btn-submit" onClick={handleStatusSubmit}>Simpan</button>
          <button className="btn-delete" onClick={handleDelete}>Hapus Tiket</button>
        </div>
      )}

      <h3>Komentar</h3>
      <ul className="comment-list">
        {ticket.comments?.map((c, i) => (
          <li key={i} className="comment-item">
            <strong>{c.author?.email}</strong>: {c.text}
          </li>
        ))}
      </ul>

      <form onSubmit={handleComment} className="comment-form">
        <input placeholder="Tulis komentar..." value={comment} onChange={(e) => setComment(e.target.value)} required />
        <button type="submit">Kirim</button>
      </form>
    </div>
  );
}