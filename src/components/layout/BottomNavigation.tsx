
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

type BottomNavigationProps = {
  items: NavItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const BottomNavigation = ({ 
  items, 
  activeTab, 
  setActiveTab 
}: BottomNavigationProps) => {
  return (
    <div className="glass-card border-t border-border/30 h-16 backdrop-blur-lg sticky bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around h-full px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              className={cn(
                "flex flex-col items-center justify-center relative w-1/4 h-full px-1",
                "focus:outline-none transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
