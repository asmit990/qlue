import { Handle, Position } from '@xyflow/react';

export function AITransformNode({ data }: { data: any }) {
  return (
    <div className="min-w-[200px] px-4 py-3 shadow-lg rounded-md border-2 border-green-500 bg-green-50">
      {/* Incoming Connection */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-600" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">✨</span>
        <div className="font-bold text-sm text-green-800">AI Transform</div>
      </div>
      
      <div className="text-xs text-green-700 italic truncate max-w-[180px] mb-1">
        "{data.prompt || 'Ask Qlue...'}"
      </div>
      
      <div className="text-[10px] text-gray-500 font-mono bg-white p-1 rounded overflow-hidden max-h-8">
        {data.sql ? 'SQL Generated' : 'Waiting for AI...'}
      </div>
      
      {/* Outgoing Connection */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-600" />
    </div>
  );
}