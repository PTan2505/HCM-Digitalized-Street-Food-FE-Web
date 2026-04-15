import { useCallback } from 'react';
import { axiosApi } from '@lib/api/apiInstance';
import type { PublicCampaign } from '../types/campaign';

export default function useCampaignCarousel(): {
  onGetPublicCampaigns: () => Promise<PublicCampaign[]>;
} {
  const onGetPublicCampaigns = useCallback(async (): Promise<
    PublicCampaign[]
  > => {
    return await axiosApi.homeCampaignApi.getPublicCampaigns();
  }, []);

  return {
    onGetPublicCampaigns,
  };
}
