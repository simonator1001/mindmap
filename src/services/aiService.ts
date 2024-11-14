import { Node } from 'reactflow';
import { NodeData } from '../types';

const TOGETHER_API_KEY = 'c2aae6dbd2cd0324f1bb9753fd74cea5f3ff7e51228eb1a84ac2eddcf7be7a2c';
const API_URL = 'https://api.together.xyz/v1/chat/completions';

interface TogetherAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIServiceError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export async function generateNodeContent(nodes: Node<NodeData>[], parentId: string): Promise<string> {
  if (!parentId || !nodes.length) {
    throw new AIServiceError('Invalid input parameters');
  }

  const parentNode = nodes.find(node => node.id === parentId);
  if (!parentNode) {
    throw new AIServiceError('Parent node not found');
  }

  try {
    const currentMap = nodes.map(node => node.data.label).join(', ');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that suggests relevant subtopics for mind maps. Keep suggestions concise and relevant.'
          },
          {
            role: 'user',
            content: `Given a mind map with topics: ${currentMap}, suggest a relevant subtopic for the parent topic "${parentNode.data.label}". Respond with just the subtopic text, no explanations.`
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIServiceError(
        'API request failed',
        { status: response.status, ...errorData }
      );
    }

    const data = await response.json() as TogetherAPIResponse;
    
    if (!data.choices?.[0]?.message?.content) {
      throw new AIServiceError('Invalid API response format');
    }

    const suggestion = data.choices[0].message.content.trim();
    if (!suggestion) {
      throw new AIServiceError('Empty suggestion received');
    }

    return suggestion;
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError(
      'Failed to generate content',
      error instanceof Error ? error.message : error
    );
  }
}