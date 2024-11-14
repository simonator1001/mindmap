import { Node, Edge } from 'reactflow';
import { NodeData } from '../types';

const TOGETHER_API_KEY = 'c2aae6dbd2cd0324f1bb9753fd74cea5f3ff7e51228eb1a84ac2eddcf7be7a2c';
const API_URL = 'https://api.together.xyz/v1/chat/completions';

function buildMindMapContext(nodes: Node<NodeData>[], edges: Edge[], currentNodeId: string): string {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const currentNode = nodeMap.get(currentNodeId);
  
  if (!currentNode) return '';

  // Get parent nodes
  const parentNodes = edges
    .filter(edge => edge.target === currentNodeId)
    .map(edge => nodeMap.get(edge.source))
    .filter(Boolean);

  // Get sibling nodes
  const siblingNodes = edges
    .filter(edge => parentNodes.some(parent => edge.source === parent?.id))
    .map(edge => nodeMap.get(edge.target))
    .filter(Boolean)
    .filter((node): node is Node<NodeData> => 
      node !== undefined && node.id !== currentNodeId
    );

  // Get child nodes
  const childNodes = edges
    .filter(edge => edge.source === currentNodeId)
    .map(edge => nodeMap.get(edge.target))
    .filter(Boolean);

  return `
Current topic: "${currentNode.data.label}"
${parentNodes.length > 0 ? `Parent topics: ${parentNodes.map(node => `"${node?.data.label}"`).join(', ')}` : ''}
${siblingNodes.length > 0 ? `Related topics: ${siblingNodes.map(node => `"${node?.data.label}"`).join(', ')}` : ''}
${childNodes.length > 0 ? `Subtopics: ${childNodes.map(node => `"${node?.data.label}"`).join(', ')}` : ''}
  `.trim();
}

export async function generateNodeContent(
  nodes: Node<NodeData>[],
  edges: Edge[],
  currentNodeId: string
): Promise<string | null> {
  try {
    const context = buildMindMapContext(nodes, edges, currentNodeId);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-7b-instruct-v0.1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that suggests relevant subtopics for mind maps. Keep suggestions concise (max 5 words) and relevant to the context.'
          },
          {
            role: 'user',
            content: `Based on this mind map context, suggest a relevant subtopic:\n\n${context}`
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error generating node content:', error);
    return null;
  }
}