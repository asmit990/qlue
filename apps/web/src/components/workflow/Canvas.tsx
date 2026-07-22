import { useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useDatabaseStore } from '@/store/useDatabaseStore';
import { compileGraphToSQL } from '@/lib/dagCompiler';

// Custom Nodes import
import { DatasetNode } from './nodes/DatasetNode';
import { JoinNode } from './nodes/JoinNode';
import { FilterNode } from './nodes/FIlterNode';
import { AITransformNode } from './nodes/AITransformNode';

const nodeTypes = {
  dataset: DatasetNode,
  join: JoinNode,
  filter: FilterNode,
  aiTransform: AITransformNode,
};

let id = 0;
const getId = () => `node_${id++}`;

export function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useWorkflowStore();
  const { db } = useDatabaseStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0),
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0),
      };

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      addNode(newNode);
    },
    [addNode]
  );

  const handleRun = () => {
    if (!db) {
      alert("Please upload a CSV dataset first!");
      return;
    }

    const { sql, error } = compileGraphToSQL(nodes, edges);
    
    if (error) {
      alert(`Compilation Error: ${error}`);
      return;
    }

    console.log("Compiled Engine Query:\n", sql);

    try {
      const result = db.exec(sql);
      console.log("Execution Result:", result);
      alert("Query executed successfully! Check console for results.");
      // TODO: Pass this result to Recharts dashboard state
    } catch (err) {
      console.error(err);
      alert("SQL Execution Error: Check console.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <h2 className="font-semibold text-gray-800">Pipeline Editor</h2>
        <button 
          onClick={handleRun}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow transition-colors font-medium text-sm"
        >
          ▶ Run Workflow
        </button>
      </div>
      
      <div className="flex-1 w-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}