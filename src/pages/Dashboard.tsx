import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { type Room, type BookingRange } from '../types';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { isWithinInterval } from 'date-fns';

interface DecodedToken { role: string; }

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { logout, token } = useAuth();
  
  const [dates, setDates] = useState<{ [key: number]: { start: Date | null; end: Date | null } }>({});
  const [busyDates, setBusyDates] = useState<{ [key: number]: { start: Date; end: Date }[] }>({});
  
  const [newRoom, setNewRoom] = useState({ name: '', description: '', price: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Room>>({});

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setIsAdmin(decoded.role === 'ADMIN');
      } catch (e) { setIsAdmin(false); }
    }
    fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get<Room[]>('/rooms');
      setRooms(data);
      data.forEach(room => fetchBusyDates(room.id));
    } catch (error) { console.error(error); }
  };

  const fetchBusyDates = async (roomId: number) => {
    try {
      const { data } = await api.get<BookingRange[]>(`/bookings/room/${roomId}`);
      const ranges = data.map(b => ({
        start: new Date(b.startDate),
        end: new Date(b.endDate)
      }));
      setBusyDates(prev => ({ ...prev, [roomId]: ranges }));
    } catch (error) { console.error(error); }
  };

  const handleDateChange = (id: number, type: 'start' | 'end', date: Date | null) => {
    setDates(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: date }
    }));
  };

  const handleBooking = async (roomId: number) => {
    const d = dates[roomId];
    if (!d?.start || !d?.end) return alert('Select dates');
    try {
      await api.post('/bookings', { roomId, startDate: d.start, endDate: d.end });
      alert('Success!');
      fetchBusyDates(roomId); 
      setDates(prev => ({ ...prev, [roomId]: { start: null, end: null } }));
    } catch (error) { alert('Failed!'); }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.name || !newRoom.price) return alert('Fill fields');
    await api.post('/rooms', newRoom);
    setNewRoom({ name: '', description: '', price: 0 });
    fetchRooms();
  };

  const handleDeleteRoom = async (id: number) => {
    if (confirm('Delete?')) { await api.delete(`/rooms/${id}`); fetchRooms(); }
  };

  const startEditing = (room: Room) => {
    setEditingRoomId(room.id);
    setEditForm(room);
  };

  const saveEdit = async () => {
    if (!editingRoomId) return;
    await api.patch(`/rooms/${editingRoomId}`, editForm);
    setEditingRoomId(null);
    fetchRooms();
  };

  const getDayClass = (date: Date, roomId: number) => {
    const ranges = busyDates[roomId] || [];
    const isBusy = ranges.some(range => 
       isWithinInterval(date, { start: range.start, end: range.end })
    );
    return isBusy ? 'bg-danger text-white text-decoration-line-through' : null;
  };

  return (
    <div className="container py-4">
      <style>{`
        .react-datepicker__day--disabled.bg-danger {
            background-color: #dc3545 !important;
            color: white !important;
            opacity: 0.6;
            cursor: not-allowed;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rooms {isAdmin && <span className="badge bg-danger">Admin</span>}</h2>
        <div>
          {isAdmin && (
            <>
               <Link to="/manage-bookings" className="btn btn-info text-white me-2">All Bookings</Link>
               <Link to="/manage-users" className="btn btn-warning me-2">Users</Link>
            </>
          )}
          <Link to="/my-bookings" className="btn btn-primary me-2">My Bookings</Link>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      {isAdmin && (
        <div className="card mb-4 border-danger p-3">
           <h5>Create Room</h5>
           <div className="row g-2">
             <div className="col-md-4"><input className="form-control" placeholder="Name" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} /></div>
             <div className="col-md-4"><input className="form-control" placeholder="Desc" value={newRoom.description} onChange={e => setNewRoom({...newRoom, description: e.target.value})} /></div>
             <div className="col-md-2"><input type="number" className="form-control" placeholder="Price" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: +e.target.value})} /></div>
             <div className="col-md-2"><button className="btn btn-success w-100" onClick={handleCreateRoom}>Add</button></div>
           </div>
        </div>
      )}

      <div className="row">
        {rooms.map(room => (
          <div key={room.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                {editingRoomId === room.id ? (
                  <div className="mb-3">
                    <input className="form-control mb-2" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    <textarea className="form-control mb-2" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                    <input type="number" className="form-control mb-2" value={editForm.price} onChange={e => setEditForm({...editForm, price: +e.target.value})} />
                    <button className="btn btn-success btn-sm me-2" onClick={saveEdit}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingRoomId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between">
                      <h5 className="card-title">{room.name}</h5>
                      {isAdmin && (
                        <div>
                            <button className="btn btn-outline-primary btn-sm me-1" onClick={() => startEditing(room)}>Edit</button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteRoom(room.id)}>X</button>
                        </div>
                      )}
                    </div>
                    <p className="text-muted">{room.description}</p>
                    <h6 className="text-primary">${room.price} / night</h6>
                  </>
                )}
                
                <div className="mt-3 bg-light p-3 rounded">
                  <div className="mb-2">
                    <label className="small d-block">Check-in</label>
                    <DatePicker 
                        selected={dates[room.id]?.start}
                        onChange={(date: Date | null) => handleDateChange(room.id, 'start', date)}
                        selectsStart
                        startDate={dates[room.id]?.start}
                        endDate={dates[room.id]?.end}
                        excludeDateIntervals={busyDates[room.id] || []}
                        minDate={new Date()}
                        className="form-control form-control-sm"
                        placeholderText="Start Date"
                        dayClassName={(date) => getDayClass(date, room.id)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="small d-block">Check-out</label>
                    <DatePicker 
                        selected={dates[room.id]?.end}
                        onChange={(date: Date | null) => handleDateChange(room.id, 'end', date)}
                        selectsEnd
                        startDate={dates[room.id]?.start}
                        endDate={dates[room.id]?.end}
                        minDate={dates[room.id]?.start || new Date()}
                        excludeDateIntervals={busyDates[room.id] || []}
                        className="form-control form-control-sm"
                        placeholderText="End Date"
                        dayClassName={(date) => getDayClass(date, room.id)}
                    />
                  </div>
                  <button className="btn btn-success w-100 mt-2" onClick={() => handleBooking(room.id)}>Book Now</button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Dashboard;