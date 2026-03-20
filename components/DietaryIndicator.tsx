
import React from 'react';

interface DietaryIndicatorProps {
  dietary: 'Veg' | 'Non-Veg' | 'All';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const DietaryIndicator: React.FC<DietaryIndicatorProps> = ({ dietary, size = 'md', onClick, className = '' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3 border-[1px]',
    md: 'w-4 h-4 border-[1.5px]',
    lg: 'w-5 h-5 border-[2px]'
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  const getStyles = () => {
    switch (dietary) {
      case 'Veg':
        return {
          border: 'border-green-600',
          dot: 'bg-green-600'
        };
      case 'Non-Veg':
        return {
          border: 'border-red-600',
          dot: 'bg-red-600'
        };
      case 'All':
        return {
          border: 'border-gray-400',
          dot: 'bg-gray-400'
        };
      default:
        return {
          border: 'border-gray-400',
          dot: 'bg-gray-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        ${styles.border} 
        flex items-center justify-center 
        rounded-sm bg-white 
        ${onClick ? 'cursor-pointer active:scale-90' : ''} 
        transition-all 
        ${className}
      `}
      title={dietary}
    >
      <div className={`${dotSizeClasses[size]} rounded-full ${styles.dot}`} />
    </div>
  );
};

export default DietaryIndicator;
