export function VerifiedSeal({
  className,
  label = "Verified account"
}: {
  className: string;
  label?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-label={label}>
      <defs>
        <linearGradient id="profile-verified-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1a8" />
          <stop offset="0.52" stopColor="#e5b943" />
          <stop offset="1" stopColor="#aa7418" />
        </linearGradient>
      </defs>
      <path d="m12 1.2 2.7 2 3.4-.2 1.4 3.1 3 1.7-.6 3.4 1.4 3.1-2.4 2.5-.4 3.4-3.3.9L15 23l-3-1.5L9 23l-2.2-2.3-3.3-.9-.4-3.4L.7 14l1.4-3.1-.6-3.4 3-1.7 1.4-3.1 3.4.2z" fill="url(#profile-verified-gold)" stroke="#8c6118" strokeLinejoin="round" />
      <path d="m7.5 12.2 3 3 6.2-6.4" fill="none" stroke="#fffdf3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
