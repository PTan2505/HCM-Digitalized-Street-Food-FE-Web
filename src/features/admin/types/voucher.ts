export interface Voucher {
  voucherId: number;
  name: string;
  voucherCode: string;
  type: 'AMOUNT' | 'PERCENT';
  description: string | null;
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number;
  quantity: number;
  redeemPoint: number;
  startDate: string;
  endDate: string;
  expiredDate: string | null;
  isActive: boolean;
  campaignId: number | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface VoucherCreate {
  name: string;
  voucherCode: string;
  type: 'AMOUNT' | 'PERCENTAGE';
  description: string | null;
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number;
  quantity: number;
  redeemPoint: number;
  startDate: string;
  endDate: string;
  expiredDate: string | null;
  isActive: boolean;
  campaignId: number | null;
}

export type VoucherUpdate = VoucherCreate;
