import React, { useRef, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { AlertCircle, Search, RefreshCcw } from 'lucide-react';
import { PathSmoother } from '../utils/smoothPath';
import { recognizeHandwriting } from '../utils/handwritingRecognition';

interface DrawingCanvasProps {
  onDrawingComplete: (imageData: string, recognizedText: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onDrawingComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathSmootherRef = useRef<PathSmoother>(new PathSmoother());
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [worker, setWorker] = useState<Tesseract.Worker | null>(null);
  const [scale, setScale] = useState(1);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [lastPoint, setLastPoint] = useState<[number, number] | null>(null);
  const pressureRef = useRef<number>(0.5);

  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const updateCanvasSize = () => {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.width * 0.6}px`;
        
        canvas.width = rect.width * dpr;
        canvas.height = (rect.width * 0.6) * dpr;
        
        const ctx = canvas.getContext('2d', { 
          willReadFrequently: true,
          alpha: false 
        });
        if (!ctx) return;
        
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        // Enable pressure sensitivity
        if ('pressure' in ctx) {
          (ctx as any).pressure = true;
        }
        
        contextRef.current = ctx;
        
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        setScale(canvas.width / rect.width);
      };

      updateCanvasSize();
      
      const resizeObserver = new ResizeObserver(updateCanvasSize);
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    };

    const initTesseract = async () => {
      try {
        const newWorker = await createWorker();
        await newWorker.loadLanguage('eng');
        await newWorker.initialize('eng');
        await newWorker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        });
        setWorker(newWorker);
      } catch (err) {
        setError('Failed to initialize text recognition');
      }
    };

    initCanvas();
    initTesseract();

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent | PointerEvent): { 
    x: number; 
    y: number;
    pressure: number;
  } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
        pressure: (touch as any).force || 0.5
      };
    } else if ('pressure' in event) {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
        pressure: event.pressure || 0.5
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
        pressure: 0.5
      };
    }
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    event.preventDefault();
    const { x, y, pressure } = getCoordinates(event);
    pressureRef.current = pressure;
    
    if (contextRef.current) {
      pathSmootherRef.current.reset();
      const smoothed = pathSmootherRef.current.addPoint(x / scale, y / scale);
      contextRef.current.beginPath();
      contextRef.current.moveTo(smoothed[0], smoothed[1]);
      setLastPoint(smoothed);
      setIsDrawing(true);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    event.preventDefault();
    if (!isDrawing || !contextRef.current || !lastPoint) return;

    const { x, y, pressure } = getCoordinates(event);
    pressureRef.current = pressure;
    
    const smoothed = pathSmootherRef.current.addPoint(x / scale, y / scale);
    const ctx = contextRef.current;

    // Adjust line width based on pressure
    ctx.lineWidth = 2 + (pressure * 2);
    
    // Draw a quadratic curve for smoother lines
    ctx.beginPath();
    ctx.moveTo(lastPoint[0], lastPoint[1]);
    ctx.quadraticCurveTo(
      lastPoint[0], lastPoint[1],
      smoothed[0], smoothed[1]
    );
    ctx.stroke();
    
    setLastPoint(smoothed);
  };

  const stopDrawing = async () => {
    if (!contextRef.current || !worker) return;
    
    setIsDrawing(false);
    setLastPoint(null);
    pathSmootherRef.current.reset();
    contextRef.current.closePath();

    setIsProcessing(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { data } = await worker.recognize(canvas);
      const cleanText = data.text.trim();

      const recognition = recognizeHandwriting(cleanText);
      
      if (recognition.match) {
        onDrawingComplete(canvas.toDataURL(), recognition.match);
        setAlternatives(recognition.alternatives);
      } else {
        setError(`No matching medicine found (Confidence: ${Math.round(recognition.confidence * 100)}%)`);
        setAlternatives(recognition.alternatives);
      }
    } catch (err) {
      setError('Failed to process handwriting');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setError('');
    setAlternatives([]);
  };

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          className="drawing-canvas touch-none"
          style={{ touchAction: 'none' }}
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white flex items-center gap-2">
              <Search className="animate-spin" size={20} />
              Processing...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          <div className="flex items-center mb-2">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
          {alternatives.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-300 mb-2">Did you mean:</p>
              <div className="flex flex-wrap gap-2">
                {alternatives.map((alt, index) => (
                  <button
                    key={index}
                    onClick={() => onDrawingComplete('', alt)}
                    className="px-3 py-1 bg-gray-700 rounded-full text-sm hover:bg-gray-600 transition-colors"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={clearCanvas}
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCcw size={16} />
          Clear Drawing
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;