'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import { Menu, X, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function SiteNav({ dark = false }) {
  const { user, activeMembership, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Base links visible to everyone
  const baseLinks = [
    { href: '/memberships', label: 'Memberships' },
    { href: '/coaches', label: 'Coaches' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Links only visible after login
  const authedLinks = [];
  if (user) {
    authedLinks.push({ href: '/classes', label: 'Classes' });
    authedLinks.push({ href: '/games', label: 'Games' });
  }

  const links = [...baseLinks, ...authedLinks];

  const textColor = dark ? 'text-white' : 'text-foreground';
  const border = dark ? 'border-white/10' : 'border-black/10';

  return (
    <header className={`w-full ${dark ? 'bg-transparent' : 'bg-background/80 backdrop-blur-lg'} border-b ${border} sticky top-0 z-40`}>
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className={`flex items-center gap-2 ${textColor}`} aria-label="Flowternity home">
          <Image src="/favicon/logo.png" alt="Flowternity" width={120} height={36} className="h-9 w-auto object-contain" priority />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`text-sm font-medium ${textColor} opacity-80 hover:opacity-100 transition`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <Avatar className="w-9 h-9"><AvatarFallback className="bg-accent text-black font-semibold">{user.full_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback></Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/classes">Book Class</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/games">Games</Link></DropdownMenuItem>
                {user.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin">Admin Panel</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {!activeMembership && (
                <Link href="/trial">
                  <Button variant="ghost" className={dark ? 'text-white hover:bg-white/10 hover:text-white' : ''}>
                    <Sparkles className="w-4 h-4 mr-1.5" /> Free class
                  </Button>
                </Link>
              )}
              <Link href="/auth?mode=login"><Button variant="ghost" className={dark ? 'text-white hover:bg-white/10 hover:text-white' : ''}>Sign in</Button></Link>
              <Link href="/memberships"><Button className="bg-accent text-black hover:bg-accent/90">Join Now</Button></Link>
            </>
          )}
        </div>

        <button className={`md:hidden ${textColor}`} onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className={`md:hidden border-t ${border} ${dark ? 'bg-black' : 'bg-background'}`}>
          <div className="container py-4 flex flex-col gap-3">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`text-sm font-medium ${textColor} py-2`} onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" className={`text-sm font-medium ${textColor} py-2`} onClick={() => setOpen(false)}>Dashboard</Link>
                <Link href="/profile" className={`text-sm font-medium ${textColor} py-2`} onClick={() => setOpen(false)}>Profile</Link>
                {user.role === 'admin' && <Link href="/admin" className={`text-sm font-medium ${textColor} py-2`} onClick={() => setOpen(false)}>Admin</Link>}
                <button onClick={logout} className="text-sm text-destructive text-left py-2">Sign out</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                {!activeMembership && (
                  <Link href="/trial" onClick={() => setOpen(false)}><Button variant="outline" className="w-full"><Sparkles className="w-4 h-4 mr-1.5" /> Book free class</Button></Link>
                )}
                <div className="flex gap-2">
                  <Link className="flex-1" href="/auth?mode=login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">Sign in</Button></Link>
                  <Link className="flex-1" href="/memberships" onClick={() => setOpen(false)}><Button className="w-full bg-accent text-black hover:bg-accent/90">Join Now</Button></Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
