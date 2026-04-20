import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Mail, Lock, AlertCircle, Building2, User, HandHeart, Send, Truck, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('donor');
  const [organizationName, setOrganizationName] = React.useState('');
  const [address, setAddress] = React.useState('');
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, role: contextRole, loading } = useAuth();

  React.useEffect(() => {
    if (user && contextRole && !loading) {
      navigate('/');
    }
  }, [user, contextRole, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!organizationName.trim() || !address.trim()) {
      addToast('Organization name and address are required.', 'error');
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      await setDoc(doc(db, 'users', createdUser.uid), {
        uid: createdUser.uid,
        email: createdUser.email,
        role: role,
        organizationName,
        address,
        lat: null,
        lng: null,
        createdAt: serverTimestamp(),
      });

      addToast('Account created successfully!', 'success');
      // Navigation is now handled by the useEffect above
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        addToast('This email is already in use.', 'error');
      } else if (err.code === 'auth/weak-password') {
        addToast('Password should be at least 6 characters.', 'error');
      } else {
        addToast('Failed to create an account. Please try again later.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
            <Truck size={32} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
        
        <div className="rounded-2xl bg-white px-8 py-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                  role === 'donor' 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`rounded-full p-2 ${role === 'donor' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                  <Building2 size={24} />
                </div>
                <span className="font-semibold text-sm">Donor (Business)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('receiver')}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                  role === 'receiver' 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`rounded-full p-2 ${role === 'receiver' ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>
                  <HandHeart size={24} />
                </div>
                <span className="font-semibold text-sm">Receiver (NGO)</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-slate-700">
                  Organization / Business Name
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="orgName"
                    type="text"
                    required
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter organization name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                  Address
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Send className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="address"
                    type="text"
                    required
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Physical address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="admin@organization.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                role === 'donor' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600' 
                  : 'bg-emerald-600 hover:bg-emerald-500 focus-visible:outline-emerald-600'
              }`}
            >
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
