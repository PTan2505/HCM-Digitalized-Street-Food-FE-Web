import type {
  Setting,
  UpdateSettingRequest,
} from '@features/admin/types/setting';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getAllSettings, reloadSettings, updateSetting } from '@slices/setting';
import { useCallback } from 'react';

const useSetting = (): {
  onGetAllSettings: () => Promise<Setting[]>;
  onUpdateSetting: (
    name: string,
    data: UpdateSettingRequest
  ) => Promise<Setting>;
  onReloadSettings: () => Promise<void>;
} => {
  const dispatch = useAppDispatch();

  const onGetAllSettings = useCallback(async (): Promise<Setting[]> => {
    return await dispatch(getAllSettings()).unwrap();
  }, [dispatch]);

  const onUpdateSetting = useCallback(
    async (name: string, data: UpdateSettingRequest): Promise<Setting> => {
      return await dispatch(updateSetting({ name, data })).unwrap();
    },
    [dispatch]
  );

  const onReloadSettings = useCallback(async (): Promise<void> => {
    await dispatch(reloadSettings()).unwrap();
  }, [dispatch]);

  return {
    onGetAllSettings,
    onUpdateSetting,
    onReloadSettings,
  };
};

export default useSetting;
