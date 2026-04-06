import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import type { ReactNode } from 'react';
import type { JSX } from 'react';

export type EditableField = 'name' | 'phoneNumber' | 'email';

type BranchDetailRowProps = {
  label: string;
  value: ReactNode;
  field?: EditableField;
  editingField: EditableField | null;
  editValue: string;
  onStartEdit: (field: EditableField, value: string) => void;
  onChangeEditValue: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isSaving: boolean;
  disableEditButton?: boolean;
};

export default function BranchDetailRow({
  label,
  value,
  field,
  editingField,
  editValue,
  onStartEdit,
  onChangeEditValue,
  onSaveEdit,
  onCancelEdit,
  isSaving,
  disableEditButton = false,
}: BranchDetailRowProps): JSX.Element {
  const isEditing = field !== undefined && editingField === field;

  return (
    <div className="grid grid-cols-12 items-start gap-3 border-b border-gray-100 py-3 last:border-0">
      <div className="col-span-12 text-sm font-semibold text-gray-600 md:col-span-4">
        {label}
      </div>
      <div className="col-span-12 md:col-span-8">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              value={editValue}
              onChange={(event) => onChangeEditValue(event.target.value)}
              className="focus:border-primary-500 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm outline-none"
              autoFocus
            />
            <IconButton
              size="small"
              color="success"
              onClick={onSaveEdit}
              disabled={isSaving}
            >
              <CheckIcon sx={{ fontSize: 18, color: '#166534' }} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={onCancelEdit}
              disabled={isSaving}
            >
              <CloseIcon sx={{ fontSize: 18, color: '#b91c1c' }} />
            </IconButton>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-table-text-primary text-sm font-medium">
              {value}
            </span>
            {field !== undefined && (
              <IconButton
                size="small"
                color="primary"
                disabled={disableEditButton}
                onClick={() =>
                  onStartEdit(
                    field,
                    typeof value === 'string'
                      ? value === '-'
                        ? ''
                        : value
                      : ''
                  )
                }
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
