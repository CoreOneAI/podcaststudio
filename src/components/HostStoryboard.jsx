import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Assuming 'db' is your initialized Firestore instance
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext'; // To potentially show who's logged in

// Component to display and manage individual story submissions
const StoryCard = ({ submission }) => {
  const [currentStatus, setCurrentStatus] = useState(submission.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    setError(null);
    try {
      const submissionRef = doc(db, 'storySubmissions', submission.id);
      await updateDoc(submissionRef, {
        status: newStatus,
        updatedAt: serverTimestamp(), // Keep track of when status was last updated
      });
      setCurrentStatus(newStatus); // Update local state on success
    } catch (err) {
      console.error("Error updating submission status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors = {
    submitted: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{submission.userName} <span className="text-gray-500 text-sm">- {submission.userEmail}</span></h3>
          {submission.userPhone && <p className="text-gray-600 text-sm">Phone: {submission.userPhone}</p>}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus] || 'bg-gray-100 text-gray-800'}`}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </span>
      </div>

      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{submission.storyText}</p>

      <div className="text-sm text-gray-500 mb-4">
        <p>Submitted: {submission.createdAt?.toDate().toLocaleString() || 'N/A'}</p>
        {submission.updatedAt && <p>Last Updated: {submission.updatedAt.toDate().toLocaleString()}</p>}
        {submission.isCallInGuest && <p className="font-medium text-purple-600">Interested in Call-in Guest</p>}
        {submission.isLiveGuest && <p className="font-medium text-indigo-600">Interested in Live Guest</p>}
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor={`status-${submission.id}`} className="sr-only">Change Status</label>
        <select
          id={`status-${submission.id}`}
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isUpdating}
          className="block w-40 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
        >
          <option value="submitted">Submitted</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        {isUpdating && <p className="text-blue-500 text-sm">Updating...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      {/* You could add buttons here for "Email Listener", "View Analyzer Report", etc. */}
    </div>
  );
};

// Main Host Storyboard Component
function HostStoryboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'storySubmissions'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSubmissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(fetchedSubmissions);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching story submissions:", err);
      setError("Failed to load stories.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-lg">Loading stories...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 text-lg">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Host Storyboard</h2>
      {submissions.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">No stories submitted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map(submission => (
            <StoryCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HostStoryboard;
