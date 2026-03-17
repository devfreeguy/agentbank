const AVATAR_COLORS = [
  "rgba(99,102,241,0.13)",
  "rgba(251,146,60,0.12)",
  "rgba(34,197,94,0.09)",
  "rgba(59,130,246,0.10)",
  "rgba(251,191,36,0.09)",
  "rgba(239,68,68,0.08)",
  "rgba(236,72,153,0.10)",
  "rgba(6,182,212,0.10)",
  "rgba(168,85,247,0.10)",
  "rgba(20,184,166,0.10)",
];

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
