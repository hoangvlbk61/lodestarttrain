import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import type { Customer } from '@/types/customer';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CustomerTable({
  customers,
  isLoading,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có khách hàng nào
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã KH</TableHead>
            <TableHead>Tên khách hàng</TableHead>
            <TableHead>Đề</TableHead>
            <TableHead>Lô</TableHead>
            <TableHead>Xiên nhảy</TableHead>
            <TableHead>Ba càng</TableHead>
            <TableHead>Chiết khấu</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell className="font-medium">
                {customer.customerId}
              </TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.prices.de}</TableCell>
              <TableCell>{customer.prices.lo}</TableCell>
              <TableCell>{customer.prices.xiuNhay}</TableCell>
              <TableCell>{customer.prices.baCang}</TableCell>
              <TableCell>{customer.discountPercent}%</TableCell>
              <TableCell>
                <Badge variant={customer.type === 'agent' ? 'default' : 'secondary'}>
                  {customer.type === 'agent' ? 'Đại lý' : 'Khách hàng'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={customer.status === 'active' ? 'success' : 'destructive'}
                >
                  {customer.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(customer._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(customer._id)}
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
  );
}