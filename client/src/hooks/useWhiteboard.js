import { useState, useEffect, useRef, useCallback } from 'react';
import { drawStroke, redrawCanvas } from '../utils/canvasHelpers';

export const useWhiteboard = (roomId, socket) => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#38bdf8'); // Cyan/brand default
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentStrokeRef = useRef(null);

  // Redraw canvas whenever strokes list changes or canvas mounts
  const refreshCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    redrawCanvas(ctx, canvas.width, canvas.height, strokes);
  }, [strokes]);

  // Handle incoming remote strokes
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRemoteStroke = (stroke) => {
      setStrokes((prev) => [...prev, stroke]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawStroke(ctx, stroke);
      }
    };

    const handleRemoteClear = () => {
      setStrokes([]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const handleHistorySync = (history) => {
      if (Array.isArray(history)) {
        setStrokes(history);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          redrawCanvas(ctx, canvas.width, canvas.height, history);
        }
      }
    };

    socket.on('whiteboard-draw', handleRemoteStroke);
    socket.on('whiteboard-clear', handleRemoteClear);
    socket.on('whiteboard-history-sync', handleHistorySync);

    return () => {
      socket.off('whiteboard-draw', handleRemoteStroke);
      socket.off('whiteboard-clear', handleRemoteClear);
      socket.off('whiteboard-history-sync', handleHistorySync);
    };
  }, [socket, roomId]);

  // Calculate coordinates relative to canvas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Start Drawing
  const startDrawing = (e) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);

    const newStroke = {
      points: [coords],
      color,
      size,
      isEraser: tool === 'eraser',
    };

    currentStrokeRef.current = newStroke;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      drawStroke(ctx, newStroke);
    }
  };

  // Drawing in progress
  const draw = (e) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const coords = getCoordinates(e);

    currentStrokeRef.current.points.push(coords);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      drawStroke(ctx, {
        points: currentStrokeRef.current.points.slice(-2),
        color,
        size,
        isEraser: tool === 'eraser',
      });
    }
  };

  // End Drawing & Broadcast stroke
  const stopDrawing = () => {
    if (!isDrawing || !currentStrokeRef.current) return;
    setIsDrawing(false);

    const finishedStroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (finishedStroke.points.length > 0) {
      setStrokes((prev) => [...prev, finishedStroke]);

      if (socket) {
        socket.emit('whiteboard-draw', {
          roomId,
          stroke: finishedStroke,
        });
      }
    }
  };

  // Clear Whiteboard
  const clearWhiteboard = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (socket) {
      socket.emit('whiteboard-clear', { roomId });
    }
  };

  // Undo last stroke
  const undoLastStroke = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      redrawCanvas(ctx, canvas.width, canvas.height, updated);
    }
  };

  return {
    canvasRef,
    color,
    setColor,
    size,
    setSize,
    tool,
    setTool,
    strokes,
    startDrawing,
    draw,
    stopDrawing,
    clearWhiteboard,
    undoLastStroke,
    refreshCanvas,
  };
};
