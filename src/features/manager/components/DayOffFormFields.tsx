import type { AddDayOffFormData } from '@features/vendor/utils/dayOffSchema';
import type { FieldErrors } from 'react-hook-form';
import type { JSX } from 'react';

interface DayOffFormFieldsProps {
  form: AddDayOffFormData;
  errors: FieldErrors<AddDayOffFormData>;
  theme: 'amber' | 'blue';
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export default function DayOffFormFields({
  form,
  errors,
  theme,
  onStartDateChange,
  onEndDateChange,
}: DayOffFormFieldsProps): JSX.Element {
  const focusClass =
    theme === 'amber'
      ? 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            Thời điểm bắt đầu
          </label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.startDate
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : focusClass
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-500">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            Thời điểm kết thúc
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(event) => onEndDateChange(event.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.endDate
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : focusClass
            }`}
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-500">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
