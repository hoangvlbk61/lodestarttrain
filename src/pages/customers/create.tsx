import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerApi } from '@/lib/api/customers';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const customerSchema = z.object({
  customerId: z.string().min(1, 'Mã khách hàng là bắt buộc'),
  name: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  prices: z.object({
    de: z.number().min(0),
    lo: z.number().min(0),
    x2: z.number().min(0),
    x3: z.number().min(0),
    x4: z.number().min(0),
    xiuNhay: z.number().min(0),
    baCang: z.number().min(0),
  }),
  rewards: z.object({
    thuongDe: z.number().min(0),
    thuongLo: z.number().min(0),
    thuongX2: z.number().min(0),
    thuongX3: z.number().min(0),
    thuongX4: z.number().min(0),
    thuongBaCang: z.number().min(0),
  }),
  discountPercent: z.number().min(0).max(100),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      prices: {
        de: 0.72,
        lo: 21.7,
        x2: 0.56,
        x3: 0.56,
        x4: 0.56,
        xiuNhay: 1.1,
        baCang: 0.72,
      },
      rewards: {
        thuongDe: 70,
        thuongLo: 80,
        thuongX2: 10,
        thuongX3: 40,
        thuongX4: 100,
        thuongBaCang: 400,
      },
      discountPercent: 100,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      await customerApi.create(data);
      toast.success('Tạo khách hàng thành công');
      navigate('/customers');
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo khách hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thêm khách hàng mới</h1>
          <p className="text-muted-foreground">
            Nhập thông tin khách hàng và cấu hình giá
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Mã khách hàng *</Label>
                <Input
                  id="customerId"
                  {...register('customerId')}
                  placeholder="17296"
                />
                {errors.customerId && (
                  <p className="text-sm text-red-500">{errors.customerId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên khách hàng *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Nguyễn Văn A"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Giá đánh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="de">Phí đề</Label>
                <Input
                  id="de"
                  type="number"
                  step="0.01"
                  {...register('prices.de', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lo">Phí lô</Label>
                <Input
                  id="lo"
                  type="number"
                  step="0.01"
                  {...register('prices.lo', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xiuNhay">Phí xiên nhảy</Label>
                <Input
                  id="xiuNhay"
                  type="number"
                  step="0.01"
                  {...register('prices.xiuNhay', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baCang">Phí ba càng</Label>
                <Input
                  id="baCang"
                  type="number"
                  step="0.01"
                  {...register('prices.baCang', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Thưởng trúng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thuongDe">Thưởng đề</Label>
                <Input
                  id="thuongDe"
                  type="number"
                  {...register('rewards.thuongDe', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thuongLo">Thưởng lô</Label>
                <Input
                  id="thuongLo"
                  type="number"
                  {...register('rewards.thuongLo', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thuongBaCang">Thưởng ba càng</Label>
                <Input
                  id="thuongBaCang"
                  type="number"
                  {...register('rewards.thuongBaCang', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount */}
        <Card>
          <CardHeader>
            <CardTitle>Phần trăm chiết khấu (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="0"
              max="100"
              {...register('discountPercent', { valueAsNumber: true })}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/customers')}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Tạo khách hàng'}
          </Button>
        </div>
      </form>
    </div>
  );
}