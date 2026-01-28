import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export interface WeeklyReportType {
  id: string;
  range: string; // Ví dụ: "19/01/2026 - 25/01/2026"
  data: {
    stt: number;
    ten_kh: string;
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  }[];
}

const INITIAL_REPORTS: WeeklyReportType[] = [
  {
    id: 'w1',
    range: '19/01/2026 - 25/01/2026',
    data: [
      { stt: 1, ten_kh: 'Tang', mon: 15100, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      { stt: 2, ten_kh: 'TRUNG PRO', mon: -2650, tue: -6400, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      { stt: 3, ten_kh: 'Dakka', mon: 27200, tue: -12800, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    ]
  },
  {
    id: 'w2',
    range: '26/01/2026 - 01/02/2026',
    data: [
      { stt: 1, ten_kh: 'Tang', mon: 5000, tue: 2000, wed: 100, thu: 0, fri: 0, sat: 0, sun: 0 },
    ]
  }
]

export default function WeeklyReportPage() {
  const [reports, setReports] = useState<WeeklyReportType[]>(INITIAL_REPORTS)
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // TODO: API GET /api/reports

  // Lọc dữ liệu hiển thị
  const displayData = selectedWeekId
    ? reports.find(r => r.id === selectedWeekId)?.data || []
    : reports.flatMap(r => r.data) // Hiển thị tổng tất cả các tuần nếu không chọn cụ thể

  // Tính tổng hàng cuối (Tổng Ngày/Tổng Tuần)
  const calculateTotal = (day: keyof WeeklyReportType['data'][0]) => {
    return displayData.reduce((sum, item) => sum + (Number(item[day]) || 0), 0)
  }

  const handleDeleteWeek = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Ngăn việc click nút Xóa kích hoạt chọn tuần
    if (confirm("Xóa báo cáo tuần này?")) {
      // TODO: API DELETE /api/reports/{id}
      setReports(reports.filter(r => r.id !== id))
      if (selectedWeekId === id) setSelectedWeekId(null)
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
          <h1 className='text-2xl font-bold tracking-tight'>Tính tiền</h1>
          <div className='flex items-center space-x-2'>
          </div>
        </div>
        <div className='flex h-full min-h-[600px] gap-6 p-6'>
          {/* Sidebar bên trái: Danh sách tuần */}
          <div className='w-64 border-r pr-6 space-y-4'>
            <h2 className='text-xl font-bold text-red-500'>Báo cáo tuần</h2>
            <div className='space-y-1'>
              <button
                onClick={() => setSelectedWeekId(null)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  selectedWeekId === null ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-slate-100"
                )}
              >
                Tất cả các tuần
              </button>
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedWeekId(report.id)}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                    selectedWeekId === report.id ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-slate-100"
                  )}
                >
                  <span className="truncate">{report.range}</span>
                  <Trash2
                    className="h-4 w-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteWeek(report.id, e)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content bên phải: Bảng dữ liệu */}
          <div className='flex-1'>
            <div className='rounded-md border bg-white shadow-sm overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-[#6366f1] hover:bg-[#6366f1]'>
                    <TableHead className='text-white font-bold w-12'>STT</TableHead>
                    <TableHead className='text-white font-bold'>Tên KH</TableHead>
                    <TableHead className='text-white font-bold text-center'>Thứ 2</TableHead>
                    <TableHead className='text-white font-bold text-center'>Thứ 3</TableHead>
                    <TableHead className='text-white font-bold text-center'>Thứ 4</TableHead>
                    <TableHead className='text-white font-bold text-center'>Thứ 5</TableHead>
                    <TableHead className='text-white font-bold text-center'>Thứ 6</TableHead>
                    <TableHead className='text-white font-bold text-center'>Thứ 7</TableHead>
                    <TableHead className='text-white font-bold text-center'>Chủ nhật</TableHead>
                    <TableHead className='text-white font-bold text-right'>Tổng tuần</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.map((row, idx) => {
                    const rowTotal = row.mon + row.tue + row.wed + row.thu + row.fri + row.sat + row.sun
                    return (
                      <TableRow key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-cyan-50/30"}>
                        <TableCell className='text-muted-foreground'>{idx + 1}</TableCell>
                        <TableCell className='font-bold text-red-700'>{row.ten_kh}</TableCell>
                        <TableCell className={cn("text-center font-medium", row.mon < 0 ? "text-red-500" : "text-blue-600")}>{row.mon.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-center font-medium", row.tue < 0 ? "text-red-500" : "text-blue-600")}>{row.tue.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-center font-medium", row.wed < 0 ? "text-red-500" : "text-blue-600")}>{row.wed.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-center font-medium", row.thu < 0 ? "text-red-500" : "text-blue-600")}>{row.thu.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-center font-medium", row.fri < 0 ? "text-red-500" : "text-blue-600")}>{row.fri.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-center font-medium", row.sat < 0 ? "text-red-500" : "text-blue-600")}>{row.sat.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-center font-medium", row.sun < 0 ? "text-red-500" : "text-blue-600")}>{row.sun.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-right font-bold border-l", rowTotal < 0 ? "text-red-500" : "text-blue-600")}>{rowTotal.toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}

                  {/* Hàng Tổng cộng */}
                  <TableRow className='bg-yellow-50 font-bold'>
                    <TableCell colSpan={2} className='text-center text-red-700 text-lg'>Tổng Ngày</TableCell>
                    <TableCell className='text-center text-blue-600'>{calculateTotal('mon').toLocaleString()}</TableCell>
                    <TableCell className='text-center text-blue-600'>{calculateTotal('tue').toLocaleString()}</TableCell>
                    <TableCell className='text-center text-blue-600'>{calculateTotal('wed').toLocaleString()}</TableCell>
                    <TableCell className='text-center text-blue-600'>{calculateTotal('thu').toLocaleString()}</TableCell>
                    <TableCell className='text-center text-blue-600'>{calculateTotal('fri').toLocaleString()}</TableCell>
                    <TableCell className='text-center text-blue-600'>{calculateTotal('sat').toLocaleString()}</TableCell>
                    <TableCell className='text-center text-blue-600'>{calculateTotal('sun').toLocaleString()}</TableCell>
                    <TableCell className='text-right text-blue-700 text-lg border-l'>
                      {(
                        calculateTotal('mon') + calculateTotal('tue') + calculateTotal('wed') +
                        calculateTotal('thu') + calculateTotal('fri') + calculateTotal('sat') + calculateTotal('sun')
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}