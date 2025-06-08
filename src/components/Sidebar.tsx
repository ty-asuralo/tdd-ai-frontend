import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';

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
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
