import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  getUserSignUps,
  getMoney,
  getCompensation,
  getConversions,
  getSystemCampaignsStatistics,
  resetAdminDashboardState,
  selectAdminDashboardUserSignUps,
  selectAdminDashboardMoney,
  selectAdminDashboardCompensation,
  selectAdminDashboardConversions,
  selectAdminDashboardSystemCampaignsStatistics,
  selectAdminDashboardRevenueBar,
  selectAdminDashboardRevenueBarStatus,
  selectAdminDashboardRevenueBarError,
  selectAdminDashboardStatus,
  selectAdminDashboardError,
  getAdminRevenueBar,
} from '@slices/adminDashboard';
import { useCallback } from 'react';
import type {
  GetUserSignUps,
  GetMoney,
  GetCompensation,
  GetConversions,
  SystemCampaignStatistics,
  AdminRevenueBarResponse,
} from '@features/admin/types/dashboard';

export default function useDashboard(): {
  userSignUps: GetUserSignUps | null;
  money: GetMoney | null;
  compensation: GetCompensation | null;
  conversions: GetConversions | null;
  systemCampaignsStatistics: SystemCampaignStatistics[] | null;
  adminRevenueBar: AdminRevenueBarResponse | null;
  revenueBarStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  revenueBarError: unknown;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  onGetUserSignUps: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<GetUserSignUps>;
  onGetMoney: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<GetMoney>;
  onGetCompensation: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<GetCompensation>;
  onGetConversions: (payload: {
    fromDate: string;
    toDate: string;
  }) => Promise<GetConversions>;
  onGetAdminRevenueBar: (payload: {
    fromDate: string;
    toDate: string;
    previousFromDate?: string;
    previousToDate?: string;
  }) => Promise<AdminRevenueBarResponse>;
  onGetSystemCampaignsStatistics: () => Promise<SystemCampaignStatistics[]>;
  onResetAdminDashboardState: () => void;
} {
  const dispatch = useAppDispatch();

  const userSignUps = useAppSelector(selectAdminDashboardUserSignUps);
  const money = useAppSelector(selectAdminDashboardMoney);
  const compensation = useAppSelector(selectAdminDashboardCompensation);
  const conversions = useAppSelector(selectAdminDashboardConversions);
  const systemCampaignsStatistics = useAppSelector(
    selectAdminDashboardSystemCampaignsStatistics
  );
  const adminRevenueBar = useAppSelector(selectAdminDashboardRevenueBar);
  const revenueBarStatus = useAppSelector(selectAdminDashboardRevenueBarStatus);
  const revenueBarError = useAppSelector(selectAdminDashboardRevenueBarError);
  const status = useAppSelector(selectAdminDashboardStatus);
  const error = useAppSelector(selectAdminDashboardError);

  const onGetUserSignUps = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<GetUserSignUps> => {
      return await dispatch(getUserSignUps(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetMoney = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<GetMoney> => {
      return await dispatch(getMoney(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetCompensation = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<GetCompensation> => {
      return await dispatch(getCompensation(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetConversions = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
    }): Promise<GetConversions> => {
      return await dispatch(getConversions(payload)).unwrap();
    },
    [dispatch]
  );

  const onResetAdminDashboardState = useCallback(() => {
    dispatch(resetAdminDashboardState());
  }, [dispatch]);

  const onGetSystemCampaignsStatistics = useCallback(async (): Promise<
    SystemCampaignStatistics[]
  > => {
    return await dispatch(getSystemCampaignsStatistics()).unwrap();
  }, [dispatch]);

  const onGetAdminRevenueBar = useCallback(
    async (payload: {
      fromDate: string;
      toDate: string;
      previousFromDate?: string;
      previousToDate?: string;
    }): Promise<AdminRevenueBarResponse> => {
      return await dispatch(getAdminRevenueBar(payload)).unwrap();
    },
    [dispatch]
  );

  return {
    userSignUps,
    money,
    compensation,
    conversions,
    systemCampaignsStatistics,
    adminRevenueBar,
    revenueBarStatus,
    revenueBarError,
    status,
    error,
    onGetUserSignUps,
    onGetMoney,
    onGetCompensation,
    onGetConversions,
    onGetSystemCampaignsStatistics,
    onGetAdminRevenueBar,
    onResetAdminDashboardState,
  };
}
