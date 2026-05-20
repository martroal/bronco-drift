import { useParams, Link } from 'react-router-dom';

export default function ProjectModule() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="space-y-6">
      <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-300">
        &larr; volver
      </Link>
      <h1 className="text-2xl font-semibold capitalize">{slug}</h1>
      <p className="text-neutral-400 text-sm">
        Módulo aún no implementado. Acá va a vivir el código específico del nicho.
      </p>
    </div>
  );
}
