import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import {
  Avatar,
  Chip,
  MenuItem,
  Select,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DishSchema, type DishFormData } from '@features/vendor/utils/dishSchema';

import type {
  CreateOrUpdateDishRequest,
  CreateOrUpdateDishResponse,
} from '@features/vendor/types/dish';
import type { Category } from '@features/admin/types/category';
import type { Taste } from '@features/admin/types/taste';
import type { UserDietaryPreference } from '@features/admin/types/userDietaryPreference';
import useCategory from '@features/admin/hooks/useCategory';
import useTaste from '@features/admin/hooks/useTaste';
import useDietary from '@features/admin/hooks/useDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectCategories } from '@slices/category';
import { selectTastes } from '@slices/taste';
import { selectUserDietaryPreferences } from '@slices/userPreferenceDietary';

interface DishFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  editingDish: CreateOrUpdateDishResponse | null;
  vendorId: number;
  onClose: () => void;
  onCreateDish: (payload: {
    data: CreateOrUpdateDishRequest;
    vendorId: number;
  }) => Promise<CreateOrUpdateDishResponse>;
  onUpdateDish: (payload: {
    data: CreateOrUpdateDishRequest;
    dishId: number;
  }) => Promise<CreateOrUpdateDishResponse>;
  onSuccess: () => void;
}

export default function DishFormModal({
  isOpen,
  isEditMode,
  editingDish,
  vendorId,
  onClose,
  onCreateDish,
  onUpdateDish,
  onSuccess,
}: DishFormModalProps): JSX.Element | null {
  const categories = useAppSelector(selectCategories);
  const tastes = useAppSelector(selectTastes);
  const dietaryPreferences = useAppSelector(selectUserDietaryPreferences);

  const { onGetAllCategories } = useCategory();
  const { onGetAllTastes } = useTaste();
  const { onGetAllUserDietaryPreferences } = useDietary();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DishFormData>({
    resolver: zodResolver(DishSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      categoryId: 0,
      tasteIds: [],
      dietaryIds: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      void onGetAllCategories();
      void onGetAllTastes();
      void onGetAllUserDietaryPreferences();
    }
  }, [
    isOpen,
    onGetAllCategories,
    onGetAllTastes,
    onGetAllUserDietaryPreferences,
  ]);

  useEffect(() => {
    if (isOpen && isEditMode && editingDish) {
      const tasteIds = tastes
        .filter((t: Taste) => editingDish.tasteNames.includes(t.name))
        .map((t: Taste) => t.tasteId);

      const dietaryIds = dietaryPreferences
        .filter((d: UserDietaryPreference) =>
          editingDish.dietaryPreferenceNames.includes(d.name)
        )
        .map((d: UserDietaryPreference) => d.dietaryPreferenceId);

      reset({
        name: editingDish.name,
        price: editingDish.price,
        description: editingDish.description ?? '',
        categoryId: editingDish.categoryId,
        tasteIds: tasteIds,
        dietaryIds: dietaryIds,
        isActive: editingDish.isActive,
      });

      setImagePreview(editingDish.imageUrl);
      setImageFile(null);
      setImageError('');
    } else if (isOpen && !isEditMode) {
      reset({
        name: '',
        price: 0,
        description: '',
        categoryId: 0,
        tasteIds: [],
        dietaryIds: [],
        isActive: true,
      });
      setImageFile(null);
      setImagePreview('');
      setImageError('');
    }
  }, [isOpen, isEditMode, editingDish, tastes, dietaryPreferences, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError('');
      e.target.value = '';
    }
  };

  const onSubmit = async (data: DishFormData): Promise<void> => {
    if (!isEditMode && !imageFile) {
      setImageError('Vui lòng chọn hình ảnh món ăn');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateOrUpdateDishRequest = {
        Name: data.name.trim(),
        Price: data.price,
        Description: data.description ? data.description.trim() : '',
        CategoryId: data.categoryId,
        TasteIds: data.tasteIds,
        DietaryPreferenceIds: data.dietaryIds,
        IsActive: data.isActive,
        imageFile: imageFile as File,
      };

      if (isEditMode && editingDish) {
        await onUpdateDish({ data: payload, dishId: editingDish.dishId });
      } else {
        await onCreateDish({ data: payload, vendorId });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save dish:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={submitting ? undefined : onClose}
    >
      <Box
        className="mx-4 flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <Box className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-8 py-5">
          <Box className="flex items-center gap-3">
            <Box className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <RestaurantMenuIcon />
            </Box>
            <Box>
              <Typography
                variant="h2"
                className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl"
              >
                {isEditMode ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
              </Typography>
              <Typography className="mt-0.5 text-sm font-medium text-[var(--color-table-text-secondary)]">
                {isEditMode
                  ? 'Cập nhật lại thông tin, giá cả và hình ảnh cho món ăn của bạn'
                  : 'Hãy thêm một món ăn hấp dẫn vào chiếc menu của cửa hàng'}
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={onClose}
            disabled={submitting}
            sx={{
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Modal Content */}
        <Box className="flex-1 overflow-y-auto px-8 py-6">
          <Box className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Cột 1: Thông tin cơ bản */}
            <Box className="flex flex-col gap-5">
              <Typography className="mb-1 border-b border-gray-100 pb-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                Thông tin cơ bản
              </Typography>

              {/* Tên món */}
              <Box>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Tên món <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        type="text"
                        className={`w-full rounded-xl border px-4 py-2.5 outline-none transition-all focus:ring-[var(--color-primary-500)] ${
                          errors.name
                            ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2'
                            : 'border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary-500)]'
                        }`}
                        placeholder="Ví dụ: Phở Bò Tái Nạm"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </Box>

              {/* Giá */}
              <Box>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value === 0 ? '' : field.value}
                        className={`w-full rounded-xl border px-4 py-2.5 outline-none transition-all focus:ring-[var(--color-primary-500)] ${
                          errors.price
                            ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2'
                            : 'border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary-500)]'
                        }`}
                        placeholder="Ví dụ: 50000"
                        min="0"
                      />
                      {errors.price && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.price.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </Box>

              {/* Mô tả */}
              <Box>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Mô tả món ăn
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <>
                      <textarea
                        {...field}
                        rows={4}
                        className={`w-full resize-none rounded-xl border px-4 py-2.5 outline-none transition-all focus:ring-[var(--color-primary-500)] ${
                          errors.description
                            ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2'
                            : 'border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary-500)]'
                        }`}
                        placeholder="Mô tả sự hấp dẫn, nguyên liệu của món..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.description.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </Box>

              {/* Trạng thái */}
              <Box>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Trạng thái kinh doanh
                </label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? 1 : 0}
                      onChange={(e) => field.onChange(Number(e.target.value) === 1)}
                      fullWidth
                      className="rounded-xl bg-white"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e5e7eb',
                          borderRadius: '0.75rem',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d1d5db',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--color-primary-500)',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      <MenuItem value={1}>
                        <span className="font-medium text-green-700">Đang bán</span>
                      </MenuItem>
                      <MenuItem value={0}>
                        <span className="font-medium text-red-700">Ngừng bán</span>
                      </MenuItem>
                    </Select>
                  )}
                />
              </Box>
            </Box>

            {/* Cột 2: Danh mục & Ảnh */}
            <Box className="flex flex-col gap-5">
              <Typography className="mb-1 border-b border-gray-100 pb-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                Phân loại & Thuộc tính
              </Typography>

              {/* Danh mục */}
              <Box>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Danh mục chính <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Select
                        {...field}
                        displayEmpty
                        fullWidth
                        className="rounded-xl bg-white"
                        error={!!errors.categoryId}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: errors.categoryId ? '#ef4444' : '#e5e7eb',
                            borderRadius: '0.75rem',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: errors.categoryId ? '#ef4444' : '#d1d5db',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: errors.categoryId ? '#ef4444' : 'var(--color-primary-500)',
                            borderWidth: errors.categoryId ? '1px' : '1px',
                          },
                        }}
                      >
                        <MenuItem value={0} disabled>
                          <span className="text-gray-400">Chọn danh mục</span>
                        </MenuItem>
                        {categories.map((cat: Category) => (
                          <MenuItem key={cat.categoryId} value={cat.categoryId}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categoryId && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </Box>

              {/* Hương vị */}
              <Box>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Hương vị <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="tasteIds"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Box className="flex flex-wrap gap-2">
                        {tastes.map((t: Taste) => {
                          const isSelected = field.value.includes(t.tasteId);
                          return (
                            <Chip
                              key={t.tasteId}
                              label={t.name}
                              onClick={() => {
                                const newValue = isSelected
                                  ? field.value.filter((val) => val !== t.tasteId)
                                  : [...field.value, t.tasteId];
                                field.onChange(newValue);
                              }}
                              variant={isSelected ? 'filled' : 'outlined'}
                              className={`transition-colors ${
                                isSelected
                                  ? 'bg-blue-100 font-medium text-blue-700 hover:bg-blue-200'
                                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            />
                          );
                        })}
                        {tastes.length === 0 && (
                          <span className="text-sm text-gray-400">Không có dữ liệu</span>
                        )}
                      </Box>
                      {errors.tasteIds && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.tasteIds.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </Box>

              {/* Chế độ ăn */}
              <Box>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Chế độ ăn phù hợp <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="dietaryIds"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Box className="flex flex-wrap gap-2">
                        {dietaryPreferences.map((d: UserDietaryPreference) => {
                          const isSelected = field.value.includes(d.dietaryPreferenceId);
                          return (
                            <Chip
                              key={d.dietaryPreferenceId}
                              label={d.name}
                              onClick={() => {
                                const newValue = isSelected
                                  ? field.value.filter(
                                      (val) => val !== d.dietaryPreferenceId
                                    )
                                  : [...field.value, d.dietaryPreferenceId];
                                field.onChange(newValue);
                              }}
                              variant={isSelected ? 'filled' : 'outlined'}
                              className={`transition-colors ${
                                isSelected
                                  ? 'bg-teal-100 font-medium text-teal-800 hover:bg-teal-200'
                                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            />
                          );
                        })}
                        {dietaryPreferences.length === 0 && (
                          <span className="text-sm text-gray-400">Không có dữ liệu</span>
                        )}
                      </Box>
                      {errors.dietaryIds && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.dietaryIds.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </Box>

              {/* Border separator before Image */}
              <Box className="my-2 border-b border-gray-100" />

              {/* Khu vực Upload Ảnh */}
              <Box>
                <label className="mb-2.5 flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>
                    Hình ảnh món ăn {' '}
                    {!isEditMode && <span className="text-red-500">*</span>}
                  </span>
                  {isEditMode && !imageFile && (
                    <span className="text-xs font-medium tracking-wide text-gray-400">
                      GIỮ ẢNH HIỆN TẠI
                    </span>
                  )}
                </label>

                {/* Khung tải ảnh */}
                <label className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-gray-50/60 p-6 transition-all hover:border-[var(--color-primary-400)] hover:bg-gray-50 ${
                    imageError ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {!imagePreview ? (
                    <Box className="flex flex-col items-center justify-center text-center">
                      <Box className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">
                        <CloudUploadIcon fontSize="medium" />
                      </Box>
                      <Typography className="text-sm font-semibold text-gray-700">
                        Nhấn để chọn ảnh
                      </Typography>
                      <Typography className="mt-1 text-xs text-gray-500">
                        PNG, JPG, JPEG (Tối đa 5MB)
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="flex flex-col items-center justify-center">
                      <Avatar
                        src={imagePreview}
                        alt="Preview"
                        variant="rounded"
                        className="mb-3 h-28 w-28 border border-gray-200 shadow-sm transition-transform hover:scale-105"
                      />
                      <Typography className="text-sm font-bold text-blue-600">
                        Nhấn để đổi ảnh khác
                      </Typography>
                    </Box>
                  )}
                </label>
                {imageError && (
                  <p className="mt-1 text-xs text-red-500">{imageError}</p>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Modal Actions */}
        <Box className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-8 py-5">
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              paddingX: 3,
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' },
            }}
          >
            Hủy bỏ
          </Button>

          <Button
            onClick={() => void handleSubmit(onSubmit)()}
            disabled={submitting}
            variant="contained"
            color="primary"
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              paddingX: 4,
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            {submitting ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Hoàn tất thêm'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
