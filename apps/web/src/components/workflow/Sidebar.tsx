export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-3">
      <h3 className="font-bold text-gray-700 mb-2 uppercase text-sm tracking-wider">Nodes</h3>
      
      <div 
        className="p-3 border-2 border-blue-500 bg-white rounded cursor-grab hover:bg-blue-50 transition-colors"
        onDragStart={(event) => onDragStart(event, 'dataset')} draggable
      >
        💾 CSV Dataset
      </div>
      
      <div 
        className="p-3 border-2 border-purple-500 bg-white rounded cursor-grab hover:bg-purple-50 transition-colors"
        onDragStart={(event) => onDragStart(event, 'join')} draggable
      >
        🔗 Join
      </div>
      
      <div 
        className="p-3 border-2 border-orange-500 bg-white rounded cursor-grab hover:bg-orange-50 transition-colors"
        onDragStart={(event) => onDragStart(event, 'filter')} draggable
      >
        🗂️ Filter
      </div>
      
      <div 
        className="p-3 border-2 border-green-500 bg-white rounded cursor-grab hover:bg-green-50 transition-colors"
        onDragStart={(event) => onDragStart(event, 'aiTransform')} draggable
      >
        ✨ AI Transform
      </div>
    </aside>
  );
}