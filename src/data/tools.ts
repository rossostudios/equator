import {
  siFigma, siClaude, siCursor, siGithub, siVercel, siAstro, siNextdotjs, siSupabase, siCloudflare,
  siRust, siTypescript, siThreedotjs, siEthereum, siNotion, siClickup, siAsana,
  siShopify, siGooglechrome, siBlender,
} from 'simple-icons';
import type { Lang } from '../i18n';

/** Every visible word comes in both languages: w('English', 'Español'). */
type Words = Record<Lang, string>;
const w = (en: string, es: string): Words => ({ en, es });

export interface Tool { name: Words; blurb: Words; path: string; hex: string; url?: string }
export interface ToolGroup { title: Words; tools: Tool[] }

const t = (icon: { title: string; path: string; hex: string }, blurb: Words, url: string): Tool =>
  ({ name: w(icon.title, icon.title), blurb, path: icon.path, hex: '#' + icon.hex, url });

/** For brands simple-icons does not ship, and for craft that has no single vendor. */
const own = (name: string | Words, blurb: Words, path: string, hex: string, url?: string): Tool =>
  ({ name: typeof name === 'string' ? w(name, name) : name, blurb, path, hex, url });

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
  { title: w('Design', 'Diseño'), tools: [
    t(siFigma, w('Where every brand and screen starts.', 'Donde empieza cada marca y cada pantalla.'), 'https://figma.com'),
    own('Paper', w('Connected canvas, so design talks to code.', 'Un lienzo conectado, para que el diseño hable con el código.'), paperPath, '#111111', 'https://paper.design/'),
  ]},
  { title: w('Languages & frameworks', 'Lenguajes y frameworks'), tools: [
    t(siTypescript, w('The default for anything that ships.', 'Lo que uso por defecto en todo lo que sale a producción.'), 'https://typescriptlang.org'),
    t(siRust, w('For the parts that have to be fast and correct.', 'Para las partes que tienen que ser rápidas y exactas.'), 'https://rust-lang.org'),
    t(siAstro, w('Fast sites without the weight.', 'Sitios rápidos, sin peso de más.'), 'https://astro.build'),
    t(siNextdotjs, w('When it needs to be an app, not a site.', 'Cuando tiene que ser una app y no un sitio.'), 'https://nextjs.org'),
    t(siThreedotjs, w('For the moments that need depth.', 'Para los momentos que piden profundidad.'), 'https://threejs.org'),
    t(siEthereum, w('Contracts and onchain data, when the product needs it.', 'Contratos y datos onchain, cuando el producto los necesita.'), 'https://ethereum.org'),
  ]},
  { title: w('AI & agents', 'IA y agentes'), tools: [
    t(siClaude, w('Anthropic models, in the product and in the build.', 'Los modelos de Anthropic, en el producto y en el desarrollo.'), 'https://claude.ai'),
    own('OpenAI', w('GPT models where they fit the job better.', 'Modelos GPT donde encajan mejor con el trabajo.'), openaiPath, '#111111', 'https://openai.com'),
    own('Grok', w('xAI, for the real-time and the irreverent.', 'xAI, para lo que pasa en tiempo real y lo irreverente.'), grokPath, '#111111', 'https://x.ai'),
    t(siCursor, w('The editor, with the model in the loop.', 'El editor, con el modelo trabajando al lado.'), 'https://cursor.com'),
  ]},
  { title: w('Operations', 'Operaciones'), tools: [
    t(siNotion, w('Workspaces, SOPs and project hubs.', 'Espacios de trabajo, procesos y centros de proyecto.'), 'https://notion.so'),
    own('monday.com', w('Team boards and delivery pipelines.', 'Tableros de equipo y flujos de entrega.'), mondayPath, '#FF3D57', 'https://monday.com'),
    t(siClickup, w('Tasks, docs and studio workflows.', 'Tareas, documentos y flujos del estudio.'), 'https://clickup.com'),
    t(siAsana, w('Light project tracking when a team already lives there.', 'Seguimiento ligero de proyectos cuando el equipo ya vive ahí.'), 'https://asana.com'),
  ]},
  { title: w('Commerce & extensions', 'Comercio y extensiones'), tools: [
    t(siShopify, w('Themes, apps and store tooling.', 'Temas, apps y herramientas para tiendas.'), 'https://shopify.com'),
    t(siGooglechrome, w('Extensions that take friction out of a workflow.', 'Extensiones que le quitan fricción a un flujo de trabajo.'), 'https://chromewebstore.google.com'),
  ]},
  { title: w('Repos & infrastructure', 'Repositorios e infraestructura'), tools: [
    t(siGithub, w('Every project lives here.', 'Aquí vive cada proyecto.'), 'https://github.com'),
    t(siVercel, w('Ship on push.', 'Publica con cada push.'), 'https://vercel.com'),
    t(siSupabase, w('Database, auth and storage in one place.', 'Base de datos, autenticación y almacenamiento en un solo lugar.'), 'https://supabase.com'),
    t(siCloudflare, w('DNS, edge and the parts nobody sees.', 'DNS, edge y las partes que nadie ve.'), 'https://cloudflare.com'),
  ]},
  { title: w('Exploring', 'Explorando'), tools: [
    own(w('AI video & motion', 'Video y movimiento con IA'), w('Cinematic clips, product ads, scene remixes. Growing this on purpose.', 'Clips cinematográficos, anuncios de producto, remezclas de escenas. Lo estoy desarrollando a propósito.'), motionPath, '#111111'),
    t(siBlender, w('3D for product shots and web moments. The renders here came from it.', 'Renders 3D de producto y momentos para la web. Los de este sitio salen de ahí.'), 'https://blender.org'),
  ]},
];
