
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import NavBar from './NavBar';
import ARViewer from './ARViewer';

const MenuViewer = () => {
  const { menuId, itemId } = useParams<{ menuId: string; itemId?: string }>();
  
  useEffect(() => {
    // We could fetch additional restaurant details here
    console.log(`Loading menu: ${menuId}, item: ${itemId || 'not specified'}`);
    
    // Simulating data loading and showing a welcome toast
    const timer = setTimeout(() => {
      toast.info(`Welcome to ${menuId === 'demo1' ? 'Demo Restaurant' : 'the restaurant'}`);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [menuId, itemId]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar title={menuId === 'demo1' ? 'Demo Restaurant' : 'Restaurant Menu'} showBackButton />
      
      <main className="container mx-auto px-4 pt-20 pb-16 animate-fade-in">
        <div className="max-w-md mx-auto">
          {/* Menu description */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-secondary text-xs rounded-full mb-2">
              Restaurant Menu
            </span>
            <h1 className="text-2xl font-display font-medium mb-3">
              {menuId === 'demo1' ? 'Demo Restaurant' : 'Restaurant Menu'}
            </h1>
            <p className="text-muted-foreground">
              Explore our menu items in augmented reality. Each dish is carefully crafted by our chefs.
            </p>
          </div>
          
          {/* AR Viewer */}
          <ARViewer menuId={menuId} itemId={itemId} />
          
          {/* Menu navigation - in a real app, this would show other menu items */}
          <div className="mt-8 flex items-center justify-between">
            <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground">Item 1 of 6</span>
            <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MenuViewer;
