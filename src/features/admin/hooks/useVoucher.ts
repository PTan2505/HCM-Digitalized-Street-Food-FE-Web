import { useAppDispatch } from '@hooks/reduxHooks';
import { useCallback } from 'react';
import {
  getAllVouchers,
  getVouchersByCampaignId,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '@slices/voucher';
import type {
  VoucherCreate,
  VoucherQueryParams,
  VoucherUpdate,
  Voucher,
} from '@custom-types/voucher';

const useVoucher = (): {
  onGetVouchers: (params?: VoucherQueryParams) => Promise<Voucher[]>;
  onGetVouchersByCampaignId: (campaignId: number) => Promise<Voucher[]>;
  onGetVoucherById: (id: number) => Promise<Voucher>;
  onCreateVoucher: (data: VoucherCreate[]) => Promise<Voucher[]>;
  onUpdateVoucher: (id: number, data: VoucherUpdate) => Promise<Voucher>;
  onDeleteVoucher: (id: number) => Promise<number>;
} => {
  const dispatch = useAppDispatch();

  const onGetVouchers = useCallback(
    async (params?: VoucherQueryParams): Promise<Voucher[]> => {
      return await dispatch(getAllVouchers(params)).unwrap();
    },
    [dispatch]
  );

  const onGetVouchersByCampaignId = useCallback(
    async (campaignId: number): Promise<Voucher[]> => {
      return await dispatch(getVouchersByCampaignId(campaignId)).unwrap();
    },
    [dispatch]
  );

  const onGetVoucherById = useCallback(
    async (id: number): Promise<Voucher> => {
      return await dispatch(getVoucherById(id)).unwrap();
    },
    [dispatch]
  );

  const onCreateVoucher = useCallback(
    async (data: VoucherCreate[]): Promise<Voucher[]> => {
      return await dispatch(createVoucher(data)).unwrap();
    },
    [dispatch]
  );

  const onUpdateVoucher = useCallback(
    async (id: number, data: VoucherUpdate): Promise<Voucher> => {
      return await dispatch(updateVoucher({ id, ...data })).unwrap();
    },
    [dispatch]
  );

  const onDeleteVoucher = useCallback(
    async (id: number): Promise<number> => {
      return await dispatch(deleteVoucher(id)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetVouchers,
    onGetVouchersByCampaignId,
    onGetVoucherById,
    onCreateVoucher,
    onUpdateVoucher,
    onDeleteVoucher,
  };
};

export default useVoucher;
