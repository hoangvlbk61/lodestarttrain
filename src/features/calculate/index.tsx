import { 
  ChevronRight, 
  Scissors, 
  SearchCode, 
  Calculator, 
  Save, 
  RefreshCw 
} from 'lucide-react' // Import icons từ thư viện lucide-react có sẵn trong template
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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

export default function CalculatePage() {
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
          <h1 className='text-2xl font-bold tracking-tight'>Tính tiền</h1>
          <div className='flex items-center space-x-2'>
          </div>
        </div>
        <div className='p-4 space-y-6'>
      {/* Phần Configuration */}
      <Card>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
            <div className='space-y-2'>
              <Label>Khách hàng mới:</Label>
              <Input placeholder='Chọn Khách Hàng' />
            </div>
            <div className='space-y-2'>
              <Label>Ngày:</Label>
              <Input type='text' defaultValue='24/01/2026' />
            </div>
            <div className='flex items-center space-x-4 pb-2'>
              <RadioGroup defaultValue='nhan' className='flex space-x-2'>
                <div className='flex items-center space-x-1'>
                  <RadioGroupItem value='nhan' id='r1' />
                  <Label htmlFor='r1'>Nhận về</Label>
                </div>
                <div className='flex items-center space-x-1'>
                  <RadioGroupItem value='chuyen' id='r2' />
                  <Label htmlFor='r2'>Chuyển đi</Label>
                </div>
              </RadioGroup>
            </div>
            <div className='space-y-2'>
              <Label>Phần trăm(%):</Label>
              <Input defaultValue='100' />
            </div>
          </div>

          <Separator className='my-4' />

          {/* Hàng thông số 1 */}
          <div className='grid grid-cols-2 md:grid-cols-7 gap-3 mb-3'>
            <div><Label className='text-xs'>Phế Đề:</Label><Input defaultValue='0.72' /></div>
            <div><Label className='text-xs'>Lô:</Label><Input defaultValue='21.7' /></div>
            <div><Label className='text-xs'>X2:</Label><Input defaultValue='0.6' /></div>
            <div><Label className='text-xs'>X3:</Label><Input defaultValue='0.6' /></div>
            <div><Label className='text-xs'>X4:</Label><Input defaultValue='0.6' /></div>
            <div><Label className='text-xs'>BC:</Label><Input defaultValue='0.72' /></div>
            <div><Label className='text-xs'>XN:</Label><Input defaultValue='1' /></div>
          </div>

          {/* Hàng thông số 2 */}
          <div className='grid grid-cols-2 md:grid-cols-7 gap-3'>
            <div><Label className='text-xs'>Thưởng Đề:</Label><Input defaultValue='70' /></div>
            <div><Label className='text-xs'>Lô:</Label><Input defaultValue='80' /></div>
            <div><Label className='text-xs'>X2:</Label><Input defaultValue='10' /></div>
            <div><Label className='text-xs'>X3:</Label><Input defaultValue='40' /></div>
            <div><Label className='text-xs'>X4:</Label><Input defaultValue='100' /></div>
            <div><Label className='text-xs'>BC:</Label><Input defaultValue='400' /></div>
          </div>
        </CardContent>
      </Card>

      {/* Phần Nhập liệu chính */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]'>
  {/* Cột trái */}
  <div className='flex flex-col h-full'>
    <Textarea 
      placeholder='Nhập nội dung tin nhắn vào đây...' 
      className='flex-1 border-gray-300 resize-none focus-visible:ring-indigo-500'
    />
  </div>
  
  {/* Cột phải */}
  <div className='flex flex-col h-full'>
    <Textarea 
      readOnly
      className='flex-1 bg-muted/20 border-gray-300 resize-none'
      placeholder='Kết quả phân tích...'
    />
  </div>
</div>

{/* Nhóm nút chức năng & Cập nhật XS */}
<div className='flex flex-wrap items-center justify-between gap-4 pt-6'>
  <div className='flex flex-wrap items-center gap-2'>
    {/* Bước 1 */}
    <Button className='bg-indigo-600 hover:bg-indigo-700 shadow-sm'>
      <Scissors className='mr-2 h-4 w-4' /> Bước 1: Tách tin
    </Button>
    
    <ChevronRight className='text-muted-foreground' />

    {/* Bước 2 */}
    <Button className='bg-indigo-600 hover:bg-indigo-700 shadow-sm'>
      <SearchCode className='mr-2 h-4 w-4' /> Bước 2: Phân tích
    </Button>

    <ChevronRight className='text-muted-foreground' />

    {/* Bước 3 */}
    <Button variant='outline' className='border-indigo-600 text-indigo-600 hover:bg-indigo-50'>
      <Calculator className='mr-2 h-4 w-4' /> Bước 3: Tính toán
    </Button>

    <ChevronRight className='text-muted-foreground' />

    {/* Bước 4 */}
    <Button variant='outline' className='border-green-600 text-green-600 hover:bg-green-50'>
      <Save className='mr-2 h-4 w-4' /> Bước 4: Lưu dữ liệu
    </Button>
  </div>

  {/* Nút Cập nhật kết quả nằm cùng hàng phía bên phải */}
  <Button variant='default' className='bg-blue-600 hover:bg-blue-700'>
    <RefreshCw className='mr-2 h-4 w-4' /> Cập nhật kết quả XS
  </Button>
</div>
    </div>
      </Main>
    </>
  )
}