import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import type { WorkSchedule, DayOff } from '@features/vendor/types/workSchedule';
import useVendor from '@features/vendor/hooks/useVendor';

interface OperatingInfoSectionProps {
  branchId: number | null;
  // Form mode props (when branchId is null)
  formMode?: boolean;
  workScheduleData?: WorkSchedule;
  dayOffData?: DayOff;
  onWorkScheduleChange?: (data: WorkSchedule) => void;
  onDayOffChange?: (data: DayOff) => void;
}

const WEEKDAY_LABELS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 7, label: 'Chủ nhật' },
];

export default function OperatingInfoSection({
  branchId,
  formMode = false,
  workScheduleData,
  dayOffData,
  onWorkScheduleChange,
  onDayOffChange,
}: OperatingInfoSectionProps): JSX.Element {
  const { onSubmitWorkSchedule, onSubmitDayOff } = useVendor();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('info');

  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(
    workScheduleData ?? {
      weekdays: [],
      openTime: '08:00',
      closeTime: '22:00',
    }
  );

  const [dayOff, setDayOff] = useState<DayOff>(
    dayOffData ?? {
      startDate: '',
      endDate: '',
      startTime: null,
      endTime: null,
    }
  );

  // Update parent when in form mode
  useEffect(() => {
    if (formMode && onWorkScheduleChange) {
      onWorkScheduleChange(workSchedule);
    }
  }, [workSchedule, formMode, onWorkScheduleChange]);

  useEffect(() => {
    if (formMode && onDayOffChange) {
      onDayOffChange(dayOff);
    }
  }, [dayOff, formMode, onDayOffChange]);

  // Auto hide alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [showAlert]);

  const displayAlert = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ): void => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const handleWeekdayToggle = (day: number): void => {
    setWorkSchedule((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort((a, b) => a - b),
    }));
  };

  // Format date from dd/mm/yyyy to yyyy-mm-dd for API
  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr || dateStr?.length !== 10) return dateStr;
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return dateStr;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Handle date input change with validation
  const handleDateChange = (
    field: 'startDate' | 'endDate',
    value: string
  ): void => {
    // Remove non-numeric and non-slash characters
    let formatted = value.replace(/[^\d/]/g, '');

    // Auto-add slashes
    if (formatted.length >= 2 && formatted.indexOf('/') === -1) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length >= 5 && formatted.split('/').length === 2) {
      const parts = formatted.split('/');
      formatted = parts[0] + '/' + parts[1] + '/' + formatted.slice(5);
    }

    // Limit to 10 characters (dd/mm/yyyy)
    formatted = formatted.slice(0, 10);

    setDayOff((prev) => ({
      ...prev,
      [field]: formatted,
    }));
  };

  const handleWorkScheduleSubmit = async (): Promise<void> => {
    // In form mode, just update parent state
    if (formMode) {
      if (workSchedule.weekdays.length === 0) {
        displayAlert('Vui lòng chọn ít nhất một ngày hoạt động', 'warning');
        return;
      }
      if (!workSchedule.openTime || !workSchedule.closeTime) {
        displayAlert('Vui lòng nhập đầy đủ giờ mở cửa và đóng cửa', 'warning');
        return;
      }
      displayAlert('Thông tin hoạt động đã được lưu tạm!', 'info');
      return;
    }

    // Standalone mode with branchId
    if (!branchId) {
      displayAlert('Không tìm thấy thông tin chi nhánh', 'error');
      return;
    }

    if (workSchedule.weekdays.length === 0) {
      displayAlert('Vui lòng chọn ít nhất một ngày hoạt động', 'warning');
      return;
    }

    if (!workSchedule.openTime || !workSchedule.closeTime) {
      displayAlert('Vui lòng nhập đầy đủ giờ mở cửa và đóng cửa', 'warning');
      return;
    }

    try {
      await onSubmitWorkSchedule({
        branchId,
        data: workSchedule,
      });
      displayAlert('Cập nhật thông tin hoạt động thành công!', 'success');
    } catch (error) {
      console.error('Failed to submit work schedule:', error);
      displayAlert('Cập nhật thất bại. Vui lòng thử lại.', 'error');
    }
  };

  const handleDayOffSubmit = async (): Promise<void> => {
    // In form mode, just update parent state
    if (formMode) {
      if (!dayOff.startDate || !dayOff.endDate) {
        displayAlert('Vui lòng chọn ngày bắt đầu và kết thúc', 'warning');
        return;
      }
      // Validate date format
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (
        !dateRegex.test(dayOff.startDate) ||
        !dateRegex.test(dayOff.endDate)
      ) {
        displayAlert(
          'Định dạng ngày không hợp lệ. Vui lòng nhập dd/mm/yyyy',
          'warning'
        );
        return;
      }
      displayAlert('Ngày nghỉ đã được lưu tạm!', 'info');
      return;
    }

    // Standalone mode with branchId
    if (!branchId) {
      displayAlert('Không tìm thấy thông tin chi nhánh', 'error');
      return;
    }

    if (!dayOff.startDate || !dayOff.endDate) {
      displayAlert('Vui lòng chọn ngày bắt đầu và kết thúc', 'warning');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dayOff.startDate) || !dateRegex.test(dayOff.endDate)) {
      displayAlert(
        'Định dạng ngày không hợp lệ. Vui lòng nhập dd/mm/yyyy',
        'warning'
      );
      return;
    }

    try {
      // Convert dates to yyyy-mm-dd format for API
      const apiData = {
        startDate: formatDateForAPI(dayOff.startDate),
        endDate: formatDateForAPI(dayOff.endDate),
        startTime: dayOff.startTime,
        endTime: dayOff.endTime,
      };

      await onSubmitDayOff({
        branchId,
        data: apiData,
      });
      displayAlert('Cập nhật ngày nghỉ thành công!', 'success');
      // Reset form
      setDayOff({
        startDate: '',
        endDate: '',
        startTime: null,
        endTime: null,
      });
    } catch (error) {
      console.error('Failed to submit day off:', error);
      displayAlert('Cập nhật thất bại. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        4. Thông tin hoạt động
      </h2>

      {/* Alert Message */}
      {showAlert && (
        <div
          className={`mb-6 rounded-xl border-2 p-4 ${
            alertType === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : alertType === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : alertType === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                  : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          <p className="text-sm font-medium">{alertMessage}</p>
        </div>
      )}

      {/* Work Schedule Section */}
      <div className="mb-8">
        <h3 className="mb-4 text-base font-semibold text-gray-700">
          Giờ làm việc
        </h3>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Giờ mở cửa <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={workSchedule.openTime}
              onChange={(e) =>
                setWorkSchedule((prev) => ({
                  ...prev,
                  openTime: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Giờ đóng cửa <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={workSchedule.closeTime}
              onChange={(e) =>
                setWorkSchedule((prev) => ({
                  ...prev,
                  closeTime: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Ngày hoạt động trong tuần <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {WEEKDAY_LABELS.map((day) => (
              <label
                key={day.value}
                className="flex cursor-pointer items-center"
              >
                <input
                  type="checkbox"
                  checked={workSchedule.weekdays.includes(day.value)}
                  onChange={() => handleWeekdayToggle(day.value)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#06AA4C] outline-none focus:ring-0"
                />
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {day.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {!formMode && (
          <button
            type="button"
            onClick={() => void handleWorkScheduleSubmit()}
            className="w-full rounded-xl bg-[#06AA4C] px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#058f40] hover:shadow-lg active:translate-y-0 md:w-auto"
          >
            Lưu thông tin hoạt động
          </button>
        )}
      </div>

      {/* Day Off Section */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="mb-4 text-base font-semibold text-gray-700">
          Thêm ngày nghỉ
        </h3>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ngày bắt đầu
            </label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={dayOff.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              maxLength={10}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Định dạng: ngày/tháng/năm (VD: 25/12/2024)
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ngày kết thúc
            </label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={dayOff.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              maxLength={10}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Định dạng: ngày/tháng/năm (VD: 31/12/2024)
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Giờ bắt đầu (tùy chọn)
            </label>
            <input
              type="time"
              value={dayOff.startTime ?? ''}
              onChange={(e) =>
                setDayOff((prev) => ({
                  ...prev,
                  startTime: e.target.value || null,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Giờ kết thúc (tùy chọn)
            </label>
            <input
              type="time"
              value={dayOff.endTime ?? ''}
              onChange={(e) =>
                setDayOff((prev) => ({
                  ...prev,
                  endTime: e.target.value || null,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
            />
          </div>
        </div>

        {!formMode && (
          <button
            type="button"
            onClick={() => void handleDayOffSubmit()}
            className="w-full rounded-xl bg-[#06AA4C] px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#058f40] hover:shadow-lg active:translate-y-0 md:w-auto"
          >
            Thêm ngày nghỉ
          </button>
        )}

        <p className="mt-3 text-xs text-gray-500">
          Nếu không chọn giờ, cửa hàng sẽ nghỉ cả ngày
        </p>
      </div>
    </div>
  );
}
