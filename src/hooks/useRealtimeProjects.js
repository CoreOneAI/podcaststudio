// src/hooks/useRealtimeProjects.js
import { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firebase db object
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext'; // Corrected path to AuthContext

export const useRealtimeProjects = () => {
  const { currentUser, loading: authLoading } = useAuth(); // Get Firebase currentUser and auth loading state
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In Firebase, you typically link data to the current user's UID.
  // If your 'projects' are associated with a 'teamId' that is *different* from the user's UID,
  // you would need to fetch that teamId from another Firestore collection (e.g., a 'users' profile).
  // For now, we'll assume projects are linked directly to the current user's UID.
  const userId = currentUser?.uid;

  useEffect(() => {
    // If authentication is still loading, or no user is logged in,
    // we don't have a userId to query projects, so we stop here.
    if (authLoading || !userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true); // Start loading state for projects
    setError(null);    // Clear any previous errors

    // 1. Construct the Firestore query
    const projectsCollectionRef = collection(db, 'projects');
    const q = query(
      projectsCollectionRef,
      // Assuming your project documents in Firestore have a 'userId' field
      // that matches the current user's UID. If it's called 'teamId', change 'userId' here.
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc') // Assuming a 'createdAt' timestamp field for ordering
    );

    // 2. Set up the real-time listener using onSnapshot
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Map the entire snapshot to your projects state.
      // Firestore's onSnapshot handles initial fetch and all subsequent real-time changes
      const fetchedProjects = snapshot.docs.map(doc => ({
        id: doc.id, // Firestore document ID
        ...doc.data() // All other fields from the document
      }));
      setProjects(fetchedProjects);
      setLoading(false);
      setError(null); // Clear any previous errors if data was successfully received
    }, (firestoreError) => {
      // Handle errors from the Firestore listener
      console.error('Error listening to real-time projects:', firestoreError);
      setError(firestoreError);
      setLoading(false);
    });

    // 3. Cleanup function: important to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();

  }, [currentUser, authLoading, userId]); // Re-run effect if currentUser or authLoading changes

  return { projects, loading, error };
};
