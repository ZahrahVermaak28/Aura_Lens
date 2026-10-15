import React from 'react';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Cpu,
  Smile,
  FileText,
  History,
  Settings,
} from 'lucide-react';
import { AuraLensLogo } from './AuraLensLogo';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  collapsed,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyse', label: 'Analyse Video', icon: Search },
    { id: 'vader', label: 'VADER Analysis', icon: Sparkles },
    { id: 'huggingface', label: 'Hugging Face Analysis', icon: Cpu },
    { id: 'emoji', label: 'Emoji Intelligence', icon: Smile },
    { id: 'insights', label: 'Insights & Reports', icon: FileText },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'settings', label: 'Methodology & API', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 flex flex-col border-r ${
        collapsed ? 'w-20' : 'w-64'
      } bg-[#285943] text-[#F7FAF7] dark:bg-[#15271D] dark:border-[#263D30]`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-5 gap-3 border-b border-[#3D6E57] dark:border-[#243E2E]">
          <div className="w-10 h-10 rounded-xl bg-[#DCEEE1] dark:bg-[#263D30] flex items-center justify-center shadow-inner shrink-0 p-1.5 transition-transform hover:scale-105">
            <AuraLensLogo className="w-full h-full" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                AuraLens
              </span>
              <span className="text-[11px] font-medium text-[#A3BFA8] tracking-wider uppercase block">
                Sentiment Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#E8F1EA] text-[#285943] shadow-md dark:bg-[#263D30] dark:text-[#88C9A1]'
                    : 'text-[#DCEEE1] hover:bg-[#32694F] dark:hover:bg-[#1C3326] hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'scale-110 text-[#285943] dark:text-[#88C9A1]' : 'text-[#A3BFA8]'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
