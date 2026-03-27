import { useAppDispatch } from '@hooks/reduxHooks';
import { useCallback } from 'react';
import {
  getAllCampaigns,
  createCampaign,
  updateCampaign,
} from '@slices/campaign';
import type {
  CampaignCreate,
  CampaignUpdate,
  Campaign,
  CampaignListResponse,
} from '@features/admin/types/campaign';

const useCampaign = (): {
  onGetCampaigns: (
    pageNumber: number,
    pageSize: number
  ) => Promise<CampaignListResponse>;
  onCreateCampaign: (data: CampaignCreate) => Promise<Campaign>;
  onUpdateCampaign: (id: number, data: CampaignUpdate) => Promise<Campaign>;
} => {
  const dispatch = useAppDispatch();

  const onGetCampaigns = useCallback(
    async (
      pageNumber: number,
      pageSize: number
    ): Promise<CampaignListResponse> => {
      return await dispatch(getAllCampaigns({ pageNumber, pageSize })).unwrap();
    },
    [dispatch]
  );

  const onCreateCampaign = useCallback(
    async (data: CampaignCreate): Promise<Campaign> => {
      return await dispatch(createCampaign(data)).unwrap();
    },
    [dispatch]
  );

  const onUpdateCampaign = useCallback(
    async (id: number, data: CampaignUpdate): Promise<Campaign> => {
      return await dispatch(updateCampaign({ id, ...data })).unwrap();
    },
    [dispatch]
  );

  return {
    onGetCampaigns,
    onCreateCampaign,
    onUpdateCampaign,
  };
};

export default useCampaign;
