import { useEffect, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  label?: string;
  height?: number;
  /** Recebe a assinatura como data URL (PNG) a cada traço, ou null ao limpar. */
  onChange: (dataUrl: string | null) => void;
}

/** Área para assinar com o dedo (ou mouse) na retirada. O traço usa a cor `foreground`. */
export function SignaturePad({ label = "Assinatura", height = 180, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = height * dpr;
    canvas.getContext("2d")?.scale(dpr, dpr);
  }, [height]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    last.current = point(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    ctx.strokeStyle = getComputedStyle(e.currentTarget).color;
    ctx.lineWidth = 2.25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasSignature) setHasSignature(true);
  };

  const handleUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasSignature && canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-label uppercase text-muted-foreground">{label}</span>
        <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!hasSignature}>
          Limpar
        </Button>
      </div>
      <div className="relative rounded-lg border border-dashed border-input bg-card text-foreground">
        <canvas
          ref={canvasRef}
          style={{ height }}
          className="block w-full cursor-crosshair touch-none rounded-lg"
          role="img"
          aria-label={hasSignature ? "Assinatura registrada" : "Área para assinar com o dedo"}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-10 border-t border-border" />
        {!hasSignature && (
          <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <PenLine className="size-[18px]" />
            Assine aqui com o dedo
          </span>
        )}
      </div>
    </div>
  );
}
