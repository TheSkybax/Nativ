"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CommunityCard } from "@/lib/communities";

function CommunityCardView({ community, joined }: { community: CommunityCard; joined: boolean }) {
  return (
    <article className="community-directory-card">
      <div className="community-icon">{community.name.slice(0, 2).toUpperCase()}</div>
      <div className="community-card-header">
        <div>
          <p className="eyebrow">{community.visibility}</p>
          <h3>{community.name}</h3>
        </div>
        {community.verifiedOnly ? <span className="pill soft">Verified</span> : null}
      </div>
      <p className="community-description">{community.description}</p>
      <div className="tag-row">
        {community.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
      </div>
      <div className="community-stat-row">
        <span>{community.members.toLocaleString()} members</span>
        <span>{joined ? "Joined" : `${community.moderatorCount} moderators`}</span>
      </div>
      <Link className="community-card-link" href={`/communities/${community.slug}`}>
        Open community →
      </Link>
    </article>
  );
}

export function CommunityDirectory({ communities }: { communities: CommunityCard[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [joinedIds, setJoinedIds] = useState(() => new Set(["comm-1", "comm-3"]));

  const categories = ["All", "Creativity", "Learning", "Support", "Trust"];
  const filteredCommunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return communities.filter((community) => {
      const matchesQuery = !normalizedQuery || [community.name, community.description, ...community.tags].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesCategory = activeCategory === "All" || community.tags.some((tag) => tag.toLowerCase().includes(activeCategory.toLowerCase()));
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, communities, query]);

  const myCommunities = filteredCommunities.filter((community) => joinedIds.has(community.id));
  const discoverCommunities = filteredCommunities.filter((community) => !joinedIds.has(community.id));

  function toggleJoin(communityId: string) {
    setJoinedIds((current) => {
      const next = new Set(current);
      if (next.has(communityId)) next.delete(communityId);
      else next.add(communityId);
      return next;
    });
  }

  return (
    <>
      <section className="community-directory-toolbar">
        <div>
          <p className="eyebrow">Communities</p>
          <h1>Find your people</h1>
        </div>
        <Link className="primary-action" href="/communities/new">+ Create community</Link>
      </section>

      <section className="community-search panel">
        <label htmlFor="community-search">Search communities</label>
        <input id="community-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, topic, or tag" />
        <div className="category-tabs" role="tablist" aria-label="Community categories">
          {categories.map((category) => (
            <button key={category} className={activeCategory === category ? "active" : ""} type="button" onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
        </div>
      </section>

      <section className="directory-section">
        <div className="directory-section-heading">
          <div><p className="eyebrow">Your spaces</p><h2>My communities</h2></div>
          <span className="muted">{myCommunities.length} joined</span>
        </div>
        {myCommunities.length ? <div className="community-directory-grid">{myCommunities.map((community) => <CommunityCardView key={community.id} community={community} joined />)}</div> : <div className="empty-state">No joined communities match this search.</div>}
      </section>

      <section className="directory-section">
        <div className="directory-section-heading">
          <div><p className="eyebrow">Explore</p><h2>Discover communities</h2></div>
          <span className="muted">{discoverCommunities.length} available</span>
        </div>
        {discoverCommunities.length ? <div className="community-directory-grid">{discoverCommunities.map((community) => <div key={community.id}><CommunityCardView community={community} joined={false} /><button className="join-community-button" type="button" onClick={() => toggleJoin(community.id)}>Join community</button></div>)}</div> : <div className="empty-state">No new communities match this search.</div>}
      </section>
    </>
  );
}
