// src/components/HostVideoCall.js

import React, { useState, useEffect, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getFirestore, doc, collection, addDoc, getDoc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth } from '../firebase'; // Assuming 'auth' is exported from firebase.js

// Import the Vonage Client SDK
import OT from '@opentok/client';

// Initialize Firebase Functions and Firestore client
const functions = getFunctions(getApp());
const db = getFirestore(getApp()); // Get Firestore instance
const generateVonageVideoTokenCallable = httpsCallable(functions, 'generateVonageVideoToken');

function HostVideoCall() {
  const [sessionId, setSessionId] = useState(null);
  const [token, setToken] = useState(null);
  const [callDocId, setCallDocId] = useState(''); // Call ID from Firestore
  const [status, setStatus] = useState('');
  const [isConnecting, setIsConnecting] = useState(false); // To prevent multiple connect attempts
  const [isConnected, setIsConnected] = useState(false); // Tracks if OpenTok session is connected

  // Refs for video containers
  const publisherRef = useRef(null); // Where local video stream will be published
  const subscriberRef = useRef(null); // Where remote video streams will be subscribed

  // OpenTok session and publisher instances
  const sessionRef = useRef(null);
  const publisherInstanceRef = useRef(null);

  // --- Utility to clean up OpenTok resources ---
  const cleanupVonage = () => {
    if (publisherInstanceRef.current) {
      publisherInstanceRef.current.destroy();
      publisherInstanceRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    setSessionId(null);
    setToken(null);
    setCallDocId('');
    setIsConnected(false);
    setIsConnecting(false);
    setStatus('Call ended.');
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      cleanupVonage();
    };
  }, []);

  // --- Function to initialize and connect to Vonage Session ---
  const initializeVonageClient = (sId, tok) => {
    if (!publisherRef.current || !subscriberRef.current) {
      setStatus('Video containers not ready.');
      return;
    }
    if (!OT.checkSystemRequirements()) {
      setStatus('Your browser does not support video calls.');
      return;
    }

    setStatus('Attempting to connect to video session...');
    setIsConnecting(true);

    sessionRef.current = OT.initSession(sId);

    // Event listener for new streams (remote participants)
    sessionRef.current.on('streamCreated', (event) => {
      setStatus(`New stream detected from ${event.stream.name || 'a participant'}`);
      const subscriber = sessionRef.current.subscribe(event.stream, subscriberRef.current, {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      }, (err) => {
        if (err) console.error('Error subscribing:', err);
      });
      // Handle subscriber events if needed
    });

    // Event listener for stream destruction (participant leaves)
    sessionRef.current.on('streamDestroyed', (event) => {
      setStatus(`Stream from ${event.stream.name || 'a participant'} destroyed.`);
    });
    
    // Connect to the session
    sessionRef.current.connect(tok, (error) => {
      if (error) {
        console.error('Error connecting to Vonage session:', error);
        setStatus(`Failed to connect to video session: ${error.message}`);
        setIsConnecting(false);
      } else {
        setStatus('Successfully connected to video session.');
        setIsConnected(true);
        setIsConnecting(false);

        // Publish local video stream
        publisherInstanceRef.current = OT.initPublisher(publisherRef.current, {
          insertMode: 'append',
          width: '100%',
          height: '100%',
          name: auth.currentUser?.displayName || auth.currentUser?.email || 'Host'
        }, (err) => {
          if (err) console.error('Error initializing publisher:', err);
          else sessionRef.current.publish(publisherInstanceRef.current, (pubErr) => {
            if (pubErr) console.error('Error publishing:', pubErr);
          });
        });

        // Update Firestore call document status (optional)
        if (callDocId) {
          updateDoc(doc(db, 'videoCalls', callDocId), { status: 'active' });
        }
      }
    });
  };

  // --- Function to start a new call ---
  const startNewCall = async () => {
    if (!auth.currentUser) {
      setStatus('You must be logged in to start a call.');
      return;
    }
    setStatus('Creating new video call...');
    setIsConnecting(true); // Indicate connection attempt

    try {
      // 1. Create a Firestore document for this new call
      const newCallRef = await addDoc(collection(db, 'videoCalls'), {
        startedBy: auth.currentUser.uid,
        status: 'pending',
        createdAt: new Date(),
        participants: [auth.currentUser.uid]
      });
      const newCallId = newCallRef.id;
      setCallDocId(newCallId);

      // 2. Call the Cloud Function to get a session ID and token
      const result = await generateVonageVideoTokenCallable({ callDocId: newCallId, role: 'publisher' });
      setSessionId(result.data.sessionId);
      setToken(result.data.token);
      setStatus(`Call created! Session: ${result.data.sessionId}. Fetching token...`);

      // 3. Initialize and connect to Vonage session
      initializeVonageClient(result.data.sessionId, result.data.token);

    } catch (error) {
      console.error('Error starting new call:', error);
      setStatus(`Error starting call: ${error.message}`);
      setIsConnecting(false);
    }
  };

  // --- Function to join an existing call ---
  const joinExistingCall = async () => {
    if (!auth.currentUser) {
      setStatus('You must be logged in to join a call.');
      return;
    }
    if (!callDocId) {
      setStatus("Please provide a Call ID to join.");
      return;
    }

    setStatus(`Joining call ${callDocId}...`);
    setIsConnecting(true);

    try {
      // 1. Get the existing session ID from Firestore
      const callDoc = await getDoc(doc(db, 'videoCalls', callDocId));
      if (!callDoc.exists()) {
        throw new Error("Call not found.");
      }
      const existingSessionId = callDoc.data().vonageSessionId;

      if (!existingSessionId) {
        throw new Error("No Vonage session associated with this call yet. Call might not be active.");
      }

      // 2. Call the Cloud Function to get a token for the existing session
      const result = await generateVonageVideoTokenCallable({ sessionId: existingSessionId, role: 'publisher' });
      setSessionId(result.data.sessionId);
      setToken(result.data.token);
      setStatus(`Fetched token for session: ${result.data.sessionId}. Now connecting...`);

      // 3. Update participants in Firestore (optional)
      if (!callDoc.data().participants.includes(auth.currentUser.uid)) {
         await updateDoc(doc(db, 'videoCalls', callDocId), { 
             participants: [...callDoc.data().participants, auth.currentUser.uid] 
         });
      }


      // 4. Initialize and connect to Vonage session
      initializeVonageClient(result.data.sessionId, result.data.token);

    } catch (error) {
      console.error('Error joining call:', error);
      setStatus(`Error joining call: ${error.message}`);
      setIsConnecting(false);
    }
  };

  // --- Function to end the call ---
  const endCall = () => {
    cleanupVonage();
    // Potentially update Firestore call document status to 'ended'
    if (callDocId) {
       updateDoc(doc(db, 'videoCalls', callDocId), { status: 'ended' });
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px' }}>
      <h2>Vonage Video Call</h2>

      {(!isConnected && !isConnecting) ? ( // Show start/join options if not connected or connecting
        <>
          <button onClick={startNewCall} disabled={isConnecting}>Start New Host Call</button>
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Enter Call ID to join"
              value={callDocId}
              onChange={(e) => setCallDocId(e.target.value)}
              style={{ marginRight: '5px', padding: '8px' }}
            />
            <button onClick={joinExistingCall} disabled={isConnecting || !callDocId}>Join Existing Call</button>
          </div>
        </>
      ) : ( // Show call interface if connected or connecting
        <>
          <p>Status: {status}</p>
          <button onClick={endCall}>End Call</button>
          {callDocId && <p>Call ID: <strong>{callDocId}</strong> (Share this to invite others)</p>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Local Publisher Video */}
            <div ref={publisherRef} style={{ width: '320px', height: '240px', border: '1px solid gray', backgroundColor: '#333' }}>
              {/* Publisher video will be appended here */}
            </div>
            {/* Remote Subscriber Videos */}
            <div ref={subscriberRef} style={{ width: '320px', height: '240px', border: '1px solid gray', backgroundColor: '#555' }}>
              {/* Subscriber videos will be appended here */}
            </div>
            {/* For multiple subscribers, you'd typically manage multiple subscriber containers */}
            {/* You'd dynamically create divs for each new subscriber stream */}
          </div>
        </>
      )}
      {status && <p>{status}</p>}
    </div>
  );
}

export default HostVideoCall;
