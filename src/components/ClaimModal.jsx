import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Clock, AlertCircle, Loader2, Package, Tag, Hash } from 'lucide-react';

const ClaimModal = ({ drop, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [timeLeft, setTimeLeft] = React.useState('');
  const [isExpired, setIsExpired] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);

  React.useEffect(() => {
    if (!drop?.expiryTime) return;

    const expiryDate = new Date(drop.expiryTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = expiryDate - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
      }
      setIsExpired(false);
    };

    updateTimer(); 
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [drop]);

  const handleClaim = async () => {
    if (isExpired) return;
    
    setIsClaiming(true);

    try {
      const dropRef = doc(db, 'drops', drop.id);
      await updateDoc(dropRef, {
        status: 'claimed',
        claimedBy: user.uid
      });
      addToast('Drop claimed successfully! Head over to Active Missions.', 'success');
      onClose(); 
    } catch (err) {
      console.error("Error claiming drop:", err);
      addToast('Failed to claim the drop. It might have already been claimed.', 'error');
      setIsClaiming(false);
    }
  };

  if (!drop) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Drop Details</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {drop.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  drop.category === 'food' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <Tag size={12} className="mr-1" />
                  {drop.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
                  <Hash size={12} className="mr-1" />
                  Qty: {drop.quantity}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-xl p-4 border ${
                isExpired ? 'bg-red-50 border-red-100 text-red-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'
              }`}
            >
              <Clock size={24} className={isExpired ? 'text-red-500' : 'text-indigo-500'} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {isExpired ? 'Expired' : 'Expires In'}
                </p>
                <p className="font-mono text-lg font-bold">
                  {timeLeft}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={isExpired || isClaiming}
            className={`flex w-full justify-center items-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isExpired 
                ? 'bg-slate-400' 
                : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg focus-visible:outline-emerald-600'
            }`}
          >
            {isClaiming ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Claiming...
              </>
            ) : isExpired ? (
              'Cannot Claim Expired Item'
            ) : (
              <>
                 <Package size={20} /> Claim Drop Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimModal;
