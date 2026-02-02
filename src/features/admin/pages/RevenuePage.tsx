export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Dashboard - Tổng quan doanh thu
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Tổng doanh thu</h3>
          <p className="mt-2 text-3xl font-bold">125.5M</p>
          <span className="text-sm text-green-600">+12.5%</span>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Đơn hàng</h3>
          <p className="mt-2 text-3xl font-bold">1,234</p>
          <span className="text-sm text-green-600">+8.2%</span>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Khách hàng</h3>
          <p className="mt-2 text-3xl font-bold">5,678</p>
          <span className="text-sm text-green-600">+15.3%</span>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm text-gray-500">Tăng trưởng</h3>
          <p className="mt-2 text-3xl font-bold">23.5%</p>
          <span className="text-sm text-green-600">+5.1%</span>
        </div>
      </div>
    </div>
  );
}
