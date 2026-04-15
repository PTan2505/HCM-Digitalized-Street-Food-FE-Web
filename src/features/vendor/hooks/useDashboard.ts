import type {
  VendorDashboardRevenue,
  VendorDashboardVoucher,
  VendorDashboardDishes,
} from '@features/vendor/types/dashboard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  getRevenue,
  getVouchers,
  getDishes,
  resetVendorDashboardState,
  selectVendorDashboardRevenue,
  selectVendorDashboardVouchers,
  selectVendorDashboardDishes,
  selectVendorDashboardStatus,
  selectVendorDashboardError,
} from '@slices/vendorDashboard';
import { useCallback } from 'react';

export default function useDashboard(): {
  revenue: VendorDashboardRevenue | null;
  vouchers: VendorDashboardVoucher | null;
  dishes: VendorDashboardDishes | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  onGetRevenue: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<VendorDashboardRevenue>;
  onGetVouchers: () => Promise<VendorDashboardVoucher>;
  onGetDishes: () => Promise<VendorDashboardDishes>;
  onResetVendorDashboardState: () => void;
} {
  const dispatch = useAppDispatch();

  const revenue = useAppSelector(selectVendorDashboardRevenue);
  const vouchers = useAppSelector(selectVendorDashboardVouchers);
  const dishes = useAppSelector(selectVendorDashboardDishes);
  const status = useAppSelector(selectVendorDashboardStatus);
  const error = useAppSelector(selectVendorDashboardError);

  const onGetRevenue = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<VendorDashboardRevenue> => {
      return await dispatch(getRevenue(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetVouchers =
    useCallback(async (): Promise<VendorDashboardVoucher> => {
      return await dispatch(getVouchers()).unwrap();
    }, [dispatch]);

  const onGetDishes = useCallback(async (): Promise<VendorDashboardDishes> => {
    return await dispatch(getDishes()).unwrap();
  }, [dispatch]);

  const onResetVendorDashboardState = useCallback(() => {
    dispatch(resetVendorDashboardState());
  }, [dispatch]);

  return {
    revenue,
    vouchers,
    dishes,
    status,
    error,
    onGetRevenue,
    onGetVouchers,
    onGetDishes,
    onResetVendorDashboardState,
  };
}
