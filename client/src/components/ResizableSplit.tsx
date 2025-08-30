
import React, { useState, useRef, useEffect } from 'react';
import ChatPanel from './ChatPanel';
import PDFViewer from './PDFViewer';
import { cn } from '@/lib/utils';

const ResizableSplit = () => {
  const [splitPosition, setSplitPosition] = useState(50); // Default split at 50%
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  // Handle resize functionality
  useEffect(() => {
    const container = containerRef.current;
    const handle = resizeHandleRef.current;
    
    if (!container || !handle) return;
    
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain the splitPosition between 20% and 80%
      const constrainedPosition = Math.max(20, Math.min(80, newPosition));
      setSplitPosition(constrainedPosition);
    };
    
    handle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    
    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex h-[calc(100vh-57px)] overflow-hidden relative"
    >
      {/* Left side - PDF Viewer */}
      <div 
        className={cn("h-full overflow-hidden transition-all duration-200", 
          isDragging.current ? "" : "ease-out"
        )}
        style={{ width: `${splitPosition}%` }}
      >
        <PDFViewer />
      </div>
      
      {/* Resizer handle */}
      <div 
        ref={resizeHandleRef}
        className="absolute top-0 w-1 h-full bg-slate-200 hover:bg-blue-400 cursor-col-resize z-10 transition-colors duration-150"
        style={{ 
          left: `calc(${splitPosition}% - 2px)`,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-slate-300 rounded-full" />
      </div>
      
      {/* Right side - Chat Panel */}
      <div 
        className={cn("h-full overflow-hidden transition-all duration-200", 
          isDragging.current ? "" : "ease-out"
        )}
        style={{ width: `${100 - splitPosition}%` }}
      >
        <ChatPanel />
      </div>
    </div>
  );
};

export default ResizableSplit;
