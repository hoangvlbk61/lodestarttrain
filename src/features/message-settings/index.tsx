import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';

import { configurationApi } from '@/lib/api/configuration';
import type { Configuraton } from '@/types/configuration';   // ← sửa tên nếu cần (Configuration)
import { toast } from 'sonner';

export default function MessageSettingPage() {
  const [data, setData] = useState<Configuraton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Configuraton | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load dữ liệu từ API khi vào trang
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      const configs = await configurationApi.getAllConfigurations();
      setData(configs);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách cấu hình', {
        description: 'Vui lòng kiểm tra kết nối và thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedConfig(null);
    setIsOpen(true);
  };

  const handleEdit = (item: Configuraton) => {
    setSelectedConfig(item);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, oldString: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa cấu hình "${oldString}"?`)) return;

    try {
      // Hiện tại API chỉ có update (PUT), nên chúng ta sẽ update lại toàn bộ danh sách sau khi xóa
      const newList = data.filter(item => item.id !== id);
      await configurationApi.updateConfigurations({ configurations: newList });

      setData(newList);
      toast.success('Đã xóa cấu hình thành công', {
        description: `Chuỗi "${oldString}" đã được xóa.`,
      });
    } catch (error) {
      toast.error('Xóa cấu hình thất bại', {
        description: 'Vui lòng thử lại sau.',
      });
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const oldChar = formData.get('oldChar') as string;
    const newChar = formData.get('newChar') as string;

    try {
      let updatedList: Configuraton[];

      if (selectedConfig) {
        // Cập nhật
        updatedList = data.map(item =>
          item.id === selectedConfig.id
            ? { ...item, oldChar, newChar }
            : item
        );
        toast.success('Cập nhật thành công', {
          description: `Đã cập nhật chuỗi "${oldChar}"`,
        });
      } else {
        // Thêm mới
        const newItem: Configuraton = {
          id: Date.now().toString(), // hoặc để backend sinh id
          oldChar,
          newChar,
        };
        updatedList = [...data, newItem];
        toast.success('Thêm mới thành công', {
          description: `Đã thêm chuỗi "${oldChar}" → "${newChar}"`,
        });
      }

      // Gọi API cập nhật toàn bộ danh sách (vì API hiện tại chỉ có PUT)
      await configurationApi.updateConfigurations({ replaceRules: updatedList });

      setData(updatedList);
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error('Lưu cấu hình thất bại', {
        description: error.response?.data?.message || 'Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter(item =>
    item.oldChar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.newChar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header>
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Cấu hình - Định nghĩa thuật ngữ</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chuỗi cũ hoặc mới..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </div>

          {/* Bảng dữ liệu */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="rounded-md border bg-card shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead className="w-32">ID</TableHead>
                    <TableHead>Chuỗi bị thay thế</TableHead>
                    <TableHead>Chuỗi mới</TableHead>
                    <TableHead className="text-right w-32">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-medium">{item.oldChar}</TableCell>
                      <TableCell>{item.newChar}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.oldChar)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Dialog Thêm / Sửa */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-lg font-semibold border-b pb-4">
                  {selectedConfig ? 'Cập nhật cấu hình' : 'Thêm mới cấu hình'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSave} className="space-y-6 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Chuỗi cũ</Label>
                  <Input
                    name="oldChar"
                    defaultValue={selectedConfig?.oldChar || ''}
                    placeholder="Nhập chuỗi cũ (ví dụ: â)"
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Chuỗi mới</Label>
                  <Input
                    name="newChar"
                    defaultValue={selectedConfig?.newChar || ''}
                    placeholder="Nhập chuỗi mới (ví dụ: A)"
                    className="col-span-3"
                    required
                  />
                </div>

                <DialogFooter className="gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                  >
                    Thoát
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 px-8">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : selectedConfig ? (
                      'Cập nhật'
                    ) : (
                      'Thêm mới'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Main>
    </>
  );
}