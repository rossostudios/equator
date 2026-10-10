import type { Lang } from '../i18n';

/** Every visible word comes in both languages: w('English', 'Español'). */
type Words = Record<Lang, string>;
const w = (en: string, es: string): Words => ({ en, es });

/**
 * What I build with, for About. Each tool shows its official logo: the icon its own website
 * publishes, saved in public/brands/tools.
 */
export interface Tool { name: Words; blurb: Words; logo: string; url: string }
export interface ToolGroup { title: Words; tools: Tool[] }

const brand = (name: string, file: string, blurb: Words, url: string): Tool =>
  ({ name: w(name, name), blurb, logo: `/brands/tools/${file}`, url });

export const toolGroups: ToolGroup[] = [
  { title: w('Design', 'Diseño'), tools: [
    brand('Figma', 'figma.svg', w('Where every brand and screen starts.', 'Donde empieza cada marca y cada pantalla.'), 'https://figma.com'),
    brand('Paper', 'paper.png', w('Connected canvas, so design talks to code.', 'Un lienzo conectado, para que el diseño hable con el código.'), 'https://paper.design/'),
  ]},
  { title: w('Languages & frameworks', 'Lenguajes y frameworks'), tools: [
    brand('TypeScript', 'typescript.png', w('The default for anything that ships.', 'Lo que uso por defecto en todo lo que sale a producción.'), 'https://typescriptlang.org'),
    brand('Rust', 'rust.svg', w('For the parts that have to be fast and correct.', 'Para las partes que tienen que ser rápidas y exactas.'), 'https://rust-lang.org'),
    brand('Astro', 'astro.svg', w('Fast sites without the weight.', 'Sitios rápidos, sin peso de más.'), 'https://astro.build'),
    brand('Next.js', 'nextjs.png', w('When it needs to be an app, not a site.', 'Cuando tiene que ser una app y no un sitio.'), 'https://nextjs.org'),
    brand('Three.js', 'threejs.png', w('For the moments that need depth.', 'Para los momentos que piden profundidad.'), 'https://threejs.org'),
    brand('Ethereum', 'ethereum.png', w('Contracts and onchain data, when the product needs it.', 'Contratos y datos onchain, cuando el producto los necesita.'), 'https://ethereum.org'),
  ]},
  { title: w('AI & agents', 'IA y agentes'), tools: [
    brand('Claude', 'claude.svg', w('Anthropic models, in the product and in the build.', 'Los modelos de Anthropic, en el producto y en el desarrollo.'), 'https://claude.ai'),
    brand('OpenAI', 'openai.svg', w('GPT models where they fit the job better.', 'Modelos GPT donde encajan mejor con el trabajo.'), 'https://openai.com'),
    brand('Grok', 'grok.svg', w('xAI, for the real-time and the irreverent.', 'xAI, para lo que pasa en tiempo real y lo irreverente.'), 'https://x.ai'),
    brand('Cursor', 'cursor.svg', w('The editor, with the model in the loop.', 'El editor, con el modelo trabajando al lado.'), 'https://cursor.com'),
  ]},
  { title: w('Operations', 'Operaciones'), tools: [
    brand('Notion', 'notion.png', w('Workspaces, SOPs and project hubs.', 'Espacios de trabajo, procesos y centros de proyecto.'), 'https://notion.so'),
    brand('monday.com', 'monday.png', w('Team boards and delivery pipelines.', 'Tableros de equipo y flujos de entrega.'), 'https://monday.com'),
    brand('ClickUp', 'clickup.png', w('Tasks, docs and team workflows.', 'Tareas, documentos y flujos de equipo.'), 'https://clickup.com'),
    brand('Asana', 'asana.png', w('Light project tracking when a team already lives there.', 'Seguimiento ligero de proyectos cuando el equipo ya vive ahí.'), 'https://asana.com'),
  ]},
  { title: w('Commerce & extensions', 'Comercio y extensiones'), tools: [
    brand('Shopify', 'shopify.png', w('Themes, apps and store tooling.', 'Temas, apps y herramientas para tiendas.'), 'https://shopify.com'),
    brand('Google Chrome', 'chrome.png', w('Extensions that take friction out of a workflow.', 'Extensiones que le quitan fricción a un flujo de trabajo.'), 'https://chromewebstore.google.com'),
  ]},
  { title: w('Repos & infrastructure', 'Repositorios e infraestructura'), tools: [
    brand('GitHub', 'github.svg', w('Every project lives here.', 'Aquí vive cada proyecto.'), 'https://github.com'),
    brand('Vercel', 'vercel.png', w('Ship on push.', 'Publica con cada push.'), 'https://vercel.com'),
    brand('Supabase', 'supabase.png', w('Database, auth and storage in one place.', 'Base de datos, autenticación y almacenamiento en un solo lugar.'), 'https://supabase.com'),
    brand('Cloudflare', 'cloudflare.png', w('DNS, edge and the parts nobody sees.', 'DNS, edge y las partes que nadie ve.'), 'https://cloudflare.com'),
  ]},
  { title: w('Exploring', 'Explorando'), tools: [
    brand('Adobe Substance', 'substance.svg', w("Textures and materials for the 3D characters: Dasha's coat, Jinx's paint.", 'Texturas y materiales para los personajes 3D: el pelaje de Dasha, la pintura de Jinx.'), 'https://www.adobe.com/products/substance3d.html'),
    brand('Blender', 'blender.svg', w('3D for product shots and web moments. The renders here came from it.', 'Renders 3D de producto y momentos para la web. Los de este sitio salen de ahí.'), 'https://blender.org'),
  ]},
];
