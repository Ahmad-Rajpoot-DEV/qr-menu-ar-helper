
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Camera, ScanLine } from 'lucide-react';
import NavBar from '../components/NavBar';
import QRScanner from '../components/QRScanner';
import QRGenerator from '../components/QRGenerator';

const Index = () => {
  const navigate = useNavigate();
  const [scannerActive, setScannerActive] = useState(false);
  
  const handleScan = useCallback((data: string) => {
    try {
      console.log('QR data received:', data);
      
      // Try to parse as URL first
      let url: URL;
      
      try {
        // Expected format: https://example.com/menu/{menuId}/{itemId?}
        url = new URL(data);
      } catch (err) {
        // If it's not a valid URL, try to see if it's just a menuId
        if (data && !data.includes(' ')) {
          console.log('Treating as direct menuId:', data);
          // Navigate directly to menu with the scanned text as ID
          setScannerActive(false);
          navigate(`/menu/${data}`);
          toast.success('Menu ID detected');
          return;
        } else {
          throw new Error('Invalid QR format');
        }
      }
      
      // Handle URL format
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      console.log('URL path parts:', pathParts);
      
      if (pathParts.length >= 2 && pathParts[0] === 'menu') {
        const menuId = pathParts[1];
        const itemId = pathParts[2] || undefined;
        
        console.log(`Navigating to menu: ${menuId}, item: ${itemId || 'not specified'}`);
        
        // Close scanner
        setScannerActive(false);
        
        // Navigate to menu viewer with the scanned IDs
        navigate(`/menu/${menuId}${itemId ? `/${itemId}` : ''}`);
        
        toast.success('QR code scanned successfully');
      } else {
        toast.error('Invalid QR code format');
      }
    } catch (err) {
      console.error('Error parsing QR data:', err);
      toast.error('Invalid QR code');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <NavBar title="AR Menu Experience" />
      
      <main className="container mx-auto px-4 pt-20 pb-16 animate-fade-in">
        <div className="max-w-md mx-auto mt-8 text-center">
          <div className="mb-10">
            <div className="w-24 h-24 neo-morphism rounded-full mx-auto mb-6 flex items-center justify-center">
              <ScanLine className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-medium mb-3">AR Restaurant Menu</h1>
            <p className="text-muted-foreground">
              Scan a restaurant's QR code to view their menu items in augmented reality
            </p>
          </div>
          
          <button
            onClick={() => setScannerActive(true)}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center">
              <Camera className="w-5 h-5 mr-2" />
              <span>Scan QR Code</span>
            </div>
          </button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Point your camera at a restaurant's QR code to see their menu in AR
          </p>
          
          {/* For demo purposes only - quick access buttons */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm font-medium mb-4">Demo Options</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/menu/demo1')}
                className="w-full py-3 bg-secondary text-foreground rounded-lg font-medium transition-colors hover:bg-secondary/70"
              >
                View Demo Menu
              </button>
            </div>
          </div>
          
          {/* QR Code Generator for testing */}
          <div className="mt-12">
            <QRGenerator defaultUrl="https://example.com/menu/demo1" />
          </div>
        </div>
      </main>
      
      {scannerActive && (
        <div className="fixed inset-0 z-50 animate-fade-in bg-black">
          <QRScanner onScan={handleScan} isActive={scannerActive} />
          <button
            onClick={() => setScannerActive(false)}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-white/90 dark:bg-black/80 text-foreground rounded-full font-medium shadow-lg backdrop-blur-sm z-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
