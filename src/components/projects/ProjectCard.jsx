// src/components/projects/ProjectCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function ProjectCard({ project }) {
  // Function to determine color based on status
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-500';
      case 'In Production':
        return 'bg-teal-100 text-teal-700 border-teal-500';
      case 'Editing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-500';
      case 'On Hold':
        return 'bg-red-100 text-red-700 border-red-500';
      case 'Draft':
      default:
        return 'bg-gray-100 text-gray-500 border-gray-400';
    }
  };

  const statusClasses = getStatusClasses(project.status);
  
  // Define custom colors: Navy Blue (#1A2C42) and Teal (#009688)
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.01] border border-gray-200">
      <Link to={`/projects/${project.id}`} className="block p-5">
        
        {/* Status Tag */}
        <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${statusClasses} mb-3`}>
          {project.status}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-navy-900 mb-2 truncate">
          {project.title}
        </h2>

        {/* Description Snippet */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {project.description || 'No description provided.'}
        </p>

        {/* Metadata */}
        <div className="text-xs text-gray-500 border-t pt-3 mt-3">
          <p>Team ID: <span className="font-mono text-gray-700">{project.team_id.substring(0, 8)}...</span></p>
          <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
        </div>

      </Link>
    </div>
  );
}

export default ProjectCard;