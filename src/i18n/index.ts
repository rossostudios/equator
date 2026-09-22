/**
 * Two languages, one set of templates. English lives at the root and Spanish under /es/,
 * with the same slugs, so a page and its translation always sit at matching addresses.
 * Each page route is src/pages/[...lang]/…, where lang is empty for English and "es".
 */
export type Lang = 'en' | 'es';
export const langs: Lang[] = ['en', 'es'];

/** getStaticPaths for a [...lang] route: the root for English, /es for Spanish. */
export const langPaths = () =>
  langs.map((lang) => ({ params: { lang: lang === 'en' ? undefined : lang }, props: { lang } }));

/** A site path in the given language: href('es', '/work') is '/es/work'. */
export const href = (lang: Lang, path: string) => (lang === 'en' ? path : path === '/' ? '/es/' : `/es${path}`);

/** The path without its language prefix or trailing slash: '/es/work/' is '/work'. */
export const unprefixed = (pathname: string) =>
  pathname.replace(/^\/es(?=\/|$)/, '').replace(/\/$/, '') || '/';

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'es' : 'en');
