
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Camera, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface QRScannerProps {
  onScan: (data: string) => void;
  isActive?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, isActive = true }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef<number | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        if (!isActive) return;

        setLoading(true);
        setError(null);
        
        // Explicitly request the back camera on mobile devices
        const constraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        console.log('Requesting camera access with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Add event listener to check when video can play
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, ready to play');
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  console.log('Video playing successfully');
                  setLoading(false);
                  scanQRCode();
                })
                .catch(err => {
                  console.error('Error playing video:', err);
                  setError('Failed to start camera preview');
                  setLoading(false);
                });
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please check permissions.');
        toast.error('Camera access denied. Please check your browser permissions.');
        setLoading(false);
      }
    };

    const scanQRCode = async () => {
      if (!isActive || hasScanned) return;

      // Dynamically import jsQR to reduce initial load time
      try {
        console.log('Starting QR code scanning');
        const jsQR = (await import('jsqr')).default;
        
        const detectQR = () => {
          if (!videoRef.current || !canvasRef.current || !isActive || hasScanned) return;

          const canvas = canvasRef.current;
          const video = videoRef.current;
          
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Make sure canvas dimensions match video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Track scan attempts for debugging
            setScanAttempts(prev => {
              const newCount = prev + 1;
              if (newCount % 30 === 0) { // Log every ~30 attempts
                console.log(`Scanning for QR code (attempt ${newCount})`);
              }
              return newCount;
            });
            
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code && code.data) {
              console.log('QR code detected:', code.data);
              // Prevent multiple scans
              setHasScanned(true);
              
              // Highlight the QR code
              ctx.beginPath();
              ctx.lineWidth = 4;
              ctx.strokeStyle = "#FF3B58";
              ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
              ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
              ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
              ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
              ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
              ctx.stroke();
              
              // Show success toast
              toast.success('QR code detected!');
              
              // Call the onScan callback
              onScan(code.data);
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
      console.log('Cleaning up QR Scanner');
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind);
          track.stop();
        });
      }
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [onScan, isActive, hasScanned]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-white font-medium">Accessing camera...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-10">
          <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
          <p className="text-white font-medium mb-2 max-w-xs text-center">{error}</p>
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
        autoPlay
      />
      
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      
      <div className="absolute bottom-24 left-0 right-0 text-center">
        <div className="mx-auto max-w-sm">
          <p className="text-white text-sm bg-black/50 backdrop-blur-sm p-3 rounded-lg mx-4">
            {scanAttempts > 0 ? 
              `Scanning for QR code... (${Math.floor(scanAttempts / 10)} seconds)` : 
              "Point your camera at a QR code to scan"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
