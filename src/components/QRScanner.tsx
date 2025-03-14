
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

interface QRScannerProps {
  onScan: (data: string) => void;
  isActive?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, isActive = true }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        if (!isActive) return;

        setLoading(true);
        setError(null);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanQRCode();
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please check permissions.');
        toast.error('Camera access denied. Please check your browser permissions.');
      } finally {
        setLoading(false);
      }
    };

    const scanQRCode = async () => {
      if (!isActive) return;

      // Dynamically import jsQR to reduce initial load time
      try {
        const jsQR = (await import('jsqr')).default;
        
        const detectQR = () => {
          if (!videoRef.current || !canvasRef.current || !isActive) return;

          const canvas = canvasRef.current;
          const video = videoRef.current;
          
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code && code.data) {
              onScan(code.data);
              // No need to continue scanning after successful scan
              return;
            }
          }
          
          rafId.current = requestAnimationFrame(detectQR);
        };
        
        detectQR();
      } catch (err) {
        console.error('Error loading jsQR:', err);
        setError('Could not load QR scanner.');
        toast.error('Failed to initialize QR scanner');
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [onScan, isActive]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/10 backdrop-blur-sm z-10">
          <p className="text-destructive mb-2 max-w-xs text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="qr-scanner-overlay">
        <div className="qr-scanner-frame"></div>
      </div>
      
      <video 
        ref={videoRef} 
        className="absolute top-0 left-0 w-full h-full object-cover"
        playsInline
        muted
      />
      
      <canvas 
        ref={canvasRef} 
        className="invisible absolute"
      />
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white text-sm mx-auto max-w-xs glass-morphism p-2 rounded-lg">
          Point your camera at a QR code to scan
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
