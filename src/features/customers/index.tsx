import { useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { customerApi } from '@/lib/api/customers'
export interface CustomerType {
  id?: string;
  name?: string;

  // Cau hinh Phe
  phe_de?: string;
  phe_lo?: string;
  phe_x2?: string;
  phe_x3?: string;
  phe_x4?: string;
  phe_xn?: string;
  phe_bc?: string;

  // Cau hinh Loai & Ty le
  type: 'Khach' | 'Chu';
  percent?: string;

  // Cau hinh tra thuong
  thuong_de?: string;
  thuong_lo?: string;
  thuong_x2?: string;
  thuong_x3?: string;
  thuong_x4?: string;
  thuong_bc?: string;
}

const defaultCustomer = { id: 'new', name: '', phe_de: '0.72', phe_lo: '21.7', phe_x2: '0.56', phe_x3: '0.56', phe_x4: '0.56', phe_xn: '1.1', phe_bc: '0.72', type: 'Khach' }
const INITIAL_CUSTOMERS = [
  { id: '17296', name: 'Achu', phe_de: '0.72', phe_lo: '21.7', phe_x2: '0.56', phe_x3: '0.56', phe_x4: '0.56', phe_xn: '1.1', phe_bc: '0.72', type: 'Khach' },
  { id: '17297', name: 'Mua', phe_de: '0.73', phe_lo: '21.8', phe_x2: '0.65', phe_x3: '0.65', phe_x4: '0.65', phe_xn: '1.1', phe_bc: '0.7', type: 'Khach' },
  { id: '17392', name: 'Lam Saodo pro', phe_de: '0.72', phe_lo: '18.86', phe_x2: '0.72', phe_x3: '0.72', phe_x4: '0.72', phe_xn: '1.1', phe_bc: '0.72', type: 'Chu' },
]

export default function CustomersPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType>(defaultCustomer) // State lưu KH đang sửa

  // Hàm mở modal để Sửa
  const handleEdit = (customer: CustomerType) => {
    setSelectedCustomer(customer)
    setIsOpen(true)
  }

  // Hàm mở modal để Thêm mới (Reset state cũ)
  const handleAddNew = () => {
    setSelectedCustomer(defaultCustomer)
    setIsOpen(true)
  }

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCustomer) {
      // TODO: Gọi API UPDATE /api/customers/${selectedCustomer.id}
      // console.log("Updating customer:", selectedCustomer.id)
    } else {
      // TODO: Gọi API POST /api/customers
      // console.log("Creating new customer")
    }
    setIsOpen(false)
  }

  // 3. TODO: API DELETE /api/customers/:id
  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      setCustomers(customers.filter(c => c.id !== id))
    }
  }
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Khách hàng</h1>
          <div className='flex items-center space-x-2'>
          </div>
        </div>
        <div className='p-6 space-y-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='relative w-full max-w-sm'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm tên hoặc mã KH...'
                className='pl-8'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className='bg-indigo-600 hover:bg-indigo-700' onClick={handleAddNew}>
                  <Plus className='mr-2 h-4 w-4' /> Thêm mới
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-md p-0 overflow-hidden'>
                <DialogHeader className='p-6 pb-0'>
                  <DialogTitle className='text-center text-xl font-bold border-b pb-4'>
                    {selectedCustomer ? `Sửa khách hàng: ${selectedCustomer.name}` : 'Thêm mới khách hàng'}
                  </DialogTitle>
                </DialogHeader>

                <ScrollArea className='max-h-[70vh] px-6'>
                  <form id="customer-form" className='grid gap-6 py-4' onSubmit={handleSaveCustomer}>
                    {/* Thông tin cơ bản */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label className='text-right font-medium'>Tên KH</Label>
                      <Input
                        defaultValue={selectedCustomer?.name || ""}
                        placeholder="Nhập tên khách hàng"
                        className='col-span-3'
                        required
                      />
                    </div>

                    {/* Nhóm thông số Phế */}
                    <div className='space-y-4 border-t pt-4'>
                      <p className='text-sm font-bold text-indigo-600'>CẤU HÌNH PHẾ</p>
                      {[
                        { label: 'Phế đề', val: '0.72' },
                        { label: 'Phế lô', val: '21.7' },
                        { label: 'Phế xiên 2', val: '0.56' },
                        { label: 'Phế xiên 3', val: '0.56' },
                        { label: 'Phế xiên 4', val: '0.56' },
                        { label: 'Phế xiên nhảy', val: '1.1' },
                        { label: 'Phế ba càng', val: '0.72' },
                      ].map((item, idx) => (
                        <div key={idx} className='grid grid-cols-4 items-center gap-4'>
                          <Label className='text-right text-xs'>{item.label}</Label>
                          <Input defaultValue={item.val} className='col-span-3 h-8' />
                        </div>
                      ))}
                    </div>

                    {/* Phân cấp Loại */}
                    <div className='grid grid-cols-4 items-center gap-4 border-t pt-4'>
                      <Label className='text-right font-medium'>Loại</Label>
                      <RadioGroup defaultValue='khach' className='flex space-x-4 col-span-3'>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='khach' id='khach-pop' />
                          <Label htmlFor='khach-pop'>Khách</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='chu' id='chu-pop' />
                          <Label htmlFor='chu-pop'>Chủ</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label className='text-right font-medium'>Phần trăm(%)</Label>
                      <Input defaultValue='100' className='col-span-3 h-8' />
                    </div>

                    {/* Cấu hình trả thưởng */}
                    <div className='space-y-4 border-t pt-4 pb-4'>
                      <p className='text-[11px] text-red-500 italic leading-tight'>
                        Cấu hình trả thưởng (Mặc định: Đề x70, Lô x80, X2 x10, X3 x40, X4 x100, Ba càng x400)
                      </p>
                      {[
                        { label: 'Thưởng đề', val: selectedCustomer.phe_de || '70' },
                        { label: 'Thưởng lô', val: selectedCustomer.phe_lo || '80' },
                        { label: 'Thưởng X2', val: selectedCustomer.phe_x2 || '10' },
                        { label: 'Thưởng X3', val: selectedCustomer.phe_x3 || '40' },
                        { label: 'Thưởng X4', val: selectedCustomer.phe_x4 || '100' },
                        { label: 'Thưởng ba càng', val: selectedCustomer.phe_bc || '400' },
                      ].map((item, idx) => (
                        <div key={idx} className='grid grid-cols-4 items-center gap-4'>
                          <Label className='text-right text-xs'>{item.label}</Label>
                          <Input defaultValue={item.val} className='col-span-3 h-8' />
                        </div>
                      ))}
                    </div>
                  </form>
                </ScrollArea>

                <DialogFooter className='p-6 border-t bg-slate-50'>
                  <Button variant='outline' onClick={() => setIsOpen(false)}>Hủy</Button>
                  <Button type="submit" form="customer-form" className='bg-indigo-600'>{`Lưu khách hàng`}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Bảng dữ liệu */}
          <div className='rounded-md border bg-card shadow-sm'>
            <Table>
              <TableHeader className='bg-slate-50'>
                <TableRow>
                  <TableHead className='w-12'>#</TableHead>
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
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className='text-muted-foreground'>{index + 1}</TableCell>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className='font-bold text-indigo-600'>{item.name}</TableCell>
                      <TableCell>{item.phe_de}</TableCell>
                      <TableCell>{item.phe_lo}</TableCell>
                      <TableCell>{item.phe_x2}</TableCell>
                      <TableCell>{item.phe_x3}</TableCell>
                      <TableCell>{item.phe_x4}</TableCell>
                      <TableCell>{item.phe_xn}</TableCell>
                      <TableCell>{item.phe_bc}</TableCell>
                      <TableCell>
                        <Badge className={item.type === 'Khach' ? 'bg-blue-500' : 'bg-orange-500'}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            onClick={() => handleEdit(item)} // Gán dữ liệu dòng hiện tại vào state
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-red-500 hover:text-red-600'
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Main>
    </>
  )
}