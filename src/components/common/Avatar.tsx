'use client';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
};

export function Avatar({ name, size = 'md', href }: AvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  const content = (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold select-none shrink-0`}
      title={name}
    >
      {initial}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
