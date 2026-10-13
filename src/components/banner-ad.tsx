"use client";

import { createContext, useContext, type ReactNode } from "react";

type AdvertisingContextValue = {
  adFree: boolean;
};

const AdvertisingContext = createContext<AdvertisingContextValue | null>(null);

export function useAdvertising() {
  return useContext(AdvertisingContext);
}

export function AdvertisingProvider({ children, adFree = false }: { children: ReactNode; adFree?: boolean }) {
  return <AdvertisingContext.Provider value={{ adFree }}>{children}</AdvertisingContext.Provider>;
}

export function BannerAd({ placement = "global", blocked = false }: { placement?: string; blocked?: boolean }) {
  const advertising = useAdvertising();
  if (!advertising || advertising.adFree) {
    return null;
  }

  return (
    <aside className={`banner-ad banner-ad-${placement}`} aria-label="Advertisement">
      <p className="banner-ad-message">Ads help keep Nativ running. We keep them unobtrusive and never use pop-up ads.</p>
      <div className="banner-ad-slot">
        {blocked ? (
          <p className="banner-ad-blocked">Nativ relies on advertising to help keep the service running. An ad blocker is preventing this space from supporting Nativ.</p>
        ) : (
          <span className="banner-ad-label">Advertisement</span>
        )}
      </div>
    </aside>
  );
}

export function TopBannerAd() {
  return <BannerAd placement="top" />;
}

export function SidebarAd({ placement }: { placement: string }) {
  return <BannerAd placement={placement} />;
}
