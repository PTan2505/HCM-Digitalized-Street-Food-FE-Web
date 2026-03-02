import type {
  GetAllVendorsParams,
  GetAllVendorsResponse,
  VendorDetail,
} from '@features/admin/types/vendor';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  getAllVendors,
  getActiveVendors,
  deleteVendor,
  suspendVendor,
  reactivateVendor,
  getVendorDetail,
} from '@slices/vendorAdmin';
import { useCallback } from 'react';

export default function useVendor(): {
  onGetAllVendors: (
    params: GetAllVendorsParams
  ) => Promise<GetAllVendorsResponse>;
  onGetActiveVendors: (
    params: GetAllVendorsParams
  ) => Promise<GetAllVendorsResponse>;
  onGetVendorDetail: (id: number) => Promise<VendorDetail>;
  onDeleteVendor: (id: number) => Promise<void>;
  onSuspendVendor: (id: number) => Promise<void>;
  onReactivateVendor: (id: number) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const onGetAllVendors = useCallback(
    async (params: GetAllVendorsParams): Promise<GetAllVendorsResponse> => {
      const response = await dispatch(getAllVendors(params)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onGetActiveVendors = useCallback(
    async (params: GetAllVendorsParams): Promise<GetAllVendorsResponse> => {
      const response = await dispatch(getActiveVendors(params)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onGetVendorDetail = useCallback(
    async (id: number): Promise<VendorDetail> => {
      const response = await dispatch(getVendorDetail(id)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onDeleteVendor = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(deleteVendor(id)).unwrap();
    },
    [dispatch]
  );

  const onSuspendVendor = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(suspendVendor(id)).unwrap();
    },
    [dispatch]
  );

  const onReactivateVendor = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(reactivateVendor(id)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetAllVendors,
    onGetActiveVendors,
    onGetVendorDetail,
    onDeleteVendor,
    onSuspendVendor,
    onReactivateVendor,
  };
}
