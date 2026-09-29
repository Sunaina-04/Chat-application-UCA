import React from 'react';

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  status = null, // 'online' | 'offline' | 'away' | 'busy'
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizeClasses = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-500',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover bg-chatdark-card border border-chatdark-border shadow-sm`}
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}

      <div
        style={{ display: src ? 'none' : 'flex' }}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-gradient-to-tr from-brand-700 to-indigo-500 items-center justify-center font-semibold text-white border border-brand-400/30 shadow-sm`}
      >
        {getInitials(name)}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ${statusSizeClasses[size] || statusSizeClasses.md} ${statusColors[status] || 'bg-slate-500'} ring-chatdark-rail shadow-sm`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
