// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login() {
  // States for Team Login
  const [teamEmail, setTeamEmail] = useState(''); // Renamed for clarity
  const [teamPassword, setTeamPassword] = useState(''); // Renamed for clarity

  // States for Email Link Login
  const [listenerEmailLink, setListenerEmailLink] = useState(''); // Renamed for clarity

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn, signInAsGuest, sendEmailSignInLink, isAuthenticated, pendingEmail } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null; 
  }

  // --- Handlers for various login methods ---

  const handleTeamLogin = async (e) => { // Renamed for clarity
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(teamEmail, teamPassword);

    if (signInError) {
      setError(signInError.message || 'Team login failed. Check credentials.');
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    setError(null);
    const { error: guestError } = await signInAsGuest();

    if (guestError) {
      setError(guestError.message || 'Could not grant guest access. Please try again.');
      setLoading(false);
    }
  };

  const handleSendEmailLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: sendError } = await sendEmailSignInLink(listenerEmailLink);

    if (sendError) {
      setError(sendError.message || 'Failed to send login link. Please try again.');
      setLoading(false);
    } else {
      setError(null);
      setLoading(false);
      alert(`A login link has been sent to ${listenerEmailLink}. Please check your inbox and spam folder.`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 transform hover:shadow-3xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-navy-900">
            Encore Portal
          </h1>
          <p className="text-teal-500 mt-2 text-lg">Access for Listeners & Team</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-4 text-sm bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* --- LISTENER ACCESS OPTIONS --- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Listener Access</h2>

        {/* Option 1: Email Link Sign-in (Persistent Listener) */}
        <form onSubmit={handleSendEmailLink} className="space-y-4 mb-6">
            <p className="text-lg text-gray-700 font-medium text-center">Login with your email (no password needed!)</p>
            {pendingEmail ? (
                <p className="p-4 text-sm bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                    A login link was sent to <span className="font-bold">{pendingEmail}</span>. Please check your inbox.
                </p>
            ) : (
                <>
                    <div>
                        <label htmlFor="listenerEmailLink" className="sr-only">Your Email</label>
                        <input
                            type="email"
                            id="listenerEmailLink"
                            value={listenerEmailLink}
                            onChange={(e) => setListenerEmailLink(e.target.value)}
                            required
                            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="your-email@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg shadow-lg text-lg font-semibold text-white transition duration-150 ease-in-out transform 
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 hover:scale-[1.01]'}`
                        }
                    >
                        {loading ? 'Sending Link...' : 'Send Login Link'}
                    </button>
                </>
            )}
        </form>

        <div className="mt-6 text-center text-gray-600 font-semibold">— OR —</div>

        {/* Option 2: Guest Button (Anonymous Listener) */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleGuestAccess}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg shadow-lg text-lg font-semibold transition duration-150 ease-in-out transform 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-navy-700 text-white hover:bg-navy-800 focus:outline-none focus:ring-4 focus:ring-navy-300 hover:scale-[1.01]'}`
            }
          >
            {loading ? 'Granting Guest Access...' : 'Continue as Guest'}
          </button>
        </div>
        
        {/* --- TEAM LOGIN (Less Prominent) --- */}
        <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Team Login</h2>
            <form onSubmit={handleTeamLogin} className="space-y-4">
                <div>
                    <label htmlFor="teamEmail" className="sr-only">Team Email</label>
                    <input
                        type="email"
                        id="teamEmail"
                        value={teamEmail}
                        onChange={(e) => setTeamEmail(e.target.value)}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Team Email"
                    />
                </div>
                <div>
                    <label htmlFor="teamPassword" className="sr-only">Team Password</label>
                    <input
                        type="password"
                        id="teamPassword"
                        value={teamPassword}
                        onChange={(e) => setTeamPassword(e.target.value)}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Password"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg shadow-lg text-lg font-semibold text-white transition duration-150 ease-in-out transform 
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 hover:scale-[1.01]'}`
                    }
                >
                    {loading ? 'Logging In...' : 'Team Sign In'}
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
