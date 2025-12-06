import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import ProtectedRoute from './components/ProtectedRoute';
import OccasionBanner from './components/OccasionBanner';

function App() {
  return (
    <SystemProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
            <OccasionBanner />
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <ToastContainer position="top-center" theme="dark" />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:resettoken" element={<ResetPassword />} />

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
            </main>
            <Footer />

          </div>
        </Router>
      </AuthProvider>
    </SystemProvider>
  );
}

export default App;
