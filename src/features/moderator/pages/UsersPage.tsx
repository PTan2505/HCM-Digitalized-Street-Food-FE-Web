import React from 'react';

export default function UsersPage(): React.JSX.Element {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý người dùng</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-gray-600">
          Danh sách người dùng sẽ hiển thị tại đây
        </p>
      </div>
    </div>
  );
}
