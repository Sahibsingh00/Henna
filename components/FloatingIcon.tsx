import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingIconProps {
  Icon: LucideIcon;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ Icon, className, direction = 'up' }) => {
  const getAnimation = () => {
    switch (direction) {
      case 'up':
        return 'animate-float-up-down';
      case 'down':
        return 'animate-float-down-up';
      case 'left':
        return 'animate-float-left-right';
      case 'right':
        return 'animate-float-right-left';
      default:
        return 'animate-float-up-down';
    }
  };

  return (
    <div className={`absolute ${getAnimation()} ${className} opacity-50`}>
      <Icon className="w-8 h-8 md:w-12 md:h-12 text-green-500" />
    </div>
  );
};

export default FloatingIcon;
