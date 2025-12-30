import { useEffect, useState } from 'react';
import api from '../api';
import { type User } from '../types';
import { Link } from 'react-router-dom';

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get<User[]>('/users');
      setUsers(data);
    } catch (error) {
      alert('Failed to fetch users');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Manage Users</h2>
        <Link to="/" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
      <ul className="list-group">
        {users.map(user => (
          <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
                <strong>{user.username}</strong> ({user.role})
            </span>
            {user.role !== 'ADMIN' && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ManageUsers;