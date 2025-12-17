import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-orange-500 tracking-tighter">
            GleePack
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="hover:text-orange-400 transition">Home</Link>
            <Link to="/menu" className="hover:text-orange-400 transition">Menu</Link>

            {user && (
              <>
                <Link to="/my-orders" className="hover:text-orange-400 transition">My Orders</Link>
              </>
            )}

            <Link to="/contact" className="hover:text-orange-400 transition">Contact</Link>

            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition">Admin</Link>
            )}
            {user && user.role === 'employee' && (
              <Link to="/employee" className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition">Employee</Link>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {/* Cart Icon Removed as per request */}

            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 hover:text-orange-400 transition group"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-orange-500 transition">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-200 group-hover:text-orange-400">{user.name.split(' ')[0]}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hover:text-orange-400 transition">
                <User size={24} />
              </Link>
            )}
          </div>
        </div>

      </nav>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};

export default Navbar;
