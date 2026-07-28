'use client';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isAgent?: boolean;
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

const colors = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-cyan-400 to-cyan-600',
  'bg-gradient-to-br from-blue-400 to-cyan-600',
  'bg-gradient-to-br from-blue-400 to-blue-600',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ name, size = 'md', isAgent = false }: AvatarProps) {
  if (isAgent) {
    return (
      <div
        className={`${sizeMap[size]} rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20`}
        title={name}
      >
        AI
      </div>
    );
  }

  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={`${sizeMap[size]} rounded-full ${getColor(name)} flex items-center justify-center text-white font-semibold shadow-md`}
      title={name}
    >
      {initial}
    </div>
  );
}
