# Nativ

Nativ is a healthy social platform prototype centered on calm communities, intentional connection, and privacy-first experiences. The app explores a feed, discovery, profile, daily prompt, and community discovery experience designed for thoughtful online interaction.

## Features

- Community directory with curated landing pages and rules
- Discovery feed based on interests and healthy behavior signals
- Personalized profile and badges
- Daily prompt system with demo participation helpers
- Auth flow for registration and login
- Responsive social shell UI with themed styling

## Stack

- Next.js
- React
- TypeScript
- CSS modules
- Vitest for unit tests

## Local development

From the project root:

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

## Production build

```bash
npm run build
```

## Testing

```bash
npm test
```

## Type checking

```bash
npm run typecheck
```

## Notes

The Next.js application and its `src` directory live at the project root. Source path aliases such as `@/components` and `@/lib` resolve from `src`.

### Profile badges

The profile badge catalog defines membership, posting, conversation, community, Daily Prompt, founder, and subscription badges. Badge IDs and eligibility rules are maintained separately from their inline SVG icon artwork. Users can choose which earned badges to display.

The profile and API currently use labeled demo assignments. Account-age and post-count helpers are implemented against the supplied values, but the profile supplies demo account dates and post counts. Founder is intended for manual assignment. The Early Member cutoff (`2026-01-01`) and Founding Member limit (first 1,000 members) are placeholders to revisit at launch. Early Supporter is defined as one of the first 100 subscribers, but subscription order is not tracked. Badge display selections, like profile edits, are client-side and reset on refresh.

Comment demo thresholds are 50 comments for Active Conversationalist and 250 for Conversation Regular. Community demo thresholds are 25 and 100 qualifying discussion participations; Daily Prompt demo thresholds are 7 and 30 responses. Supporting milestones are defined as 30 and 365 eligible subscription days. These configurable values are examples, not production requirements. Comment, longitudinal community participation, Daily Prompt response, and subscription/billing event tracking are not integrated, so those awards use explicit demo assignments only. Comment aggregates must count posted comments rather than edits when event tracking is added.

### Profile color customization

Profile owners can preview the site-default name style or earned-only name colors, choose the Nativ header or one of six color-named gradients, and customize the main profile and About/Badges panels independently. Panels provide a subtle tint and a stronger solid treatment for red, orange, yellow, green, blue, and purple, using color-family names such as Crimson Mist and Crimson Velvet. Header/action-button and panel colors adapt to the active light or dark theme. Founder Gold, Founding Midnight, and Supporter Plum remain badge-gated; One-Year Sage uses an account-age milestone.

Normal customization hides locked and unreleased cosmetics. The current demo profile uses explicit badge assignments and a fixed demo date; eligibility and all selections are prototype-only, and changes reset on refresh. Event eligibility and explicit free-promotion grants are represented in the catalog model, but no event or promotion grant system is connected. Cosmetics are not purchasable.

To inspect the full catalog locally, set `NATIV_PROFILE_COSMETICS_PREVIEW=1` in the development shell before starting Next.js. In PowerShell:

```powershell
$env:NATIV_PROFILE_COSMETICS_PREVIEW = "1"
npm run dev
```

This preview is enabled only when `NODE_ENV` is `development`. In the profile's Customize panel, use **Show locked options and badges** to reveal or hide locked/released cosmetic entries and unearned badges. Locked and unreleased colors can be applied as temporary visual previews; hiding the catalog or leaving customization clears those previews. The flag is server-checked, and no production API or reward bypass is provided.
