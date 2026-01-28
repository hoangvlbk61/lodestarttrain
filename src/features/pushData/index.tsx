import { useState } from 'react'
import { Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns' // Thư viện format ngày tháng
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from "sonner"
// import { useToast } from '@/components/ui/use-toast' // Giả định template có shadcn toast
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const FAKE_CUSTOMERS = [
  { id: '1', name: 'Achu' },
  { id: '2', name: 'Mua' },
  { id: '3', name: 'Lam Saodo pro' },
]

export default function CalculatePage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [date, setDate] = useState<Date | undefined>(new Date()) // Mặc định là ngày hôm nay
  const [rawContent, setRawContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!selectedCustomerId || !date || !rawContent.trim()) {
      alert("Vui lòng chọn khách hàng, ngày và nhập nội dung!")
      return
    }

    setIsLoading(true)
    // TODO: Chờ API POST /api/data/push
    console.log("Pushing data...", {
      customerId: selectedCustomerId,
      date: format(date, 'yyyy-MM-dd'),
      content: rawContent
    })

    setTimeout(() => {
      setIsLoading(false)
      setRawContent('')
      alert("Đã lưu dữ liệu thành công!")
    }, 1000)
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
          <h1 className='text-2xl font-bold tracking-tight'>Đẩy dữ liệu</h1>
          <div className='flex items-center space-x-2'>
          </div>
        </div>
        <div className='p-6 max-w-5xl mx-auto space-y-6'>
      <div className='bg-white border rounded-lg p-6 shadow-sm space-y-6'>
        
        <div className='space-y-4'>
          {/* Chọn KH */}
          <div className='flex items-center gap-4 w-1/2'>
            <Label className='min-w-[80px] text-slate-600'>Chọn KH</Label>
            <div className='flex items-center gap-2 flex-1'>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className='w-full bg-slate-50/50'>
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {FAKE_CUSTOMERS.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-blue-600"><Plus className="h-5 w-5" /></Button>
            </div>
          </div>

          {/* Date Picker thay thế cho Input cũ */}
          <div className='flex items-center gap-4 w-1/2'>
            <Label className='min-w-[80px] text-slate-600'>Ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "flex-1 justify-start text-left font-normal bg-slate-50/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Textarea
          placeholder='Paste dữ liệu cần tính vào đây...'
          className='min-h-[350px] resize-none border-slate-300'
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
        />

        <Button 
          className='w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg'
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : 'Lưu'}
        </Button>
      </div>
    </div>
      </Main>
    </>
  )
}