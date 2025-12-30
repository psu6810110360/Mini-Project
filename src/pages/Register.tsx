import { useState, type FormEvent } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', { username, password });
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (error) {
      alert('Registration Failed: Username might be taken.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: '350px' }}>
        <h3 className="text-center mb-3">Register</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input className="form-control" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success w-100">Sign Up</button>
        </form>
        <p className="mt-3 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;