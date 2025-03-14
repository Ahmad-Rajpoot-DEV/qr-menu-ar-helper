
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

// Mock 3D models data for our demo
const mockModels = [
  {
    id: '1',
    name: 'Classic Burger',
    modelUrl: 'https://cdn.example.com/models/burger.glb', // This is a placeholder URL
    price: '$12.99',
    description: 'Juicy beef patty with fresh lettuce, tomato, and our special sauce',
    category: 'Main Course'
  },
  {
    id: '2',
    name: 'Pasta Carbonara',
    modelUrl: 'https://cdn.example.com/models/pasta.glb', // This is a placeholder URL
    price: '$14.99',
    description: 'Creamy pasta with pancetta, egg, and parmesan cheese',
    category: 'Main Course'
  }
];

interface ARViewerProps {
  menuId?: string;
  itemId?: string;
}

const ARViewer: React.FC<ARViewerProps> = ({ menuId, itemId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [selectedModel, setSelectedModel] = useState(mockModels[0]);

  useEffect(() => {
    // Check if WebXR is supported
    const checkARSupport = () => {
      if ('xr' in navigator) {
        // @ts-ignore - TypeScript doesn't know about isSessionSupported yet
        navigator.xr?.isSessionSupported('immersive-ar')
          .then((supported) => {
            setArSupported(supported);
            if (!supported) {
              console.warn('WebXR AR not supported');
            }
          })
          .catch((err) => {
            console.error('Error checking AR support:', err);
            setArSupported(false);
          });
      } else {
        setArSupported(false);
      }
    };

    checkARSupport();

    // In a real implementation, fetch the model data based on menuId and itemId
    const fetchModelData = async () => {
      try {
        setLoading(true);
        
        // Simulate an API call to get menu items
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // If itemId is provided, find that specific item
        if (itemId) {
          const model = mockModels.find(m => m.id === itemId);
          if (model) {
            setSelectedModel(model);
          } else {
            throw new Error(`Item not found: ${itemId}`);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching model data:', err);
        setError('Failed to load menu item');
        toast.error('Could not load the menu item');
        setLoading(false);
      }
    };

    fetchModelData();

    // Clean up function
    return () => {
      // Any cleanup for 3D renderer would go here
    };
  }, [menuId, itemId]);

  const launchAR = () => {
    if (!arSupported) {
      toast.error('AR is not supported on your device');
      return;
    }

    // In a real implementation, this would launch the AR experience
    toast.info('AR experience would launch here with the selected model');
  };

  // Placeholder for the 3D model viewer
  // In a real implementation, this would use Three.js, model-viewer, or another library
  const renderModelViewer = () => {
    if (!selectedModel) return null;

    return (
      <div className="w-full h-64 sm:h-80 md:h-96 bg-gradient-to-b from-secondary/50 to-secondary/20 rounded-xl flex items-center justify-center ar-placeholder">
        <div className="text-center p-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-primary text-4xl">3D</span>
          </div>
          <p className="text-muted-foreground">
            {arSupported ? 
              '3D model would render here' : 
              'AR not supported on this device'}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-destructive/10 rounded-xl text-center">
        <p className="text-destructive mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full animate-fade-in">
      {renderModelViewer()}
      
      <div className="mt-6 glass-morphism rounded-xl p-6">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full mb-2">
          {selectedModel.category}
        </span>
        <h2 className="text-2xl font-display font-medium mb-2">{selectedModel.name}</h2>
        <p className="text-xl font-medium text-primary mb-4">{selectedModel.price}</p>
        <p className="text-muted-foreground mb-6">{selectedModel.description}</p>
        
        <button
          onClick={launchAR}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-300 
            ${arSupported ? 
              'bg-primary text-white hover:bg-primary/90' : 
              'bg-muted text-muted-foreground cursor-not-allowed'}`}
          disabled={!arSupported}
        >
          {arSupported ? 'View in AR' : 'AR Not Supported'}
        </button>
      </div>
    </div>
  );
};

export default ARViewer;
