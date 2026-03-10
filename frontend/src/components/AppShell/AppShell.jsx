import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/* ── Icons (inline SVG for zero extra deps) ──────────────────── */
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ── Navigation config ───────────────────────────────────────── */
const getUserNav = () => [
  { label: 'Dashboard', icon: IconHome, href: '/user' },
  { label: 'Chat with WellBee', icon: IconChat, href: '/chat' },
  { label: 'Take Survey', icon: IconClipboard, href: '/surveyform' },
  { label: 'Contact Us', icon: IconMail, href: '/contact' },
];
const getAdminNav = () => [
  { label: 'Dashboard', icon: IconHome, href: '/admin' },
  { label: 'Employee Feedback', icon: IconShield, href: '/feedback' },
  { label: 'Contact Us', icon: IconMail, href: '/contact' },
];

/* ── SidebarContent ─────────────────────────────────────────── */
const SidebarContent = ({ onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const navItems = isAdmin ? getAdminNav() : getUserNav();
  const empId = user?.emp_id || '';
  const initials = empId ? empId.slice(0, 2).toUpperCase() : 'WB';

  const handleNav = (href) => {
    navigate(href);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[hsl(var(--border))]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[hsl(var(--border))]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)' }}>
          W
        </div>
        <span className="font-bold text-[hsl(var(--foreground))] text-[15px]">WellBee</span>
      </div>

      {/* User info */}
      <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-[hsl(var(--accent))]">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 text-xs">
            <AvatarFallback className="text-[hsl(var(--accent-foreground))] bg-[hsl(var(--primary))]/20 font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[hsl(var(--foreground))] truncate">{empId || 'Employee'}</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{isAdmin ? 'Administrator' : 'Employee'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = location.pathname === href;
          return (
            <button
              key={href}
              onClick={() => handleNav(href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 text-left group',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
              )}
            >
              <span className={cn('flex-shrink-0 transition-colors', isActive ? 'text-white' : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]')}>
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-[hsl(var(--border))]">
        <button
          onClick={() => setLogoutOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-[hsl(var(--muted-foreground))] hover:bg-red-50 hover:text-red-600 transition-all duration-150 text-left"
        >
          <IconLogout />
          Log Out
        </button>
      </div>

      {/* Logout confirm */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>You'll need to sign in again to access your account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ── AppShell ────────────────────────────────────────────────── */
const AppShell = ({ children, title, showBack = false, noPadding = false }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 bg-white border-b border-[hsl(var(--border))]"
        style={{ height: 'var(--shell-topbar-h, 56px)' }}
      >
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-[hsl(var(--muted-foreground))]" aria-label="Open menu">
              <IconMenu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Back button */}
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] gap-1"
          >
            <IconChevronLeft />
            Back
          </Button>
        )}

        {/* Page title */}
        <h1 className="text-[15px] font-semibold text-[hsl(var(--foreground))] truncate flex-1">
          {title}
        </h1>
      </header>

      {/* ── Body (sidebar + main) ─────────────────────────────── */}
      <div
        className="flex flex-1"
        style={{ paddingTop: 'var(--shell-topbar-h, 56px)' }}
      >
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30"
          style={{ width: 'var(--shell-sidebar-w, 256px)', paddingTop: 'var(--shell-topbar-h, 56px)' }}
        >
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-56px)] overflow-y-auto lg:ml-[256px]',
            !noPadding && 'p-5 md:p-6'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
