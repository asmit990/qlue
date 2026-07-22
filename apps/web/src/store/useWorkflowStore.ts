import { create } from 'zustand'
import {
 type  Node,
 type  Edge,
 type  OnNodesChange,
 type  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import type { OnConnect } from "@xyflow/react";


interface WorkflowState {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;


    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
  
  
  addNode: (node: Node) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (nodeId: string, newData: Record<string, any>) => void;
  setGraph: (nodes: Node[], edges: Edge[]) => void;
  resetWorkflow: () => void;
}



export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
    }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  updateNodeData: (nodeId, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      }),
    }));
  },

  setGraph: (nodes, edges) => set({ nodes, edges }),

  resetWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null }),
}));