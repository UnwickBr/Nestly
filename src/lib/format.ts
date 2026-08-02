const AVATAR_COLORS = ['bg-blue-500', 'bg-pink-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];

export function avatarColor(name: string): string {
  const sum = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
}
