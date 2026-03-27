import { useAppDispatch } from '@hooks/reduxHooks';
import { useCallback } from 'react';
import {
  getVendorCampaigns,
  createVendorCampaign,
  updateVendorCampaign,
  getBranchCampaigns,
  createBranchCampaign,
  getJoinableSystemCampaigns,
  joinBranchToSystemCampaign,
} from '@slices/campaign';
import type {
  VendorCampaign,
  VendorCampaignCreate,
  VendorCampaignUpdate,
  VendorCampaignListResponse,
  JoinSystemCampaignResponse,
} from '@features/vendor/types/campaign';

const useVendorCampaign = (): {
  onGetVendorCampaigns: (
    pageNumber: number,
    pageSize: number
  ) => Promise<VendorCampaignListResponse>;
  onCreateVendorCampaign: (
    data: VendorCampaignCreate
  ) => Promise<VendorCampaign>;
  onUpdateVendorCampaign: (
    id: number,
    data: VendorCampaignUpdate
  ) => Promise<VendorCampaign>;
  onGetBranchCampaigns: (
    branchId: number,
    pageNumber: number,
    pageSize: number
  ) => Promise<VendorCampaignListResponse>;
  onCreateBranchCampaign: (
    branchId: number,
    data: VendorCampaignCreate
  ) => Promise<VendorCampaign>;
  onGetJoinableSystemCampaigns: (
    pageNumber: number,
    pageSize: number
  ) => Promise<VendorCampaignListResponse>;
  onJoinBranchToSystemCampaign: (
    branchId: number,
    campaignId: number
  ) => Promise<JoinSystemCampaignResponse>;
} => {
  const dispatch = useAppDispatch();

  const onGetVendorCampaigns = useCallback(
    async (
      pageNumber: number,
      pageSize: number
    ): Promise<VendorCampaignListResponse> => {
      return await dispatch(
        getVendorCampaigns({ pageNumber, pageSize })
      ).unwrap();
    },
    [dispatch]
  );

  const onCreateVendorCampaign = useCallback(
    async (data: VendorCampaignCreate): Promise<VendorCampaign> => {
      return await dispatch(createVendorCampaign(data)).unwrap();
    },
    [dispatch]
  );

  const onUpdateVendorCampaign = useCallback(
    async (id: number, data: VendorCampaignUpdate): Promise<VendorCampaign> => {
      return await dispatch(updateVendorCampaign({ id, ...data })).unwrap();
    },
    [dispatch]
  );

  const onGetBranchCampaigns = useCallback(
    async (
      branchId: number,
      pageNumber: number,
      pageSize: number
    ): Promise<VendorCampaignListResponse> => {
      return await dispatch(
        getBranchCampaigns({ branchId, pageNumber, pageSize })
      ).unwrap();
    },
    [dispatch]
  );

  const onCreateBranchCampaign = useCallback(
    async (
      branchId: number,
      data: VendorCampaignCreate
    ): Promise<VendorCampaign> => {
      return await dispatch(
        createBranchCampaign({ branchId, ...data })
      ).unwrap();
    },
    [dispatch]
  );

  const onGetJoinableSystemCampaigns = useCallback(
    async (
      pageNumber: number,
      pageSize: number
    ): Promise<VendorCampaignListResponse> => {
      return await dispatch(
        getJoinableSystemCampaigns({ pageNumber, pageSize })
      ).unwrap();
    },
    [dispatch]
  );

  const onJoinBranchToSystemCampaign = useCallback(
    async (
      branchId: number,
      campaignId: number
    ): Promise<JoinSystemCampaignResponse> => {
      return await dispatch(
        joinBranchToSystemCampaign({ branchId, campaignId })
      ).unwrap();
    },
    [dispatch]
  );

  return {
    onGetVendorCampaigns,
    onCreateVendorCampaign,
    onUpdateVendorCampaign,
    onGetBranchCampaigns,
    onCreateBranchCampaign,
    onGetJoinableSystemCampaigns,
    onJoinBranchToSystemCampaign,
  };
};

export default useVendorCampaign;
