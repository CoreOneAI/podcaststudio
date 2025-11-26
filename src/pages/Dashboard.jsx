// src/pages/Dashboard.js
import React, { useState, useMemo } from 'react'; // Added useMemo for efficient filtering
import { useRealtimeProjects } from '../hooks/useRealtimeProjects';
import ProjectCard from '../components/projects/ProjectCard'; 

// Define status options for the filter dropdown
const STATUS_OPTIONS = ['All', 'Draft', 'In Production', 'Editing', 'Completed', 'On Hold'];

function Dashboard() {
  const { projects, loading, error } = useRealtimeProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // --- Filtering Logic using useMemo ---
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // 1. Filter by Status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    // 2. Filter by Search Term (Title or Description)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(lowerCaseSearch) ||
        project.description.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    return filtered;
  }, [projects, searchTerm, filterStatus]); // Recalculate only when dependencies change

  if (loading) {
    return (
        <div className="text-center mt-12">
            <p className="text-xl font-semibold text-navy-900">Loading Team Projects...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center mt-12 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="text-2xl font-bold">Error Loading Data</h2>
            <p>Could not fetch projects: {error.message}</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-navy-900 mb-6 border-b-2 border-teal-500 pb-2">
        Team Projects Dashboard
      </h1>

      {/* --- Filtering and Action Area --- */}
      <div className="flex flex-wrap justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
        
        {/* Search Input */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search by Title or Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="w-1/2 md:w-1/4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Create Project Button */}
        <div className="w-1/2 md:w-auto text-right">
          <a 
            href="/projects/new" 
            className="px-4 py-2 rounded-lg text-white font-semibold shadow-lg transition duration-200 
                       bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            + New Project
          </a>
        </div>
      </div>
      {/* --- End Filtering and Action Area --- */}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl mt-10">
          <p className="text-xl text-gray-500">No projects match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            // Ensure ProjectCard links to /projects/:id
            <ProjectCard key={project.id} project={project} /> 
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;