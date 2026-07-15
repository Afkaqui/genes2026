const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateVerificationCode(): string {
  const block = () => {
    let s = '';
    for (let i = 0; i < 4; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
    return s;
  };
  return `GENES-${block()}-${block()}`;
}
