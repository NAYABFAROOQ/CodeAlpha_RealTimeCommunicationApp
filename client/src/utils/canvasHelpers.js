/**
 * Draw a single stroke or path on the HTML5 2D canvas context
 */
export const drawStroke = (ctx, stroke) => {
  if (!ctx || !stroke || !stroke.points || stroke.points.length === 0) return;

  const { points, color, size, isEraser } = stroke;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isEraser) {
    // When erasing, use destination-out for transparency or match background
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = size * 2.5;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
  }

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, (size || 3) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : color;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }

  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
};

/**
 * Redraw entire stroke history
 */
export const redrawCanvas = (ctx, width, height, strokes, backgroundColor = '#0f172a') => {
  if (!ctx) return;
  ctx.save();
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  strokes.forEach((stroke) => {
    drawStroke(ctx, stroke);
  });
};

/**
 * Export canvas to image download
 */
export const exportCanvasToImage = (canvas, filename = 'whiteboard-export.png') => {
  if (!canvas) return;

  // Create temporary canvas to ensure dark background is preserved in exported PNG
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.fillStyle = '#0f172a';
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(canvas, 0, 0);

  const dataUrl = tempCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};
