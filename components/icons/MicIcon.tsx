
import React from 'react';

const MicIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5V21m-6-6.75v-1.5a6 6 0 0 1 12 0v1.5m-6 7.5a6 6 0 0 1-6-6m6 7.5v2.25m6-12v-1.5a6 6 0 0 0-12 0v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 12.75 0-6.75m0 6.75a3.75 3.75 0 0 1-3.75-3.75M12 12.75a3.75 3.75 0 0 0 3.75-3.75M12 6a3.75 3.75 0 0 1 3.75 3.75m-7.5 0A3.75 3.75 0 0 1 12 6m0 0v.01" />
  </svg>
);

export default MicIcon;
