# Nativ

Nativ is a social platform prototype exploring a calmer, more intentional approach to online connection. Its current product scope includes social feeds, interest-based discovery, profile identity and customization, daily photo prompts, and community discovery. The interface emphasizes privacy choices, thoughtful participation, verified identity, accessibility, and a distinctive visual identity.

## Current features

### Social feeds and posts

- Following and discovery feeds with demo ranking, interest signals, and visibility-aware filtering.
- Post composer and feed filters for audience, content type, and verified authors.
- Post interactions including likes, comments, and reposts.
- Authors can edit or delete their posts, change the audience, and choose tags suggested from post text.
- Audience options include everyone, verified-only, followers, verified followers, and only me.
- Feed posts identify authors and support links to their profiles.

### Profiles and identity

- Owner and visitor profile views with profile details, bio, posts, follower counts, badges, and verified seals.
- Profile editing for display name and bio, with save and cancel behavior.
- Earned badges can be selected for display and reordered by dragging; accessible move controls are also available.
- Profile customization previews name colors, header gradients, and profile panel colors.
- The signed-in profile name color is shared across supported profile, post, and comment surfaces.
- Verified seals support Founder (gold), standard verified (blue), and verified creator (green) variants.
- Experimental gold root artwork grows from beneath the logo through the page background.

### Daily prompts and communities

- Daily prompt page with an optional photo response, local image preview, caption, and demo response previews.
- Community directory with search, topic categories, joined and discover sections, and sample community pages.
- Community creation page is currently a draft UI; it does not create or persist a community.

### Shared experience

- Responsive navigation across Following, Discovery, Communities, and Prompts.
- Light and dark themes.
- Shared visual styling, including the Nativ logo and background artwork.
- Reusable advertising placements, with support for an ad-free shell configuration.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Following feed and post composer |
| `/discovery` | Interest-ranked discovery feed |
| `/profile` | Demo owner profile; use `?user=<id>` to view the demo visitor profile |
| `/communities` | Searchable community directory |
| `/communities/new` | Community creation draft |
| `/communities/[slug]` | Sample community detail page |
| `/daily-prompts` | Daily photo prompt experience |

## API routes

The app includes prototype route handlers for registration and login, feed data, profile data, daily prompts, and the community directory:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/feed`
- `GET /api/profile`
- `GET /api/daily-prompts`
- `GET /api/communities`

These handlers are not a complete production backend. Most return demo data. The authentication helper stores users in a process-local in-memory map and hashes passwords, but there is no database, session/token system, or durable account storage.

## Prototype boundaries

- Demo accounts, feed content, community membership, prompt responses, and badge assignments are used throughout the app.
- Interactive post and profile changes are client-side prototype state; they reset on refresh and are not synchronized across users.
- Login and registration endpoints are not connected to a durable identity system or session flow.
- Community creation, moderation, access requests, event tracking, notification delivery, and production recommendation infrastructure are not implemented.
- Profile badges and cosmetics have modeled eligibility rules, but several awards rely on explicit demo assignments because the required account, billing, participation, or event data is not connected.
- The Early Member cutoff (`2026-01-01`) and Founding Member limit (first 1,000 members) are placeholders. Early Supporter is defined as one of the first 100 subscribers, but subscription order is not tracked.
- Cosmetics are not purchasable. Event eligibility and free-promotion grants are represented in the catalog model but have no connected grant workflow.

### Badge and cosmetic demo rules

The badge catalog covers membership, posting, conversations, community participation, Daily Prompt participation, founder, and subscription milestones. Demo thresholds include 50 and 250 posted comments for conversation badges; 25 and 100 qualifying community discussion participations; 7 and 30 prompt responses; and 30 and 365 eligible subscription days. These values demonstrate the model and are not production requirements. Comment aggregates should count posted comments rather than edits when event tracking is added.

Normal profile customization hides locked and unreleased cosmetics. To inspect the catalog during development, set `NATIV_PROFILE_COSMETICS_PREVIEW=1` before starting the app:

```powershell
$env:NATIV_PROFILE_COSMETICS_PREVIEW = "1"
npm run dev
```

The preview is enabled only in development. In the profile's **Customize** panel, select **Show locked options and badges** to reveal the catalog. Locked or unreleased colors can be applied temporarily; hiding the catalog or leaving customization clears those previews. The preview flag is server-checked and does not grant production rewards.

## Technology

- Next.js App Router
- React
- TypeScript
- Global CSS
- Vitest
- Zod for API request validation
- `bcryptjs` for prototype password hashing

The Next.js app and `src` directory are at the repository root. The `@/` alias resolves to `src`.

## Local development

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm test
npm run typecheck
npm run build
```
