import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw, Pencil, Type } from 'lucide-react';
import { config } from '../config';

type Modo = 'dibujo' | 'tipeo';

type Props = {
  onConfirmar: (data: string, tipo: Modo) => void;
  disabled?: boolean;
  nombreSugerido?: string;
};

/**
 * Componente de firma. Permite dibujar (canvas) o tipear (cursive font).
 * Devuelve el data URL del PNG (modo dibujo) o el texto plano (modo tipeo)
 * más el tipo seleccionado.
 */
export default function FirmaCanvas({ onConfirmar, disabled, nombreSugerido }: Props) {
  const [modo, setModo] = useState<Modo>('dibujo');
  const [textoTipeo, setTextoTipeo] = useState(nombreSugerido ?? '');
  const [tieneDibujo, setTieneDibujo] = useState(false);
  const canvasRef = useRef<SignatureCanvas | null>(null);

  function limpiar() {
    canvasRef.current?.clear();
    setTieneDibujo(false);
  }

  function confirmar() {
    if (modo === 'dibujo') {
      if (!canvasRef.current || canvasRef.current.isEmpty()) return;
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onConfirmar(dataUrl, 'dibujo');
    } else {
      if (!textoTipeo.trim()) return;
      onConfirmar(textoTipeo.trim(), 'tipeo');
    }
  }

  const puedeConfirmar = modo === 'dibujo' ? tieneDibujo : textoTipeo.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Toggle de modo */}
      <div className="flex items-center gap-1 p-0.5 rounded-md w-fit" style={{ backgroundColor: config.borde }}>
        <button
          type="button"
          onClick={() => setModo('dibujo')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-colors ${
            modo === 'dibujo' ? 'bg-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
          style={modo === 'dibujo' ? { color: config.acento } : undefined}
        >
          <Pencil size={12} />
          Dibujar
        </button>
        <button
          type="button"
          onClick={() => setModo('tipeo')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-colors ${
            modo === 'tipeo' ? 'bg-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
          style={modo === 'tipeo' ? { color: config.acento } : undefined}
        >
          <Type size={12} />
          Tipear
        </button>
      </div>

      {modo === 'dibujo' ? (
        <div className="space-y-2">
          <div
            className="rounded-lg overflow-hidden border-2 border-dashed"
            style={{ borderColor: config.bordeFuerte, backgroundColor: '#ffffff' }}
          >
            <SignatureCanvas
              ref={canvasRef}
              canvasProps={{
                className: 'w-full h-40 touch-none',
                style: { background: '#ffffff' },
              }}
              penColor={config.tinta}
              onEnd={() => setTieneDibujo(!canvasRef.current?.isEmpty())}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={limpiar}
              disabled={!tieneDibujo}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-800 disabled:opacity-40"
            >
              <RotateCcw size={12} />
              Borrar y rehacer
            </button>
            <span className="text-stone-400">Firmá con el dedo o el mouse</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="rounded-lg border-2 border-dashed p-6 text-center"
            style={{ borderColor: config.bordeFuerte, backgroundColor: '#ffffff' }}
          >
            <input
              value={textoTipeo}
              onChange={(e) => setTextoTipeo(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-transparent text-center text-3xl outline-none placeholder:text-stone-300"
              style={{
                fontFamily: config.serifDisplay,
                color: config.tinta,
                ...config.fraunces.titularSuave,
                fontStyle: 'italic',
              }}
              autoFocus
            />
          </div>
          <p className="text-xs text-stone-400 text-center">
            Se renderiza con tipografía manuscrita en el contrato final.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={confirmar}
        disabled={disabled || !puedeConfirmar}
        className="w-full text-sm font-medium text-white rounded-md py-2.5 disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: config.acento }}
      >
        Confirmar firma
      </button>
    </div>
  );
}
