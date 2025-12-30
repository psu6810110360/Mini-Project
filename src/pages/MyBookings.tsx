import { useEffect, useState } from 'react';
import api from '../api';
import { type Booking } from '../types';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const { data } = await api.get<Booking[]>('/bookings/my');
      setBookings(data);
    } catch (error) {
      alert('Error fetching bookings');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b.id !== id));
    } catch (error) {
      alert('Failed to cancel');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Bookings</h2>
        <Link to="/" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      {bookings.length === 0 ? (
        <div className="alert alert-info">No bookings found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered bg-white">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.room.name}</td>
                  <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings;