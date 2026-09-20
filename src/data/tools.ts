import {
  siFigma, siClaude, siCursor, siGithub, siVercel, siAstro, siNextdotjs, siSupabase, siCloudflare,
  siRust, siTypescript, siThreedotjs, siEthereum, siNotion, siClickup, siAsana,
  siShopify, siGooglechrome, siBlender,
} from 'simple-icons';

export interface Tool { name: string; blurb: string; path: string; hex: string; url?: string }
export interface ToolGroup { title: string; tools: Tool[] }

const t = (icon: { title: string; path: string; hex: string }, blurb: string, url: string): Tool =>
  ({ name: icon.title, blurb, path: icon.path, hex: '#' + icon.hex, url });

/** For brands simple-icons does not ship, and for craft that has no single vendor. */
const own = (name: string, blurb: string, path: string, hex: string, url?: string): Tool =>
  ({ name, blurb, path, hex, url });

const mondayPath =
  'M2.6 7.1a2.6 2.6 0 0 1 5.2 0v9.8a2.6 2.6 0 0 1-5.2 0z' +
  'M9.4 7.1a2.6 2.6 0 0 1 5.2 0v9.8a2.6 2.6 0 0 1-5.2 0z' +
  'M16.2 7.1a2.6 2.6 0 0 1 5.2 0v9.8a2.6 2.6 0 0 1-5.2 0z';

const paperPath = 'M7 2h6.6L19.8 8.2V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z';

/* Geometric stand-ins: simple-icons no longer ships these marks. */
/* Hexagonal ring: outer and inner wound in opposite directions so the centre stays open. */
const openaiPath =
  'M12 2.8 4.03 7.4v9.2L12 21.2l7.97-4.6V7.4z' +
  'M12 6.9 16.4 9.45v5.1L12 17.1l-4.4-2.55v-5.1z';

const grokPath =
  'M3.6 3h4.5l12.3 18h-4.5z' +
  'M20.4 3h-3.1l-4.6 6.7 1.6 2.3z' +
  'M3.6 21h3.1l4.6-6.7-1.6-2.3z';

const motionPath =
  'M9.5 7.4a1 1 0 0 1 1.5-.87l7.2 4.16a1 1 0 0 1 0 1.73l-7.2 4.16a1 1 0 0 1-1.5-.87z' +
  'M5 1.8l.85 2.35L8.2 5l-2.35.85L5 8.2l-.85-2.35L1.8 5l2.35-.85z';

export const toolGroups: ToolGroup[] = [
  { title: 'Design', tools: [
    t(siFigma, 'Where every brand and screen starts.', 'https://figma.com'),
    own('Paper', 'Connected canvas, so design talks to code.', paperPath, '#111111', 'https://paper.design/'),
  ]},
  { title: 'Languages & frameworks', tools: [
    t(siTypescript, 'The default for anything that ships.', 'https://typescriptlang.org'),
    t(siRust, 'For the parts that have to be fast and correct.', 'https://rust-lang.org'),
    t(siAstro, 'Fast sites without the weight.', 'https://astro.build'),
    t(siNextdotjs, 'When it needs to be an app, not a site.', 'https://nextjs.org'),
    t(siThreedotjs, 'For the moments that need depth.', 'https://threejs.org'),
    t(siEthereum, 'Contracts and onchain data, when the product needs it.', 'https://ethereum.org'),
  ]},
  { title: 'AI & agents', tools: [
    t(siClaude, 'Anthropic models, in the product and in the build.', 'https://claude.ai'),
    own('OpenAI', 'GPT models where they fit the job better.', openaiPath, '#111111', 'https://openai.com'),
    own('Grok', 'xAI, for the real-time and the irreverent.', grokPath, '#111111', 'https://x.ai'),
    t(siCursor, 'The editor, with the model in the loop.', 'https://cursor.com'),
  ]},
  { title: 'Operations', tools: [
    t(siNotion, 'Workspaces, SOPs and project hubs.', 'https://notion.so'),
    own('monday.com', 'Team boards and delivery pipelines.', mondayPath, '#FF3D57', 'https://monday.com'),
    t(siClickup, 'Tasks, docs and studio workflows.', 'https://clickup.com'),
    t(siAsana, 'Light project tracking when a team already lives there.', 'https://asana.com'),
  ]},
  { title: 'Commerce & extensions', tools: [
    t(siShopify, 'Themes, apps and store tooling.', 'https://shopify.com'),
    t(siGooglechrome, 'Extensions that take friction out of a workflow.', 'https://chromewebstore.google.com'),
  ]},
  { title: 'Repos & infrastructure', tools: [
    t(siGithub, 'Every project lives here.', 'https://github.com'),
    t(siVercel, 'Ship on push.', 'https://vercel.com'),
    t(siSupabase, 'Database, auth and storage in one place.', 'https://supabase.com'),
    t(siCloudflare, 'DNS, edge and the parts nobody sees.', 'https://cloudflare.com'),
  ]},
  { title: 'Exploring', tools: [
    own('AI video & motion', 'Cinematic clips, product ads, scene remixes. Growing this on purpose.', motionPath, '#111111'),
    t(siBlender, '3D for product shots and web moments. The renders here came from it.', 'https://blender.org'),
  ]},
];
