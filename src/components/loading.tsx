export default function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3 text-left bg-gray-100 rounded-t-md">
                <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b last:border-0">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="p-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
