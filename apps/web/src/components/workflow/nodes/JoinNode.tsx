import { Handle, Position } from '@xyflow/react';

export function JoinNode({ data }: { data: any }) {
  return (
    <div className="min-w-[180px] px-4 py-3 shadow-lg rounded-md bg-white border-2 border-purple-500">
      {/* Incoming Left Connection */}
      <Handle 
        type="target" 
        id="left" 
        position={Position.Top} 
        className="w-3 h-3 bg-purple-500 -ml-8" 
      />
      {/* Incoming Right Connection */}
      <Handle 
        type="target" 
        id="right" 
        position={Position.Top} 
        className="w-3 h-3 bg-purple-500 ml-8" 
      />
      
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🔗</span>
        <div className="font-bold text-sm text-gray-800">
          {data.joinType || 'INNER'} JOIN
        </div>
      </div>
      <div className="text-xs text-gray-500 truncate max-w-[150px]" title={data.condition}>
        {data.condition ? `ON ${data.condition}` : 'Configure condition...'}
      </div>
      
      {/* Outgoing Connection */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
    </div>
  );
}