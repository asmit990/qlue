import { type Node, type  Edge } from '@xyflow/react'

export interface CompilationResult {
    sql: string;
    finalNodeId: string;
    error?: string;
}




// using CTEs to build the SQL query from the DAG



function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
    const nodesMap  = new Map<string, Node>(nodes.map((n) => [n.id, n]))
    const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();


  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adjList.set(n.id, []);
  });

  edges.forEach((e) => {
    if (adjList.has(e.source) && inDegree.has(e.target)) {
      adjList.get(e.source)!.push(e.target);
      inDegree.set(e.target, inDegree.get(e.target)! + 1);
    }
  });

  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sorted: Node[] = [];

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const currNode = nodesMap.get(currId);
    if (currNode) sorted.push(currNode);

    const neighbors = adjList.get(currId) || [];
    neighbors.forEach((neighborId) => {
      inDegree.set(neighborId, inDegree.get(neighborId)! - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(neighborId);
      }
    });
  }


  if (sorted.length !== nodes.length) {
  return nodes;
  }

  return sorted;
}


function sanitizeIdentifier(id: string): string {
  return `node_${id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
}


export function compileGraphToSQL(nodes: Node[], edges: Edge[]): CompilationResult {
  if (nodes.length === 0) {
    return { sql: '', finalNodeId: '', error: 'Canvas is empty.' };
  }

  const sortedNodes = topologicalSort(nodes, edges);
  const cteStatements: string[] = [];

  for (const node of sortedNodes) {
    const cteAlias = sanitizeIdentifier(node.id);

    switch (node.type) {
      case 'dataset': {
  
        const tableName = node.data?.tableName || 'dataset';
        cteStatements.push(`${cteAlias} AS (SELECT * FROM "${tableName}")`);
        break;
      }

      case 'join': {
      
        const incomingEdges = edges.filter((e) => e.target === node.id);
        const leftEdge = incomingEdges.find((e) => e.targetHandle === 'left') || incomingEdges[0];
        const rightEdge = incomingEdges.find((e) => e.targetHandle === 'right') || incomingEdges[1];

        if (!leftEdge || !rightEdge) {
          return {
            sql: '',
            finalNodeId: node.id,
            error: `Join Node (${node.id}) requires 2 inputs connected.`,
          };
        }

        const leftAlias = sanitizeIdentifier(leftEdge.source);
        const rightAlias = sanitizeIdentifier(rightEdge.source);
        const joinType = node.data?.joinType || 'INNER'; // INNER, LEFT, RIGHT
        const condition = node.data?.condition || '1=1';

        cteStatements.push(`
          ${cteAlias} AS (
            SELECT * 
            FROM ${leftAlias} 
            ${joinType} JOIN ${rightAlias} 
            ON ${condition}
          )
        `);
        break;
      }

      case 'filter': {
        const incomingEdge = edges.find((e) => e.target === node.id);
        if (!incomingEdge) {
          return {
            sql: '',
            finalNodeId: node.id,
            error: `Filter Node (${node.id}) is missing an input connection.`,
          };
        }

        const inputAlias = sanitizeIdentifier(incomingEdge.source);
        const filterCondition = node.data?.filterCondition || '1=1';

        cteStatements.push(`
          ${cteAlias} AS (
            SELECT * FROM ${inputAlias} WHERE ${filterCondition}
          )
        `);
        break;
      }

      case 'aiTransform': {
        const incomingEdge = edges.find((e) => e.target === node.id);
        const inputAlias = incomingEdge ? sanitizeIdentifier(incomingEdge.source) : null;

        // Custom SQL block directly generated from Gemini NL-to-SQL
        const generatedSql = typeof node.data?.sql === 'string' ? node.data.sql : undefined;
        if (!generatedSql) {
          return {
            sql: '',
            finalNodeId: node.id,
            error: `AI Node (${node.id}) has no generated SQL yet.`,
          };
        }

        if (inputAlias) {
          // Replace placeholders like {{input}} with the input CTE alias
          const resolvedSql = generatedSql.replace(/\{\{input\}\}/g, inputAlias);
          cteStatements.push(`${cteAlias} AS (${resolvedSql})`);
        } else {
          cteStatements.push(`${cteAlias} AS (${generatedSql})`);
        }
        break;
      }

      default: {
        // Generic node fallback
        cteStatements.push(`${cteAlias} AS (SELECT 1 as dummy)`);
        break;
      }
    }
  }

  // The final leaf node (the node with no outgoing edges)
  const leafNode = sortedNodes.find((n) => !edges.some((e) => e.source === n.id)) || sortedNodes[sortedNodes.length - 1];
  const finalAlias = sanitizeIdentifier(leafNode.id);

  const fullQuery = `WITH \n${cteStatements.join(', \n')}\nSELECT * FROM ${finalAlias};`;

  return {
    sql: fullQuery,
    finalNodeId: leafNode.id,
  };
}
