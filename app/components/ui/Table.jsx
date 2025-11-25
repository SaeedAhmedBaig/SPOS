import React from 'react';

const Table = ({
  columns = [],
  data = [],
  keyField = "id",
  onRowClick,
  loading = false,
  emptyMessage = "No data found",
  className = "",
  striped = false,
  hoverable = true,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex border-b border-gray-200">
            {columns.map((_, index) => (
              <div key={index} className="flex-1 p-4">
                <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
              </div>
            ))}
          </div>

          {/* Row skeletons */}
          {[...Array(5)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex border-b border-gray-200 last:border-b-0"
            >
              {columns.map((_, colIndex) => (
                <div key={colIndex} className="flex-1 p-4">
                  <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap"
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {/* Empty State */}
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    transition-all duration-150
                    ${
                      striped && rowIndex % 2 === 0
                        ? "bg-gray-50"
                        : "bg-white"
                    }
                    ${
                      hoverable && onRowClick
                        ? "hover:bg-gray-100/70 cursor-pointer"
                        : ""
                    }
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
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
