import { 
  PlusCircleIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  DocumentTextIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  SwatchIcon,
  CodeBracketIcon,
  SparklesIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { NodeData, EdgeStyle, LineStyle } from '../../types';
import EdgeStylePanel from './EdgeStylePanel';

interface ToolbarProps {
  onAddNode: () => void;
  onAddAINode: () => void;
  onDeleteSelected: () => void;
  selectedNodes: Node<NodeData>[];
  showSettings: boolean;
  onToggleSettings: () => void;
  isLoading: boolean;
  edgeStyle: EdgeStyle;
  lineStyle: LineStyle;
  onEdgeStyleChange: (style: EdgeStyle) => void;
  onLineStyleChange: (style: LineStyle) => void;
  showEdgeStylePanel: boolean;
  onToggleEdgeStylePanel: () => void;
}

export default function Toolbar({ 
  onAddNode, 
  onAddAINode,
  onDeleteSelected, 
  selectedNodes,
  showSettings,
  onToggleSettings,
  isLoading,
  edgeStyle,
  lineStyle,
  onEdgeStyleChange,
  onLineStyleChange,
  showEdgeStylePanel,
  onToggleEdgeStylePanel
}: ToolbarProps) {
  const { zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();

  const downloadImage = useCallback(async (type: 'png' | 'svg') => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
      const dataUrl = await (type === 'png' ? toPng(element) : toSvg(element));
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `mindmap.${type}`;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, []);

  const downloadPDF = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
      const dataUrl = await toPng(element);
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('mindmap.pdf');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }, []);

  const downloadJSON = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const data = { nodes, edges };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [getNodes, getEdges]);

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={onAddNode}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Add Node"
        >
          <PlusCircleIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onAddAINode}
          disabled={isLoading}
          className={`p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1 ${
            isLoading ? 'opacity-50 cursor-wait' : ''
          }`}
          title="Add AI Suggestion"
        >
          <SparklesIcon className={`w-5 h-5 text-blue-500 ${isLoading ? 'animate-pulse' : ''}`} />
        </button>

        <button
          onClick={onDeleteSelected}
          disabled={selectedNodes.length === 0}
          className={`p-2 rounded-lg ${
            selectedNodes.length === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-gray-100'
          }`}
          title="Delete Selected"
        >
          <TrashIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleSettings}
          disabled={selectedNodes.length === 0}
          className={`p-2 rounded-lg ${
            selectedNodes.length === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-gray-100'
          } ${showSettings ? 'bg-blue-50' : ''}`}
          title="Node Settings"
        >
          <SwatchIcon className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={onToggleEdgeStylePanel}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              showEdgeStylePanel ? 'bg-blue-50' : ''
            }`}
            title="Line Style"
          >
            <ArrowsRightLeftIcon className="w-5 h-5" />
          </button>
          <EdgeStylePanel
            currentStyle={edgeStyle}
            currentLineStyle={lineStyle}
            onStyleChange={onEdgeStyleChange}
            onLineStyleChange={onLineStyleChange}
            isOpen={showEdgeStylePanel}
          />
        </div>

        <div className="w-px h-6 bg-gray-200 my-auto mx-1" />

        <button
          onClick={() => downloadImage('png')}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Export as PNG"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => downloadImage('svg')}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Export as SVG"
        >
          <DocumentDuplicateIcon className="w-5 h-5" />
        </button>

        <button
          onClick={downloadPDF}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Export as PDF"
        >
          <DocumentTextIcon className="w-5 h-5" />
        </button>

        <button
          onClick={downloadJSON}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Export as JSON"
        >
          <CodeBracketIcon className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-200 my-auto mx-1" />

        <button
          onClick={() => zoomIn()}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Zoom In"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => zoomOut()}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Zoom Out"
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}