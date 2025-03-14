
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRGeneratorProps {
  defaultUrl?: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ defaultUrl = 'https://example.com/menu/demo1' }) => {
  const [url, setUrl] = useState(defaultUrl);
  
  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success('URL copied to clipboard'))
      .catch(() => toast.error('Failed to copy URL'));
  };
  
  return (
    <div className="p-4 border border-border rounded-lg bg-card shadow-sm">
      <h3 className="text-lg font-medium mb-3">Test QR Code</h3>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL for QR code"
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyUrlToClipboard}
            title="Copy URL"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md">
          <QRCodeSVG 
            value={url} 
            size={200} 
            level="H" 
            includeMargin={true}
            className="mx-auto"
          />
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Scan this QR code with your app to test
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Valid URL format: https://example.com/menu/{'menuId'}/{'itemId (optional)'}</p>
          <p>Example: https://example.com/menu/demo1</p>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
