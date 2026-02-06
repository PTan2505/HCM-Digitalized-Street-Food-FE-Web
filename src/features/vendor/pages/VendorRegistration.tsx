import { useState, useMemo, useEffect } from 'react';
import OwnerInfoSection from '../components/OwnerInfoSection';
import StoreInfoSection from '../components/StoreInfoSection';
import BranchSection from '../components/BranchSection';
import TermsDialog from '../components/TermsDialog';
import type { Branch } from '../types/branch';
import { createEmptyBranch } from '../types/branch';

export default function VendorRegistration(): React.JSX.Element {
  const [openTerms, setOpenTerms] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([createEmptyBranch()]);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    // Thông tin chủ quán
    ownerName: '',
    ownerPhone: '',
    email: '',

    // Thông tin cửa hàng
    storeName: '',
    storeType: '',
    storePhone: '',

    // Điều khoản
    agreeTerms: false,
  });

  // Đảm bảo currentPage luôn hợp lệ khi số lượng branches thay đổi
  useEffect(() => {
    if (currentPage > branches.length) {
      setCurrentPage(branches.length);
    }
  }, [branches.length, currentPage]);

  const isFormValid = useMemo(() => {
    const hasOwnerInfo =
      formData.ownerName.trim() !== '' &&
      formData.ownerPhone.trim() !== '' &&
      formData.storeName.trim() !== '' &&
      formData.storeType !== '' &&
      formData.agreeTerms;

    const allBranchesValid = branches.every(
      (branch) =>
        branch.detailAddress.trim() !== '' &&
        branch.latitude !== null &&
        branch.longitude !== null
    );

    return hasOwnerInfo && allBranchesValid;
  }, [formData, branches]);

  const handleInputChange = (field: string, value: unknown): void => {
    setFormData({ ...formData, [field]: value });
  };

  const handleBranchChange = (
    branchId: string,
    field: string,
    value: unknown
  ): void => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === branchId ? { ...branch, [field]: value } : branch
      )
    );
  };

  const handleAddBranch = (): void => {
    setBranches((prev) => [...prev, createEmptyBranch()]);
    // Chuyển đến trang mới sau khi thêm chi nhánh
    setCurrentPage(branches.length + 1);
  };

  const handleRemoveBranch = (branchId: string): void => {
    setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
  };

  const handleWorkingDayToggle = (branchId: string, day: string): void => {
    setBranches((prev) =>
      prev.map((branch) => {
        if (branch.id === branchId) {
          const newDays = branch.workingDays.includes(day)
            ? branch.workingDays.filter((d) => d !== day)
            : [...branch.workingDays, day];
          return { ...branch, workingDays: newDays };
        }
        return branch;
      })
    );
  };

  const handleServiceTypeToggle = (branchId: string, service: string): void => {
    setBranches((prev) =>
      prev.map((branch) => {
        if (branch.id === branchId) {
          const newServices = branch.serviceTypes.includes(service)
            ? branch.serviceTypes.filter((s) => s !== service)
            : [...branch.serviceTypes, service];
          return { ...branch, serviceTypes: newServices };
        }
        return branch;
      })
    );
  };

  const handleFileChange = (
    branchId: string,
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0] ?? null;
    handleBranchChange(branchId, field, file);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Form submitted:', { ...formData, branches });
    alert(
      `Đăng ký thành công với ${branches.length} ${branches.length === 1 ? 'cửa hàng' : 'chi nhánh'}!`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Đăng ký trở thành Vendor
          </h1>
          <p className="text-lg text-gray-600">
            Hoàn thành các bước dưới đây để bắt đầu kinh doanh
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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

          {/* Quản lý chi nhánh */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Thông tin cửa hàng & Chi nhánh
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {branches.length === 1
                    ? 'Thêm chi nhánh nếu cửa hàng có nhiều địa điểm'
                    : `Đang quản lý ${branches.length} địa điểm`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddBranch}
                className="flex items-center gap-2 rounded-lg bg-[#06AA4C] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#058f40] hover:shadow-lg active:scale-95"
              >
                <span className="text-lg">+</span>
                Thêm chi nhánh
              </button>
            </div>

            {/* Hiển thị chi nhánh hiện tại */}
            <div className="mb-6">
              {branches[currentPage - 1] && (
                <BranchSection
                  key={branches[currentPage - 1].id}
                  branch={branches[currentPage - 1]}
                  index={currentPage - 1}
                  onBranchChange={handleBranchChange}
                  onBranchRemove={handleRemoveBranch}
                  showRemoveButton={branches.length > 1}
                  onWorkingDayToggle={handleWorkingDayToggle}
                  onServiceTypeToggle={handleServiceTypeToggle}
                  onFileChange={handleFileChange}
                />
              )}
            </div>

            {/* Phân trang */}
            {branches.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Trước
                </button>

                <div className="flex gap-1">
                  {branches.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentPage(index + 1)}
                      className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                        currentPage === index + 1
                          ? 'bg-[#06AA4C] text-white shadow-md'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(branches.length, prev + 1)
                    )
                  }
                  disabled={currentPage === branches.length}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>

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
