import React, { useState } from 'react';
import {
  Home,
  Trophy,
  Activity,
  Weight,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  Info,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface AppLayoutProps {
  currentUser: UserProfile;
  activePage: string;
  onSelectPage: (page: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onStartOnboarding: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentUser,
  activePage,
  onSelectPage,
  isDarkMode,
  onToggleTheme,
  onOpenProfile,
  onStartOnboarding,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Today', icon: Home },
    { name: 'The Bet', icon: Trophy },
    { name: 'Activity', icon: Activity },
    { name: 'Progress', icon: Weight },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <div className="app">
      {/* Desktop & Mobile Slide-Out Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'show' : ''}`}>
        {/* Brand */}
        <div className="brand">
          <span className="brand-symbol">b.</span>
          <span>BETFIT</span>
          <button className="close-menu" onClick={() => setMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Profile Switcher */}
        <div className="profile-switch" onClick={onOpenProfile}>
          <div className="avatar">{currentUser.avatarInitials || 'U'}</div>
          <div>
            <b>{currentUser.name}</b>
            <small>
              {currentUser.goalType === 'gain' ? 'Bulking' : 'Weight Loss'} · {currentUser.currentWeight}kg
            </small>
          </div>
          <ChevronRight size={14} className="text-[var(--muted)]" />
        </div>

        {/* Nav Caption */}
        <div className="nav-caption">MENU</div>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.name;
          return (
            <button
              key={item.name}
              className={`side-link ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectPage(item.name);
                setMobileMenuOpen(false);
              }}
            >
              <Icon size={17} />
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* Sidebar Footer */}
        <div className="side-bottom">
          <button
            className="side-link"
            onClick={() => {
              onStartOnboarding();
              setMobileMenuOpen(false);
            }}
          >
            <Sparkles size={16} />
            <span>New User Flow</span>
          </button>

          <button className="theme-toggle-btn" onClick={onToggleTheme}>
            <span>Theme</span>
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              {isDarkMode ? <Moon size={13} /> : <Sun size={13} />}
              <span>{isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
          </button>

          <div className="privacy-note">
            <Info size={14} />
            <span>Your data is stored in this browser.</span>
          </div>
        </div>
      </aside>

      {/* Scrim for Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="scrim" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main App Content Area */}
      <main className="main">
        {/* Sticky Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-2">
            <button
              className="menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="crumb">
              BETFIT <ChevronRight size={13} /> <b>{activePage}</b>
            </span>
          </div>

          <div className="top-actions">
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-subtle)] transition"
              title="Toggle theme"
            >
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button className="top-profile" onClick={onOpenProfile}>
              <span className="avatar small">{currentUser.avatarInitials || 'U'}</span>
              <span>{currentUser.name.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="content">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.name;
          return (
            <button
              key={item.name}
              className={isActive ? 'active' : ''}
              onClick={() => onSelectPage(item.name)}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
