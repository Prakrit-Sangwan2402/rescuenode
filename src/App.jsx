import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Basic Home component to handle root redirect
const Home = () => {
  const { user, role, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role === 'donor') {
    return <Navigate to="/donor-dashboard" replace />;
  } else if (role === 'receiver') {
    return <Navigate to="/receiver-dashboard" replace />;
  }
  
  return <div className="flex h-screen items-center justify-center p-4 text-center">Configuring your account...</div>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route 
          path="/donor-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/receiver-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['receiver']}>
              <ReceiverDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
