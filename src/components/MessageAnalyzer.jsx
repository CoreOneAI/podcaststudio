import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Import for Callable Functions
import { app } from '../firebase'; // Import your Firebase app instance
import { useAuth } from '../context/AuthContext'; // To show current user info

// Initialize Cloud Functions
const functions = getFunctions(app);
const analyzeMessageCallable = httpsCallable(functions, 'analyzeDatingMessage'); // Link to your Cloud Function

function MessageAnalyzer() {
  const { currentUser, userRole } = useAuth(); // Access auth state
  const [message, setMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);
    setError(null);

    if (!message.trim()) {
      setError("Please enter a message to analyze.");
      setLoading(false);
      return;
    }

    try {
      // Call the Cloud Function
      const result = await analyzeMessageCallable({ message: message });
      setAnalysisResult(result.data); // result.data contains the return value from your function
    } catch (err) {
      console.error("Error calling analyzer function:", err);
      // Firebase Callable Function errors are structured.
      // err.code will be like "unauthenticated", "invalid-argument", etc.
      // err.message will be the message you threw from the function.
      setError(`Analysis failed: ${err.message || 'An unknown error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Dating App Message Analyzer</h2>
      <p className="text-gray-600 mb-8 text-center">
        Paste messages you receive on dating apps here to get an assessment of potential scam or bot indicators.
        Always trust your intuition, but let us help you spot red flags.
      </p>

      {/* User Info (optional, for debugging/context) */}
      {currentUser && (
        <p className="text-sm text-gray-500 mb-4 text-center">
          Analyzed by: {currentUser.isAnonymous ? 'Guest User' : currentUser.email} (Role: {userRole})
        </p>
      )}

      {/* Message Input */}
      <div className="mb-6">
        <label htmlFor="messageInput" className="block text-sm font-medium text-gray-700 mb-2">Message to Analyze:</label>
        <textarea
          id="messageInput"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="8"
          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
          placeholder="Paste the suspicious message here..."
        ></textarea>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 mb-4 text-sm bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`py-3 px-8 rounded-lg shadow-lg text-lg font-semibold text-white transition duration-150 ease-in-out transform 
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 hover:scale-[1.01]'}`
          }
        >
          {loading ? 'Analyzing...' : 'Analyze Message'}
        </button>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className={`p-6 rounded-lg ${analysisResult.isScamLikely ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border-l-4`}>
          <h3 className="text-2xl font-bold mb-3 flex items-center">
            {analysisResult.isScamLikely ? (
              <span className="text-red-600 mr-2">🚨</span>
            ) : (
              <span className="text-green-600 mr-2">✅</span>
            )}
            {analysisResult.assessment}
          </h3>
          <p className="text-gray-800 text-sm mb-4">Score: {analysisResult.score}/100 (Higher score = higher risk)</p>
          
          {analysisResult.flags && analysisResult.flags.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Detected Flags:</h4>
              <ul className="list-disc list-inside text-gray-600">
                {analysisResult.flags.map((flag, index) => <li key={index}>{flag}</li>)}
              </ul>
            </div>
          )}

          {analysisResult.advice && analysisResult.advice.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Our Advice:</h4>
              <ul className="list-disc list-inside text-gray-600">
                {analysisResult.advice.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageAnalyzer;
