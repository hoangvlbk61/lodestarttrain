import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { configurationApi } from '@/lib/api/configurations';
import { toast } from 'sonner';

interface ReplaceRule {
  id: number;
  oldChar: string;
  newChar: string;
}

export default function ConfigurationPage() {
  const [rules, setRules] = useState<ReplaceRule[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await configurationApi.get();
      setRules(response.data.replaceRules || []);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleAddRule = () => {
    const newId = rules.length > 0 ? Math.max(...rules.map((r) => r.id)) + 1 : 1;
    setRules([...rules, { id: newId, oldChar: '', newChar: '' }]);
  };

  const handleRemoveRule = (id: number) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleUpdateRule = (
    id: number,
    field: 'oldChar' | 'newChar',
    value: string
  ) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await configurationApi.update({ replaceRules: rules });
      toast.success('Lưu cấu hình thành công');
    } catch (error: any) {
      toast.error('Không thể lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cấu hình</h1>
        <p className="text-muted-foreground">
          Quản lý quy tắc thay thế ký tự
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quy tắc thay thế ký tự</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-8">
                {index + 1}
              </span>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`old-${rule.id}`}>Chuỗi bị thay thế</Label>
                  <Input
                    id={`old-${rule.id}`}
                    value={rule.oldChar}
                    onChange={(e) =>
                      handleUpdateRule(rule.id, 'oldChar', e.target.value)
                    }
                    placeholder="á"
                  />
                </div>
                <div>
                  <Label htmlFor={`new-${rule.id}`}>Chuỗi mới</Label>
                  <Input
                    id={`new-${rule.id}`}
                    value={rule.newChar}
                    onChange={(e) =>
                      handleUpdateRule(rule.id, 'newChar', e.target.value)
                    }
                    placeholder="A"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddRule}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm quy tắc
          </Button>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}