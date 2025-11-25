export default function WarehouseSelect({ value, onChange, warehouses, includeAll = false, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 ${className}`}
    >
      {includeAll && <option value="">All Warehouses</option>}
      {!includeAll && <option value="">Select Warehouse</option>}
      {warehouses.map(warehouse => (
        <option key={warehouse.id} value={warehouse.id}>
          {warehouse.name} - {warehouse.location}
        </option>
      ))}
    </select>
  )
}