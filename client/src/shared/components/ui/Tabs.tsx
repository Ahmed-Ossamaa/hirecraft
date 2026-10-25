import React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`w-full max-w-full overflow-x-auto no-scrollbar border-b border-border/40 mb-2 ${className}`}
    >
      <div className="flex items-center gap-3 md:gap-6 min-w-max h-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap select-none inline-flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
