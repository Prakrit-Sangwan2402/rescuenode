import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Filter, MapPin, Loader2, AlertCircle, Compass, ListTodo, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

// React-Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import ClaimModal from '../components/ClaimModal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
};

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState('map'); // 'map', 'missions'
  
  const [drops, setDrops] = React.useState([]);
  const [myMissions, setMyMissions] = React.useState([]);
  
  const [loading, setLoading] = React.useState(true);
  const [filterCategory, setFilterCategory] = React.useState('all'); 
  const [userLocation, setUserLocation] = React.useState(null);
  const [locationError, setLocationError] = React.useState('');
  
  const [selectedDrop, setSelectedDrop] = React.useState(null);
  const [isCompleting, setIsCompleting] = React.useState({});

  React.useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Could not fetch location. Showing default map view.");
        setUserLocation({ lat: 51.505, lng: -0.09 });
      }
    );
  }, []);

  React.useEffect(() => {
    if (!user) return;
    const qActive = query(collection(db, 'drops'), where('status', '==', 'active'));
    const unsubActive = onSnapshot(qActive, (snapshot) => {
      const activeDrops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrops(activeDrops);
      setLoading(false);
      
      if (selectedDrop) {
        const stillExists = activeDrops.find(d => d.id === selectedDrop.id);
        if (!stillExists) setSelectedDrop(null);
      }
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    const qMissions = query(collection(db, 'drops'), where('claimedBy', '==', user.uid));
    const unsubMissions = onSnapshot(qMissions, (snapshot) => {
      const allMine = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyMissions(allMine.filter(d => d.status === 'claimed'));
    });

    return () => { unsubActive(); unsubMissions(); };
  }, [user, selectedDrop]);

  const filteredDrops = React.useMemo(() => {
    if (filterCategory === 'all') return drops;
    return drops.filter(drop => drop.category === filterCategory);
  }, [drops, filterCategory]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleMarkCompleted = async (id) => {
    setIsCompleting(prev => ({ ...prev, [id]: true }));
    try {
      await updateDoc(doc(db, 'drops', id), { status: 'completed' });
      addToast('Mission marked as successfully completed!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to complete mission. Try again.', 'error');
    } finally {
      setIsCompleting(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="p-4 sm:px-8 mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Receiver Console</h1>
            <p className="text-slate-500 text-sm mt-0.5">Find active drops and manage missions</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'map' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass size={16} /> Live Map
              </button>
              <button
                onClick={() => setActiveTab('missions')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'missions' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListTodo size={16} /> Active Missions
                {myMissions.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-xs shrink-0">
                    {myMissions.length}
                  </span>
                )}
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {activeTab === 'map' ? (
          <>
            {/* Filters */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-8 z-10 shadow-sm relative">
              <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                  <Filter size={18} className="text-indigo-600" /> Filter:
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setFilterCategory('all')} className={`px-4 py-1.5 text-sm font-medium flex-1 sm:flex-none rounded-md transition-all ${filterCategory === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>All</button>
                  <button onClick={() => setFilterCategory('food')} className={`px-4 py-1.5 text-sm font-medium flex-1 sm:flex-none rounded-md transition-all ${filterCategory === 'food' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}>Food</button>
                  <button onClick={() => setFilterCategory('medicine')} className={`px-4 py-1.5 text-sm font-medium flex-1 sm:flex-none rounded-md transition-all ${filterCategory === 'medicine' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}>Medicine</button>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative bg-slate-200 z-0">
              {!userLocation ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-20">
                  <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
                  <p className="text-slate-700 font-medium">Acquiring your location...</p>
                </div>
              ) : (
                <MapContainer 
                  center={[userLocation.lat, userLocation.lng]} 
                  zoom={13} 
                  scrollWheelZoom={true} 
                  className="w-full h-full z-0"
                  style={{ minHeight: 'calc(100vh - 140px)' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
                  {filteredDrops.map((drop) => {
                    if (!drop.lat || !drop.lng) return null;
                    return (
                      <Marker 
                        key={drop.id} 
                        position={[drop.lat, drop.lng]}
                        eventHandlers={{ click: () => setSelectedDrop(drop) }}
                      />
                    );
                  })}
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                     <Popup>You are here!</Popup>
                  </Marker>
                </MapContainer>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-3">
                 <MapPin size={18} className="text-indigo-400" />
                 <span className="text-sm font-semibold">{loading ? 'Discovering...' : `${filteredDrops.length} Drops`}</span>
              </div>
            </div>
            
            {/* Claim Modal Overlay */}
            {selectedDrop && <ClaimModal drop={selectedDrop} onClose={() => setSelectedDrop(null)} />}
          </>
        ) : (
          /* Active Missions Tab */
          <div className="flex-1 bg-slate-50 p-4 sm:p-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ListTodo size={24} className="text-slate-400" /> Missions In Progress
              </h2>
              
              {myMissions.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                  <Compass size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-900">No active missions</p>
                  <p className="text-sm text-slate-500 mt-1">Switch to the Live Map to claim drops.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {myMissions.map(m => (
                    <div key={m.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-lg text-slate-900 leading-tight">{m.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${m.category === 'food' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {m.category}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">Quantity: <span className="font-semibold">{m.quantity}</span></p>
                        <p className="text-xs text-slate-500 mt-1">Expires: {new Date(m.expiryTime).toLocaleString()}</p>
                      </div>
                      
                      <button
                        onClick={() => handleMarkCompleted(m.id)}
                        disabled={isCompleting[m.id]}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isCompleting[m.id] ? (
                          <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                        ) : (
                          <><CheckCircle2 size={16} className="text-emerald-400" /> Mark as Picked Up</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReceiverDashboard;
