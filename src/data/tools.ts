import { siFigma, siClaude, siCursor, siGithub, siVercel, siAstro, siNextdotjs, siSupabase, siCloudflare, siRust, siTypescript, siThreedotjs } from 'simple-icons';

export interface Tool { name: string; blurb: string; path: string; hex: string; url: string }
export interface ToolGroup { title: string; tools: Tool[] }
const t = (icon: { title: string; path: string; hex: string }, blurb: string, url: string): Tool => ({ name: icon.title, blurb, path: icon.path, hex: '#' + icon.hex, url });

export const toolGroups: ToolGroup[] = [
  { title: 'Design', tools: [
    t(siFigma, 'Where every brand and screen starts.', 'https://figma.com'),
  ]},
  { title: 'Languages & frameworks', tools: [
    t(siTypescript, 'The default for anything that ships.', 'https://typescriptlang.org'),
    t(siRust, 'For the parts that have to be fast and correct.', 'https://rust-lang.org'),
    t(siAstro, 'Fast sites without the weight.', 'https://astro.build'),
    t(siNextdotjs, 'When it needs to be an app, not a site.', 'https://nextjs.org'),
    t(siThreedotjs, 'For the moments that need depth.', 'https://threejs.org'),
  ]},
  { title: 'Editing & AI', tools: [
    t(siCursor, 'The editor, with the model in the loop.', 'https://cursor.com'),
    t(siClaude, 'Pair programmer. Most of this site was built with it.', 'https://claude.ai'),
  ]},
  { title: 'Repos & infrastructure', tools: [
    t(siGithub, 'Every project lives here.', 'https://github.com'),
    t(siVercel, 'Ship on push.', 'https://vercel.com'),
    t(siSupabase, 'Database, auth and storage in one place.', 'https://supabase.com'),
    t(siCloudflare, 'DNS, edge and the parts nobody sees.', 'https://cloudflare.com'),
  ]},
];
