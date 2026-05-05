import type {
  VendorDashboardRevenue,
  VendorDashboardVoucher,
  VendorDashboardDishes,
  VendorDashboardCampaigns,
} from '@features/vendor/types/dashboard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  getRevenue,
  getVouchers,
  getDishes,
  getCampaigns,
  resetVendorDashboardState,
  selectVendorDashboardRevenue,
  selectVendorDashboardVouchers,
  selectVendorDashboardDishes,
  selectVendorDashboardCampaigns,
  selectVendorDashboardStatus,
  selectVendorDashboardError,
} from '@slices/vendorDashboard';
import { useCallback } from 'react';

export default function useDashboard(): {
  revenue: VendorDashboardRevenue | null;
  vouchers: VendorDashboardVoucher | null;
  dishes: VendorDashboardDishes | null;
  campaigns: VendorDashboardCampaigns | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  onGetRevenue: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<VendorDashboardRevenue>;
  onGetVouchers: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<VendorDashboardVoucher>;
  onGetDishes: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<VendorDashboardDishes>;
  onGetCampaigns: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<VendorDashboardCampaigns>;
  onResetVendorDashboardState: () => void;
} {
  const dispatch = useAppDispatch();

  const revenue = useAppSelector(selectVendorDashboardRevenue);
  const vouchers = useAppSelector(selectVendorDashboardVouchers);
  const dishes = useAppSelector(selectVendorDashboardDishes);
  const campaigns = useAppSelector(selectVendorDashboardCampaigns);
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

  const onGetVouchers = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<VendorDashboardVoucher> => {
      return await dispatch(getVouchers(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetDishes = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<VendorDashboardDishes> => {
      return await dispatch(getDishes(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetCampaigns = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<VendorDashboardCampaigns> => {
      return await dispatch(getCampaigns(payload)).unwrap();
    },
    [dispatch]
  );

  const onResetVendorDashboardState = useCallback(() => {
    dispatch(resetVendorDashboardState());
  }, [dispatch]);

  return {
    revenue,
    vouchers,
    dishes,
    campaigns,
    status,
    error,
    onGetRevenue,
    onGetVouchers,
    onGetDishes,
    onGetCampaigns,
    onResetVendorDashboardState,
  };
}
