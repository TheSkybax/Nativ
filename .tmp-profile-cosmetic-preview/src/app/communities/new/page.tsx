import Link from "next/link";
import { AppShell } from "@/components/social-shell";

export default function NewCommunityPage() {
  return (
    <AppShell viewer={{ id: "user-1", username: "calvinm", displayName: "Calvin M.", verified: true }}>
      <main className="community-create-page">
        <section className="panel community-create-panel">
          <Link className="back-link" href="/communities">← Communities</Link>
          <p className="eyebrow">Create a space</p>
          <h1>Start a community</h1>
          <p className="muted">Community creation will connect to account and moderation settings once the backend workflow is available.</p>
          <label>Community name<input placeholder="Name your community" /></label>
          <label>Description<textarea placeholder="What is this space about?" rows={4} /></label>
          <button className="primary-action" type="button">Save draft</button>
        </section>
      </main>
    </AppShell>
  );
}
