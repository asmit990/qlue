import { ReactFlowProvider } from '@xyflow/react';
import { Sidebar } from '@/components/workflow/Sidebar';
import { Canvas } from '@/components/workflow/Canvas';
import { PropertyPanel } from '@/components/workflow/PropertyPanel';

export default function WorkflowBuilderPage() {
  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 font-sans text-gray-900 overflow-hidden">
      

      <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md z-20">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          <span className="text-blue-400">🔍</span> Qlue Studio
        </div>

      </header>

    <div className="flex flex-1 overflow-hidden">
        <ReactFlowProvider>
   
          <Sidebar />
          
         <Canvas />
          
         <PropertyPanel />
        </ReactFlowProvider>
      </div>
    </div>
  );
}