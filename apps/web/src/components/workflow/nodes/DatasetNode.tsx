import { Handle, Position } from '@xyflow/react';

export function DatasetNode({ data }: { data: any }) {
  return (
    <div className="min-w-[150px] px-4 py-3 shadow-lg rounded-md bg-white border-2 border-blue-500">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">DOC</span>
        <div className="font-bold text-sm text-gray-800">CSV Dataset</div>
      </div>
      <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded font-mono text-center">
        {data.tableName || 'Select Table'}
      </div>
      {/* Outgoing Connection */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}