import { useState, useEffect } from 'react';
import API from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await API.get('/auth/users');
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    await API.put(`/auth/users/${id}/role`, { role: newRole });
    fetchUsers();
  };

  return (
    <div className="container">
      <h1>Manajemen User</h1>

      {loading ? (
        <p className="empty-state">Memuat...</p>
      ) : users.length === 0 ? (
        <p className="empty-state">Belum ada user.</p>
      ) : (
        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>No. Telepon</th>
                <th>Lokasi</th>
                <th>Jabatan</th>
                <th>Role</th>
                <th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.location || '-'}</td>
                  <td>{u.jabatan || '-'}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}