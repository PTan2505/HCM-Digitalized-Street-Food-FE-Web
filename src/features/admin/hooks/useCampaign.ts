import { useAppDispatch } from '@hooks/reduxHooks';
import { useCallback } from 'react';
import {
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  getCampaignImage,
  postCampaignImage,
  deleteCampaignImage,
} from '@slices/campaign';
import { axiosApi } from '@lib/api/apiInstance';
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
  onGetCampaignDetail: (id: number) => Promise<Campaign>;
  onUpdateCampaign: (id: number, data: CampaignUpdate) => Promise<Campaign>;
  onGetCampaignImage: (id: number) => Promise<string[]>;
  onPostCampaignImage: (id: number, data: FormData) => Promise<string>;
  onDeleteCampaignImage: (id: number) => Promise<void>;
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

  const onGetCampaignDetail = useCallback(
    async (id: number): Promise<Campaign> => {
      return await axiosApi.campaignApi.getCampaignDetail(id);
    },
    []
  );

  const onUpdateCampaign = useCallback(
    async (id: number, data: CampaignUpdate): Promise<Campaign> => {
      return await dispatch(updateCampaign({ id, ...data })).unwrap();
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

  return {
    onGetCampaigns,
    onCreateCampaign,
    onGetCampaignDetail,
    onUpdateCampaign,
    onGetCampaignImage,
    onPostCampaignImage,
    onDeleteCampaignImage,
  };
};

export default useCampaign;
