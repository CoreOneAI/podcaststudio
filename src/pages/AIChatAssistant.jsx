// src/pages/AIChatAssistant.js
import React, { useState, useRef, useEffect } from 'react';

// Define the API endpoint for your Netlify function
const GEMINI_ENDPOINT = '/.netlify/functions/gemini-chat';

// Initial greeting message from the assistant
const initialMessages = [
  { 
    role: 'model', 
    text: "Hello! I'm the Podcast Studio Assistant. How can I help you plan, produce, or manage your next project?",
  },
];

function AIChatAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    
    // 1. Add user message to state
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // 2. Call the Netlify serverless function with history
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }), // Send the full history
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.response;

      // 3. Add AI response to state
      setMessages((prev) => [...prev, { role: 'model', text: assistantResponse }]);

    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Error: Could not connect to the assistant. Please check the Netlify function logs.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getBubbleClass = (role) => {
    return role === 'user'
      ? 'bg-teal-500 text-white self-end rounded-br-none'
      : 'bg-gray-200 text-navy-900 self-start rounded-tl-none';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-navy-900 mb-4 border-b border-gray-200 pb-2">
        AI Chat Assistant 🤖
      </h1>
      
      {/* --- Chat History Area --- */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 mb-4 bg-white border border-gray-200 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-xl p-3 rounded-xl shadow ${getBubbleClass(msg.role)}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-700 p-3 rounded-xl rounded-tl-none">
              <span className="animate-pulse">Assistant is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Form --- */}
      <form onSubmit={sendMessage} className="flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant a question about your podcast..."
          className="flex-1 border border-gray-300 rounded-full p-3 focus:ring-teal-500 focus:border-teal-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`px-6 py-3 rounded-full text-lg font-semibold text-white transition duration-150 
            ${loading || !input.trim()
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-navy-900 hover:bg-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-300'
            }`
          }
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default AIChatAssistant;