// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import Firebase auth object
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// If you need Firestore for user roles, import it too:
// import { db } from '../firebase';
// import { doc, getDoc } from 'firebase/firestore';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // To store the user's role
  const [loading, setLoading] = useState(true);

  const getUserRole = async (user) => {
    if (!user) return null;
    // --- Placeholder for Firebase User Role Logic ---
    // Example using Firestore (requires importing 'db' and Firestore functions):
    // try {
    //   const userDocRef = doc(db, 'users', user.uid); // Assuming a 'users' collection
    //   const userDoc = await getDoc(userDocRef);
    //   if (userDoc.exists()) {
    //     return userDoc.data().role || null;
    //   }
    //   return null;
    // } catch (error) {
    //   console.error('Error fetching user role with Firebase:', error.message);
    //   return null;
    // }
    // --- End Placeholder ---
    
    // For now, returning null or a default role if not implementing Firebase DB roles yet
    return null; // Or 'listener', 'basic', etc.
  };

  useEffect(() => {
    // Subscribe to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user); // user will be null if logged out, or a User object if logged in
      if (user) {
        const role = await getUserRole(user);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false); // Authentication state has been determined
    });

    // Cleanup the auth listener when the component unmounts
    return () => unsubscribe();
  }, []); // auth as dependency if it might change, but typically it's static

  // Login function using Firebase Email/Password
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Firebase's onAuthStateChanged listener will handle updating the currentUser state
      return userCredential.user;
    } catch (error) {
      console.error("Firebase Login Error:", error.message);
      // Firebase auth errors have 'code' and 'message' properties
      throw new Error(error.message || 'Login failed');
    }
  };

  // Logout function using Firebase
  const logout = async () => { // Renamed from signOut to logout to avoid conflict with imported signOut function
    try {
      await signOut(auth);
      // Firebase's onAuthStateChanged listener will handle updating the currentUser state
    } catch (error) {
      console.error("Firebase Logout Error:", error.message);
      throw new Error(error.message || 'Logout failed');
    }
  };

  // The value provided to children components
  const value = {
    currentUser,
    userRole,
    loading,
    signIn,
    logout, // Use logout here
    // You might add signUp, resetPassword, etc. here using Firebase methods
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Only render children once auth state is determined */}
    </AuthContext.Provider>
  );
};
