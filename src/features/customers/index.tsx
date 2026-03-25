import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';

import { customerApi } from '@/lib/api/customers';
import type { Customer, CreateCustomerData } from '@/types/customer';
import { toast } from 'sonner';        // ← import toast từ sonner

// ==================== TYPE CHO FORM ====================
type CustomerFormData = {
  customerId: string;
  name: string;
  type: 'customer' | 'agent';
  discountPercent: string;

  phe_de: string;
  phe_lo: string;
  phe_x2: string;
  phe_x3: string;
  phe_x4: string;
  phe_xn: string;
  phe_bc: string;

  thuong_de: string;
  thuong_lo: string;
  thuong_x2: string;
  thuong_x3: string;
  thuong_x4: string;
  thuong_bc: string;
};

const defaultForm: CustomerFormData = {
  customerId: '',
  name: '',
  type: 'customer',
  discountPercent: '100',
  phe_de: '0.72',
  phe_lo: '21.7',
  phe_x2: '0.56',
  phe_x3: '0.56',
  phe_x4: '0.56',
  phe_xn: '1.1',
  phe_bc: '0.72',
  thuong_de: '70',
  thuong_lo: '80',
  thuong_x2: '10',
  thuong_x3: '40',
  thuong_x4: '100',
  thuong_bc: '400',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách khách hàng', {
        description: 'Vui lòng kiểm tra kết nối hoặc thử lại sau.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      customerId: customer.customerId,
      name: customer.name,
      type: customer.type,
      discountPercent: customer.discountPercent.toString(),
      phe_de: customer.prices.de.toString(),
      phe_lo: customer.prices.lo.toString(),
      phe_x2: customer.prices.x2.toString(),
      phe_x3: customer.prices.x3.toString(),
      phe_x4: customer.prices.x4.toString(),
      phe_xn: customer.prices.xiuNhay.toString(),
      phe_bc: customer.prices.baCang.toString(),
      thuong_de: customer.rewards.thuongDe.toString(),
      thuong_lo: customer.rewards.thuongLo.toString(),
      thuong_x2: customer.rewards.thuongX2.toString(),
      thuong_x3: customer.rewards.thuongX3.toString(),
      thuong_x4: customer.rewards.thuongX4.toString(),
      thuong_bc: customer.rewards.thuongBaCang.toString(),
    });
    setEditingId(customer._id);
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const payload: CreateCustomerData = {
      customerId: formData.customerId.trim(),
      name: formData.name.trim(),
      type: formData.type,
      discountPercent: parseFloat(formData.discountPercent) || 100,
      prices: {
        de: parseFloat(formData.phe_de) || 0,
        lo: parseFloat(formData.phe_lo) || 0,
        x2: parseFloat(formData.phe_x2) || 0,
        x3: parseFloat(formData.phe_x3) || 0,
        x4: parseFloat(formData.phe_x4) || 0,
        xiuNhay: parseFloat(formData.phe_xn) || 0,
        baCang: parseFloat(formData.phe_bc) || 0,
      },
      rewards: {
        thuongDe: parseFloat(formData.thuong_de) || 0,
        thuongLo: parseFloat(formData.thuong_lo) || 0,
        thuongX2: parseFloat(formData.thuong_x2) || 0,
        thuongX3: parseFloat(formData.thuong_x3) || 0,
        thuongX4: parseFloat(formData.thuong_x4) || 0,
        thuongBaCang: parseFloat(formData.thuong_bc) || 0,
      },
    };

    try {
      if (editingId) {
        await customerApi.update(editingId, payload as any);
        toast.success('Cập nhật khách hàng thành công!', {
          description: `Đã cập nhật ${formData.name}`,
        });
      } else {
        await customerApi.create(payload);
        toast.success('Thêm khách hàng mới thành công!', {
          description: `Khách hàng ${formData.name} đã được tạo.`,
        });
      }

      setIsOpen(false);
      await loadCustomers();
    } catch (error: any) {
      console.error(error);
      toast.error('Lưu khách hàng thất bại', {
        description: error.response?.data?.message || error.message || 'Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) return;

    try {
      await customerApi.delete(id);
      toast.success('Đã xóa khách hàng thành công', {
        description: `Khách hàng ${name} đã bị xóa.`,
      });
      setCustomers(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      toast.error('Không thể xóa khách hàng', {
        description: 'Vui lòng thử lại sau.',
      });
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerId.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold tracking-tight">Khách hàng</h1>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên hoặc mã KH..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">
                    {editingId ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
                  </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] px-4">
                  <form onSubmit={handleSave} className="space-y-6 py-4">
                    {/* Các trường form giữ nguyên như phiên bản trước */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Mã KH <span className="text-red-500">*</span></Label>
                        <Input name="customerId" value={formData.customerId} onChange={handleInputChange} required />
                      </div>
                      <div>
                        <Label>Tên KH <span className="text-red-500">*</span></Label>
                        <Input name="name" value={formData.name} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Loại</Label>
                        <RadioGroup
                          value={formData.type}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as 'customer' | 'agent' }))}
                          className="flex gap-6 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="customer" id="customer" />
                            <Label htmlFor="customer">Khách</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="agent" id="agent" />
                            <Label htmlFor="agent">Đại lý (Chu)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label>Phần trăm (%)</Label>
                        <Input
                          name="discountPercent"
                          type="number"
                          step="0.01"
                          value={formData.discountPercent}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Phế và Thưởng giữ nguyên như code trước (grid cols-2) */}

                    <div className="border-t pt-4">
                      <p className="text-sm font-bold text-indigo-600 mb-3">CẤU HÌNH PHẾ</p>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Phế đề', name: 'phe_de' },
                          { label: 'Phế lô', name: 'phe_lo' },
                          { label: 'Phế x2', name: 'phe_x2' },
                          { label: 'Phế x3', name: 'phe_x3' },
                          { label: 'Phế x4', name: 'phe_x4' },
                          { label: 'Phế xiên nhảy', name: 'phe_xn' },
                          { label: 'Phế ba càng', name: 'phe_bc' },
                        ].map(item => (
                          <div key={item.name}>
                            <Label className="text-xs">{item.label}</Label>
                            <Input
                              name={item.name}
                              type="number"
                              step="0.01"
                              value={formData[item.name as keyof CustomerFormData]}
                              onChange={handleInputChange}
                              className="h-9"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-red-500 italic mb-3">
                        Cấu hình trả thưởng (Mặc định: Đề x70, Lô x80, X2 x10, X3 x40, X4 x100, Ba càng x400)
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Thưởng đề', name: 'thuong_de' },
                          { label: 'Thưởng lô', name: 'thuong_lo' },
                          { label: 'Thưởng X2', name: 'thuong_x2' },
                          { label: 'Thưởng X3', name: 'thuong_x3' },
                          { label: 'Thưởng X4', name: 'thuong_x4' },
                          { label: 'Thưởng ba càng', name: 'thuong_bc' },
                        ].map(item => (
                          <div key={item.name}>
                            <Label className="text-xs">{item.label}</Label>
                            <Input
                              name={item.name}
                              type="number"
                              step="0.1"
                              value={formData[item.name as keyof CustomerFormData]}
                              onChange={handleInputChange}
                              className="h-9"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="pt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : editingId ? (
                          'Cập nhật'
                        ) : (
                          'Tạo mới'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
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
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Mã KH</TableHead>
                    <TableHead>Tên KH</TableHead>
                    <TableHead>Đề</TableHead>
                    <TableHead>Lô</TableHead>
                    <TableHead>X2</TableHead>
                    <TableHead>X3</TableHead>
                    <TableHead>X4</TableHead>
                    <TableHead>X.Nhảy</TableHead>
                    <TableHead>3 Càng</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((item, index) => (
                    <TableRow key={item._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.customerId}</TableCell>
                      <TableCell className="font-bold text-indigo-600">{item.name}</TableCell>
                      <TableCell>{item.prices.de}</TableCell>
                      <TableCell>{item.prices.lo}</TableCell>
                      <TableCell>{item.prices.x2}</TableCell>
                      <TableCell>{item.prices.x3}</TableCell>
                      <TableCell>{item.prices.x4}</TableCell>
                      <TableCell>{item.prices.xiuNhay}</TableCell>
                      <TableCell>{item.prices.baCang}</TableCell>
                      <TableCell>
                        <Badge className={item.type === 'customer' ? 'bg-blue-500' : 'bg-orange-500'}>
                          {item.type === 'customer' ? 'Khách' : 'Chủ'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(item._id, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Main>
    </>
  );
}