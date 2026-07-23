import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';

export function PropertyPanel() {
  const { nodes, selectedNodeId, updateNodeData } = useWorkflowStore();
  const { tables } = useDatabaseStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-gray-50 border-l border-gray-200 p-6 flex flex-col justify-center items-center text-center">
        <div className="text-4xl mb-4 text-gray-300">SETTING</div>
        <p className="text-gray-500 text-sm">Select a node on the canvas to configure its properties.</p>
      </aside>
    );
  }

  const { id, type, data } = selectedNode;

  const handleChange = (key: string, value: any) => {
    updateNodeData(id, { [key]: value });
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-20">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 capitalize">{type} Properties</h3>
        <span className="text-xs text-gray-400 font-mono">{id}</span>
      </div>

      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">
        
        {/* --- DATASET NODE PROPERTIES --- */}
        {type === 'dataset' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Select Table</label>
            <select
              className="border border-gray-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={typeof data.tableName === 'string' ? data.tableName : ''}
              onChange={(e) => handleChange('tableName', e.target.value)}
            >
              <option value="" disabled>Select a loaded CSV...</option>
              {tables.map((table) => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
            {tables.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Please upload a CSV first.</p>
            )}
          </div>
        )}

        {/* --- JOIN NODE PROPERTIES --- */}
        {type === 'join' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Join Type</label>
              <select
                className="border border-gray-300 rounded p-2 text-sm bg-white"
                value={typeof data.joinType === 'string' ? data.joinType : 'INNER'}
                onChange={(e) => handleChange('joinType', e.target.value)}
              >
                <option value="INNER">INNER JOIN</option>
                <option value="LEFT">LEFT JOIN</option>
                <option value="RIGHT">RIGHT JOIN</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Join Condition</label>
              <input
                type="text"
                placeholder="e.g. node_1.id = node_2.user_id"
                className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                value={typeof data.condition === 'string' ? data.condition : ''}
                onChange={(e) => handleChange('condition', e.target.value)}
              />
              <p className="text-xs text-gray-400">Use the exact node IDs or table aliases.</p>
            </div>
          </>
        )}

        {/* --- FILTER NODE PROPERTIES --- */}
        {type === 'filter' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">WHERE Condition</label>
            <textarea
              rows={3}
              placeholder="e.g. status = 'active' AND age > 18"
              className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-mono"
              value={typeof data.filterCondition === 'string' ? data.filterCondition : ''}
              onChange={(e) => handleChange('filterCondition', e.target.value)}
            />
          </div>
        )}

        {/* --- AI TRANSFORM NODE PROPERTIES --- */}
        {type === 'aiTransform' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Ask Qlue</label>
              <textarea
                rows={3}
                placeholder="e.g. Group by state and calculate total revenue"
                className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                value={typeof data.prompt === 'string' ? data.prompt : ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
              />
              <button 
                className="mt-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition"
                onClick={() => alert('Will trigger Gemini WebSocket here!')}
              >
                ✨ Generate SQL
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-semibold text-gray-700">Generated SQL (Editable)</label>
              <textarea
                rows={5}
                placeholder="AI generated SQL will appear here..."
                className="border border-gray-300 rounded p-2 text-sm bg-gray-50 outline-none font-mono text-gray-600"
                value={typeof data.sql === 'string' ? data.sql : ''}
                onChange={(e) => handleChange('sql', e.target.value)}
              />
              <p className="text-[10px] text-gray-400">Use {'{{input}}'} to refer to the incoming dataset.</p>
            </div>
          </>
        )}

      </div>
    </aside>
  );
}