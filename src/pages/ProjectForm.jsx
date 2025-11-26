// src/pages/ProjectForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function ProjectForm() {
  const { user } = useAuth(); // Get the authenticated user (which includes team_id)
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Draft'); // Default status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Status options for the select dropdown
  const statusOptions = ['Draft', 'In Production', 'Editing', 'Completed', 'On Hold'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user || !user.team_id) {
        setError("Authentication error: User or team ID is missing.");
        setLoading(false);
        return;
    }

    const newProject = {
      title,
      description,
      status,
      // **CRUCIAL LOGIC**: Insert the team_id to satisfy RLS
      team_id: user.team_id, 
      created_by: user.id // Optional: Track who created it
    };

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert([newProject])
      .select(); // Use .select() to return the inserted data

    setLoading(false);

    if (insertError) {
      console.error('Error creating project:', insertError);
      setError(`Failed to create project: ${insertError.message}`);
    } else {
      // Success: Navigate to the new project details page or the dashboard
      const newProjectId = data[0].id;
      navigate(`/projects/${newProjectId}`, { replace: true });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-navy-900 mb-6 border-b border-teal-500 pb-2">
        Create New Podcast Project
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Project Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description / Notes
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Status Select */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Initial Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition duration-150 ease-in-out 
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300'}`
          }
        >
          {loading ? 'Creating Project...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}

export default ProjectForm;