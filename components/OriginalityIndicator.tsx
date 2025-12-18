import React from 'react';

interface OriginalityIndicatorProps {
    score: number;
    justification: string;
    size?: 'small' | 'default';
}

const OriginalityIndicator: React.FC<OriginalityIndicatorProps> = ({ score, justification, size = 'default' }) => {
    const getScoreColor = () => {
        if (score >= 70) return { ring: 'ring-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
        if (score >= 40) return { ring: 'ring-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        return { ring: 'ring-green-500', text: 'text-green-400', bg: 'bg-green-500/10' };
    };

    const { ring, text, bg } = getScoreColor();
    
    const isSmall = size === 'small';
    const containerSize = isSmall ? 'w-9 h-9' : 'w-10 h-10';
    const textSize = isSmall ? 'text-sm' : 'text-base';
    const labelSize = isSmall ? 'text-[9px]' : 'text-xs';
    const marginTop = isSmall ? 'mt-0.5' : 'mt-1';

    return (
        <div className="group relative flex flex-col items-center justify-center">
            <div className={`flex items-center justify-center rounded-full ${containerSize} ${bg} ring-2 ring-inset ${ring}`}>
                <span className={`font-bold ${text} ${textSize}`}>{score}%</span>
            </div>
            <span className={`${labelSize} font-semibold text-slate-500 whitespace-nowrap ${marginTop}`}>Similaridade IA</span>

             <div className="absolute bottom-full mb-2 w-72 p-3 bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <h5 className="font-bold mb-1">Justificativa da IA:</h5>
                <p>{justification}</p>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-700 transform rotate-45"></div>
            </div>
        </div>
    );
};

export default OriginalityIndicator;