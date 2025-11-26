// src/components/HostMessageSender.js

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Import your Firestore instance

// IMPORTANT: Replace 'vonage_messages' with the EXACT Firestore Collection Path
// you configured during the Vonage Messages API Extension installation.
// You can find this path on the extension's dashboard in the Firebase Console.
const VONAGE_MESSAGES_COLLECTION_PATH = 'vonage_messages'; // <<< VERIFY THIS!

// IMPORTANT: Replace with your actual Vonage virtual number configured for SMS.
// It MUST be a string and include the '+' and country code (e.g., '+17173089595').
const YOUR_VONAGE_SMS_NUMBER = '+17173089595'; // <<< REPLACE THIS!

function HostMessageSender() {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [status, setStatus] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!recipientPhone || !messageContent) {
      setStatus('Please enter both phone number and message.');
      return;
    }

    // Validation for recipient phone number format
    // Ensures it starts with '+' and has a reasonable length
    if (!recipientPhone.startsWith('+') || recipientPhone.length < 10) {
      setStatus('Please enter a valid recipient phone number including country code (e.g., +15551234567).');
      return;
    }

    setStatus('Sending message via Vonage...');
    try {
      await addDoc(collection(db, VONAGE_MESSAGES_COLLECTION_PATH), {
        to: {
          type: 'sms',
          number: recipientPhone // The recipient's phone number (e.g., '+15551234567')
        },
        from: {
          type: 'sms',
          number: YOUR_VONAGE_SMS_NUMBER // <<< CORRECTED: Uses the string constant!
        },
        message: {
          type: 'text',
          text: messageContent // The actual message content
        },
        timestamp: serverTimestamp(), // Optional: adds a server timestamp for ordering/logging
      });
      setStatus('Message request successfully sent to Firestore! Check the recipient\'s phone.');
      setRecipientPhone('');
      setMessageContent('');
    } catch (error) {
      console.error('Error adding Vonage message request to Firestore:', error);
      setStatus(`Failed to send message: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px' }}>
      <h2>Send Message to Guest (via Vonage)</h2>
      <form onSubmit={handleSendMessage}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="recipientPhone" style={{ display: 'block', marginBottom: '5px' }}>Recipient Phone (e.g., +15551234567):</label>
          <input
            type="tel" // Use type="tel" for phone numbers
            id="recipientPhone"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="+12345678900"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="messageContent" style={{ display: 'block', marginBottom: '5px' }}>Message:</label>
          <textarea
            id="messageContent"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here..."
            rows="4"
            required
            style={{ width: '100%', padding: '8px' }}
          ></textarea>
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#673AB7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Send Vonage Message
        </button>
      </form>
      {status && <p style={{ marginTop: '10px', color: status.includes('Failed') ? 'red' : 'green' }}>{status}</p>}
    </div>
  );
}

export default HostMessageSender;
