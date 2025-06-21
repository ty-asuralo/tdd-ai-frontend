import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Language } from '../lib/api';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function Sidebar({ language, onLanguageChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-card transition-all duration-300 ease-in-out ${
      isExpanded ? 'w-64 border-r' : 'w-0'
    }`}>
      {isExpanded ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select value={language} onValueChange={onLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Language.TYPESCRIPT}>TypeScript</SelectItem>
                    <SelectItem value={Language.JAVASCRIPT}>JavaScript</SelectItem>
                    <SelectItem value={Language.PYTHON}>Python-3.12</SelectItem>
                    <SelectItem value={Language.JAVA}>Java</SelectItem>
                    <SelectItem value={Language.CSHARP}>C#</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="bg-card border shadow-sm"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
