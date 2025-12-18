import React from 'react';

const UserPlusIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.375 19.5a5.25 5.25 0 0 1 10.5 0v.25c0 .524.423.95.95.95h.4c.524 0 .95-.423.95-.95v-.25a5.25 5.25 0 0 1 10.5 0v.25c0 .524.423.95.95.95h.4c.524 0 .95-.423.95-.95v-.25a5.25 5.25 0 0 1-10.5 0v-.25c0-.524-.423-.95-.95-.95h-.4c-.524 0-.95.423-.95.95v.25Z" />
  </svg>
);

export default UserPlusIcon;