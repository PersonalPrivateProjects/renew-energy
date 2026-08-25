"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useUserStatus } from "../hooks/useUserStatus";
import { Role, UserStatus } from "../lib/enums";

function isRestrictedPath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tokens/create") ||
    pathname.startsWith("/tokens/transform") ||
    pathname.startsWith("/tokens/redeem")
  );
}

export default function SessionRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { role, status, isLoading } = useUserStatus();

  const prevAddressRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      prevAddressRef.current = null;
      if (pathname !== "/") {
        router.replace("/");
      }
      return;
    }

    const prevAddress = prevAddressRef.current;
    const currentAddress = address.toLowerCase();

    if (!prevAddress) {
      prevAddressRef.current = currentAddress;
      if (pathname !== "/dashboard") {
        router.replace("/dashboard");
      }
      return;
    }

    if (prevAddress !== currentAddress) {
      prevAddressRef.current = currentAddress;
      if (pathname !== "/dashboard") {
        router.replace("/dashboard");
      }
    }
  }, [address, isConnected, pathname, router]);

  useEffect(() => {
    if (!isConnected || !address || isLoading) return;
    if (!isRestrictedPath(pathname)) return;

    if (status !== UserStatus.Approved) {
      router.replace("/dashboard");
      return;
    }

    if (pathname.startsWith("/admin")) {
      if (role !== Role.NONE) {
        router.replace("/dashboard");
      }
      return;
    }

    if (pathname.startsWith("/tokens/create") && role !== Role.PRODUCER) {
      router.replace("/dashboard");
      return;
    }

    if (pathname.startsWith("/tokens/transform") && role !== Role.FACTORY) {
      router.replace("/dashboard");
      return;
    }

    if (pathname.startsWith("/tokens/redeem") && role !== Role.CONSUMER) {
      router.replace("/dashboard");
    }
  }, [address, isConnected, isLoading, pathname, role, router, status]);

  return null;
}