import { useEffect, useState } from 'react';
import api from '../api';
import { type Booking } from '../types';
import { Link } from 'react-router-dom';

const ManageBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      // ดึงข้อมูลการจองทั้งหมด (API นี้มีอยู่แล้วใน Backend)
      const { data } = await api.get<Booking[]>('/bookings');
      setBookings(data);
    } catch (error) {
      alert('Error fetching bookings');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      // ลบแล้วอัปเดตหน้าจอทันที
      setBookings(bookings.filter(b => b.id !== id));
    } catch (error) {
      alert('Failed to delete booking');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage All Bookings (Admin)</h2>
        <Link to="/" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover shadow-sm bg-white">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={6} className="text-center">No bookings found.</td></tr>
            ) : (
              bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  {/* แสดงชื่อคนจอง (ถ้าไม่มีให้แสดง -) */}
                  <td className="fw-bold text-primary">{booking.user?.username || '-'}</td>
                  <td>{booking.room?.name}</td>
                  <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(booking.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;