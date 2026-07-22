import { Handle, Position } from '@xyflow/react';

export function FilterNode({ data }: { data: any }) {
  return (
    <div className="min-w-[150px] px-4 py-3 shadow-lg rounded-md bg-white border-2 border-orange-500">
      {/* Incoming Connection */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🗂️</span>
        <div className="font-bold text-sm text-gray-800">Filter</div>
      </div>
      <div className="text-xs text-gray-500 truncate max-w-[130px]">
        {data.filterCondition || 'No condition set'}
      </div>
      
      {/* Outgoing Connection */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
    </div>
  );
}