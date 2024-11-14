import { ReactFlowProvider } from 'reactflow';
import MindMap from './components/MindMap';
import { ToastContainer } from './components/Toast';
import 'reactflow/dist/style.css';

function App() {
  return (
    <div className="w-screen h-screen">
      <ReactFlowProvider>
        <MindMap />
        <ToastContainer />
      </ReactFlowProvider>
    </div>
  );
}

export default App;