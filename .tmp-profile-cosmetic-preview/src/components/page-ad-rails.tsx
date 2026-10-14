"use client";

import type { ReactNode } from "react";
import { SidebarAd, useAdvertising } from "./banner-ad";

export function PageAdRails({ children }: { children: ReactNode }) {
  const advertising = useAdvertising();

  if (advertising?.adFree) {
    return <div className="page-ad-rails page-ad-rails-ad-free">{children}</div>;
  }

  return (
    <div className="page-ad-rails">
      <aside className="page-ad-rail page-ad-rail-left">
        <SidebarAd placement="following-left" />
      </aside>
      <main className="page-ad-main">{children}</main>
      <aside className="page-ad-rail page-ad-rail-right">
        <SidebarAd placement="following-right" />
      </aside>
    </div>
  );
}
