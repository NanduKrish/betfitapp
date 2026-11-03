import React from 'react';
import { CheckCircle2, Trophy, LineChart } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab
}) => {
  const tabs = [
    { id: 'today', label: 'Today', icon: CheckCircle2 },
    { id: 'bet', label: 'The Bet', icon: Trophy },
    { id: 'history', label: 'History', icon: LineChart }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--nav-bg)] backdrop-blur-md border-t border-[var(--border-color)] px-4 py-2">
      <div className="mobile-container flex items-center justify-around">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition ${
                active
                  ? 'text-emerald-500 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[11px] mt-1 font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
