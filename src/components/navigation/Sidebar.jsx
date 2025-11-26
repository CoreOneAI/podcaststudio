// src/components/navigation/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// CRITICAL FIX: Changed path from ./context to ../../context
import { useAuth } from '../../context/AuthContext.jsx'; 

// Define the navigation items
const navItems = [
  { name: 'Dashboard', path: '/', icon: '🏠' },
  { name: 'Create Project', path: '/projects/new', icon: '📝' },
  { name: 'Guest Management', path: '/guests', icon: '👥' },
  { name: 'AI Chat Assistant', path: '/ai-chat', icon: '🤖' },
];

function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation(); // Hook to get current path for active state

  const handleSignOut = () => {
    signOut();
    // The ProtectedRoute in App.jsx will automatically redirect to /login
  };

  return (
    // Uses the custom 'navy-900' background color and sets a fixed width
    <div className="w-64 flex flex-col bg-navy-900 text-white min-h-screen shadow-2xl">
      
      {/* 1. Logo/Portal Title Section */}
      <div className="p-6 border-b border-navy-700">
        <h1 className="text-2xl font-bold tracking-widest text-teal-500">
          PodcastStudio
        </h1>
        <p className="text-xs text-gray-400 mt-1">Portal</p>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          // Determine if the link is active
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center p-3 rounded-lg text-sm font-medium transition duration-200
                ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-md' // Active link style (Teal)
                    : 'text-gray-300 hover:bg-navy-700 hover:text-white' // Inactive link style
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer/Sign Out Section */}
      <div className="p-4 border-t border-navy-700">
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full p-3 rounded-lg text-sm font-medium 
                     text-gray-300 bg-navy-700 hover:bg-red-700 hover:text-white transition duration-200"
        >
          <span className="mr-2 text-lg">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;