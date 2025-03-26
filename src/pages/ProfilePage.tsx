
import { useState } from "react";
import { 
  LogOut, 
  Settings, 
  MessageSquare, 
  User, 
  FileText, 
  Bell, 
  HelpCircle, 
  MapPin,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };
  
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    // In a real app, we would toggle dark mode here
    toast({
      title: `${checked ? "Dark" : "Light"} mode enabled`,
      description: `The app theme has been switched to ${checked ? "dark" : "light"} mode.`
    });
  };
  
  const settingsSections = [
    {
      title: "App Settings",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          onClick: () => {},
          rightElement: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
        {
          icon: Settings,
          label: "Dark Mode",
          onClick: () => {},
          rightElement: (
            <Switch 
              checked={darkMode} 
              onCheckedChange={handleDarkModeToggle} 
              aria-label="Toggle dark mode"
            />
          ),
        },
      ],
    },
    {
      title: "Content",
      items: [
        {
          icon: MapPin,
          label: "My Submitted Sites",
          onClick: () => {},
          rightElement: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
        {
          icon: FileText,
          label: "My Reviews",
          onClick: () => {},
          rightElement: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: MessageSquare,
          label: "Feedback",
          onClick: () => {},
          rightElement: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
        {
          icon: HelpCircle,
          label: "Help Center",
          onClick: () => {},
          rightElement: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background pb-16">
      <div className="p-6 flex flex-col items-center">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarImage src="/placeholder.svg" alt="Profile" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <h1 className="text-xl font-semibold">Guest User</h1>
        <p className="text-sm text-muted-foreground mt-1">guest@example.com</p>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            Edit Profile
          </Button>
          
          <Button 
            variant="default"
            size="sm"
            className="rounded-full"
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-auto p-4 no-scrollbar">
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground px-2">
                {section.title}
              </h2>
              
              <div className="bg-card rounded-lg overflow-hidden border border-border/40">
                {section.items.map((item, index) => (
                  <div key={index}>
                    {index > 0 && <Separator />}
                    <button
                      className="w-full flex items-center justify-between py-3.5 px-4 hover:bg-secondary/50 transition-colors"
                      onClick={item.onClick}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 mr-3 text-primary" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {item.rightElement}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
          
          <div className="pt-2 pb-4 text-center">
            <p className="text-xs text-muted-foreground">
              SafeCamp v0.1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
