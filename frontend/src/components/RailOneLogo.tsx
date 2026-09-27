import React from 'react';

interface RailOneLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RailOneLogo: React.FC<RailOneLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`flex items-center select-none font-sans font-extrabold tracking-tight ${sizeClasses[size]} ${className}`}>
      {/* "Ra" in dark black */}
      <span className="text-[#111827]">Ra</span>
      {/* "i" with custom vibrant orange/red accent dot */}
      <span className="relative inline-block text-[#111827]">
        <span className="opacity-0">i</span>
        <span className="absolute bottom-0 left-0 right-0 top-[28%] bg-[#111827] w-full h-[72%] rounded-[1px]"></span>
        <span className="absolute top-[2%] left-1/2 -translate-x-1/2 w-[3.5px] h-[3.5px] sm:w-[4px] sm:h-[4px] rounded-full bg-[#FF5722] shadow-[0_0_4px_rgba(255,87,34,0.6)]"></span>
      </span>
      {/* "l" in dark black */}
      <span className="text-[#111827]">l</span>
      {/* "One" in deep dark navy/gray */}
      <span className="text-[#172B63] ml-[1px]">One</span>
    </div>
  );
};
