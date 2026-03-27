import { useAppDispatch } from '@hooks/reduxHooks';
import { useCallback } from 'react';
import {
  getVendorCampaigns,
  createVendorCampaign,
  updateVendorCampaign,
  getCampaignImage,
  postCampaignImage,
  deleteCampaignImage,
  getBranchCampaigns,
  createBranchCampaign,
  getJoinableSystemCampaigns,
  joinBranchToSystemCampaign,
  getSystemCampaignDetails,
} from '@slices/campaign';
import type {
  VendorCampaign,
  CampaignDetailsResponse,
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
  onGetCampaignImage: (id: number) => Promise<string[]>;
  onPostCampaignImage: (id: number, data: FormData) => Promise<string>;
  onDeleteCampaignImage: (id: number) => Promise<void>;
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
  onGetSystemCampaignDetails: (
    campaignId: number
  ) => Promise<CampaignDetailsResponse>;
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

  const onGetCampaignImage = useCallback(
    async (id: number): Promise<string[]> => {
      return await dispatch(getCampaignImage(id)).unwrap();
    },
    [dispatch]
  );

  const onPostCampaignImage = useCallback(
    async (id: number, data: FormData): Promise<string> => {
      return await dispatch(postCampaignImage({ id, data })).unwrap();
    },
    [dispatch]
  );

  const onDeleteCampaignImage = useCallback(
    async (id: number): Promise<void> => {
      return await dispatch(deleteCampaignImage(id)).unwrap();
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

  const onGetSystemCampaignDetails = useCallback(
    async (campaignId: number): Promise<CampaignDetailsResponse> => {
      return await dispatch(getSystemCampaignDetails(campaignId)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetVendorCampaigns,
    onCreateVendorCampaign,
    onUpdateVendorCampaign,
    onGetCampaignImage,
    onPostCampaignImage,
    onDeleteCampaignImage,
    onGetBranchCampaigns,
    onCreateBranchCampaign,
    onGetJoinableSystemCampaigns,
    onJoinBranchToSystemCampaign,
    onGetSystemCampaignDetails,
  };
};

export default useVendorCampaign;
