import React from 'react';

export interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  name?: string;
}

/**
 * CAPACITY CONNECT Standard Avatar
 * Air-gapped government portal compliance:
 * Neutral light-grey fill with no image, no initials, and no icon.
 */
export const Avatar: React.FC<AvatarProps> = ({ size = 'md', className = '', name }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 min-w-8 min-h-8',
    md: 'w-10 h-10 min-w-10 min-h-10',
    lg: 'w-16 h-16 min-w-16 min-h-16',
    xl: 'w-24 h-24 min-w-24 min-h-24',
  }[size] || 'w-10 h-10 min-w-10 min-h-10';

  return (
    <div
      title={name}
      aria-label={name ? `${name} avatar` : 'User avatar'}
      className={`rounded-full bg-slate-200 border border-slate-300 flex-shrink-0 inline-block ${sizeClasses} ${className}`}
    />
  );
};

export default Avatar;
