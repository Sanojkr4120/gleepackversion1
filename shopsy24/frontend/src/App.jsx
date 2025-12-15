import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Admin from './pages/Admin';
import Employee from './pages/Employee';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthSuccess from './pages/OAuthSuccess';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import ProtectedRoute from './components/ProtectedRoute';
import OccasionBanner from './components/OccasionBanner';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTop from './components/ScrollToTop';

// Layout component to handle conditional styling
function Layout({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '';

  return (
    <main className={`flex-grow pb-20 md:pb-0 ${isHomePage ? '' : 'container mx-auto px-4 py-8'}`}>
      <ToastContainer position="top-center" theme="dark" />
      {children}
    </main>
  );
}

function App() {
  return (
    <SystemProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
            <OccasionBanner />
            <Navbar />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
                <Route path="/oauth-success" element={<OAuthSuccess />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>

                {/* Employee Routes */}
                <Route element={<ProtectedRoute staffOnly={true} />}>
                  <Route path="/employee" element={<Employee />} />
                </Route>
              </Routes>
            </Layout>
            <Footer />
            <MobileBottomNav />

          </div>
        </Router>
      </AuthProvider>
    </SystemProvider>
  );
}

export default App;
