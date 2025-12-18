import React from 'react';

const GiftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a8.25 8.25 0 0 1-16.5 0v-8.25m16.5 0a8.25 8.25 0 0 0-16.5 0m16.5 0v-1.5A2.25 2.25 0 0 0 18.75 7.5h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5m-6.75-3.75v1.5A2.25 2.25 0 0 1 6.75 7.5h-1.5a2.25 2.25 0 0 1-2.25-2.25v-1.5m11.25-1.5v-1.5a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5" />
    </svg>
);

export default GiftIcon;