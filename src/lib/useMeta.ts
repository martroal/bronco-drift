import { useEffect } from 'react';

type MetaOptions = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
};

const BASE_URL = 'https://bronco-drift.vercel.app';

/**
 * Hook que ajusta meta tags por ruta. Maneja document.title, meta description,
 * Open Graph (og:title, og:description, og:image, og:url) y canonical.
 *
 * Para datos compartidos en redes (WhatsApp, Twitter, LinkedIn) lo importante
 * es og:* — esos crawlers leen el HTML inicial, no esperan a que React renderice.
 * Para Google indexar bien, los crawlers modernos sí esperan render JS, pero
 * conviene tener fallbacks razonables en `index.html`.
 *
 * Restaura los valores anteriores al desmontar.
 */
export function useMeta(options: MetaOptions): void {
  useEffect(() => {
    const prev = {
      title: document.title,
      description: getMetaContent('name', 'description'),
      ogTitle: getMetaContent('property', 'og:title'),
      ogDescription: getMetaContent('property', 'og:description'),
      ogImage: getMetaContent('property', 'og:image'),
      ogUrl: getMetaContent('property', 'og:url'),
      canonical: getLinkHref('canonical'),
    };

    if (options.title) document.title = options.title;
    if (options.description) setMeta('name', 'description', options.description);
    if (options.ogTitle ?? options.title) setMeta('property', 'og:title', options.ogTitle ?? options.title!);
    if (options.ogDescription ?? options.description) setMeta('property', 'og:description', options.ogDescription ?? options.description!);
    if (options.ogImage) setMeta('property', 'og:image', resolveUrl(options.ogImage));

    if (typeof window !== 'undefined') {
      setMeta('property', 'og:url', window.location.href);
      setLink('canonical', options.canonical ? resolveUrl(options.canonical) : window.location.href);
    }

    return () => {
      document.title = prev.title;
      if (prev.description !== null) setMeta('name', 'description', prev.description);
      if (prev.ogTitle !== null) setMeta('property', 'og:title', prev.ogTitle);
      if (prev.ogDescription !== null) setMeta('property', 'og:description', prev.ogDescription);
      if (prev.ogImage !== null) setMeta('property', 'og:image', prev.ogImage);
      if (prev.ogUrl !== null) setMeta('property', 'og:url', prev.ogUrl);
      if (prev.canonical !== null) setLink('canonical', prev.canonical);
    };
  }, [options.title, options.description, options.ogTitle, options.ogDescription, options.ogImage, options.canonical]);
}

function getMetaContent(attr: 'name' | 'property', value: string): string | null {
  const tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  return tag?.content ?? null;
}

function setMeta(attr: 'name' | 'property', value: string, content: string): void {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function getLinkHref(rel: string): string | null {
  const link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  return link?.href ?? null;
}

function setLink(rel: string, href: string): void {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

function resolveUrl(maybeRelative: string): string {
  if (maybeRelative.startsWith('http')) return maybeRelative;
  return `${BASE_URL}${maybeRelative.startsWith('/') ? '' : '/'}${maybeRelative}`;
}
