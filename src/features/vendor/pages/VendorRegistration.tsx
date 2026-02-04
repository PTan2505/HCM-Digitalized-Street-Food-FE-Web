import { useState, useMemo } from 'react';
import OwnerInfoSection from '../components/OwnerInfoSection';
import StoreInfoSection from '../components/StoreInfoSection';
import AddressSection from '../components/AddressSection';
import OperatingInfoSection from '../components/OperatingInfoSection';
import DocumentsSection from '../components/DocumentsSection';
import TermsDialog from '../components/TermsDialog';

export default function VendorRegistration() {
  const [openTerms, setOpenTerms] = useState(false);
  const [formData, setFormData] = useState({
    // Thông tin chủ quán
    ownerName: '',
    ownerPhone: '',
    email: '',

    // Thông tin cửa hàng
    storeName: '',
    storeType: '',
    storePhone: '',

    // Địa chỉ
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    mapLocation: '',

    // Thông tin hoạt động
    openTime: '08:00',
    closeTime: '22:00',
    workingDays: [] as string[],
    closedDates: '',
    serviceTypes: [] as string[],

    // Upload files
    storeAvatar: null as File | null,
    storeFrontImage: null as File | null,
    businessLicense: null as File | null,
    idCard: null as File | null,

    // Điều khoản
    agreeTerms: false,
  });

  const isFormValid = useMemo(() => {
    return (
      formData.ownerName.trim() !== '' &&
      formData.ownerPhone.trim() !== '' &&
      formData.storeName.trim() !== '' &&
      formData.storeType !== '' &&
      formData.province !== '' &&
      formData.district !== '' &&
      formData.ward !== '' &&
      formData.detailAddress.trim() !== '' &&
      formData.agreeTerms
    );
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleWorkingDayToggle = (day: string) => {
    const newDays = formData.workingDays.includes(day)
      ? formData.workingDays.filter((d) => d !== day)
      : [...formData.workingDays, day];
    handleInputChange('workingDays', newDays);
  };

  const handleServiceTypeToggle = (service: string) => {
    const newServices = formData.serviceTypes.includes(service)
      ? formData.serviceTypes.filter((s) => s !== service)
      : [...formData.serviceTypes, service];
    handleInputChange('serviceTypes', newServices);
  };

  const handleFileChange = (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    handleInputChange(field, file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Đăng ký thành công! Vui lòng kiểm tra console để xem dữ liệu.');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-16">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-12">
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-gray-900">
          Đăng ký cửa hàng
        </h1>
        <p className="mb-12 text-center text-base text-gray-600">
          Hoàn thành các thông tin bên dưới để bắt đầu
        </p>

        <form onSubmit={handleSubmit}>
          <OwnerInfoSection
            formData={{
              ownerName: formData.ownerName,
              ownerPhone: formData.ownerPhone,
              email: formData.email,
            }}
            onChange={handleInputChange}
          />

          <StoreInfoSection
            formData={{
              storeName: formData.storeName,
              storeType: formData.storeType,
              storePhone: formData.storePhone,
            }}
            onChange={handleInputChange}
          />

          <AddressSection
            formData={{
              province: formData.province,
              district: formData.district,
              ward: formData.ward,
              detailAddress: formData.detailAddress,
              mapLocation: formData.mapLocation,
            }}
            onChange={handleInputChange}
          />

          <OperatingInfoSection
            formData={{
              openTime: formData.openTime,
              closeTime: formData.closeTime,
              workingDays: formData.workingDays,
              closedDates: formData.closedDates,
              serviceTypes: formData.serviceTypes,
            }}
            onFieldChange={handleInputChange}
            onWorkingDayToggle={handleWorkingDayToggle}
            onServiceTypeToggle={handleServiceTypeToggle}
          />

          <DocumentsSection
            formData={{
              storeAvatar: formData.storeAvatar,
              storeFrontImage: formData.storeFrontImage,
              businessLicense: formData.businessLicense,
              idCard: formData.idCard,
            }}
            onFileChange={handleFileChange}
          />

          {/* Điều khoản */}
          <div className="mt-10">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={(e) =>
                  handleInputChange('agreeTerms', e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 accent-[#06AA4C] outline-none focus:ring-0"
              />
              <span className="ml-2 text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <button
                  type="button"
                  onClick={() => setOpenTerms(true)}
                  className="text-[#06AA4C] underline-offset-2 hover:underline"
                >
                  Điều khoản sử dụng
                </button>
              </span>
            </label>
          </div>

          {/* Submit button */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full rounded-xl bg-[#06AA4C] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#058f40] hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              Đăng ký cửa hàng
            </button>
          </div>
        </form>
      </div>

      <TermsDialog open={openTerms} onClose={() => setOpenTerms(false)} />
    </div>
  );
}
