// src/pages/ProjectDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useRealtimeProjects } from '../hooks/useRealtimeProjects';

// Status options for the update dropdown
const STATUS_OPTIONS = ['Draft', 'In Production', 'Editing', 'Completed', 'On Hold'];

function ProjectDetails() {
  const { id } = useParams(); // Get project ID from the URL
  const navigate = useNavigate();
  // Get the project data from the hook's real-time list
  const { projects, loading: hookLoading, error: hookError } = useRealtimeProjects();

  const [project, setProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // --- Effect to find the project details from the real-time list ---
  useEffect(() => {
    // We check the real-time projects array first
    if (projects.length > 0) {
      const foundProject = projects.find(p => p.id === parseInt(id));
      if (foundProject) {
        setProject(foundProject);
        setSelectedStatus(foundProject.status);
      } else if (!hookLoading) {
        // If not found in the list and not loading, it might be an invalid ID
        // Note: For a very large number of projects, you might want a direct fetch fallback here.
        navigate('/', { replace: true });
      }
    }
  }, [id, projects, hookLoading, navigate]);


  // --- Status Update Handler (Triggers Real-time Update) ---
  const handleStatusUpdate = async () => {
    if (!project || selectedStatus === project.status) return;

    setUpdateLoading(true);
    setUpdateError(null);

    // Update only the 'status' column for the current project ID
    const { error: updateError } = await supabase
      .from('projects')
      .update({ status: selectedStatus })
      .eq('id', id);

    setUpdateLoading(false);

    if (updateError) {
      console.error('Error updating status:', updateError);
      setUpdateError(`Failed to update status: ${updateError.message}`);
    } 
    // Success: The useRealtimeProjects hook handles updating the 'project' state 
    // via its subscription listener, ensuring consistency.
  };

  if (hookLoading || !project) {
    return <div className="text-center mt-12 text-lg text-teal-500">Loading Project Details...</div>;
  }
  
  if (hookError) {
    return <div className="p-4 bg-red-100 text-red-700">Error: {hookError.message}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-navy-900 mb-4">{project.title}</h1>
      <p className="text-xl text-gray-500 mb-6 border-b pb-4">
        Project ID: <span className="font-mono text-sm bg-gray-100 p-1 rounded">#{project.id}</span>
      </p>

      {/* --- Details Section --- */}
      <div className="space-y-4 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-teal-500">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-teal-500">Created</h3>
          <p className="text-gray-700">{new Date(project.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* --- Status Update Card --- */}
      <div className="p-6 bg-navy-900 text-white rounded-lg shadow-xl">
        <h3 className="text-2xl font-bold text-teal-500 mb-4">Update Project Status</h3>
        
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          
          {/* Current Status Display */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300">Current Status:</p>
            <span className={`text-2xl font-extrabold ${project.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
              {project.status}
            </span>
          </div>
          
          {/* Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-grow border-0 rounded-md p-3 text-navy-900 font-medium focus:ring-teal-500 focus:border-teal-500"
            disabled={updateLoading}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          {/* Update Button */}
          <button
            onClick={handleStatusUpdate}
            disabled={updateLoading || selectedStatus === project.status}
            className={`px-6 py-3 rounded-lg text-lg font-semibold transition duration-200 
              ${updateLoading || selectedStatus === project.status
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 text-white'
              }`
            }
          >
            {updateLoading ? 'Saving...' : 'Update Status'}
          </button>
        </div>

        {updateError && (
          <div className="mt-4 p-3 text-sm bg-red-700 text-white rounded-md">
            {updateError}
          </div>
        )}
      </div>
      {/* End Status Update Card */}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-teal-500 hover:text-teal-600 transition duration-150 text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>

    </div>
  );
}

export default ProjectDetails;