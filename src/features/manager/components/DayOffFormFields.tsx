import type { AddDayOffFormData } from '@features/vendor/utils/dayOffSchema';
import type { FieldErrors } from 'react-hook-form';
import type { JSX } from 'react';

interface DayOffFormFieldsProps {
  form: AddDayOffFormData;
  errors: FieldErrors<AddDayOffFormData>;
  theme: 'amber' | 'blue';
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onIsAllDayChange: (checked: boolean) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export default function DayOffFormFields({
  form,
  errors,
  theme,
  onStartDateChange,
  onEndDateChange,
  onIsAllDayChange,
  onStartTimeChange,
  onEndTimeChange,
}: DayOffFormFieldsProps): JSX.Element {
  const dateFocusClass =
    theme === 'amber'
      ? 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';

  const checkboxAccentClass =
    theme === 'amber' ? 'accent-amber-500' : 'accent-blue-600';

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.startDate
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : dateFocusClass
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
            Ngày kết thúc
          </label>
          <input
            type="date"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(event) => onEndDateChange(event.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.endDate
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : dateFocusClass
            }`}
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-500">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={form.isAllDay}
            onChange={(event) => onIsAllDayChange(event.target.checked)}
            className={`h-4 w-4 cursor-pointer rounded border-gray-300 checked:text-white ${checkboxAccentClass}`}
          />
          <span className="text-sm font-semibold text-gray-700">
            Nghỉ cả ngày
          </span>
        </label>
      </div>

      {!form.isAllDay && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Giờ bắt đầu nghỉ
            </label>
            <input
              type="time"
              value={form.startTime ?? ''}
              onChange={(event) => onStartTimeChange(event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                errors.startTime
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                  : dateFocusClass
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-xs text-red-500">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Giờ hết nghỉ
            </label>
            <input
              type="time"
              value={form.endTime ?? ''}
              min={form.startTime ?? undefined}
              onChange={(event) => onEndTimeChange(event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                errors.endTime
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                  : dateFocusClass
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-xs text-red-500">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
