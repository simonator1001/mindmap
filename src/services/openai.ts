import OpenAI from 'openai';
import { Node, Edge } from 'reactflow';
import { NodeData } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function buildMindMapContext(nodes: Node<NodeData>[], edges: Edge[], currentNodeId: string): string {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const currentNode = nodeMap.get(currentNodeId);
  
  if (!currentNode) return '';

  // Get parent nodes
  const parentNodes = edges
    .filter(edge => edge.target === currentNodeId)
    .map(edge => nodeMap.get(edge.source))
    .filter((node): node is Node<NodeData> => node !== undefined);

  // Get sibling nodes
  const siblingNodes = edges
    .filter(edge => parentNodes.some(parent => edge.source === parent.id))
    .map(edge => nodeMap.get(edge.target))
    .filter((node): node is Node<NodeData> => node !== undefined)
    .filter(node => node.id !== currentNodeId);

  // Get child nodes
  const childNodes = edges
    .filter(edge => edge.source === currentNodeId)
    .map(edge => nodeMap.get(edge.target))
    .filter((node): node is Node<NodeData> => node !== undefined);

  return `
Current topic: "${currentNode.data.label}"
${parentNodes.length > 0 ? `Parent topics: ${parentNodes.map(node => `"${node.data.label}"`).join(', ')}` : ''}
${siblingNodes.length > 0 ? `Related topics: ${siblingNodes.map(node => `"${node.data.label}"`).join(', ')}` : ''}
${childNodes.length > 0 ? `Subtopics: ${childNodes.map(node => `"${node.data.label}"`).join(', ')}` : ''}
  `.trim();
}

export async function generateNodeContent(
  nodes: Node<NodeData>[],
  edges: Edge[],
  currentNodeId: string
): Promise<string | null> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      return null;
    }

    const context = buildMindMapContext(nodes, edges, currentNodeId);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests relevant subtopics for mind maps. Keep suggestions concise (max 5 words) and relevant to the context."
        },
        {
          role: "user",
          content: `Based on this mind map context, suggest a relevant subtopic:\n\n${context}`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error generating node content:', error);
    return null;
  }
}