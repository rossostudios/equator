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

export type Category = 'Brand' | 'Product' | 'Web' | 'Motion';
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
    cover: { kind: 'image', src: img('petzone/hero-light'), alt: 'Petzone Home on a desktop browser and on a phone', fit: 'contain', bg: '#ffffff', pattern: { seed: 41, palette: ['#ff6b1a', '#ffb020', '#101010'] } },
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
        intro: 'Home opens on the day: money collected, orders to prepare and balances to collect. A new store sees its setup there instead, one card per step, each with a 3D scene that moves under the cursor.',
        es: {
          title: 'Inicio y configuración',
          intro: 'El inicio abre con el día: el dinero cobrado, los pedidos por preparar y los saldos por cobrar. Una tienda nueva ve ahí su configuración, una tarjeta por paso, cada una con una escena 3D que se mueve al pasar el cursor.',
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
            alt: 'Petzone purchase orders: an order sent to a supplier and ready to receive, and the inventory on its way from three more, with their expected delivery dates',
            caption: "Purchase orders: what to receive today and what's on its way",
            es: {
              alt: 'Órdenes de compra de Petzone: una orden enviada a un proveedor y lista para recibir, y el inventario en camino de otras tres, con su fecha de entrega esperada',
              caption: 'Órdenes de compra: lo que hay que recibir hoy y lo que viene en camino',
            },
          },
          {
            src: img('petzone/desktop-light/purchase-order'),
            alt: 'Petzone purchase order, sent: a product ordered, received and remaining, with its cost, the supplier and expected delivery beside it, and a button to receive inventory',
            caption: 'A purchase order: ordered, received and still in transit',
            es: {
              alt: 'Orden de compra de Petzone, enviada: un producto pedido, recibido y pendiente, con su costo, y al lado el proveedor y la entrega esperada, con un botón para recibir inventario',
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
      alt: "Petzone's film: a 3D shop prints a receipt, eighteen purchase-order spreadsheets fall in and their bad cells light up, then the app screen by screen, from Home and a sale charged at the register to orders, products, discounts, customers, purchasing, the cash drawer and reports, Home's setup cards coming alive, and two phones.",
      caption: 'A silent film made from the app itself, for the site and for social media. Sample store data.',
      es: {
        alt: 'El video de Petzone: una tienda 3D imprime un recibo, caen dieciocho hojas de cálculo de órdenes de compra y se iluminan sus celdas con errores, y luego la app pantalla por pantalla, del inicio y una venta cobrada en la caja a los pedidos, los productos, los descuentos, los clientes, las compras, la jornada de caja y los reportes, las tarjetas de configuración del inicio cobrando vida y dos celulares.',
        caption: 'Un video sin sonido hecho con la propia app, para el sitio y las redes sociales. Datos de una tienda de ejemplo.',
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
      "Runs the shop's daily trade, not a prototype",
    ],
    summary: "The till and back office running a pet store in Itagüí.",
    description: "Point-of-sale and operations for a pet retail store in Itagüí, Colombia. Fast checkout at the counter, then orders, products by SKU and variant, purchasing, discounts, customers and reports behind it. Designed for a counter, not a desk: everything reachable with a thumb, keyboard shortcuts for the till.",
    tags: ['product design', 'pos', 'retail', 'operations', 'ui', 'ux', 'dashboard'],
    es: {
      summary: 'La caja y el back office con los que funciona una tienda de mascotas en Itagüí.',
      scope: 'Diseño de producto, desarrollo, operaciones',
      description: 'Punto de venta y operaciones para una tienda de mascotas en Itagüí, Colombia. Cobro rápido en el mostrador y, detrás, pedidos, productos por referencia y variante, compras, descuentos, clientes y reportes. Diseñado para un mostrador, no para un escritorio: todo al alcance del pulgar y atajos de teclado para la caja.',
      highlights: [
        'Una caja pensada para el mostrador: escanear o buscar, favoritos y ticket con un toque',
        'Recibos, más pedidos apartados para pagar, recoger o enviar después',
        'Productos por referencia, variante y lote, órdenes de compra, clientes y reportes detrás de la caja',
        'Descuentos que la caja aplica sola: códigos, compra X y lleva Y, domicilio gratis',
        'Un inicio que prepara una tienda nueva paso a paso, cada paso una tarjeta en 3D',
        'Se usa en la operación diaria de la tienda, no es un prototipo',
      ],
      tags: ['diseño de producto', 'pos', 'retail', 'operaciones', 'ui', 'ux', 'dashboard'],
      coverAlt: 'Inicio de Petzone en un navegador de escritorio y en un celular',
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
