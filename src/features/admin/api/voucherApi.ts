import type {
  Voucher,
  VoucherCreate,
  VoucherUpdate,
} from '@features/admin/types/voucher';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class VoucherApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVouchers(): Promise<Voucher[]> {
    const res = await this.apiClient.get<Voucher[]>({
      url: apiUrl.voucher.GetOrPostVouchers,
    });
    return res.data;
  }

  async createVoucher(data: VoucherCreate): Promise<Voucher> {
    const res = await this.apiClient.post<Voucher, VoucherCreate>({
      url: apiUrl.voucher.GetOrPostVouchers,
      data,
    });
    return res.data;
  }

  async updateVoucher(id: number, data: VoucherUpdate): Promise<Voucher> {
    const res = await this.apiClient.put<Voucher, VoucherUpdate>({
      url: apiUrl.voucher.UpdateOrDeleteVoucher(id),
      data,
    });
    return res.data;
  }

  async deleteVoucher(id: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.voucher.UpdateOrDeleteVoucher(id),
    });
  }
}
