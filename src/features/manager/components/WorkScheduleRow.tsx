import type { GetWorkScheduleItem } from '@features/vendor/types/workSchedule';
import type { EditWorkScheduleFormData } from '@features/vendor/utils/workScheduleSchema';
import type { FieldErrors } from 'react-hook-form';
import type { JSX } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';

interface WorkScheduleRowProps {
  item: GetWorkScheduleItem;
  dayName: string;
  isEditing: boolean;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  isEditValid: boolean;
  editForm: EditWorkScheduleFormData;
  editErrors: FieldErrors<EditWorkScheduleFormData>;
  formatTime: (time: string) => string;
  onOpenTimeChange: (value: string) => void;
  onCloseTimeChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onStartEdit: () => void;
  onRequestDelete: () => void;
  disableEdit: boolean;
}

export default function WorkScheduleRow({
  item,
  dayName,
  isEditing,
  status,
  isEditValid,
  editForm,
  editErrors,
  formatTime,
  onOpenTimeChange,
  onCloseTimeChange,
  onSave,
  onCancel,
  onStartEdit,
  onRequestDelete,
  disableEdit,
}: WorkScheduleRowProps): JSX.Element {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition ${
        isEditing
          ? 'border-blue-300 bg-blue-50/50'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex min-w-22.5 items-center justify-center">
        <span className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          {dayName}
        </span>
      </div>

      {isEditing ? (
        <div className="flex flex-1 items-center gap-3">
          <div>
            <input
              type="time"
              value={editForm.openTime}
              onChange={(e) => onOpenTimeChange(e.target.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                editErrors.openTime
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            {editErrors.openTime && (
              <p className="mt-1 text-xs text-red-500">
                {editErrors.openTime.message}
              </p>
            )}
          </div>

          <span className="text-sm text-gray-400">-</span>

          <div>
            <input
              type="time"
              value={editForm.closeTime}
              min={editForm.openTime || undefined}
              onChange={(e) => onCloseTimeChange(e.target.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                editErrors.closeTime
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            {editErrors.closeTime && (
              <p className="mt-1 text-xs text-red-500">
                {editErrors.closeTime.message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center gap-2">
          <span className="rounded-md bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">
            {formatTime(item.openTime)}
          </span>
          <span className="text-sm text-gray-400">-</span>
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700">
            {formatTime(item.closeTime)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <Tooltip title="Lưu">
              <span>
                <IconButton
                  size="small"
                  onClick={onSave}
                  disabled={status === 'pending' || !isEditValid}
                  sx={{ color: '#16a34a' }}
                >
                  {status === 'pending' ? (
                    <CircularProgress size={16} sx={{ color: '#16a34a' }} />
                  ) : (
                    <SaveIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Hủy">
              <IconButton
                size="small"
                onClick={onCancel}
                disabled={status === 'pending'}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Chỉnh sửa giờ">
              <IconButton
                size="small"
                onClick={onStartEdit}
                disabled={disableEdit}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <span>
                <IconButton
                  size="small"
                  onClick={onRequestDelete}
                  disabled={status === 'pending' || disableEdit}
                  sx={{
                    color: '#ef4444',
                    '&:hover': {
                      bgcolor: '#fee2e2',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}
