import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n';

/** Every image under src/assets/work, by path: img('petzone/desktop-light/home'). Imported rather
 *  than linked, so Astro reads each file's real size and resizes it. A wrong path fails the build. */
const files = import.meta.glob<ImageMetadata>('../assets/work/**/*.webp', { eager: true, import: 'default' });
const img = (path: string) => {
  const file = files[`../assets/work/${path}.webp`];
  if (!file) throw new Error(`No image at src/assets/work/${path}.webp`);
  return file;
};
/** A video's two cuts in public/work, cuts('petzone/film'): /work/petzone/film-en.mp4 and
 *  film-es.mp4, each with its poster beside it as a WebP of the same name. */
const cuts = (path: string): Record<Lang, { mp4: string; poster: string }> => ({
  en: { mp4: `/work/${path}-en.mp4`, poster: `/work/${path}-en.webp` },
  es: { mp4: `/work/${path}-es.mp4`, poster: `/work/${path}-es.webp` },
});
/** One video for both languages, same('purrsuit/loops/dive'): /work/purrsuit/loops/dive.mp4 and its poster. For
 *  footage whose words are the product's own, which stay in one language whoever reads the page. */
const same = (path: string): Record<Lang, { mp4: string; poster: string }> => {
  const one = { mp4: `/work/${path}.mp4`, poster: `/work/${path}.webp` };
  return { en: one, es: one };
};

export type Category = 'Brand' | 'Product' | 'Web' | 'Motion' | 'Game';
export type Status = 'shipped' | 'wip';

/** One screenshot on a case-study page. */
export interface Shot {
  src: ImageMetadata;
  /** What the screen shows, for screen readers and image search. */
  alt: string;
  /** The line printed under it. */
  caption?: string;
  es?: { alt?: string; caption?: string };
}

/** A film of the product, one cut per language, served from public/. The page plays the
 *  reader's: /work/… the English cut, /es/work/… the Spanish one. */
export interface Film {
  /** Its length, for the label. */
  seconds: number;
  /** Per language: an H.264 MP4 and its poster (the first thing a visitor sees). */
  sources: Record<Lang, { mp4: string; poster: string }>;
  /** What happens in it, for screen readers. The films are silent: the story is on screen. */
  alt: string;
  caption?: string;
  es?: { alt?: string; caption?: string };
}

/** A few silent seconds of the product moving, one cut per language, served from public/.
 *  It plays like the film, while in view, and a press pauses it. */
export interface Loop {
  /** Per language: an H.264 MP4 and its poster. */
  sources: Record<Lang, { mp4: string; poster: string }>;
  /** Its size in pixels, so the page keeps its place before it loads. */
  width: number;
  height: number;
  /** What moves in it, for screen readers. */
  alt: string;
  caption?: string;
  /** Across the chapter's full width, rather than one of its columns. */
  wide?: boolean;
  es?: { alt?: string; caption?: string };
}

/** Screenshots from one part of a product, shown under one heading. */
export interface Chapter {
  /** The anchor the page's chapter links jump to. */
  id: string;
  /** Without one, the shots follow the page's hero with no heading of their own. */
  title?: string;
  intro?: string;
  shots: Shot[];
  /** Loops of the part in motion, after its shots. */
  loops?: Loop[];
  es?: { title?: string; intro?: string };
}

export interface Project {
  slug: string;
  title: string;
  client: string;
  category: Category;
  status: Status;
  year: number;
  video?: boolean;
  cover: {
    kind: 'image'; src: ImageMetadata; alt: string; fit?: 'cover' | 'contain'; bg?: string;
    /** Renders are transparent, so the house pattern sits behind them. */
    pattern?: { seed: number; palette: string[] };
  };
  /** The case study's lead screenshot, full width under the title. Without one the cover stands in. */
  hero?: Shot;
  /** Shown in the hero's place while the site is in its dark theme. */
  heroDark?: Shot;
  /** The rest of the screenshots, grouped the way the product is. */
  chapters?: Chapter[];
  /** Plays after the overview, before the screenshots. */
  film?: Film;
  url?: string;
  /** One line under the card title: what this is, before anyone opens it. */
  summary: string;
  /** Case-study fields. Only what the work supports, no invented metrics. */
  scope?: string;
  highlights?: string[];
  description: string;
  tags: string[];
  /** The Spanish for every word above that a reader sees. Anything left out stays English.
   *  Screenshots and chapters carry their Spanish beside the English instead. */
  es?: {
    summary?: string; scope?: string; description?: string; highlights?: string[]; tags?: string[];
    coverAlt?: string;
  };
}

export const projects: Project[] = [
  {
    slug: 'plazuela', title: 'Plazuela', client: 'Plazuela', category: 'Web', status: 'shipped', year: 2026,
    cover: { kind: 'image', src: img('plazuela/hero-light'), alt: "Plazuela's 3D town in a desktop browser, with a phone showing a storefront visit", fit: 'contain', bg: '#ffffff', pattern: { seed: 17, palette: ['#8898ff', '#ffb020', '#ff6b1a'] } },
    /* Captured from the app's demo mode, light theme. The café in the publish flow,
       Tostadores del Parque, is made up for the screenshots. */
    hero: {
      src: img('plazuela/hero-light'),
      alt: "Plazuela's 3D town in a desktop browser, with a phone showing a storefront visit",
      caption: 'The town on a desktop, and a storefront on a phone',
      es: {
        alt: 'El pueblo 3D de Plazuela en un navegador de escritorio, con un celular que muestra la visita a un local',
        caption: 'El pueblo en el computador y un local en el celular',
      },
    },
    chapters: [
      {
        id: 'town',
        title: 'The town',
        intro: 'A 3D pueblo where every numbered building is a business. Open one, walk its streets, or read the same businesses as a list.',
        es: {
          title: 'El pueblo',
          intro: 'Un pueblo en 3D donde cada edificio numerado es un negocio. Abre uno, recorre sus calles o mira los mismos negocios en una lista.',
        },
        shots: [
          {
            src: img('plazuela/desktop-light/town'),
            alt: 'Plazuela 3D town around a plaza with a church, numbered markers on the buildings and an open spot offered from USD 10',
            caption: 'The board: every numbered building is a business, and number 10 is still open',
            es: {
              alt: 'El pueblo 3D de Plazuela alrededor de una plaza con iglesia, marcadores numerados en los edificios y un puesto libre desde USD 10',
              caption: 'El tablero: cada edificio numerado es un negocio, y el 10 sigue libre',
            },
          },
          {
            src: img('plazuela/desktop-light/storefront'),
            alt: "Street-level view of a pink restaurant storefront with its sign, and a side panel with the business's description, hours, address and Instagram link",
            caption: 'A storefront visit: the business up close, with its details beside it',
            es: {
              alt: 'Vista a nivel de calle de la fachada rosada de un restaurante con su letrero, y un panel lateral con la descripción, el horario, la dirección y el enlace a Instagram',
              caption: 'La visita a un local: el negocio de cerca, con sus datos al lado',
            },
          },
          {
            src: img('plazuela/desktop-light/walk'),
            alt: 'Street-level walk up to a pink restaurant storefront, with neighbors on the cobblestones and a card to open the storefront or its Instagram',
            caption: "Walking the streets, right up to a business's door",
            es: {
              alt: 'Paseo a nivel de calle hasta la fachada rosada de un restaurante, con vecinos en el empedrado y una tarjeta para abrir el local o su Instagram',
              caption: 'Paseando por las calles, hasta la puerta de un negocio',
            },
          },
          {
            src: img('plazuela/desktop-light/directory'),
            alt: 'Plazuela directory below the town: a news bar of recent payments, a search box, category filters and a card for each business with its rank',
            caption: 'Below the town: news, search, categories and every business',
            es: {
              alt: 'Directorio de Plazuela debajo del pueblo: una barra de novedades con pagos recientes, un buscador, filtros por categoría y una tarjeta por negocio con su puesto',
              caption: 'Debajo del pueblo: novedades, búsqueda, categorías y todos los negocios',
            },
          },
          {
            src: img('plazuela/desktop-light/list'),
            alt: "Plazuela ranking as a table, with each business's rank, Instagram visits and total approved in USD",
            caption: 'The same ranking as a list, ordered by approved total',
            es: {
              alt: 'El ranking de Plazuela en una tabla, con el puesto de cada negocio, las visitas a Instagram y el total aprobado en USD',
              caption: 'El mismo ranking en lista, ordenado por total aprobado',
            },
          },
        ],
      },
      {
        id: 'businesses',
        title: 'For businesses',
        intro: 'What a business sees: the offer, a three-step checkout, its own page and a shop to decorate its storefront.',
        es: {
          title: 'Para negocios',
          intro: 'Lo que ve un negocio: la oferta, un pago en tres pasos, su propia página y una tienda para decorar su local.',
        },
        shots: [
          {
            src: img('plazuela/desktop-light/for-businesses'),
            alt: 'Plazuela page for businesses: a headline, the offer from USD 10 with a free account and no subscription, and a real storefront on film',
            caption: 'The offer: a storefront in the town from USD 10, one payment with a free account',
            es: {
              alt: 'Página de Plazuela para negocios: un titular, la oferta desde USD 10 con cuenta gratis y sin suscripción, y un local real en video',
              caption: 'La oferta: un local en el pueblo desde USD 10, un solo pago con cuenta gratis',
            },
          },
          {
            src: img('plazuela/desktop-light/publish-profile'),
            alt: 'Publish dialog, profile step, filled in for a sample café with its Instagram handle, name, one-line description, category and photo',
            caption: "Step 1: the business's Instagram, name, one line, category and photo",
            es: {
              alt: 'Diálogo de publicación, paso de perfil, lleno para un café de ejemplo con su usuario de Instagram, nombre, descripción, categoría y foto',
              caption: 'Paso 1: el Instagram del negocio, su nombre, una frase, su categoría y su foto',
            },
          },
          {
            src: img('plazuela/desktop-light/publish-position'),
            alt: 'Publish dialog, position step: quick options, the amount in USD and the projected rank by category, city, department and country',
            caption: 'Step 2: choose how far to move up, and see the projected rank first',
            es: {
              alt: 'Diálogo de publicación, paso de posición: opciones rápidas, el monto en USD y el puesto proyectado por categoría, ciudad, departamento y país',
              caption: 'Paso 2: elegir cuánto subir y ver antes el puesto proyectado',
            },
          },
          {
            src: img('plazuela/desktop-light/publish-style'),
            alt: 'Publish dialog with six storefront styles and a 3D preview of the chosen facade',
            caption: "Choosing the storefront's style, previewed in 3D",
            es: {
              alt: 'Diálogo de publicación con seis estilos de local y una vista previa en 3D de la fachada elegida',
              caption: 'Elegir el estilo del local, con vista previa en 3D',
            },
          },
          {
            src: img('plazuela/desktop-light/publish-pay'),
            alt: 'Publish dialog, payment review: the handle, the chosen style, the charge in USD, what the payment is and is not, and who processes it',
            caption: 'Step 3: the exact charge and what it buys, before Stripe',
            es: {
              alt: 'Diálogo de publicación, revisión del pago: el usuario, el estilo elegido, el cobro en USD, qué es y qué no es el pago, y quién lo procesa',
              caption: 'Paso 3: el cobro exacto y lo que compra, antes de Stripe',
            },
          },
          {
            src: img('plazuela/desktop-light/business-page'),
            alt: 'Plazuela page for a café: its name, category, city and description, a 3D view of its storefront and a card to plan a visit',
            caption: "A business's own page, with its storefront from the town",
            es: {
              alt: 'Página de Plazuela de un café: su nombre, categoría, ciudad y descripción, una vista 3D de su local y una tarjeta para planear la visita',
              caption: 'La página de un negocio, con su local del pueblo',
            },
          },
          {
            src: img('plazuela/desktop-light/shop'),
            alt: 'Plazuela storefront shop with decoration cards and a 3D preview of a storefront with a coffee cup by the door',
            caption: "The storefront shop: decorations tried on the business's own facade",
            es: {
              alt: 'Tienda de fachadas de Plazuela con tarjetas de decoraciones y una vista 3D de un local con una taza de café junto a la puerta',
              caption: 'La tienda de fachadas: decoraciones que se prueban en el propio local',
            },
          },
        ],
      },
      {
        id: 'phone',
        title: 'On a phone',
        intro: 'The town fills the phone, with the publish button always within reach.',
        es: {
          title: 'En el celular',
          intro: 'El pueblo llena el celular, con el botón para publicar siempre a mano.',
        },
        shots: [
          {
            src: img('plazuela/mobile-light/town'),
            alt: 'Plazuela town on a phone with numbered buildings, map controls and a publish button at the bottom',
            caption: 'The town, upright',
            es: {
              alt: 'El pueblo de Plazuela en un celular con edificios numerados, controles del mapa y un botón para publicar abajo',
              caption: 'El pueblo, en vertical',
            },
          },
          {
            src: img('plazuela/mobile-light/storefront'),
            alt: 'A restaurant storefront on a phone, with its details in a sheet below',
            caption: 'A storefront visit, with its details in a sheet',
            es: {
              alt: 'La fachada de un restaurante en un celular, con sus datos en un panel abajo',
              caption: 'La visita a un local, con sus datos en un panel',
            },
          },
          {
            src: img('plazuela/mobile-light/menu'),
            alt: "Plazuela menu on a phone with sign-in and links to the town, how it works, advertising, the business page, the storefront shop, the founders and Plazuela's story",
            caption: 'The menu: the town, the business side and Plazuela itself',
            es: {
              alt: 'Menú de Plazuela en un celular con el ingreso y enlaces al pueblo, cómo funciona, publicidad, la página del negocio, la tienda de fachadas, los fundadores y la historia de Plazuela',
              caption: 'El menú: el pueblo, la parte para negocios y Plazuela',
            },
          },
          {
            src: img('plazuela/mobile-light/list'),
            alt: 'Plazuela list view on a phone with search, filters and the open spot offer above the ranking',
            caption: 'The ranking as a list',
            es: {
              alt: 'Vista de lista de Plazuela en un celular con búsqueda, filtros y la oferta del puesto libre sobre el ranking',
              caption: 'El ranking en lista',
            },
          },
          {
            src: img('plazuela/mobile-light/business-page'),
            alt: "A café's Plazuela page on a phone with its description and a 3D view of its storefront",
            caption: "A business's page",
            es: {
              alt: 'La página de Plazuela de un café en un celular con su descripción y una vista 3D de su local',
              caption: 'La página de un negocio',
            },
          },
          {
            src: img('plazuela/mobile-light/publish'),
            alt: 'The publish form on a phone, filled in for a sample café',
            caption: 'Publishing from a phone',
            es: {
              alt: 'El formulario para publicar en un celular, lleno para un café de ejemplo',
              caption: 'Publicar desde el celular',
            },
          },
          {
            src: img('plazuela/mobile-light/shop'),
            alt: 'A storefront with a coffee cup decoration previewed in 3D on a phone',
            caption: 'A decoration, previewed on the storefront',
            es: {
              alt: 'Un local con la decoración de una taza de café en vista 3D en un celular',
              caption: 'Una decoración, vista sobre el local',
            },
          },
        ],
      },
    ],
    film: {
      seconds: 27,
      sources: {
        en: { mp4: '/work/plazuela/film-en.mp4', poster: '/work/plazuela/film-en.webp' },
        es: { mp4: '/work/plazuela/film-es.mp4', poster: '/work/plazuela/film-es.webp' },
      },
      alt: "Plazuela's film: the logo builds itself and its sun rises, the camera flies over the 3D town at dawn and down a street, a phone opens a storefront and publishes a business from USD 10, and the town turns from dusk to night.",
      caption: 'A silent film made from the app itself, for the site and for social media. Sample businesses.',
      es: {
        alt: 'El video de Plazuela: el logo se arma solo y sale su sol, la cámara vuela sobre el pueblo 3D al amanecer y baja por una calle, un celular abre un local y publica un negocio desde USD 10, y el pueblo pasa del atardecer a la noche.',
        caption: 'Un video sin sonido hecho con la propia app, para el sitio y las redes sociales. Negocios de ejemplo.',
      },
    },
    url: 'https://www.plazuela.app/',
    scope: 'Brand, product design, web, build',
    highlights: [
      "An isometric town where every building is a real business you can open",
      "Public business pages with category, city and a direct line to the owner",
      "Self-serve listing from USD 10 in one payment, ranked on the board by total paid",
      "A plain list view for anyone who'd rather not stroll",
      "Live at plazuela.app",
    ],
    summary: "A business directory for Colombia, drawn as a town you can walk through.",
    description: "A directory of local businesses in Colombia, except the directory is a town. Every building is a real business; open the door and you're talking to the owner. You can buy your own building too: one payment from USD 10, with a free account and no subscription.",
    tags: ['web design', 'product design', 'branding', 'marketplace', 'colombia', 'next.js'],
    es: {
      summary: 'Un directorio de negocios en Colombia, dibujado como un pueblo que puedes recorrer.',
      scope: 'Marca, diseño de producto, web, desarrollo',
      description: 'Un directorio de negocios locales en Colombia, solo que el directorio es un pueblo. Cada edificio es un negocio real; abres la puerta y estás hablando con el dueño. También puedes tener tu propio edificio: un solo pago desde USD 10, con cuenta gratis y sin suscripción.',
      highlights: [
        'Un pueblo isométrico donde cada edificio es un negocio real que puedes abrir',
        'Páginas públicas de cada negocio con categoría, ciudad y contacto directo con el dueño',
        'Publicación por cuenta propia desde USD 10 en un solo pago, con el puesto en el tablero según el total pagado',
        'Una vista de lista para quien prefiere no pasear',
        'En vivo en plazuela.app',
      ],
      tags: ['diseño web', 'diseño de producto', 'marca', 'marketplace', 'colombia', 'next.js'],
      coverAlt: 'El pueblo 3D de Plazuela en un navegador de escritorio, con un celular que muestra la visita a un local',
    },
  },
  {
    slug: 'petzone', title: 'Petzone', client: 'Petzone', category: 'Product', status: 'shipped', year: 2026,
    cover: { kind: 'image', src: img('petzone/cover'), alt: "Dasha, Petzone's 3D kitten, waving in front of Petzone Home on a desktop browser and on a phone", fit: 'contain', bg: '#ffffff', pattern: { seed: 41, palette: ['#ff6b1a', '#ffb020', '#101010'] } },
    /* Captured from the app's demo mode, in its showcase store: the customers, orders and
       sales are sample data. Captions and alt text describe the screen, never the people on
       it, so no customer's name or address ends up in the page's text. The hero is the
       desktop and the phone together, in whichever theme the site is showing. */
    hero: {
      src: img('petzone/hero-light'),
      alt: 'Petzone Home on a desktop browser and on a phone, in the light theme',
      caption: 'Home, on a desktop and on a phone',
      es: {
        alt: 'Inicio de Petzone en un navegador de escritorio y en un celular, en el tema claro',
        caption: 'El inicio, en el computador y en el celular',
      },
    },
    heroDark: {
      src: img('petzone/hero-dark'),
      alt: 'Petzone register with a ticket, on a desktop browser and on a phone, in the dark theme',
      caption: 'The register in the dark theme, on a desktop and on a phone',
      es: {
        alt: 'Caja de Petzone con un ticket, en un navegador de escritorio y en un celular, en el tema oscuro',
        caption: 'La caja en el tema oscuro, en el computador y en el celular',
      },
    },
    chapters: [
      {
        id: 'home',
        title: 'Home and setup',
        intro: "Home opens on the day: money collected, orders to prepare and balances to collect, under a box to ask Dasha, the store's assistant. A new store sees its setup there instead, one card per step, each with a 3D scene that moves under the cursor.",
        es: {
          title: 'Inicio y configuración',
          intro: 'El inicio abre con el día: el dinero cobrado, los pedidos por preparar y los saldos por cobrar, bajo un cuadro para preguntarle a Dasha, la asistente de la tienda. Una tienda nueva ve ahí su configuración, una tarjeta por paso, cada una con una escena 3D que se mueve al pasar el cursor.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/home'),
            alt: "Petzone Home: the date and a greeting, a box to ask the store's AI assistant with suggested questions, and cards for today's sales, open orders and balances to collect",
            caption: "Home: ask the assistant, or start from today's sales, open orders and balances",
            es: {
              alt: 'Inicio de Petzone: la fecha y un saludo, un cuadro para preguntarle al asistente de IA de la tienda con preguntas sugeridas, y tarjetas de las ventas de hoy, los pedidos abiertos y los saldos por cobrar',
              caption: 'Inicio: pregúntale al asistente, o empieza por las ventas de hoy, los pedidos abiertos y los saldos',
            },
          },
          {
            src: img('petzone/desktop-light/home-setup'),
            alt: "Petzone Home for a new store: seven setup cards, each with a 3D cover, from the store's details, products and prices to stock, the cash drawer, QR payments and operator access",
            caption: "A new store's Home: every setup step is a card with its own 3D scene",
            es: {
              alt: 'Inicio de Petzone para una tienda nueva: siete tarjetas de configuración, cada una con una portada 3D, desde los datos de la tienda, los productos y los precios hasta las existencias, la caja de efectivo, los pagos por QR y el acceso de operadores',
              caption: 'El inicio de una tienda nueva: cada paso de la configuración es una tarjeta con su propia escena 3D',
            },
          },
          {
            src: img('petzone/desktop-light/dasha'),
            alt: "Petzone with Dasha's panel open beside Orders: her face, 'Where should we begin?', questions to start from (this week's sales, what's running low, orders to deliver, today's drawer, refills) and a box to ask her",
            caption: "Dasha, the store's assistant, answers from the store's own records: sales, stock, customers and the drawer",
            es: {
              alt: 'Petzone con el panel de Dasha abierto junto a Pedidos: su cara, «¿Por dónde empezamos?», preguntas para empezar (las ventas de la semana, lo que se está acabando, los pedidos por entregar, la caja de hoy, las recompras) y un cuadro para preguntarle',
              caption: 'Dasha, la asistente de la tienda, responde con los registros de la propia tienda: ventas, existencias, clientes y la caja',
            },
          },
        ],
        loops: [
          {
            sources: cuts('petzone/loops/store'), width: 724, height: 632,
            alt: 'The Store and receipt details card: the cursor comes in and a receipt prints beside the 3D shop',
            caption: 'Store and receipt details: the receipt prints',
            es: {
              alt: 'La tarjeta Datos de tienda y recibos: llega el cursor y se imprime un recibo junto a la tienda 3D',
              caption: 'Datos de tienda y recibos: el recibo se imprime',
            },
          },
          {
            sources: cuts('petzone/loops/catalog'), width: 724, height: 632,
            alt: 'The Products and presentations card: under the cursor, a treat hops beside a bag of kibble and a can of pâté',
            caption: 'Products and presentations: the treat hops',
            es: {
              alt: 'La tarjeta Productos y presentaciones: bajo el cursor, un snack salta junto a una bolsa de croquetas y una lata de paté',
              caption: 'Productos y presentaciones: el snack salta',
            },
          },
          {
            sources: cuts('petzone/loops/pricing'), width: 724, height: 632,
            alt: "The Prices and costs card: under the cursor, the price tag swings from a shopping bag's handle, beside a calculator and coins",
            caption: 'Prices and costs: the tag swings',
            es: {
              alt: 'La tarjeta Precios y costos: bajo el cursor, la etiqueta de precio se balancea colgada del asa de una bolsa, junto a una calculadora y unas monedas',
              caption: 'Precios y costos: la etiqueta se balancea',
            },
          },
          {
            sources: cuts('petzone/loops/cash'), width: 724, height: 632,
            alt: 'The Cash opening card: under the cursor, a coin flips beside an open cash box of notes',
            caption: 'Cash opening: the coin flips',
            es: {
              alt: 'La tarjeta Apertura de efectivo: bajo el cursor, una moneda gira junto a una caja de efectivo abierta con billetes',
              caption: 'Apertura de efectivo: la moneda gira',
            },
          },
          {
            sources: cuts('petzone/loops/dismiss'), width: 2112, height: 1232, wide: true,
            alt: "Home's setup cards: the Operator access card closes with its X, and Show 1 hidden card brings it back",
            caption: "A step can wait: close its card, and bring it back when you're ready",
            es: {
              alt: 'Las tarjetas de configuración del inicio: la tarjeta Acceso de operadores se cierra con su X y Mostrar 1 tarjeta oculta la trae de vuelta',
              caption: 'Un paso puede esperar: cierra su tarjeta y tráela de vuelta cuando quieras',
            },
          },
        ],
      },
      {
        id: 'point-of-sale',
        title: 'Point of sale',
        intro: "A sale from the first scan to the receipt on WhatsApp, then the day's tickets and the cash drawer.",
        es: {
          title: 'Punto de venta',
          intro: 'Una venta desde el primer escaneo hasta el recibo por WhatsApp y, después, los tickets de hoy y la jornada de caja.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/register'),
            alt: 'Petzone register: product tiles with their prices to scan or search, and a three-item ticket for a customer and their pet, with a pending balance flagged, a discount code applied and the total to charge',
            caption: 'The register: a ticket for a customer and their pet, with a code taken off before charging',
            es: {
              alt: 'Caja de Petzone: tarjetas de producto con su precio para escanear o buscar, y un ticket de tres productos para un cliente y su mascota, con un saldo pendiente señalado, un código de descuento aplicado y el total a cobrar',
              caption: 'La caja: un ticket para un cliente y su mascota, con un código descontado antes de cobrar',
            },
          },
          {
            src: img('petzone/desktop-light/variant-picker'),
            alt: "Petzone variant picker over the register for Agility Gold cats: two sizes with their prices, and the chosen size's SKU, price and stock",
            caption: 'Picking a size before it goes on the ticket',
            es: {
              alt: 'Selector de variantes de Petzone sobre la caja para Agility Gold cats: dos tamaños con su precio, y la referencia, el precio y la disponibilidad del tamaño elegido',
              caption: 'Elegir el tamaño antes de agregarlo al ticket',
            },
          },
          {
            src: img('petzone/desktop-light/paid'),
            alt: 'Petzone payment recorded: the total paid in cash, an exact payment, a button for the next sale, and the receipt to share on WhatsApp or print',
            caption: 'Paid: send the receipt on WhatsApp or print it, and Enter starts the next sale',
            es: {
              alt: 'Pago registrado en Petzone: el total pagado en efectivo, un pago exacto, un botón para la siguiente venta y el recibo para compartir por WhatsApp o imprimir',
              caption: 'Pagado: envía el recibo por WhatsApp o imprímelo, y Enter empieza la siguiente venta',
            },
          },
          {
            src: img('petzone/desktop-light/todays-tickets'),
            alt: "Petzone today's tickets: net sales, money collected, money refunded and the outstanding balance above the day's tickets",
            caption: "Today's tickets: sales, money collected, refunds and what's still owed",
            es: {
              alt: 'Tickets de hoy en Petzone: ventas netas, dinero cobrado, dinero devuelto y saldo pendiente sobre los tickets del día',
              caption: 'Tickets de hoy: ventas, dinero cobrado, devoluciones y lo que falta por cobrar',
            },
          },
          {
            src: img('petzone/desktop-light/cash-drawer'),
            alt: 'Petzone cash drawer, open, in three steps (open, sell, close), with the opening float, the net cash movement and the cash expected in the drawer',
            caption: 'The cash drawer: open it, sell, then count the cash once at close',
            es: {
              alt: 'Jornada de caja de Petzone abierta, en tres pasos (abrir, vender, cerrar), con el fondo de apertura, el movimiento neto de efectivo y el efectivo esperado en el cajón',
              caption: 'La jornada de caja: abrirla, vender y contar el efectivo una sola vez al cerrar',
            },
          },
        ],
      },
      {
        id: 'orders',
        title: 'Orders and customers',
        intro: 'Every sale and order in one list, the orders still to prepare or collect, and customers with their pets and what they usually buy.',
        es: {
          title: 'Pedidos y clientes',
          intro: 'Cada venta y pedido en una sola lista, los pedidos que faltan por preparar o cobrar, y los clientes con sus mascotas y lo que suelen comprar.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/orders'),
            alt: "Petzone orders: today's orders, items, returns, orders prepared and orders delivered above a table of receipts with customer, date, net total, payment and status, one of them still to collect",
            caption: 'Orders: every sale and order, with its payment and delivery',
            es: {
              alt: 'Pedidos de Petzone: los pedidos, los artículos, las devoluciones y los pedidos preparados y entregados de hoy sobre una tabla de recibos con cliente, fecha, total neto, pago y estado, uno de ellos por cobrar',
              caption: 'Pedidos: cada venta y pedido, con su pago y su entrega',
            },
          },
          {
            src: img('petzone/desktop-light/order'),
            alt: 'Petzone delivery order, being prepared with its payment pending: two products, the balance due, buttons to mark it ready or delivered and to record the collection, and the customer, their pet and the delivery beside it',
            caption: 'A delivery order, paid for when it arrives',
            es: {
              alt: 'Pedido a domicilio de Petzone en preparación, con el pago pendiente: dos productos, el saldo por cobrar, botones para marcarlo listo o entregado y para registrar el cobro, y al lado el cliente, su mascota y la entrega',
              caption: 'Un pedido a domicilio que se paga al recibirlo',
            },
          },
          {
            src: img('petzone/desktop-light/customers'),
            alt: 'Petzone customers: a query bar above the list of customers with phone, pets, last purchase and balance, and a next step beside many of them: collect a balance or restock a pet',
            caption: 'Customers: their pets, their balance and what to do next',
            es: {
              alt: 'Clientes de Petzone: una barra de consulta sobre la lista de clientes con teléfono, mascotas, última compra y saldo, y un siguiente paso junto a muchos de ellos: cobrar un saldo o reponerle algo a una mascota',
              caption: 'Clientes: sus mascotas, su saldo y lo que sigue',
            },
          },
          {
            src: img('petzone/desktop-light/customer'),
            alt: 'Petzone customer record: last paid purchase, number of purchases and outstanding balance, a next step to collect for a reserved order, their usual purchases and recent activity',
            caption: "A customer's record: what they owe, what they usually buy and what happened last",
            es: {
              alt: 'Ficha de cliente de Petzone: última compra pagada, número de compras y saldo pendiente, un siguiente paso para cobrar un pedido apartado, sus compras habituales y su actividad reciente',
              caption: 'La ficha de un cliente: lo que debe, lo que suele comprar y lo último que pasó',
            },
          },
          {
            src: img('petzone/desktop-light/refills'),
            alt: "Petzone refills: pets due to restock a product, with the last purchase, how often it's bought and the estimated refill date, and buttons to repeat the purchase or draft a WhatsApp message",
            caption: 'Refills: when each pet is likely to need more, with a WhatsApp message drafted',
            es: {
              alt: 'Recompras en Petzone: mascotas a las que les toca reponer un producto, con la última compra, cada cuánto se compra y la fecha estimada, y botones para repetir la compra o preparar un mensaje de WhatsApp',
              caption: 'Recompras: cuándo es probable que cada mascota necesite más, con un mensaje de WhatsApp listo',
            },
          },
        ],
      },
      {
        id: 'products',
        title: 'Products and discounts',
        intro: 'Every package with its price, cost, stock and lots, a page for each product, and discounts the register applies on its own.',
        es: {
          title: 'Productos y descuentos',
          intro: 'Cada empaque con su precio, costo, existencias y lotes, una página para cada producto y descuentos que la caja aplica sola.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/products'),
            alt: 'Petzone products: sell-through, days of inventory and an ABC analysis above the list of products with size, stock available and committed, sale price, and a reorder button on those out of stock',
            caption: 'Products: what sells, what runs out soon and what to reorder',
            es: {
              alt: 'Productos de Petzone: tasa de venta, días de inventario y un análisis ABC sobre la lista de productos con tamaño, unidades disponibles y comprometidas, precio de venta y un botón para volver a pedir los agotados',
              caption: 'Productos: lo que se vende, lo que se acaba pronto y lo que hay que volver a pedir',
            },
          },
          {
            src: img('petzone/desktop-light/product'),
            alt: 'Petzone product page for a dog food: size and photo, sale price and cost with the profit and margin, stock in the store with buttons to adjust it, SKU and barcode, and its recent sales beside them',
            caption: 'A product page: price and margin, stock, codes and recent sales, saved as you type',
            es: {
              alt: 'Página de producto de Petzone para un alimento para perro: tamaño y foto, precio de venta y costo con la ganancia y el margen, existencias en la tienda con botones para ajustarlas, referencia y código de barras, y al lado sus ventas recientes',
              caption: 'La página de un producto: precio y margen, existencias, códigos y ventas recientes, guardados mientras escribes',
            },
          },
          {
            src: img('petzone/desktop-light/variants'),
            alt: "Petzone product page for a cat food in two sizes: its lots with their expiry dates, each variant's SKU, price and stock, and how it's bought from the supplier",
            caption: 'Variants and lots: each size with its own SKU, price and stock, and each lot with its expiry',
            es: {
              alt: 'Página de producto de Petzone para un alimento para gato en dos tamaños: sus lotes con la fecha de vencimiento, la referencia, el precio y las existencias de cada variante, y cómo se le compra al proveedor',
              caption: 'Variantes y lotes: cada tamaño con su referencia, precio y existencias, y cada lote con su vencimiento',
            },
          },
          {
            src: img('petzone/desktop-light/inventory'),
            alt: 'Petzone inventory: each product and SKU with its units committed, available, on hand and incoming, and a button to receive inventory',
            caption: "Inventory: what's in the store, what open orders hold and what's on its way",
            es: {
              alt: 'Inventario de Petzone: cada producto y referencia con sus unidades comprometidas, disponibles, en tienda y en camino, y un botón para recibir inventario',
              caption: 'Inventario: lo que hay en la tienda, lo que apartan los pedidos abiertos y lo que viene en camino',
            },
          },
          {
            src: img('petzone/desktop-light/new-product'),
            alt: 'Petzone add product page: name, size, photo, sale price and cost per unit, the stock in the store, and its type, species and supplier',
            caption: "A new product on a page of its own. Its stock can wait until it's received",
            es: {
              alt: 'Página para agregar un producto en Petzone: nombre, tamaño, foto, precio de venta y costo por unidad, las existencias en la tienda, y su tipo, especie y proveedor',
              caption: 'Un producto nuevo en su propia página. Sus existencias pueden esperar a que llegue',
            },
          },
          {
            src: img('petzone/desktop-light/discounts'),
            alt: 'Petzone discounts: codes and automatic discounts with their status and type, from an amount off the order or off products to buy one, get one free and free delivery over an amount, one of them scheduled',
            caption: 'Discounts: with a code or automatic, active or scheduled',
            es: {
              alt: 'Descuentos de Petzone: códigos y descuentos automáticos con su estado y tipo, desde un descuento en el pedido o en productos hasta compra uno y lleva otro gratis y domicilio gratis desde un monto, uno de ellos programado',
              caption: 'Descuentos: con código o automáticos, activos o programados',
            },
          },
          {
            src: img('petzone/desktop-light/discount'),
            alt: 'Petzone buy X get Y discount: a code or an automatic method, what the customer buys and what they get, with a summary beside it',
            caption: 'Buy X get Y, set up on its own page',
            es: {
              alt: 'Descuento Compra X, lleva Y en Petzone: con código o automático, lo que el cliente compra y lo que se lleva, con un resumen al lado',
              caption: 'Compra X, lleva Y, configurado en su propia página',
            },
          },
        ],
      },
      {
        id: 'reports',
        title: 'Reports, purchasing and payments',
        intro: 'How the store is doing, stock ordered from suppliers and received against the order, and every account the money lands in.',
        es: {
          title: 'Reportes, compras y pagos',
          intro: 'Cómo va la tienda, el inventario que se les pide a los proveedores y se recibe contra la orden, y cada cuenta a la que llega el dinero.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/reports'),
            alt: 'Petzone reports over 30 days: net sales, gross profit, completed tickets and customer balances, sales over time against the period before, and what needs attention',
            caption: 'Reports: sales, profit and balances, and what needs attention',
            es: {
              alt: 'Reportes de Petzone en 30 días: ventas netas, ganancia bruta, tickets completados y saldos de clientes, las ventas en el tiempo frente al periodo anterior y lo que necesita atención',
              caption: 'Reportes: ventas, ganancia y saldos, y lo que necesita atención',
            },
          },
          {
            src: img('petzone/desktop-light/purchasing'),
            alt: 'Petzone purchase orders: an order sent to a supplier and ready to receive, and the inventory on its way from two more, with their expected delivery dates',
            caption: "Purchase orders: what to receive today and what's on its way",
            es: {
              alt: 'Órdenes de compra de Petzone: una orden enviada a un proveedor y lista para recibir, y el inventario en camino de otros dos, con su fecha de entrega esperada',
              caption: 'Órdenes de compra: lo que hay que recibir hoy y lo que viene en camino',
            },
          },
          {
            src: img('petzone/desktop-light/purchase-order'),
            alt: 'Petzone purchase order, sent: three products ordered and none received yet, with their cost, the supplier and expected delivery beside them, and a button to receive inventory',
            caption: 'A purchase order: ordered, received and still in transit',
            es: {
              alt: 'Orden de compra de Petzone, enviada: tres productos pedidos y ninguno recibido aún, con su costo, y al lado el proveedor y la entrega esperada, con un botón para recibir inventario',
              caption: 'Una orden de compra: lo pedido, lo recibido y lo que sigue en camino',
            },
          },
          {
            src: img('petzone/desktop-light/cash'),
            alt: 'Petzone payments: the cash drawer, a bank and a wallet with what each should hold and when it was last confirmed, card payments waiting to settle, and recent activity',
            caption: 'Payments: what each account should hold, and card payments still to settle',
            es: {
              alt: 'Pagos de Petzone: la caja, un banco y una billetera con lo que debería haber en cada una y cuándo se confirmó por última vez, pagos con tarjeta por liquidar y la actividad reciente',
              caption: 'Pagos: lo que debería haber en cada cuenta y los pagos con tarjeta por liquidar',
            },
          },
          {
            src: img('petzone/desktop-light/settings'),
            alt: "Petzone settings, General: the store's name, tax ID, phone and address that appear on every receipt, and its currency and time zone, which stay fixed",
            caption: 'Settings: the details on every receipt, and a currency and time zone that stay fixed',
            es: {
              alt: 'Configuración de Petzone, General: el nombre, el NIT, el teléfono y la dirección de la tienda que salen en cada recibo, y su moneda y su zona horaria, que no cambian',
              caption: 'Configuración: los datos de cada recibo, y una moneda y una zona horaria que no cambian',
            },
          },
        ],
      },
      {
        id: 'empty',
        title: 'Empty pages, with Dasha',
        intro: "A page with nothing in it yet shows Dasha, the store's tabby kitten, in a scene of its own: the register with no products, orders before the first sale, customers, discounts, lots, the 404. Twenty-one in all. Point at her and she moves.",
        es: {
          title: 'Páginas vacías, con Dasha',
          intro: 'Una página que todavía no tiene nada muestra a Dasha, la gatita atigrada de la tienda, en una escena propia: la caja sin productos, los pedidos antes de la primera venta, los clientes, los descuentos, los lotes, el 404. Veintiuna en total. Pasa el cursor y se mueve.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/empty-orders'),
            alt: 'Petzone orders before the first sale: Dasha beside a Petzone shopping bag, batting at the receipt curling out of it, above "Your orders will show up here" and a button for a new order',
            caption: 'Orders, before the first sale',
            es: {
              alt: 'Pedidos de Petzone antes de la primera venta: Dasha junto a una bolsa de Petzone, dándole un manotazo al recibo que sale de ella, sobre «Aquí verás tus pedidos» y un botón para un pedido nuevo',
              caption: 'Pedidos, antes de la primera venta',
            },
          },
          {
            src: img('petzone/desktop-light/empty-customers'),
            alt: 'Petzone customers before the first one: Dasha in a teal bandana high-fiving a puppy, a blank customer card at her chest, above buttons to add or import customers',
            caption: 'Customers: Dasha and the puppy from the logo',
            es: {
              alt: 'Clientes de Petzone antes del primero: Dasha con una pañoleta turquesa chocando la pata con un cachorro, una tarjeta de cliente en blanco en el pecho, sobre botones para agregar o importar clientes',
              caption: 'Clientes: Dasha y el cachorro del logo',
            },
          },
          {
            src: img('petzone/desktop-light/empty-register'),
            alt: "Petzone register with no products yet: Dasha sniffing a bag of kibble's barcode as a scanner's red beam crosses it, with buttons to create a product or charge an open item",
            caption: 'The register with nothing to sell yet: create a product, or charge an open item',
            es: {
              alt: 'Caja de Petzone sin productos todavía: Dasha olfateando el código de barras de una bolsa de croquetas mientras la cruza la luz roja de un lector, con botones para crear un producto o cobrar una línea libre',
              caption: 'La caja sin nada que vender todavía: crea un producto o cobra una línea libre',
            },
          },
          {
            src: img('petzone/desktop-light/empty-404'),
            alt: 'Petzone page not found: Dasha peeking out of a knocked-over empty box, above "There is nothing here" and a button back to Home',
            caption: 'A link that leads nowhere',
            es: {
              alt: 'Página no encontrada de Petzone: Dasha asomada desde una caja vacía volcada, sobre «Aquí no hay nada» y un botón para volver al inicio',
              caption: 'Un enlace que no lleva a ninguna parte',
            },
          },
        ],
        loops: [
          {
            sources: cuts('petzone/loops/empty-orders'), width: 760, height: 560,
            alt: 'The empty Orders page: the pointer finds Dasha and she bats at the receipt',
            caption: 'Orders: she bats at the receipt',
            es: { alt: 'La página de Pedidos vacía: el cursor encuentra a Dasha y le da un manotazo al recibo', caption: 'Pedidos: un manotazo al recibo' },
          },
          {
            sources: cuts('petzone/loops/empty-customers'), width: 760, height: 560,
            alt: 'The empty Customers page: Dasha and the puppy move as the pointer finds them',
            caption: 'Customers: a high five',
            es: { alt: 'La página de Clientes vacía: Dasha y el cachorro se mueven cuando los encuentra el cursor', caption: 'Clientes: un choque de patas' },
          },
          {
            sources: cuts('petzone/loops/empty-register'), width: 760, height: 560,
            alt: 'The register with no products: Dasha sniffs the barcode and blinks',
            caption: 'The register: a sniff and a blink',
            es: { alt: 'La caja sin productos: Dasha olfatea el código de barras y parpadea', caption: 'La caja: olfatea y parpadea' },
          },
          {
            sources: cuts('petzone/loops/empty-404'), width: 760, height: 560,
            alt: 'The 404 page: Dasha flicks an ear and blinks in her knocked-over box',
            caption: 'The 404: an ear flick',
            es: { alt: 'La página 404: Dasha mueve una oreja y parpadea en su caja volcada', caption: 'El 404: una oreja que se mueve' },
          },
          {
            sources: same('petzone/loops/scenes'), width: 1680, height: 750, wide: true,
            alt: 'Twenty-one 3D scenes of Dasha on one grid, one for each empty page, each playing its hover motion in turn: a shopping bag, a nap on a saved ticket, a shelf of kibble, a box, a high five with the puppy, a cash box, a barcode scanner, a receipt printer, a cash drawer, coins, a price tag, a hand truck, her bowl and a calendar, a lot crate, a gift, the 404 box, a bell, a staff badge, a shop sign, a delivery box and a pet tag',
            caption: 'Each scene keys one motion on her rig, played once on hover',
            es: {
              alt: 'Veintiuna escenas 3D de Dasha en una cuadrícula, una por cada página vacía, cada una haciendo su movimiento por turnos: una bolsa de compras, una siesta sobre un ticket guardado, un estante de croquetas, una caja, un choque de patas con el cachorro, una caja de efectivo, un lector de códigos, una impresora de recibos, un cajón de dinero, monedas, una etiqueta de precio, una carretilla, su plato y un calendario, un guacal de lote, un regalo, la caja del 404, una campana, una escarapela, un letrero de tienda, una caja de envío y una placa de mascota',
              caption: 'Cada escena tiene un movimiento sobre su esqueleto, que se reproduce una vez al pasar el cursor',
            },
          },
        ],
      },
      {
        id: '3d',
        title: 'Dasha in 3D',
        intro: "Dasha began as the owner's 2D drawings. Now she is built in Blender from code, with no hand-made file: a body from a signed-distance field, a groom of hair curves that follows her pose, eyes with lids that blink. Her coat is a Substance Designer graph rendered from its command line, the props wear Substance materials, and Rigify rigs her, so one model takes every pose. A puppy from the logo joins her.",
        es: {
          title: 'Dasha en 3D',
          intro: 'Dasha empezó como los dibujos 2D de la dueña. Ahora se construye en Blender con código, sin ningún archivo hecho a mano: un cuerpo a partir de un campo de distancias, un pelaje de curvas de pelo que sigue su pose, ojos con párpados que parpadean. Su pelaje es un grafo de Substance Designer que se renderiza desde la línea de comandos, los objetos llevan materiales de Substance y Rigify le arma el esqueleto, así que un solo modelo toma cualquier pose. La acompaña un cachorro del logo.',
        },
        shots: [
          {
            src: img('petzone/3d/poses'),
            alt: 'Dasha in six poses: sitting with an open smile, waving, standing with a customer card, peeking over a box, batting a ball of yarn and asleep',
            caption: 'One model, six poses from her pose library',
            es: {
              alt: 'Dasha en seis poses: sentada con una sonrisa abierta, saludando, de pie con una tarjeta de cliente, asomada sobre una caja, jugando con un ovillo de lana y dormida',
              caption: 'Un modelo, seis poses de su biblioteca de poses',
            },
          },
          {
            src: img('petzone/3d/turnaround'),
            alt: 'Dasha sitting, from the front, three-quarter, side and back: her bandit mask, white muzzle and chest, striped back and ringed tail',
            caption: 'The turnaround, rendered in Blender',
            es: {
              alt: 'Dasha sentada, de frente, de tres cuartos, de perfil y de espalda: su antifaz, el hocico y el pecho blancos, el lomo rayado y la cola con anillos',
              caption: 'Las vistas del personaje, renderizadas en Blender',
            },
          },
          {
            src: img('petzone/3d/faces'),
            alt: "A close-up of Dasha's face with an open smile, beside two more: the drawings' closed 'w' smile, and her eyes shut in a blink",
            caption: "Her face: a smile on a shape key, and lids that close into the drawings' sleepy arc",
            es: {
              alt: 'Un primer plano de la cara de Dasha con una sonrisa abierta, junto a otros dos: la sonrisa cerrada en «w» de los dibujos y los ojos cerrados en un parpadeo',
              caption: 'Su cara: una sonrisa en una forma clave, y párpados que se cierran en el arco dormido de los dibujos',
            },
          },
          {
            src: img('petzone/3d/rig'),
            alt: 'Dasha twice from one camera: in clay with the Rigify controls drawn over her in their colours, IK, FK, spine, head, face and tail; and as a pale ghost with her deform bones inside',
            caption: 'The rig: Rigify fitted to her by script, bound by bone heat, then cleaned up so her head never bends',
            es: {
              alt: 'Dasha dos veces desde una misma cámara: en arcilla con los controles de Rigify dibujados encima en sus colores, IK, FK, columna, cabeza, cara y cola; y como un fantasma pálido con sus huesos de deformación por dentro',
              caption: 'El esqueleto: Rigify ajustado a ella por script, con pesos por calor de huesos, limpiados para que su cabeza nunca se doble',
            },
          },
          {
            src: img('petzone/3d/coat'),
            alt: "Dasha's coat laid flat: its base colour map large, with orange fur, white patches and stripes, beside its normal and roughness maps",
            caption: 'Her coat, from a Substance Designer graph rendered from its command line',
            es: {
              alt: 'El pelaje de Dasha extendido: su mapa de color base en grande, con pelo naranja, manchas blancas y rayas, junto a sus mapas de normales y de rugosidad',
              caption: 'Su pelaje, de un grafo de Substance Designer renderizado desde la línea de comandos',
            },
          },
          {
            src: img('petzone/3d/materials'),
            alt: 'Seven material balls in the colours the scenes use: teal linen, kraft paper, cardboard, wood, an orange glaze, orange yarn and soft orange plastic',
            caption: "The props' materials, from Substance",
            es: {
              alt: 'Siete esferas de materiales en los colores que usan las escenas: lino turquesa, papel kraft, cartón, madera, esmalte naranja, lana naranja y plástico suave naranja',
              caption: 'Los materiales de los objetos, de Substance',
            },
          },
          {
            src: img('petzone/3d/puppy'),
            alt: 'The puppy from the logo, a cream mixed breed with caramel ears, a blue collar and a yellow bone tag, sitting beside Dasha, both smiling at the camera',
            caption: 'The puppy, built the same way, beside her',
            es: {
              alt: 'El cachorro del logo, un criollo crema con orejas color caramelo, collar azul y placa amarilla en forma de hueso, sentado junto a Dasha, los dos sonriendo a la cámara',
              caption: 'El cachorro, hecho de la misma manera, junto a ella',
            },
          },
        ],
        loops: [
          {
            sources: same('petzone/loops/turntable'), width: 1200, height: 800, wide: true,
            alt: 'Dasha sitting on a turntable, turning a full circle',
            caption: 'A full turn, rendered in Blender',
            es: { alt: 'Dasha sentada en una base giratoria, dando una vuelta completa', caption: 'Una vuelta completa, renderizada en Blender' },
          },
        ],
      },
      {
        id: 'phone',
        title: 'On a phone',
        intro: 'Everything reachable with a thumb: one column, a menu for the rest, and every record on a page of its own.',
        es: {
          title: 'En el celular',
          intro: 'Todo al alcance del pulgar: una columna, un menú para lo demás y cada registro en su propia página.',
        },
        shots: [
          {
            src: img('petzone/mobile-light/home'),
            alt: "Petzone Home on a phone: the date and a greeting, the assistant's box with suggested questions, and today's sales",
            caption: 'Home, in one column',
            es: {
              alt: 'Inicio de Petzone en el celular: la fecha y un saludo, el cuadro del asistente con preguntas sugeridas y las ventas de hoy',
              caption: 'El inicio, en una columna',
            },
          },
          {
            src: img('petzone/mobile-light/menu'),
            alt: 'Petzone menu on a phone: home, orders, products, customers, discounts, reports, payments and the point of sale, with their pages under them and counts for orders, refills and tickets',
            caption: 'The menu: every part of the store',
            es: {
              alt: 'Menú de Petzone en el celular: inicio, pedidos, productos, clientes, descuentos, reportes, pagos y el punto de venta, con sus páginas debajo y contadores de pedidos, recompras y tickets',
              caption: 'El menú: cada parte de la tienda',
            },
          },
          {
            src: img('petzone/mobile-light/register'),
            alt: 'Petzone register on a phone: search and scan, a three-item ticket for a customer and their pet, and the total above a button to continue to payment',
            caption: 'The register: the ticket, then the total above the pay button',
            es: {
              alt: 'Caja de Petzone en el celular: buscar y escanear, un ticket de tres productos para un cliente y su mascota, y el total sobre un botón para pasar al pago',
              caption: 'La caja: el ticket y, debajo, el total sobre el botón de pago',
            },
          },
          {
            src: img('petzone/mobile-light/variant-picker'),
            alt: "Petzone variant picker on a phone for Agility Gold cats: two sizes with their prices, the chosen size's stock, and a button to add it to the ticket",
            caption: 'Picking a size',
            es: {
              alt: 'Selector de variantes de Petzone en el celular para Agility Gold cats: dos tamaños con su precio, la disponibilidad del tamaño elegido y un botón para agregarlo al ticket',
              caption: 'Elegir el tamaño',
            },
          },
          {
            src: img('petzone/mobile-light/orders'),
            alt: "Petzone orders on a phone: today's orders and items above the list of receipts",
            caption: 'Orders, newest first',
            es: {
              alt: 'Pedidos de Petzone en el celular: los pedidos y artículos de hoy sobre la lista de recibos',
              caption: 'Los pedidos, del más reciente al más antiguo',
            },
          },
          {
            src: img('petzone/mobile-light/customer'),
            alt: 'Petzone customer record on a phone: last paid purchase, purchases and balance, a next step to collect, and their usual purchases',
            caption: "A customer's record: balance, next step and usual buys",
            es: {
              alt: 'Ficha de cliente de Petzone en el celular: última compra pagada, compras y saldo, un siguiente paso para cobrar y sus compras habituales',
              caption: 'La ficha de un cliente: saldo, siguiente paso y compras habituales',
            },
          },
          {
            src: img('petzone/mobile-light/product'),
            alt: 'Petzone product page on a phone for a dog food: size, photo, sale price and cost, with the profit and margin',
            caption: 'A product page, in one column',
            es: {
              alt: 'Página de producto de Petzone en el celular para un alimento para perro: tamaño, foto, precio de venta y costo, con la ganancia y el margen',
              caption: 'La página de un producto, en una columna',
            },
          },
          {
            src: img('petzone/mobile-light/variants'),
            alt: "Petzone product page on a phone: a cat food's lots with their expiry, and its two sizes with their SKU, stock and price",
            caption: "A product's lots and variants",
            es: {
              alt: 'Página de producto de Petzone en el celular: los lotes de un alimento para gato con su vencimiento, y sus dos tamaños con referencia, existencias y precio',
              caption: 'Los lotes y las variantes de un producto',
            },
          },
          {
            src: img('petzone/mobile-light/discounts'),
            alt: 'Petzone discounts on a phone: a button to create one above the list of discounts with their status',
            caption: 'Discounts, with their status',
            es: {
              alt: 'Descuentos de Petzone en el celular: un botón para crear uno sobre la lista de descuentos con su estado',
              caption: 'Los descuentos, con su estado',
            },
          },
          {
            src: img('petzone/mobile-light/empty-orders'),
            alt: 'Petzone orders on a phone before the first sale: Dasha beside a Petzone bag, a sentence on how the list fills, and a button for a new order',
            caption: 'Orders before the first sale, with Dasha',
            es: {
              alt: 'Pedidos de Petzone en el celular antes de la primera venta: Dasha junto a una bolsa de Petzone, una frase sobre cómo se llena la lista y un botón para un pedido nuevo',
              caption: 'Los pedidos antes de la primera venta, con Dasha',
            },
          },
        ],
      },
      {
        id: 'dark',
        title: 'Dark theme',
        intro: 'The same app in its dark theme, from Home to reports.',
        es: {
          title: 'Tema oscuro',
          intro: 'La misma app en su tema oscuro, del inicio a los reportes.',
        },
        shots: [
          {
            src: img('petzone/desktop-dark/home'),
            alt: "Petzone Home in the dark theme: a greeting, the assistant's box with suggested questions, and cards for today's sales, open orders and balances to collect",
            caption: 'Home in the dark theme',
            es: {
              alt: 'Inicio de Petzone en el tema oscuro: un saludo, el cuadro del asistente con preguntas sugeridas, y tarjetas de las ventas de hoy, los pedidos abiertos y los saldos por cobrar',
              caption: 'El inicio en el tema oscuro',
            },
          },
          {
            src: img('petzone/desktop-dark/register'),
            alt: 'Petzone register in the dark theme with a three-item ticket for a customer and their pet, a discount code applied and the total to charge',
            caption: 'A ticket ready to charge',
            es: {
              alt: 'Caja de Petzone en el tema oscuro con un ticket de tres productos para un cliente y su mascota, un código de descuento aplicado y el total a cobrar',
              caption: 'Un ticket listo para cobrar',
            },
          },
          {
            src: img('petzone/desktop-dark/variant-picker'),
            alt: "Petzone variant picker in the dark theme for Agility Gold cats: two sizes with their prices, and the chosen size's SKU and stock",
            caption: 'Picking a size, with each price on its button',
            es: {
              alt: 'Selector de variantes de Petzone en el tema oscuro para Agility Gold cats: dos tamaños con su precio, y la referencia y la disponibilidad del tamaño elegido',
              caption: 'Elegir el tamaño, con el precio de cada uno en su botón',
            },
          },
          {
            src: img('petzone/desktop-dark/orders'),
            alt: "Petzone orders in the dark theme: today's figures above the table of receipts, with their payment and delivery status",
            caption: 'Orders: payment and delivery at a glance',
            es: {
              alt: 'Pedidos de Petzone en el tema oscuro: las cifras de hoy sobre la tabla de recibos, con su estado de pago y de entrega',
              caption: 'Pedidos: el pago y la entrega de un vistazo',
            },
          },
          {
            src: img('petzone/desktop-dark/product'),
            alt: 'Petzone product page in the dark theme: size and photo, price and cost with the margin, stock and codes, and recent sales',
            caption: 'A product page, with its recent sales',
            es: {
              alt: 'Página de producto de Petzone en el tema oscuro: tamaño y foto, precio y costo con el margen, existencias y códigos, y ventas recientes',
              caption: 'La página de un producto, con sus ventas recientes',
            },
          },
          {
            src: img('petzone/desktop-dark/customer'),
            alt: 'Petzone customer record in the dark theme: last paid purchase, purchases and balance, a next step to collect, usual purchases and recent activity',
            caption: "A customer's record, with what to do next",
            es: {
              alt: 'Ficha de cliente de Petzone en el tema oscuro: última compra pagada, compras y saldo, un siguiente paso para cobrar, compras habituales y actividad reciente',
              caption: 'La ficha de un cliente, con lo que sigue',
            },
          },
          {
            src: img('petzone/desktop-dark/reports'),
            alt: 'Petzone reports in the dark theme: net sales, gross profit, completed tickets and customer balances over 30 days, and sales over time',
            caption: 'Reports over 30 days',
            es: {
              alt: 'Reportes de Petzone en el tema oscuro: ventas netas, ganancia bruta, tickets completados y saldos de clientes en 30 días, y las ventas en el tiempo',
              caption: 'Reportes de 30 días',
            },
          },
        ],
      },
    ],
    film: {
      seconds: 60,
      sources: cuts('petzone/film'),
      alt: "Petzone's film: Dasha, the store's 3D kitten, turns beside the name; then the app screen by screen, from Home and a three-item sale charged at the register to orders, products and their variants, a buy X get Y discount and reports; Dasha playing on an empty page, her rig over clay and all twenty-one of her scenes moving in turn; two phones, light and dark; and the end card.",
      caption: 'A silent film made from the app itself, and from Dasha rendered in Blender, for the site and for social media. Sample store data.',
      es: {
        alt: 'El video de Petzone: Dasha, la gatita 3D de la tienda, gira junto al nombre; luego la app pantalla por pantalla, del inicio y una venta de tres productos cobrada en la caja a los pedidos, los productos y sus variantes, un descuento compra X lleva Y y los reportes; Dasha moviéndose en una página vacía, su esqueleto sobre arcilla y sus veintiuna escenas moviéndose por turnos; dos celulares, claro y oscuro; y el cierre.',
        caption: 'Un video sin sonido hecho con la propia app, y con Dasha renderizada en Blender, para el sitio y las redes sociales. Datos de una tienda de ejemplo.',
      },
    },
    url: 'https://petzone-coral.vercel.app',
    scope: 'Product design, build, operations',
    highlights: [
      "A register built for a counter: scan or search, favourites, one-tap ticket",
      "Receipts, plus orders reserved for later payment, pickup or delivery",
      "Products by SKU, variant and lot, purchase orders, customers and reports behind the till",
      "Discounts the register applies on its own: codes, buy X get Y, free delivery",
      "A Home that sets up a new store one step at a time, each step a 3D card",
      "Dasha, the store's mascot: modelled, groomed, textured in Substance and rigged in Blender, on every empty page",
      "Runs the shop's daily trade, not a prototype",
    ],
    summary: "The till and back office running a pet store in Itagüí.",
    description: "Point-of-sale and operations for a pet retail store in Itagüí, Colombia. Fast checkout at the counter, then orders, products by SKU and variant, purchasing, discounts, customers and reports behind it. Designed for a counter, not a desk: everything reachable with a thumb, keyboard shortcuts for the till. Its mascot, Dasha, is built and rigged in Blender with a coat from Substance Designer, and keeps every empty page company.",
    tags: ['product design', 'pos', 'retail', 'operations', 'ui', 'ux', 'dashboard', '3d', 'blender', 'substance'],
    es: {
      summary: 'La caja y el back office con los que funciona una tienda de mascotas en Itagüí.',
      scope: 'Diseño de producto, desarrollo, operaciones',
      description: 'Punto de venta y operaciones para una tienda de mascotas en Itagüí, Colombia. Cobro rápido en el mostrador y, detrás, pedidos, productos por referencia y variante, compras, descuentos, clientes y reportes. Diseñado para un mostrador, no para un escritorio: todo al alcance del pulgar y atajos de teclado para la caja. Su mascota, Dasha, se construye y se arma en Blender con un pelaje de Substance Designer, y acompaña cada página vacía.',
      highlights: [
        'Una caja pensada para el mostrador: escanear o buscar, favoritos y ticket con un toque',
        'Recibos, más pedidos apartados para pagar, recoger o enviar después',
        'Productos por referencia, variante y lote, órdenes de compra, clientes y reportes detrás de la caja',
        'Descuentos que la caja aplica sola: códigos, compra X y lleva Y, domicilio gratis',
        'Un inicio que prepara una tienda nueva paso a paso, cada paso una tarjeta en 3D',
        'Dasha, la mascota de la tienda: modelada, con pelaje, texturizada en Substance y con esqueleto en Blender, en cada página vacía',
        'Se usa en la operación diaria de la tienda, no es un prototipo',
      ],
      tags: ['diseño de producto', 'pos', 'retail', 'operaciones', 'ui', 'ux', 'dashboard', '3d', 'blender', 'substance'],
      coverAlt: 'Dasha, la gatita 3D de Petzone, saludando frente al inicio de Petzone en un navegador de escritorio y en un celular',
    },
  },
  {
    slug: 'purrsuit', title: 'Purrsuit', client: 'Purrsuit', category: 'Game', status: 'wip', year: 2026,
    cover: { kind: 'image', src: img('purrsuit/hero'), alt: "Jinx, Purrsuit's hero cat, rendered in 3D beside two iPhones: the game's loading screen and a run along the sea floor", fit: 'contain', bg: '#ffffff', pattern: { seed: 88, palette: ['#8898ff', '#ffb020', '#ff9ec4'] } },
    /* Everything here comes from the game itself: its editor tools screenshot and film it on an iPhone 16-shaped
       screen while a bot plays, from a test save, and the 3D renders come from the game's own Blender file
       (mockups/purrsuit). The game's words stay English in both languages, so its loops have one cut. */
    hero: {
      src: img('purrsuit/hero'),
      alt: "Jinx, Purrsuit's hero cat, rendered in 3D beside two iPhones: the game's loading screen and a run along the sea floor",
      caption: 'Jinx, rendered in Blender, and the game on two phones',
      es: {
        alt: 'Jinx, el gato protagonista de Purrsuit, renderizado en 3D junto a dos iPhone: la pantalla de carga del juego y una carrera por el fondo del mar',
        caption: 'Jinx, renderizado en Blender, y el juego en dos celulares',
      },
    },
    chapters: [
      {
        id: 'run',
        title: 'The run',
        intro: 'Swipe to change lanes, up to jump, down to roll. Every level has three stars to earn: clear it, pick up three quarters of its fish, and take no hits. A boss waits at the end of each one.',
        es: {
          title: 'La carrera',
          intro: 'Desliza para cambiar de carril, hacia arriba para saltar y hacia abajo para rodar. Cada nivel tiene tres estrellas: pasarlo, recoger tres cuartas partes de su pescado y no recibir golpes. Al final de cada uno espera un jefe.',
        },
        shots: [
          {
            src: img('purrsuit/phone/hud'),
            alt: "Purrsuit's level 3 starting on the fish market docks, with the district's name and the three star goals over the boardwalk",
            caption: 'A level opens with its three star goals',
            es: {
              alt: 'El nivel 3 de Purrsuit empezando en los muelles del mercado de pescado, con el nombre del distrito y las tres metas de estrellas sobre el muelle',
              caption: 'Un nivel abre con sus tres metas de estrellas',
            },
          },
          {
            src: img('purrsuit/phone/hud-powers'),
            alt: 'Jinx running with three power-ups along the left edge, a card that says to swipe up to jump, and the super button ready in the corner',
            caption: 'Power-ups down the left edge, the super ready to fire',
            es: {
              alt: 'Jinx corriendo con tres potenciadores en el borde izquierdo, una tarjeta que dice que deslices hacia arriba para saltar y el botón del súper listo en la esquina',
              caption: 'Los potenciadores a la izquierda y el súper listo para usar',
            },
          },
          {
            src: img('purrsuit/phone/hud-chase'),
            alt: 'Red screen edges and a ribbon warning that the Dog Squad is on your tail, after a stumble',
            caption: 'Stumble, and the Dog Squad gives chase',
            es: {
              alt: 'Los bordes de la pantalla en rojo y una cinta que avisa que la brigada canina viene detrás, después de un tropiezo',
              caption: 'Si tropiezas, la brigada canina sale a perseguirte',
            },
          },
          {
            src: img('purrsuit/phone/hud-boss'),
            alt: 'Big Bruno, the docks boss, charging down a lane while a POUNCE! callout says how to answer, with his health bar at the top',
            caption: 'Every boss attack is called out before it lands',
            es: {
              alt: 'Big Bruno, el jefe de los muelles, embistiendo por un carril mientras un aviso de POUNCE! dice cómo responder, con su barra de vida arriba',
              caption: 'Cada ataque del jefe se anuncia antes de llegar',
            },
          },
          {
            src: img('purrsuit/phone/result-win'),
            alt: 'Level clear: two of three stars, the fish earned and a button to double them with an ad, with Jinx dancing in confetti above',
            caption: 'Level clear: the stars, the fish, and an optional ad to double them',
            es: {
              alt: 'Nivel superado: dos de tres estrellas, el pescado ganado y un botón para duplicarlo con un anuncio, con Jinx bailando entre confeti arriba',
              caption: 'Nivel superado: las estrellas, el pescado y un anuncio opcional para duplicarlo',
            },
          },
          {
            src: img('purrsuit/phone/levels'),
            alt: "The levels map: three district cards above ten medallions on a winding path, the next level glowing with Jinx's head beside it and the boss at the top",
            caption: 'Ten levels per district, with the boss at the top',
            es: {
              alt: 'El mapa de niveles: tres tarjetas de distrito sobre diez medallones en un camino sinuoso, el siguiente nivel brillando con la cabeza de Jinx al lado y el jefe arriba',
              caption: 'Diez niveles por distrito, con el jefe arriba',
            },
          },
          {
            src: img('purrsuit/phone/level-card'),
            alt: "Level 6's card: Sgt. Barkley waiting at the end with his taunt, the best stars so far, the three goals and a PLAY button",
            caption: "Each level's card names the boss waiting at the end",
            es: {
              alt: 'La tarjeta del nivel 6: el Sgt. Barkley esperando al final con su provocación, las mejores estrellas hasta ahora, las tres metas y un botón PLAY',
              caption: 'La tarjeta de cada nivel presenta al jefe que espera al final',
            },
          },
        ],
        loops: [
          {
            sources: same('purrsuit/loops/tuna'), width: 462, height: 1000,
            alt: 'A tuna thrown low across the lanes, and Jinx landing on it for a TUNA BONK! bonus',
            caption: 'The tuna toss: jump it, or land on it',
            es: {
              alt: 'Un atún lanzado bajo de lado a lado, y Jinx cayéndole encima para ganar el bono de TUNA BONK!',
              caption: 'El atún lanzado: sáltalo o cáele encima',
            },
          },
          {
            sources: same('purrsuit/loops/crates'), width: 462, height: 1000,
            alt: 'Jinx bouncing from one fish crate to the next without touching down, for a crate chain',
            caption: 'A crate chain: pounce, bounce, pounce',
            es: {
              alt: 'Jinx rebotando de una caja de pescado a la siguiente sin tocar el suelo, en una cadena de cajas',
              caption: 'Una cadena de cajas: caer, rebotar, caer',
            },
          },
          {
            sources: same('purrsuit/loops/super'), width: 462, height: 1000,
            alt: 'Jinx firing his super, Shadow Dash, and streaking down the boardwalk through everything in his way',
            caption: "Shadow Dash, Jinx's super",
            es: {
              alt: 'Jinx usando su súper, el Shadow Dash, y cruzando el muelle llevándose todo por delante',
              caption: 'Shadow Dash, el súper de Jinx',
            },
          },
          {
            sources: same('purrsuit/loops/boss'), width: 462, height: 1000,
            alt: "Big Bruno's showdown: he throws barrels and charges, Jinx jumps them, pounces on him, and he gets mad",
            caption: 'A boss fight: jump, pounce, dodge',
            es: {
              alt: 'El enfrentamiento con Big Bruno: lanza barriles y embiste, Jinx los salta, le cae encima y él se enoja',
              caption: 'Una pelea con un jefe: saltar, caer encima, esquivar',
            },
          },
        ],
      },
      {
        id: 'journey',
        title: 'The endless journey',
        intro: "Endless mode is one looping journey through seven places, each with rules of its own: belts and presses on the beat in a cannery, floaty water physics on the sea floor, a shipwreck's hull to run along, and a deep end where only the hazards glow.",
        es: {
          title: 'El viaje infinito',
          intro: 'El modo infinito es un solo viaje en bucle por siete lugares, cada uno con sus propias reglas: cintas y prensas al ritmo de la música en una enlatadora, saltos flotantes en el fondo del mar, el casco de un naufragio para correr por él y unas profundidades donde solo brillan los peligros.',
        },
        shots: [
          {
            src: img('purrsuit/phone/journey-cannery'),
            alt: "The Cannery's place card over a factory hall with conveyor belts, and the journey bar under the score",
            caption: 'Each place opens with a card of its own',
            es: {
              alt: 'La tarjeta de la enlatadora sobre una nave con cintas transportadoras, y la barra del viaje debajo del puntaje',
              caption: 'Cada lugar abre con su propia tarjeta',
            },
          },
          {
            src: img('purrsuit/phone/press-window'),
            alt: 'Can presses in the Cannery with a red, amber or green light over each lane, and a card that reads red dodge, amber roll, green go',
            caption: 'Presses on the beat: red, dodge; amber, roll; green, go',
            es: {
              alt: 'Prensas de latas en la enlatadora con una luz roja, ámbar o verde sobre cada carril, y una tarjeta que explica qué hacer con cada color',
              caption: 'Prensas al ritmo: rojo, esquiva; ámbar, rueda; verde, pasa',
            },
          },
          {
            src: img('purrsuit/phone/journey-dive-leap'),
            alt: 'Jinx leaping off the end of the pier toward the sea, with fish arcing ahead of him',
            caption: 'The dive, off the end of the pier',
            es: {
              alt: 'Jinx saltando desde la punta del muelle hacia el mar, con peces en arco delante de él',
              caption: 'El chapuzón, desde la punta del muelle',
            },
          },
          {
            src: img('purrsuit/phone/journey-shallows'),
            alt: 'Jinx running along the sandy sea floor in a fishbowl helmet, kelp and coral on either side and light rippling on the sand',
            caption: 'Kelp Shallows: floaty jumps and a fishbowl for a helmet',
            es: {
              alt: 'Jinx corriendo por el fondo arenoso del mar con una pecera de casco, algas y coral a los lados y la luz ondulando sobre la arena',
              caption: 'Kelp Shallows: saltos flotantes y una pecera de casco',
            },
          },
          {
            src: img('purrsuit/phone/wreck-hull-run'),
            alt: "Jinx running along the side of a sunken ship's hull, under the Wreck's place card",
            caption: 'The Wreck: run along the hull',
            es: {
              alt: 'Jinx corriendo por el costado del casco de un barco hundido, bajo la tarjeta del naufragio',
              caption: 'The Wreck: correr por el casco',
            },
          },
          {
            src: img('purrsuit/phone/trench-lou'),
            alt: 'The Deep End in near darkness, lit by Lantern Lou, an anglerfish swimming ahead, with glowing hazards on the sea floor',
            caption: 'The Deep End, where Lantern Lou lights the way',
            es: {
              alt: 'Las profundidades casi a oscuras, iluminadas por Lantern Lou, un rape que nada adelante, con peligros que brillan en el fondo',
              caption: 'Las profundidades, donde Lantern Lou alumbra el camino',
            },
          },
          {
            src: img('purrsuit/phone/whaleback'),
            alt: 'Jinx on the back of Barnacle Bess, a whale, with lines of fish leading to her blowhole and a THAR SHE BLOWS! card',
            caption: 'Barnacle Bess: fish only, then the spout',
            es: {
              alt: 'Jinx sobre el lomo de Barnacle Bess, una ballena, con filas de peces que llevan a su espiráculo y una tarjeta de THAR SHE BLOWS!',
              caption: 'Barnacle Bess: solo peces, y luego el chorro',
            },
          },
          {
            src: img('purrsuit/phone/spout-apex-slowmo'),
            alt: "Jinx in slow motion at the top of the whale's spout, high over the rooftops at night, with SHOOK 'EM! on screen and the Dog Squad's submarine flipped over below",
            caption: 'The spout shakes off the chase, in slow motion over the rooftops',
            es: {
              alt: "Jinx en cámara lenta en lo alto del chorro de la ballena, sobre los tejados de noche, con SHOOK 'EM! en pantalla y el submarino de la brigada canina volteado abajo",
              caption: 'El chorro deja atrás la persecución, en cámara lenta sobre los tejados',
            },
          },
          {
            src: img('purrsuit/phone/journey-rooftops'),
            alt: 'Rooftops at Night: Jinx running across flat roofs under a full moon, among neon signs and city lights',
            caption: 'Rooftops at Night, with a song of its own',
            es: {
              alt: 'Rooftops at Night: Jinx corriendo por las azoteas bajo la luna llena, entre letreros de neón y luces de la ciudad',
              caption: 'Rooftops at Night, con su propia canción',
            },
          },
          {
            src: img('purrsuit/phone/result-endless'),
            alt: 'An endless run ends: NEW BEST! with the score, the place reached on the second loop, the fish earned and two postcards stamped',
            caption: 'The result names the furthest place and stamps its postcards',
            es: {
              alt: 'Termina una carrera infinita: NEW BEST! con el puntaje, el lugar alcanzado en la segunda vuelta, el pescado ganado y dos postales selladas',
              caption: 'El resultado dice hasta dónde llegaste y sella sus postales',
            },
          },
          {
            src: img('purrsuit/phone/endless-postcards'),
            alt: 'The endless page: a row of postcards, five stamped and two still hidden, above the best score and five medals from bronze to legend',
            caption: 'A postcard from every place reached, and medals for the best score',
            es: {
              alt: 'La página del modo infinito: una fila de postales, cinco selladas y dos todavía ocultas, sobre el mejor puntaje y cinco medallas de bronce a leyenda',
              caption: 'Una postal de cada lugar alcanzado y medallas para el mejor puntaje',
            },
          },
        ],
        loops: [
          {
            sources: same('purrsuit/loops/presses'), width: 462, height: 1000,
            alt: 'Can presses stamping on the beat while Jinx takes the open lane',
            caption: 'Presses on the beat',
            es: { alt: 'Prensas que golpean al ritmo mientras Jinx toma el carril libre', caption: 'Prensas al ritmo' },
          },
          {
            sources: same('purrsuit/loops/dive'), width: 462, height: 1000,
            alt: 'Jinx runs off the pier, snatches a fishbowl and splashes down into the Kelp Shallows',
            caption: 'The dive',
            es: { alt: 'Jinx sale corriendo del muelle, atrapa una pecera y cae al agua en Kelp Shallows', caption: 'El chapuzón' },
          },
          {
            sources: same('purrsuit/loops/hull'), width: 462, height: 1000,
            alt: 'Jinx swiping onto the side of a sunken ship and running along its hull',
            caption: "The Wreck's wall-run",
            es: { alt: 'Jinx pasándose al costado de un barco hundido y corriendo por su casco', caption: 'La carrera por el casco del naufragio' },
          },
          {
            sources: same('purrsuit/loops/spout'), width: 462, height: 1000,
            alt: "Barnacle Bess's spout throws Jinx up out of the sea and onto the rooftops",
            caption: 'The spout',
            es: { alt: 'El chorro de Barnacle Bess lanza a Jinx fuera del mar y hasta los tejados', caption: 'El chorro' },
          },
        ],
      },
      {
        id: '3d',
        title: 'Heroes in 3D',
        intro: 'Jinx began as a model sculpted in code. A script carries him into Blender to be rigged, unwrapped and baked, and Substance Painter paints him through a script of its own, with no one at the keyboard. The game loads the result: about 47,000 triangles, six looks, four faces.',
        es: {
          title: 'Personajes en 3D',
          intro: 'Jinx empezó como un modelo esculpido en código. Un script lo lleva a Blender, donde se le arma el esqueleto, se desenvuelven sus UV y se hornean sus texturas, y Substance Painter lo pinta con otro script, sin nadie al teclado. El juego carga el resultado: unos 47.000 triángulos, seis looks y cuatro caras.',
        },
        shots: [
          {
            src: img('purrsuit/3d/looks'),
            alt: 'Jinx in his six looks side by side: Street, Midnight, Gold Heist, Faux Tux, The Evidence and Catch of the Day',
            caption: 'Six looks from one model, each its own painted texture set',
            es: {
              alt: 'Jinx con sus seis looks uno al lado del otro: Street, Midnight, Gold Heist, Faux Tux, The Evidence y Catch of the Day',
              caption: 'Seis looks de un solo modelo, cada uno con su propio juego de texturas pintadas',
            },
          },
          {
            src: img('purrsuit/3d/turnaround'),
            alt: 'Jinx from the front, three-quarter, side and back, in his purple hoodie, shorts and sneakers',
            caption: 'The turnaround, rendered in Blender',
            es: {
              alt: 'Jinx de frente, de tres cuartos, de perfil y de espalda, con su buzo morado, pantalones cortos y tenis',
              caption: 'Las vistas del personaje, renderizadas en Blender',
            },
          },
          {
            src: img('purrsuit/3d/faces'),
            alt: "A close-up of Jinx's smug face, beside two more of his expressions: a happy grin and a shocked stare",
            caption: 'His faces: one mesh per expression, swapped in the game',
            es: {
              alt: 'Un primer plano de la cara de Jinx con su expresión de suficiencia, junto a otras dos: una sonrisa feliz y una mirada de susto',
              caption: 'Sus caras: una malla por expresión, que el juego intercambia',
            },
          },
          {
            src: img('purrsuit/3d/wireframe'),
            alt: 'Jinx rendered with his painted textures beside the same model in grey with its wireframe drawn over it',
            caption: 'About 47,000 triangles, laid out in clean quads',
            es: {
              alt: 'Jinx renderizado con sus texturas pintadas junto al mismo modelo en gris con su malla dibujada encima',
              caption: 'Unos 47.000 triángulos, ordenados en cuadriláteros limpios',
            },
          },
          {
            src: img('purrsuit/3d/textures'),
            alt: "Six painted texture sheets laid flat, one for each of Jinx's looks",
            caption: 'Painted in Substance Painter by a script: one texture set per look',
            es: {
              alt: 'Seis hojas de texturas pintadas extendidas, una por cada look de Jinx',
              caption: 'Pintadas en Substance Painter por un script: un juego de texturas por look',
            },
          },
        ],
        loops: [
          {
            sources: same('purrsuit/loops/turntable'), width: 1200, height: 800, wide: true,
            alt: 'Jinx turning a full circle on a turntable in his purple hoodie',
            caption: 'A full turn, rendered in Blender',
            es: { alt: 'Jinx dando una vuelta completa en una base giratoria con su buzo morado', caption: 'Una vuelta completa, renderizada en Blender' },
          },
        ],
      },
      {
        id: 'art',
        title: 'Props and icons',
        intro: "The props on the track and the icons in the menus go through the same pipeline as Jinx: built and baked in Blender, painted in Substance Painter. The app icon is rendered from the game's own models.",
        es: {
          title: 'Objetos e íconos',
          intro: 'Los objetos de la pista y los íconos de los menús pasan por el mismo proceso que Jinx: se construyen y se hornean en Blender y se pintan en Substance Painter. El ícono de la app se renderiza con los propios modelos del juego.',
        },
        shots: [
          {
            src: img('purrsuit/3d/props'),
            alt: 'Twenty-four painted props from the run, among them a barrier, crates, a pufferfish, a goldfish, nets, a cardboard box with a cat inside, power-ups, a jellyfish, a can press and a tuna',
            caption: "The track's props, painted",
            es: {
              alt: 'Veinticuatro objetos pintados de la carrera, entre ellos una barrera, cajas, un pez globo, un pez dorado, redes, una caja de cartón con un gato adentro, potenciadores, una medusa, una prensa de latas y un atún',
              caption: 'Los objetos de la pista, pintados',
            },
          },
          {
            src: img('purrsuit/3d/icons'),
            alt: "The game's 3D menu icons: the three heroes, the Dog Squad's five bosses, a fish, a star, a trophy, a chest, a shopping bag, a map, a heart, a padlock, a TV for ads, a gear, sound, music, vibration and the level medallions",
            caption: 'Every icon in the menus is a painted 3D model',
            es: {
              alt: 'Los íconos 3D de los menús del juego: los tres héroes, los cinco jefes de la brigada canina, un pez, una estrella, un trofeo, un cofre, una bolsa de compras, un mapa, un corazón, un candado, un televisor para los anuncios, un engranaje, sonido, música, vibración y los medallones de los niveles',
              caption: 'Cada ícono de los menús es un modelo 3D pintado',
            },
          },
          {
            src: img('purrsuit/3d/app-icon'),
            alt: 'The Purrsuit app icon, Jinx in a fish-bone cap with a goldfish in his mouth on blue, beside a gold version',
            caption: "The app icon, rendered in Blender from the game's own models",
            es: {
              alt: 'El ícono de la app de Purrsuit, Jinx con una gorra con espina de pescado y un pez dorado en la boca sobre azul, junto a una versión dorada',
              caption: 'El ícono de la app, renderizado en Blender con los propios modelos del juego',
            },
          },
        ],
      },
      {
        id: 'menus',
        title: 'Menus and the shop',
        intro: 'Every screen is built in code, in the look of the game. The shop sells looks, never chances: each price is on its tile, and nothing you buy changes a run.',
        es: {
          title: 'Menús y la tienda',
          intro: 'Cada pantalla está hecha en código, con el estilo del juego. La tienda vende looks, nunca sorpresas: cada precio está en su tarjeta y nada de lo que compras cambia una carrera.',
        },
        shots: [
          {
            src: img('purrsuit/phone/loading'),
            alt: 'The loading screen: the Purrsuit logo over key art of the crew running from the Dog Squad, with a gold loading bar and a tip',
            caption: "The loading screen's key art is rendered by the game itself",
            es: {
              alt: 'La pantalla de carga: el logo de Purrsuit sobre una ilustración del equipo huyendo de la brigada canina, con una barra de carga dorada y un consejo',
              caption: 'La ilustración de la pantalla de carga la renderiza el propio juego',
            },
          },
          {
            src: img('purrsuit/phone/home'),
            alt: 'The home screen: Jinx on the boardwalk under the logo, his name and super, his looks, a big PLAY button and the tab bar',
            caption: 'Home: the hero, his looks and PLAY',
            es: {
              alt: 'La pantalla de inicio: Jinx en el muelle bajo el logo, su nombre y su súper, sus looks, un gran botón PLAY y la barra de pestañas',
              caption: 'Inicio: el héroe, sus looks y PLAY',
            },
          },
          {
            src: img('purrsuit/phone/shop'),
            alt: 'The shop: The Gala Duo bundle featured with its saving, and couture looks below with their prices in fish',
            caption: 'The shop: looks for fish, a few for real money, all of them for good',
            es: {
              alt: 'La tienda: el paquete The Gala Duo destacado con su ahorro, y abajo looks de alta costura con su precio en pescado',
              caption: 'La tienda: looks por pescado, algunos por dinero real, todos para siempre',
            },
          },
          {
            src: img('purrsuit/phone/bundle'),
            alt: 'The Gala Duo bundle: Jinx in Faux Tux and Duchess in Grand Finale side by side, with each price and the bundle price',
            caption: 'A bundle, tried on before it is bought',
            es: {
              alt: 'El paquete The Gala Duo: Jinx con Faux Tux y Duchess con Grand Finale uno al lado del otro, con el precio de cada uno y el del paquete',
              caption: 'Un paquete, que se prueba antes de comprarlo',
            },
          },
          {
            src: img('purrsuit/phone/look-couture'),
            alt: 'Jinx trying on Faux Tux, a white tuxedo, with its price in fish and in dollars',
            caption: 'Every look can be tried on first',
            es: {
              alt: 'Jinx probándose Faux Tux, un esmoquin blanco, con su precio en pescado y en dólares',
              caption: 'Cada look se puede probar primero',
            },
          },
          {
            src: img('purrsuit/phone/look-night'),
            alt: 'Duchess trying on Neon Tetra, with a glowing boa, on the rooftops at night',
            caption: 'After Dark looks glow at night',
            es: {
              alt: 'Duchess probándose Neon Tetra, con una boa que brilla, en los tejados de noche',
              caption: 'Los looks After Dark brillan de noche',
            },
          },
          {
            src: img('purrsuit/phone/revive'),
            alt: 'The revive offer after a crash: a heart in a draining ring, how far the run got, and two choices, fish or an ad, above No thanks',
            caption: 'One revive per run, paid in fish or with an ad',
            es: {
              alt: 'La oferta para revivir después de un choque: un corazón en un anillo que se vacía, hasta dónde llegó la carrera y dos opciones, pescado o un anuncio, sobre No thanks',
              caption: 'Una sola resurrección por carrera, pagada con pescado o con un anuncio',
            },
          },
          {
            src: img('purrsuit/phone/pause'),
            alt: 'The pause sheet: the way to the boss, the star goals so far, sound and music switches, RESUME and QUIT',
            caption: 'Pause shows how the run is going',
            es: {
              alt: 'La pausa: el camino hasta el jefe, las metas de estrellas hasta ahora, interruptores de sonido y música, RESUME y QUIT',
              caption: 'La pausa muestra cómo va la carrera',
            },
          },
        ],
      },
    ],
    film: {
      seconds: 61,
      sources: cuts('purrsuit/film'),
      alt: "Purrsuit's film: the game opens on its logo, Jinx runs the fish market docks and fires his super, the endless journey goes from the cannery to the sea floor, a shipwreck, the deep end and a whale's spout up to the rooftops, Big Bruno is beaten in a boss fight, Jinx turns on a turntable, two looks are tried on in the shop, and the logo returns.",
      caption: 'A silent film made from the game itself: a bot plays while the game renders every frame.',
      es: {
        alt: 'El video de Purrsuit: el juego abre con su logo, Jinx corre por los muelles del mercado de pescado y usa su súper, el viaje infinito pasa de la enlatadora al fondo del mar, un naufragio, las profundidades y el chorro de una ballena hasta los tejados, Big Bruno cae en una pelea de jefe, Jinx gira en una base giratoria, se prueban dos looks en la tienda y vuelve el logo.',
        caption: 'Un video sin sonido hecho con el propio juego: un bot juega mientras el juego renderiza cada cuadro.',
      },
    },
    scope: 'Game design, 3D art, development',
    highlights: [
      'A lane runner with a boss fight at the end of each of its 30 levels',
      "An endless journey through seven places, from a cannery to the sea floor and a whale's spout",
      'Jinx rigged in Blender and painted in Substance Painter, in six looks',
      "Bots that play every level with the game's own physics, so the difficulty is measured, not guessed",
      'Rewarded ads and cosmetic looks only: nothing buys score',
      'Runs at 60 fps on an iPhone, in TestFlight now',
    ],
    summary: 'An iPhone game where a crew of cats raids a fish market.',
    description: 'A lane runner for iPhone: a crew of cats raids a fish market with the Dog Squad on their tail. Each of its 30 levels ends in a boss fight, and an endless mode follows the fish from the docks to the bottom of the sea and back over the rooftops. I designed it, modelled and painted the heroes, and built it in Unity, with bots that play every level so the difficulty is measured, not guessed.',
    tags: ['game design', 'unity', 'c#', '3d', 'blender', 'substance painter', 'ios', 'mobile game'],
    es: {
      summary: 'Un juego para iPhone en el que un grupo de gatos asalta un mercado de pescado.',
      scope: 'Diseño de juego, arte 3D, desarrollo',
      description: 'Un juego de carriles para iPhone: un grupo de gatos asalta un mercado de pescado con la brigada canina detrás. Cada uno de sus 30 niveles termina con un jefe, y un modo infinito sigue al pescado desde los muelles hasta el fondo del mar y de vuelta por los tejados. Lo diseñé, modelé y pinté a los personajes, y lo construí en Unity, con bots que juegan cada nivel para que la dificultad se mida y no se adivine.',
      highlights: [
        'Un juego de carriles con un jefe al final de cada uno de sus 30 niveles',
        'Un viaje infinito por siete lugares, de una enlatadora al fondo del mar y al chorro de una ballena',
        'Jinx armado en Blender y pintado en Substance Painter, con seis looks',
        'Bots que juegan cada nivel con la física del propio juego, para medir la dificultad en vez de adivinarla',
        'Solo anuncios con recompensa y looks cosméticos: nada compra puntos',
        'Corre a 60 fps en un iPhone, ya en TestFlight',
      ],
      tags: ['diseño de juegos', 'unity', 'c#', '3d', 'blender', 'substance painter', 'ios', 'juego móvil'],
      coverAlt: 'Jinx, el gato protagonista de Purrsuit, renderizado en 3D junto a dos iPhone: la pantalla de carga del juego y una carrera por el fondo del mar',
    },
  },
  {
    slug: 'equator', title: 'Equator', client: 'Equator', category: 'Brand', status: 'wip', year: 2026,
    cover: { kind: 'image', src: img('equator/brand'), alt: 'Equator brand: the horizon-line mark and wordmark in white', fit: 'contain', bg: '#ffffff', pattern: { seed: 63, palette: ['#ff9ec4', '#8898ff', '#ffb020'] } },
    scope: 'Brand identity, in progress',
    highlights: [
      "A horizon-line mark that reads at favicon size and on a studio pass",
      "A palette built as a horizon: sky, sun on the line, ground below",
      "A block pattern generated in code, one construction across every surface",
      "This site is the first place the system lives",
    ],
    summary: "This studio's own identity, still being drawn.",
    description: "My own brand, still in progress. A horizon line with a sun on it: sky above, ground below. The palette is generated in code, so every surface on this site shares one construction. This site is the first place it lives.",
    tags: ['branding', 'logo', 'visual identity', 'in progress', 'studio'],
    es: {
      summary: 'La identidad de mi propio estudio, todavía en proceso.',
      scope: 'Identidad de marca, en proceso',
      description: 'Mi propia marca, todavía en proceso. Una línea de horizonte con un sol encima: cielo arriba, tierra abajo. La paleta se genera en código, así que cada superficie de este sitio comparte una misma construcción. Este sitio es el primer lugar donde vive.',
      highlights: [
        'Un símbolo de horizonte que se lee igual en un favicon que en un pase de estudio',
        'Una paleta construida como un horizonte: cielo, sol en la línea y tierra abajo',
        'Un patrón de bloques generado en código, una sola construcción en todas las superficies',
        'Este sitio es el primer lugar donde vive el sistema',
      ],
      tags: ['marca', 'logo', 'identidad visual', 'en proceso', 'estudio'],
      coverAlt: 'Marca Equator: el símbolo de horizonte y el logotipo en blanco',
    },
  },
];

/** Widths every work image is built at. The browser picks one using each img's `sizes`. */
export const imageWidths = [640, 960, 1280, 1920, 2400];

/** A screenshot in the reader's language. */
const localShot = (s: Shot): Shot => (s.es ? { ...s, alt: s.es.alt ?? s.alt, caption: s.es.caption ?? s.caption } : s);

/** A project in the reader's language: the Spanish where there is some, English otherwise. */
export const localize = (p: Project, lang: Lang): Project => {
  if (lang === 'en') return p;
  const es = p.es ?? {};
  return {
    ...p,
    summary: es.summary ?? p.summary,
    scope: es.scope ?? p.scope,
    description: es.description ?? p.description,
    highlights: es.highlights ?? p.highlights,
    tags: es.tags ?? p.tags,
    cover: { ...p.cover, alt: es.coverAlt ?? p.cover.alt },
    hero: p.hero && localShot(p.hero),
    heroDark: p.heroDark && localShot(p.heroDark),
    chapters: p.chapters?.map((c) => ({
      ...c,
      title: c.es?.title ?? c.title,
      intro: c.es?.intro ?? c.intro,
      shots: c.shots.map(localShot),
      loops: c.loops?.map((l) => ({ ...l, alt: l.es?.alt ?? l.alt, caption: l.es?.caption ?? l.caption })),
    })),
    film: p.film && { ...p.film, alt: p.film.es?.alt ?? p.film.alt, caption: p.film.es?.caption ?? p.film.caption },
  };
};
