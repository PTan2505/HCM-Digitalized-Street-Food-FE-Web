const daysOfWeek = [
  { value: 'monday', label: 'Thứ 2' },
  { value: 'tuesday', label: 'Thứ 3' },
  { value: 'wednesday', label: 'Thứ 4' },
  { value: 'thursday', label: 'Thứ 5' },
  { value: 'friday', label: 'Thứ 6' },
  { value: 'saturday', label: 'Thứ 7' },
  { value: 'sunday', label: 'Chủ nhật' },
];

const serviceTypes = ['Mang về', 'Ăn tại chỗ', 'Giao hàng'];

interface OperatingInfoSectionProps {
  formData: {
    openTime: string;
    closeTime: string;
    workingDays: string[];
    closedDates: string;
    serviceTypes: string[];
  };
  onFieldChange: (field: string, value: any) => void;
  onWorkingDayToggle: (day: string) => void;
  onServiceTypeToggle: (service: string) => void;
}

export default function OperatingInfoSection({
  formData,
  onFieldChange,
  onWorkingDayToggle,
  onServiceTypeToggle,
}: OperatingInfoSectionProps) {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-gray-800">
        4. Thông tin hoạt động
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Giờ mở cửa
          </label>
          <input
            type="time"
            value={formData.openTime}
            onChange={(e) => onFieldChange('openTime', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Giờ đóng cửa
          </label>
          <input
            type="time"
            value={formData.closeTime}
            onChange={(e) => onFieldChange('closeTime', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Ngày hoạt động trong tuần
        </label>
        <div className="flex flex-wrap gap-4">
          {daysOfWeek.map((day) => (
            <label key={day.value} className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.workingDays.includes(day.value)}
                onChange={() => onWorkingDayToggle(day.value)}
                className="h-4 w-4 rounded border-gray-300 accent-[#06AA4C] outline-none focus:ring-0"
              />
              <span className="ml-2 text-sm font-medium text-gray-600">
                {day.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Nghỉ ngày nào đó
        </label>
        <input
          type="text"
          placeholder="VD: Nghỉ Tết, ngày 1/1, ngày 30/4..."
          value={formData.closedDates}
          onChange={(e) => onFieldChange('closedDates', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 outline-none hover:border-gray-400 hover:bg-white focus:border-2 focus:border-[#06AA4C] focus:bg-white"
        />
        <p className="mt-2 text-xs text-gray-500">
          Ghi rõ các ngày nghỉ lễ hoặc nghỉ đặc biệt
        </p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Hình thức phục vụ
        </label>
        <div className="flex flex-wrap gap-4">
          {serviceTypes.map((service) => (
            <label key={service} className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.serviceTypes.includes(service)}
                onChange={() => onServiceTypeToggle(service)}
                className="h-4 w-4 rounded border-gray-300 accent-[#06AA4C] outline-none focus:ring-0"
              />
              <span className="ml-2 text-sm font-medium text-gray-600">
                {service}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
