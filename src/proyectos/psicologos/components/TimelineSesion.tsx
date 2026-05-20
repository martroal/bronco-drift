import { Pencil } from 'lucide-react';
import type { SesionConTags } from '../lib/queries';
import { formatearFecha } from '../lib/recap';
import TagPill from './TagPill';
import { config } from '../config';

export default function TimelineSesion({
  sesion,
  onEditar,
}: {
  sesion: SesionConTags;
  onEditar: (sesion: SesionConTags) => void;
}) {
  const tieneContenido =
    sesion.tema_central ||
    sesion.tarea_propuesta ||
    sesion.estado_emocional ||
    sesion.notas_libres ||
    sesion.plan_proxima;

  return (
    <article className="relative pl-8 pb-6 group">
      {/* Línea vertical del timeline */}
      <span
        className="absolute left-[7px] top-2 bottom-0 w-px"
        style={{ backgroundColor: config.acentoSoftBorder }}
      />
      {/* Punto */}
      <span
        className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2"
        style={{ backgroundColor: '#0a0a0a', borderColor: config.acento }}
      />

      <header className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-3">
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: config.acento, fontFamily: config.serif }}
          >
            {formatearFecha(sesion.fecha)}
          </span>
          {sesion.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {sesion.tags.map((t) => (
                <TagPill key={t.id} tag={t} size="xs" />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onEditar(sesion)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-neutral-200"
          title="Editar sesión"
          aria-label="Editar"
        >
          <Pencil size={13} />
        </button>
      </header>

      {!tieneContenido && (
        <p className="text-xs text-neutral-600 italic">
          Sesión sin notas aún. <button onClick={() => onEditar(sesion)} className="underline hover:text-neutral-400">Escribir notas</button>
        </p>
      )}

      {sesion.tema_central && (
        <Campo etiqueta="Tema central" valor={sesion.tema_central} destacar />
      )}
      {sesion.estado_emocional && (
        <Campo etiqueta="Estado emocional" valor={sesion.estado_emocional} />
      )}
      {sesion.tarea_propuesta && (
        <Campo etiqueta="Tarea propuesta" valor={sesion.tarea_propuesta} />
      )}
      {sesion.notas_libres && (
        <Campo etiqueta="Notas" valor={sesion.notas_libres} multilinea />
      )}
      {sesion.plan_proxima && (
        <Campo etiqueta="Plan próxima sesión" valor={sesion.plan_proxima} />
      )}
    </article>
  );
}

function Campo({
  etiqueta,
  valor,
  destacar,
  multilinea,
}: {
  etiqueta: string;
  valor: string;
  destacar?: boolean;
  multilinea?: boolean;
}) {
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">{etiqueta}</div>
      <p
        className={`text-sm leading-relaxed ${destacar ? 'font-medium text-neutral-100' : 'text-neutral-300'} ${multilinea ? 'whitespace-pre-wrap' : ''}`}
      >
        {valor}
      </p>
    </div>
  );
}
