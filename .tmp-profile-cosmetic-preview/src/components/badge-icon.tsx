import type { BadgeCategory, BadgeIconName } from "@/lib/personalization";

const baseProps = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const
};

export function BadgeIcon({ icon, category }: { icon: BadgeIconName; category: BadgeCategory }) {
  const props = { ...baseProps, className: `badge-icon badge-icon--${category}` };

  switch (icon) {
    case "sprout":
      return <svg {...props}><circle cx="16" cy="16" r="13" /><path d="M16 25v-9m0 3c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-3c0-5 3-8 8-8 0 5-3 8-8 8Z" /></svg>;
    case "calendar-one":
    case "calendar-five":
      return <svg {...props}>
        <rect x="5" y="7" width="22" height="20" rx="3" />
        <path d="M10 4v6m12-6v6M5 13h22" />
        <path className="badge-icon-accent-gold" d="m23 15 .8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
        <text className="badge-icon-number" x="12" y="24">{icon === "calendar-one" ? "1" : "5"}</text>
      </svg>;
    case "paper-pencil":
      return <svg {...props}><path d="M7 4.5h13l5 5V27H7zM20 5v5h5M11 15h9M11 19h6" /><path d="m14 25 1.2-3.6 6.4-6.4 2.4 2.4-6.4 6.4z" className="badge-icon-accent-gold" /></svg>;
    case "post-stack-100":
    case "post-stack-1k":
    case "post-stack-10k":
      return <svg {...props}>
        <path d="m7 10 15-4 3 12-15 4z" />
        <path d="m5 15 2 11 17-3" />
        <path d="m10 13 8-2" />
        <text className="badge-icon-number" x="11" y="21">{icon === "post-stack-100" ? "100" : icon === "post-stack-1k" ? "1K" : "10K"}</text>
        {icon === "post-stack-10k" ? <path className="badge-icon-accent-gold" d="m25 4 .8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z" /> : null}
      </svg>;
    case "speech-first":
      return <svg {...props}><path d="M4 6.5h17v12H11l-5 4v-4H4z" /><path className="badge-icon-accent" d="M11 11h6" /></svg>;
    case "speech-active":
      return <svg {...props}><path d="M3.5 6h15v11H9l-4 3v-3h-1.5z" /><path d="M13.5 12h14v10H23l-4 3v-3h-5.5z" /><circle className="badge-icon-accent-gold" cx="22" cy="16" r="1" /></svg>;
    case "speech-regular":
      return <svg {...props}><circle cx="16" cy="16" r="13" /><path d="M6 11h13v9h-6l-4 3v-3H6zM17 15h9v7h-4l-3 2v-2h-2" /><circle className="badge-icon-accent-gold" cx="22" cy="18" r="1" /></svg>;
    case "community-member":
      return <svg {...props}><circle cx="16" cy="9" r="3" /><circle cx="7.5" cy="13" r="2.5" /><circle cx="24.5" cy="13" r="2.5" /><path d="M10 25v-2a6 6 0 0 1 12 0v2M2.5 25v-2a5 5 0 0 1 6-4.9M29.5 25v-2a5 5 0 0 0-6-4.9" /></svg>;
    case "community-regular":
      return <svg {...props}><circle cx="16" cy="16" r="14" /><circle cx="16" cy="11" r="2.5" /><circle cx="9" cy="14" r="2" /><circle cx="23" cy="14" r="2" /><path d="M11.5 24a4.5 4.5 0 0 1 9 0M5 24a4 4 0 0 1 5-3.8M27 24a4 4 0 0 0-5-3.8" /></svg>;
    case "community-contributor":
      return <svg {...props}><circle cx="16" cy="9" r="3" /><circle cx="7.5" cy="13" r="2.5" /><circle cx="24.5" cy="13" r="2.5" /><path d="M10 25v-2a6 6 0 0 1 12 0v2M2.5 25v-2a5 5 0 0 1 6-4.9M29.5 25v-2a5 5 0 0 0-6-4.9" /><path className="badge-icon-accent-gold" d="m16 12 .9 1.8 2 .3-1.5 1.4.4 2-1.8-.9-1.8.9.4-2-1.5-1.4 2-.3z" /></svg>;
    case "camera-first":
      return <svg {...props}><path d="M4 11h5l2-3h8l2 3h7v14H4z" /><circle cx="16" cy="18" r="4" /><circle className="badge-icon-accent" cx="16" cy="18" r="1.6" /></svg>;
    case "camera-regular":
      return <svg {...props}><circle cx="16" cy="16" r="14" /><path d="M7 13h4l1.5-2h7l1.5 2h4v10H7z" /><circle cx="16" cy="18" r="3" /><path className="badge-icon-accent" d="M16 2v3m9.9 1.1-2.1 2.1M30 16h-3" /></svg>;
    case "camera-veteran":
      return <svg {...props}><path d="M8 26c-4-3-5-8-4-13m20 13c4-3 5-8 4-13M5 18l-2-3 4-1m20 4 2-3-4-1" /><path d="M7 13h4l1.5-2h7l1.5 2h4v11H7z" /><circle cx="16" cy="18.5" r="3.5" /><path className="badge-icon-accent-gold" d="m16 3 1.2 2.4 2.7.4-2 1.9.5 2.7L16 9.1l-2.4 1.3.5-2.7-2-1.9 2.7-.4z" /></svg>;
    case "founder-shield":
      return <svg {...props}><path d="M16 3 27 7v8c0 7-4.7 11.5-11 14-6.3-2.5-11-7-11-14V7z" /><path className="badge-icon-accent-gold" d="m16 8 1.7 3.4 3.8.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.6z" /></svg>;
    case "founding-group":
      return <svg {...props}><path className="badge-icon-accent-gold" d="m16 2 1.2 2.4 2.7.4-2 1.9.5 2.7L16 8.1l-2.4 1.3.5-2.7-2-1.9 2.7-.4z" /><circle cx="16" cy="13" r="2.5" /><circle cx="8" cy="16" r="2" /><circle cx="24" cy="16" r="2" /><path d="M11 26v-2a5 5 0 0 1 10 0v2M3.5 26v-2a4.5 4.5 0 0 1 6-4.2M28.5 26v-2a4.5 4.5 0 0 0-6-4.2" /></svg>;
    case "supporter-hand":
      return <svg {...props}><path d="M5 19h5l3 3h7l7-7a2 2 0 0 0-3-3l-4 3h-5M5 16l4-4 5-1 3 2-2 3h-4" /><path className="badge-icon-accent-gold" d="m18 3 .9 1.8 2 .3-1.5 1.4.4 2-1.8-.9-1.8.9.4-2-1.5-1.4 2-.3z" /></svg>;
    case "ad-free":
      return <svg {...props}><path d="M16 3 27 7v8c0 7-4.7 11.5-11 14-6.3-2.5-11-7-11-14V7z" /><path d="M9 13h14M9 17h8" /><path className="badge-icon-accent-gold" d="m8 8 16 16" /></svg>;
    case "support-month":
    case "support-year":
      return <svg {...props}><path d="M5 7h22v20H5zM10 4v6m12-6v6M5 13h22" /><path className="badge-icon-accent-gold" d="m23 15 .8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" /><text className="badge-icon-number" x="14" y="25">{icon === "support-month" ? "1M" : "1Y"}</text></svg>;
  }
}
