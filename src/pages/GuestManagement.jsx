// src/pages/GuestManagement.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // Use a library to generate unique file names

function GuestManagement() {
  const { user, isAuthenticated } = useAuth();
  const [guestName, setGuestName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [seriesName, setSeriesName] = useState(''); // Holds the selected series title
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const [seriesOptions, setSeriesOptions] = useState([]); // List of available project titles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guests, setGuests] = useState([]); // State to hold the list of guests

  const teamId = user?.team_id;

  // --- 1. Fetching Series Options and Initial Guests ---
  useEffect(() => {
    if (!isAuthenticated || !teamId) return;

    // Fetch unique project titles for the Series selection box
    const fetchSeriesAndGuests = async () => {
      setLoading(true);
      
      // Fetch project titles
      const { data: projectsData, error: projError } = await supabase
        .from('projects')
        .select('title')
        .eq('team_id', teamId);
      
      if (projError) {
        console.error('Error fetching series titles:', projError);
        setError('Could not load available series titles.');
      } else {
        // Map data to an array of titles, ensuring uniqueness
        const uniqueTitles = [...new Set(projectsData.map(p => p.title))];
        setSeriesOptions(uniqueTitles);
      }
      
      // Fetch existing guests
      const { data: guestsData, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (guestError) {
        console.error('Error fetching guests:', guestError);
        setError(prev => prev + ' Could not load existing guests.');
      } else {
        setGuests(guestsData);
      }

      setLoading(false);
    };

    fetchSeriesAndGuests();
  }, [isAuthenticated, teamId]);

  // --- 2. File Upload Function (Supabase Storage) ---
  const uploadPhoto = async () => {
    if (!photoFile) return { error: null, publicUrl: null };

    // Create a unique file path: teamId/guest_photos/unique_id.extension
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${teamId}/guest_photos/${fileName}`;

    // Upload to 'guest-photos' bucket
    const { error: uploadError } = await supabase.storage
      .from('guest-photos') // **NOTE**: Ensure this bucket exists in your Supabase project
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Photo upload error:', uploadError);
      return { error: uploadError, publicUrl: null };
    }

    // Get the public URL for the uploaded file
    const { data: publicURLData } = supabase.storage
      .from('guest-photos')
      .getPublicUrl(filePath);
    
    return { error: null, publicUrl: publicURLData.publicUrl };
  };

  // --- 3. Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Upload the photo first
    const { error: uploadError, publicUrl } = await uploadPhoto();
    if (uploadError) {
      setError(`Failed to upload photo: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    // 2. Insert guest data into the 'guests' table
    const newGuest = {
      name: guestName,
      contact_info: contactInfo,
      series_name: seriesName, // Tying guest to the selected series
      episode_number: episodeNumber,
      photo_url: publicUrl, // Save the public URL
      team_id: teamId, // CRUCIAL for RLS
    };

    const { data, error: insertError } = await supabase
      .from('guests')
      .insert([newGuest])
      .select();

    setLoading(false);

    if (insertError) {
      console.error('Error adding guest:', insertError);
      setError(`Failed to add guest: ${insertError.message}`);
    } else {
      // Success: Clear form and update guest list
      setGuests([data[0], ...guests]);
      setGuestName('');
      setContactInfo('');
      setSeriesName('');
      setEpisodeNumber('');
      setPhotoFile(null);
      // Clear the file input field visually
      document.getElementById('photo-upload').value = null;
    }
  };
  
  // Simple Guest Delete Function (for the CRUD interface)
  const handleDelete = async (guestId) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
        const { error: deleteError } = await supabase
            .from('guests')
            .delete()
            .eq('id', guestId);

        if (deleteError) {
            alert('Failed to delete guest: ' + deleteError.message);
        } else {
            // Remove from local state to update UI
            setGuests(guests.filter(g => g.id !== guestId));
        }
    }
  };


  return (
    <div className="p-6">
      <h1 className="text-4xl font-extrabold text-navy-900 mb-6 border-b-2 border-teal-500 pb-2">
        Guest Management 👥
      </h1>
      
      {/* --- Add New Guest Form --- */}
      <div className="mb-10 p-6 bg-white shadow-lg rounded-lg border border-gray-100">
        <h2 className="text-2xl font-semibold text-navy-900 mb-4">Add New Guest</h2>
        
        {error && (
            <div className="p-3 mb-4 text-sm bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Guest Name */}
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Contact Info */}
          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Contact Info (Email/Phone)</label>
            <input
              type="text"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          {/* Series Selection (Your new requirement) */}
          <div>
            <label htmlFor="seriesName" className="block text-sm font-medium text-gray-700">Series Name</label>
            <select
              id="seriesName"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="" disabled>Select a series...</option>
              {seriesOptions.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Series are taken from your current projects.</p>
          </div>
          
          {/* Episode Number (Your new requirement) */}
          <div>
            <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-700">Episode Number</label>
            <input
              type="number"
              id="episodeNumber"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Guest Photo Upload */}
          <div className="md:col-span-2">
            <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700">Guest Photo (Optional)</label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            <p className="text-xs text-gray-500 mt-1">Saves file to Supabase Storage.</p>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md shadow-md text-lg font-semibold text-white transition duration-150 ease-in-out 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300'}`
              }
            >
              {loading ? 'Adding Guest...' : 'Save New Guest'}
            </button>
          </div>
        </form>
      </div>

      {/* --- Existing Guests List (CRUD View) --- */}
      <h2 className="text-3xl font-semibold text-navy-900 mb-4">Existing Team Guests</h2>
      
      {loading && <p className="text-center text-teal-500">Loading guests...</p>}
      
      {guests.length === 0 && !loading && (
          <p className="text-gray-500">No guests have been added yet.</p>
      )}

      <div className="space-y-4">
        {guests.map(guest => (
          <div key={guest.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center space-x-4">
              {guest.photo_url ? (
                <img 
                  src={guest.photo_url} 
                  alt={guest.name} 
                  className="w-12 h-12 object-cover rounded-full border-2 border-teal-500" 
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg text-gray-500">?</div>
              )}
              <div>
                <p className="text-lg font-bold text-navy-900">{guest.name}</p>
                <p className="text-sm text-gray-600">
                    Series: **{guest.series_name || 'N/A'}** | Episode: **{guest.episode_number || 'N/A'}**
                </p>
                <p className="text-xs text-gray-500 italic">{guest.contact_info}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleDelete(guest.id)}
              className="text-red-500 hover:text-red-700 transition duration-150 p-2 rounded-full hover:bg-red-50"
              title="Delete Guest"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuestManagement;