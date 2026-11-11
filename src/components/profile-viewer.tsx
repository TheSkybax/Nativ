"use client";

import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { ProfileSpace } from "@/components/profile-space";

type ProfileSpaceProps = ComponentProps<typeof ProfileSpace>;

/**
 * Reads the `?user=` deep link on the client so the profile page can be
 * statically exported. The `useSearchParams()` call must live behind a
 * Suspense boundary (see profile/page.tsx) or the static build fails.
 */
export function ProfileViewer(props: ProfileSpaceProps) {
  const searchParams = useSearchParams();
  const user = searchParams.get("user");
  return (
    <ProfileSpace
      {...props}
      initialViewedAccountId={user === props.visitor.id ? props.visitor.id : props.owner.id}
    />
  );
}
