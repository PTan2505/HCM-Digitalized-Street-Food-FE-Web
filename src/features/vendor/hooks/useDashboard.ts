import type {
  VendorDashboardRevenue,
  VendorDashboardVoucher,
  VendorDashboardDishes,
  VendorDashboardCampaigns,
  VendorRevenueBarResponse,
} from '@features/vendor/types/dashboard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  getRevenue,
  getVouchers,
  getDishes,
  getCampaigns,
  getVendorRevenueBar,
  resetVendorDashboardState,
  selectVendorDashboardRevenue,
  selectVendorDashboardVouchers,
  selectVendorDashboardDishes,
  selectVendorDashboardCampaigns,
  selectVendorDashboardRevenueBar,
  selectVendorDashboardRevenueBarStatus,
  selectVendorDashboardStatus,
  selectVendorDashboardError,
} from '@slices/vendorDashboard';
import { useCallback } from 'react';

export default function useDashboard(): {
  revenue: VendorDashboardRevenue | null;
  vouchers: VendorDashboardVoucher | null;
  dishes: VendorDashboardDishes | null;
  campaigns: VendorDashboardCampaigns | null;
  vendorRevenueBar: VendorRevenueBarResponse | null;
  revenueBarStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
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
  onGetVendorRevenueBar: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<VendorRevenueBarResponse>;
  onResetVendorDashboardState: () => void;
} {
  const dispatch = useAppDispatch();

  const revenue = useAppSelector(selectVendorDashboardRevenue);
  const vouchers = useAppSelector(selectVendorDashboardVouchers);
  const dishes = useAppSelector(selectVendorDashboardDishes);
  const campaigns = useAppSelector(selectVendorDashboardCampaigns);
  const vendorRevenueBar = useAppSelector(selectVendorDashboardRevenueBar);
  const revenueBarStatus = useAppSelector(
    selectVendorDashboardRevenueBarStatus
  );
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

  const onGetVendorRevenueBar = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<VendorRevenueBarResponse> => {
      return await dispatch(getVendorRevenueBar(payload)).unwrap();
    },
    [dispatch]
  );

  return {
    revenue,
    vouchers,
    dishes,
    campaigns,
    vendorRevenueBar,
    revenueBarStatus,
    status,
    error,
    onGetRevenue,
    onGetVouchers,
    onGetDishes,
    onGetCampaigns,
    onGetVendorRevenueBar,
    onResetVendorDashboardState,
  };
}
