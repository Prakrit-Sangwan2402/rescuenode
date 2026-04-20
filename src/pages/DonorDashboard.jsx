import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Plus, MapPin, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';

const DonorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [drops, setDrops] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Form State
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('food');
  const [quantity, setQuantity] = React.useState('');
  const [expiryTime, setExpiryTime] = React.useState('');
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'drops'), where('donorId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dropsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort locally to avoid needing immediate Firestore composite indexes
      dropsData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setDrops(dropsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching drops:", err);
      addToast("Failed to load your drops.", 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleCreateDrop = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!navigator.geolocation) {
      addToast("Geolocation is not supported by your browser.", 'error');
      setIsSubmitting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          await addDoc(collection(db, 'drops'), {
            donorId: user.uid,
            title,
            category,
            quantity: Number(quantity),
            expiryTime,
            lat: latitude,
            lng: longitude,
            status: 'active',
            claimedBy: null,
            createdAt: serverTimestamp(),
          });

          addToast("Drop successfully published!", 'success');
          setTitle('');
          setCategory('food');
          setQuantity('');
          setExpiryTime('');
          
        } catch (err) {
          console.error("Error creating drop:", err);
          addToast("Failed to create the drop. Please try again.", 'error');
        } finally {
          setIsSubmitting(false);
        }
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        addToast("Location access is required to post a drop.", 'error');
        setIsSubmitting(false);
      }
    );
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Active</span>;
      case 'claimed':
        return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Claimed</span>;
      case 'completed':
        return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Completed</span>;
      default:
        return <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <header className="mx-auto max-w-7xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Donor Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your surplus donations</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <main className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-1/3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-indigo-50 p-2 text-indigo-600 text-sm">
                <Plus size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Post New Drop</h2>
            </div>

            <form onSubmit={handleCreateDrop} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 Boxes of Apples"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select
                  required
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="food">Food</option>
                  <option value="medicine">Medicine</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Count"
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date/Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700 mt-2 flex items-start gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <p>Your browser's location will be attached to this drop to help receivers find it.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full justify-center items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  'Publish Drop'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Data Table */}
        <div className="w-full lg:flex-1">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Package size={20} className="text-slate-400" />
                Your Drops
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
              </div>
            ) : drops.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Package size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-900">No drops yet</p>
                <p className="text-sm mt-1">Create your first surplus drop using the form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Expiry
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {drops.map((drop) => (
                      <tr key={drop.id} className="hover:bg-slate-50 transition-colors">
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-slate-900">
                          {drop.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 capitalize">
                          {drop.category}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                          {drop.quantity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {renderStatusBadge(drop.status)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                          {new Date(drop.expiryTime).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default DonorDashboard;
