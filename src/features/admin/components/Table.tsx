interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any, index?: number) => React.ReactNode;
  className?: string;
}

interface Action {
  label: string | React.ReactNode;
  onClick: (row: any) => void;
  className?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  rowKey?: string;
  maxHeight?: string;
  actions?: Action[];
  onRowClick?: (row: any) => void;
}

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  loadingMessage = 'Đang tải...',
  rowKey = 'id',
  maxHeight = '600px',
  actions,
  onRowClick,
}: TableProps) => {
  const totalColumns = columns.length + (actions && actions.length > 0 ? 1 : 0);

  return (
    <div className="overflow-hidden border border-gray-300 bg-white shadow sm:rounded-lg">
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase ${
                    column.className || ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-600 uppercase">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[rowKey]}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-gray-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = column.key
                      .split('.')
                      .reduce((obj, key) => obj?.[key], row);
                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm whitespace-nowrap text-gray-900 ${
                          column.className || ''
                        }`}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : value || '-'}
                      </td>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <div className="flex gap-2">
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={
                              action.className ||
                              'font-medium text-blue-600 hover:text-blue-800'
                            }
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
