import { useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
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
    DialogFooter,
} from '@/components/ui/dialog'

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
// import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export interface ConfigType {
    id: string;
    old_string: string; // Chuỗi bị thay thế
    new_string: string; // Chuỗi mới
}

const INITIAL_DATA: ConfigType[] = [
    { id: '1807', old_string: 'â', new_string: 'A' },
    { id: '1809', old_string: 'ầ', new_string: 'A' },
]

export default function MessageSettingPage() {
    const [data, setData] = useState<ConfigType[]>(INITIAL_DATA)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedConfig, setSelectedConfig] = useState<ConfigType | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Mở modal để thêm mới
    const handleAddNew = () => {
        setSelectedConfig(null)
        setIsOpen(true)
    }

    // Mở modal để sửa
    const handleEdit = (item: ConfigType) => {
        setSelectedConfig(item)
        setIsOpen(true)
    }

    // Xóa item
    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) {
            // TODO: API DELETE /api/configs/{id}
            setData(data.filter((item) => item.id !== id))
        }
    }

    // Xử lý Lưu (Thêm/Sửa)
    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const old_string = formData.get('old_string') as string
        const new_string = formData.get('new_string') as string

        if (selectedConfig) {
            // Logic Sửa
            // TODO: API PUT /api/configs/{selectedConfig.id}
            setData(data.map(item =>
                item.id === selectedConfig.id ? { ...item, old_string, new_string } : item
            ))
        } else {
            // Logic Thêm mới
            // TODO: API POST /api/configs
            const newItem: ConfigType = {
                id: Math.floor(Math.random() * 10000).toString(),
                old_string,
                new_string,
            }
            setData([...data, newItem])
        }

        setIsOpen(false)
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
                    <h1 className='text-2xl font-bold tracking-tight'>Cấu hình - Định nghĩa thuật ngữ</h1>
                    <div className='flex items-center space-x-2'>
                    </div>
                </div>
                <div className='p-6 space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-xl font-bold'>Cấu hình - Định nghĩa thuật ngữ</h1>
                    </div>

                    <div className='flex items-center justify-between gap-4'>
                        <div className='relative w-full max-w-sm'>
                            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Tìm kiếm...'
                                className='pl-8'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Button className='bg-indigo-600 hover:bg-indigo-700' onClick={handleAddNew}>
                            <Plus className='mr-2 h-4 w-4' /> Thêm mới
                        </Button>
                    </div>

                    {/* Bảng dữ liệu */}
                    <div className='rounded-md border bg-white shadow-sm'>
                        <Table>
                            <TableHeader className='bg-slate-50'>
                                <TableRow>
                                    <TableHead className='w-16'>#</TableHead>
                                    <TableHead className='w-32'>ID</TableHead>
                                    <TableHead>Chuỗi bị thay thế</TableHead>
                                    <TableHead>Chuỗi mới</TableHead>
                                    <TableHead className='text-right w-32'>Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data
                                    .filter(item => item.old_string.includes(searchTerm) || item.new_string.includes(searchTerm))
                                    .map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.old_string}</TableCell>
                                            <TableCell>{item.new_string}</TableCell>
                                            <TableCell className='text-right space-x-1'>
                                                <Button variant='ghost' size='icon' onClick={() => handleEdit(item)}>
                                                    <Edit className='h-4 w-4 text-slate-600' />
                                                </Button>
                                                <Button variant='ghost' size='icon' onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className='h-4 w-4 text-red-500' />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Popup Thêm/Sửa */}
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent className='max-w-md'>
                            <DialogHeader>
                                <DialogTitle className='text-center text-lg font-semibold border-b pb-4'>
                                    {selectedConfig ? 'Cập nhật cấu hình' : 'Thêm mới cấu hình'}
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSave} className='space-y-6 py-4'>
                                <div className='grid grid-cols-4 items-center gap-4'>
                                    <Label className='text-right'>Chuỗi cũ</Label>
                                    <Input
                                        name='old_string'
                                        defaultValue={selectedConfig?.old_string || ''}
                                        placeholder='Nhập chuỗi cũ'
                                        className='col-span-3'
                                        required
                                    />
                                </div>
                                <div className='grid grid-cols-4 items-center gap-4'>
                                    <Label className='text-right'>Chuỗi mới</Label>
                                    <Input
                                        name='new_string'
                                        defaultValue={selectedConfig?.new_string || ''}
                                        placeholder='Nhập chuỗi mới'
                                        className='col-span-3'
                                        required
                                    />
                                </div>

                                <DialogFooter className='gap-2 sm:justify-center pt-4'>
                                    <Button type='submit' className='bg-indigo-600 px-8'>
                                        {selectedConfig ? 'Lưu thông tin' : 'Thêm mới'}
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => setIsOpen(false)}
                                        className='px-8'
                                    >
                                        Thoát
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </Main>
        </>
    )
}