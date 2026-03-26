import { useAppDispatch } from '@hooks/reduxHooks';
import { useCallback } from 'react';
import {
  getVendorCampaigns,
  createVendorCampaign,
  updateVendorCampaign,
} from '@slices/campaign';
import type {
  VendorCampaign,
  VendorCampaignCreate,
  VendorCampaignUpdate,
  VendorCampaignListResponse,
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

  return {
    onGetVendorCampaigns,
    onCreateVendorCampaign,
    onUpdateVendorCampaign,
  };
};

export default useVendorCampaign;
