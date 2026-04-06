import type { RootState } from '@app/store';
import type {
  Voucher,
  VoucherCreate,
  VoucherUpdate,
} from '@custom-types/voucher';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface VoucherState {
  vouchers: Voucher[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: VoucherState = {
  vouchers: [],
  status: 'idle',
  error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const getAllVouchers = createAppAsyncThunk(
  'voucher/getAllVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosApi.voucherApi.getVouchers();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getVouchersByCampaignId = createAppAsyncThunk(
  'voucher/getVouchersByCampaignId',
  async (campaignId: number, { rejectWithValue }) => {
    try {
      const response =
        await axiosApi.voucherApi.getVouchersByCampaignId(campaignId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getVoucherById = createAppAsyncThunk(
  'voucher/getVoucherById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosApi.voucherApi.getVoucherById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createVoucher = createAppAsyncThunk(
  'voucher/createVoucher',
  async (payload: VoucherCreate[], { rejectWithValue }) => {
    try {
      const response = await axiosApi.voucherApi.createVoucher(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateVoucher = createAppAsyncThunk(
  'voucher/updateVoucher',
  async (payload: { id: number } & VoucherUpdate, { rejectWithValue }) => {
    try {
      const { id, ...data } = payload;
      const response = await axiosApi.voucherApi.updateVoucher(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteVoucher = createAppAsyncThunk(
  'voucher/deleteVoucher',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.voucherApi.deleteVoucher(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const voucherSlice = createSlice({
  name: 'voucher',
  initialState,
  reducers: {
    resetVoucherState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllVouchers.fulfilled, (state, action) => {
        state.vouchers = action.payload;
      })
      .addCase(getVouchersByCampaignId.fulfilled, (state, action) => {
        state.vouchers = action.payload;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        // API trả Voucher[] — unshift tất cả vào đầu danh sách
        action.payload.forEach((voucher) => {
          state.vouchers.unshift(voucher);
        });
      })
      .addCase(updateVoucher.fulfilled, (state, action) => {
        if (action.payload) {
          const voucher = action.payload;
          const index = state.vouchers.findIndex(
            (v) => v.voucherId === voucher.voucherId
          );
          if (index !== -1) {
            state.vouchers[index] = voucher;
          }
        }
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.vouchers = state.vouchers.filter(
          (v) => v.voucherId !== action.payload
        );
      })
      .addMatcher(
        isPending(
          getAllVouchers,
          getVouchersByCampaignId,
          getVoucherById,
          createVoucher,
          updateVoucher,
          deleteVoucher
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      .addMatcher(
        isFulfilled(
          getAllVouchers,
          getVouchersByCampaignId,
          getVoucherById,
          createVoucher,
          updateVoucher,
          deleteVoucher
        ),
        (state) => {
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(
          getAllVouchers,
          getVouchersByCampaignId,
          getVoucherById,
          createVoucher,
          updateVoucher,
          deleteVoucher
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetVoucherState } = voucherSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectVoucherStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.voucher.status;

export const selectVouchers = (state: RootState): Voucher[] =>
  state.voucher.vouchers;

export default voucherSlice.reducer;
