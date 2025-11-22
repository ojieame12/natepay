"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/create', label: 'Create', icon: '➕' },
  { href: '/finance', label: 'Finance', icon: '🏦' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (pathname === '/settings') return;

      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          // Redirect if no settings or onboarding not complete
          if (!data?.onboardingComplete) {
            router.push('/settings?onboarding=true');
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status', error);
      }
    };

    checkOnboarding();
  }, [pathname, router]);

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-white flex">
          <aside className="w-64 border-r-2 border-hare-grey p-4 hidden md:block fixed h-full">
            <div className="text-2xl font-bold text-feather-green mb-8 px-4 tracking-tighter">
              Quote Cards
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide cursor-pointer transition-colors ${isActive
                        ? 'bg-hare-grey text-eel-black'
                        : 'text-wolf-grey hover:bg-hare-grey'
                        }`}
                    >
                      <span>{item.icon}</span> {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-8 left-4 px-4">
              <UserButton showName />
            </div>
          </aside>

          <main className="flex-1 md:ml-64">{children}</main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
