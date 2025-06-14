import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Language } from '../lib/api';

interface SidebarProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function Sidebar({ language, onLanguageChange }: SidebarProps) {
  return (
    <div className="bg-card w-64 border-r p-4">
      <div className="space-y-4">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Settings</h2>
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
  );
}
