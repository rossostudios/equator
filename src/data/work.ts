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

export type Category = 'Brand' | 'Product' | 'Web' | 'Motion' | 'Type';
export type Status = 'shipped' | 'wip';

/** One picture on a case-study page: a screenshot, or a specimen for a typeface. */
export interface Shot {
  src: ImageMetadata;
  /** What the screen shows, for screen readers and image search. */
  alt: string;
  /** The line printed under it. */
  caption?: string;
  es?: { alt?: string; caption?: string };
}

/** Pictures from one part of the work, shown under one heading. */
export interface Chapter {
  /** The anchor the page's chapter links jump to. */
  id: string;
  /** Without one, the shots follow the page's hero with no heading of their own. */
  title?: string;
  intro?: string;
  shots: Shot[];
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
  /** What the case study counts them as. Screens, unless the pictures aren't screenshots. */
  pictures?: 'screens' | 'images';
  url?: string;
  /** For work with no site of its own, like a typeface: the live product it runs in. */
  usedOn?: string;
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
            alt: 'Plazuela 3D town around a plaza with a church, numbered markers on the buildings and an open spot offered from $10 USD',
            caption: 'The board: every numbered building is a business, and number 20 is still open',
            es: {
              alt: 'El pueblo 3D de Plazuela alrededor de una plaza con iglesia, marcadores numerados en los edificios y un puesto libre desde USD 10',
              caption: 'El tablero: cada edificio numerado es un negocio, y el 20 sigue libre',
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
            alt: 'Street-level view of the town with people walking under colored bunting beside a building with blue balconies',
            caption: 'Walking the streets, among neighbors and bunting',
            es: {
              alt: 'Vista del pueblo a nivel de calle con gente caminando bajo banderines de colores junto a un edificio de balcones azules',
              caption: 'Paseando por las calles, entre vecinos y banderines',
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
            alt: 'Plazuela page for businesses: a headline, the offer from USD 10 with no account or subscription, and live positions in Colombia',
            caption: 'The offer: a storefront in the town from $10 USD, with no account or subscription',
            es: {
              alt: 'Página de Plazuela para negocios: un titular, la oferta desde USD 10 sin cuenta ni suscripción y las posiciones en vivo en Colombia',
              caption: 'La oferta: un local en el pueblo desde USD 10, sin cuenta ni suscripción',
            },
          },
          {
            src: img('plazuela/desktop-light/publish-profile'),
            alt: 'Publish dialog, profile step, filled in for a sample café with its Instagram handle, name, one-line description, category, photo and city',
            caption: "Step 1: the business's Instagram, name, one line, category and photo",
            es: {
              alt: 'Diálogo de publicación, paso de perfil, lleno para un café de ejemplo con su usuario de Instagram, nombre, descripción, categoría, foto y ciudad',
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
            alt: 'Plazuela menu on a phone with links to the town, events, how it works, advertising, the business page, the storefront shop and contact',
            caption: 'The menu: the town, the business side and Plazuela itself',
            es: {
              alt: 'Menú de Plazuela en un celular con enlaces al pueblo, eventos, cómo funciona, publicidad, la página del negocio, la tienda de fachadas y contacto',
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
    description: "A directory of local businesses in Colombia, except the directory is a town. Every building is a real business; open the door and you're talking to the owner. You can buy your own building too: one payment from USD 10, with no account or subscription.",
    tags: ['web design', 'product design', 'branding', 'marketplace', 'colombia', 'next.js'],
    es: {
      summary: 'Un directorio de negocios en Colombia, dibujado como un pueblo que puedes recorrer.',
      scope: 'Marca, diseño de producto, web, desarrollo',
      description: 'Un directorio de negocios locales en Colombia, solo que el directorio es un pueblo. Cada edificio es un negocio real; abres la puerta y estás hablando con el dueño. También puedes tener tu propio edificio: un solo pago desde USD 10, sin cuenta ni suscripción.',
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
    cover: { kind: 'image', src: img('petzone/hero-light'), alt: 'Petzone home on a desktop browser and on a phone', fit: 'contain', bg: '#ffffff', pattern: { seed: 41, palette: ['#ff6b1a', '#ffb020', '#101010'] } },
    /* Captions and alt text describe the screen, never the people on it, so no customer's
       name or address ends up in the page's text. The hero is the desktop and the phone
       together, in whichever theme the site is showing. */
    hero: {
      src: img('petzone/hero-light'),
      alt: 'Petzone home on a desktop browser and on a phone, in the light theme',
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
        id: 'point-of-sale',
        title: 'Point of sale',
        intro: "A sale from an empty register to change in hand, then the day's tickets and the cash drawer.",
        es: {
          title: 'Punto de venta',
          intro: 'Una venta desde la caja vacía hasta el cambio en la mano y, después, los tickets del día y el cajón de efectivo.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/register'),
            alt: 'Petzone register: product cards with price and stock, and an empty ticket suggesting regular customers by name and pet',
            caption: 'The register: scan or search, with regular customers and their pets one tap away',
            es: {
              alt: 'Caja de Petzone: tarjetas de producto con precio y disponibilidad, y un ticket vacío que sugiere clientes frecuentes por nombre y mascota',
              caption: 'La caja: escanear o buscar, con los clientes frecuentes y sus mascotas a un toque',
            },
          },
          {
            src: img('petzone/desktop-light/ticket'),
            alt: 'Petzone register with a four-item ticket for a customer and their pet, the total to charge, and cash or QR transfer to pay',
            caption: 'A ticket in progress: pay now or reserve it, in cash or by transfer',
            es: {
              alt: 'Caja de Petzone con un ticket de cuatro productos para un cliente y su mascota, el total a cobrar y pago en efectivo o por transferencia QR',
              caption: 'Un ticket en curso: pagar ya o apartarlo, en efectivo o por transferencia',
            },
          },
          {
            src: img('petzone/desktop-light/variant-picker'),
            alt: "Petzone variant picker for Churu Cat Puree: size and flavor options, with the chosen variant's price and stock",
            caption: 'Picking a size and flavor before it goes on the ticket',
            es: {
              alt: 'Selector de variantes de Petzone para Churu Cat Puree: opciones de tamaño y sabor, con el precio y la disponibilidad de la variante elegida',
              caption: 'Elegir tamaño y sabor antes de agregarlo al ticket',
            },
          },
          {
            src: img('petzone/desktop-light/cash'),
            alt: 'Petzone checkout taking cash, with quick amount buttons and the change to give',
            caption: 'Taking cash: one-tap amounts and the change worked out',
            es: {
              alt: 'Cobro en efectivo en Petzone, con botones de montos rápidos y el cambio por entregar',
              caption: 'Cobro en efectivo: montos con un toque y el cambio ya calculado',
            },
          },
          {
            src: img('petzone/desktop-light/paid'),
            alt: 'Petzone payment confirmation with the total paid in cash, the cash received and the change to give',
            caption: 'Payment recorded: the change to give, and Enter starts the next sale',
            es: {
              alt: 'Confirmación de pago en Petzone con el total pagado en efectivo, el efectivo recibido y el cambio por entregar',
              caption: 'Pago registrado: el cambio por entregar, y Enter empieza la siguiente venta',
            },
          },
          {
            src: img('petzone/desktop-light/todays-tickets'),
            alt: "Petzone today's tickets: net sales, money collected, money refunded and the outstanding balance above the day's list of tickets",
            caption: "Today's tickets: sales, money collected, refunds and what's still owed",
            es: {
              alt: 'Tickets del día en Petzone: ventas netas, dinero cobrado, dinero devuelto y saldo pendiente sobre la lista de tickets del día',
              caption: 'Tickets del día: ventas, dinero cobrado, devoluciones y lo que falta por cobrar',
            },
          },
          {
            src: img('petzone/desktop-light/cash-drawer'),
            alt: 'Petzone cash drawer, open, with the opening float, net cash movement and the cash expected in the drawer',
            caption: 'The cash drawer: open it, sell, then count the cash once at close',
            es: {
              alt: 'Cajón de efectivo de Petzone abierto, con la base inicial, el movimiento neto de efectivo y el efectivo esperado en el cajón',
              caption: 'El cajón de efectivo: abrirlo, vender y contar el efectivo una sola vez al cerrar',
            },
          },
        ],
      },
      {
        id: 'sales',
        title: 'Sales and orders',
        intro: 'Behind the counter: every receipt, orders set aside for later, and customers due to buy again.',
        es: {
          title: 'Ventas y pedidos',
          intro: 'Detrás del mostrador: cada recibo, los pedidos apartados para después y los clientes a los que ya les toca volver a comprar.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/sales'),
            alt: 'Petzone sales: a table of counter receipts with customer, date, net units, net total and payment status',
            caption: 'Sales: every receipt with its units, total and payment status',
            es: {
              alt: 'Ventas de Petzone: una tabla de recibos del mostrador con cliente, fecha, unidades netas, total neto y estado de pago',
              caption: 'Ventas: cada recibo con sus unidades, su total y su estado de pago',
            },
          },
          {
            src: img('petzone/desktop-light/sale'),
            alt: 'Petzone sale opened in a side panel: paid and delivered, four products and the ticket history, with archive and return actions',
            caption: 'One sale opened beside the list: products, delivery, history and returns',
            es: {
              alt: 'Venta de Petzone abierta en un panel lateral: pagada y entregada, cuatro productos y el historial del ticket, con acciones para archivar y devolver',
              caption: 'Una venta abierta junto a la lista: productos, entrega, historial y devoluciones',
            },
          },
          {
            src: img('petzone/desktop-light/orders'),
            alt: "Petzone orders: open orders, their value and what's left to collect, above the stock reserved for each one",
            caption: 'Orders set aside for later payment, pickup or delivery',
            es: {
              alt: 'Pedidos de Petzone: pedidos abiertos, su valor y lo que falta por cobrar, sobre el inventario apartado para cada uno',
              caption: 'Pedidos apartados para pagar, recoger o enviar después',
            },
          },
          {
            src: img('petzone/desktop-light/order'),
            alt: 'Petzone order opened in a side panel: being prepared, payment pending, for delivery with payment on arrival',
            caption: 'A delivery order, paid for when it arrives',
            es: {
              alt: 'Pedido de Petzone abierto en un panel lateral: en preparación, con el pago pendiente, para envío a domicilio con pago contra entrega',
              caption: 'Un pedido a domicilio que se paga al recibirlo',
            },
          },
          {
            src: img('petzone/desktop-light/refills'),
            alt: "Petzone refills: customers due to buy their pet's food again, with the estimated date, a repeat purchase button and a WhatsApp draft",
            caption: 'Refills: when each pet is likely to need more, with a WhatsApp message drafted',
            es: {
              alt: 'Recompras en Petzone: clientes a los que les toca volver a comprar la comida de su mascota, con la fecha estimada, un botón para repetir la compra y un borrador de WhatsApp',
              caption: 'Recompras: cuándo es probable que cada mascota necesite más, con un mensaje de WhatsApp listo',
            },
          },
        ],
      },
      {
        id: 'inventory',
        title: 'Inventory and vendors',
        intro: "Stock for every product and variant, shelf counts, and the vendors it's bought from.",
        es: {
          title: 'Inventario y proveedores',
          intro: 'El inventario de cada producto y variante, los conteos físicos y los proveedores a los que se les compra.',
        },
        shots: [
          {
            src: img('petzone/desktop-light/inventory'),
            alt: 'Petzone inventory: products with size, available and committed stock, sale price and a low or healthy reorder status',
            caption: "Inventory: what's available, what's committed and what's running low",
            es: {
              alt: 'Inventario de Petzone: productos con tamaño, unidades disponibles y comprometidas, precio de venta y un estado de reposición bajo o saludable',
              caption: 'Inventario: lo disponible, lo comprometido y lo que se está acabando',
            },
          },
          {
            src: img('petzone/desktop-light/product'),
            alt: 'Petzone product record for a dog food, open to its details, with tabs for variants, price and stock, codes and suppliers',
            caption: 'A product record, with variants, price, codes and suppliers in tabs',
            es: {
              alt: 'Ficha de producto de Petzone para un alimento para perro, abierta en sus detalles, con pestañas de variantes, precio y existencias, códigos y proveedores',
              caption: 'La ficha de un producto, con variantes, precio, códigos y proveedores en pestañas',
            },
          },
          {
            src: img('petzone/desktop-light/variants-size'),
            alt: 'Petzone variants for a dog food in 1 kg, 3 kg and 7.5 kg bags, each with its own SKU, price and stock',
            caption: 'Sizes as variants, each with its own SKU, price and stock',
            es: {
              alt: 'Variantes de un alimento para perro en Petzone en bolsas de 1 kg, 3 kg y 7,5 kg, cada una con su referencia, precio y existencias',
              caption: 'Tamaños como variantes, cada uno con su referencia, precio y existencias',
            },
          },
          {
            src: img('petzone/desktop-light/variants-flavor'),
            alt: 'Petzone variants for Churu Cat Puree that combine size and flavor, with the stock of each and the total across all four',
            caption: 'Two options at once: every size and flavor is its own SKU',
            es: {
              alt: 'Variantes de Churu Cat Puree en Petzone que combinan tamaño y sabor, con las existencias de cada una y el total de las cuatro',
              caption: 'Dos opciones a la vez: cada combinación de tamaño y sabor es su propia referencia',
            },
          },
          {
            src: img('petzone/desktop-light/new-product'),
            alt: 'Petzone new product form with a preferred supplier, type, species and unit cost, and three sizes each priced separately',
            caption: "A new product with its sizes priced up front. Stock arrives when it's received or counted",
            es: {
              alt: 'Formulario de producto nuevo en Petzone con proveedor preferido, tipo, especie y costo unitario, y tres tamaños con precio propio',
              caption: 'Un producto nuevo con sus tamaños y precios desde el inicio. Las existencias llegan al recibirlo o contarlo',
            },
          },
          {
            src: img('petzone/desktop-light/counts'),
            alt: 'Petzone counts: an active count partway done, above the history of applied counts',
            caption: 'Stock counts: pick up where you left off, with every past count on record',
            es: {
              alt: 'Conteos de Petzone: un conteo activo a medio camino, sobre el historial de conteos aplicados',
              caption: 'Conteos de inventario: sigue donde quedaste, con cada conteo anterior registrado',
            },
          },
          {
            src: img('petzone/desktop-light/vendors'),
            alt: "Petzone vendors: each vendor's linked products, last purchase date, missing vendor codes and payment terms",
            caption: 'Vendors: products per vendor, the last purchase and any missing codes',
            es: {
              alt: 'Proveedores de Petzone: los productos de cada proveedor, la fecha de la última compra, los códigos faltantes y las condiciones de pago',
              caption: 'Proveedores: productos por proveedor, la última compra y los códigos que faltan',
            },
          },
        ],
      },
      {
        id: 'phone',
        title: 'On a phone',
        intro: 'Everything reachable with a thumb: one column, a menu for the rest, and records that slide up from the bottom.',
        es: {
          title: 'En el celular',
          intro: 'Todo al alcance del pulgar: una columna, un menú para lo demás y registros que suben desde abajo.',
        },
        shots: [
          {
            src: img('petzone/mobile-light/home'),
            alt: 'Petzone home on a phone: a greeting with quick actions, refills to follow up and money to collect',
            caption: 'Home: the day at a glance, in one column',
            es: {
              alt: 'Inicio de Petzone en el celular: un saludo con acciones rápidas, recompras por atender y dinero por cobrar',
              caption: 'Inicio: el resumen del día, en una columna',
            },
          },
          {
            src: img('petzone/mobile-light/menu'),
            alt: 'Petzone menu on a phone: home, notifications, cash and banks, sales, inventory, vendors, customers and reports, with counts for orders and refills',
            caption: 'The menu: every part of the back office',
            es: {
              alt: 'Menú de Petzone en el celular: inicio, notificaciones, caja y bancos, ventas, inventario, proveedores, clientes y reportes, con contadores de pedidos y recompras',
              caption: 'El menú: cada parte del back office',
            },
          },
          {
            src: img('petzone/mobile-light/register'),
            alt: 'Petzone register on a phone: search and scan, suggested customers with their pets, a two-item ticket and the total above a button to continue to payment',
            caption: 'The register: the ticket, then the total above the pay button',
            es: {
              alt: 'Caja de Petzone en el celular: buscar y escanear, clientes sugeridos con sus mascotas, un ticket de dos productos y el total sobre un botón para pasar al pago',
              caption: 'La caja: el ticket y, debajo, el total sobre el botón de pago',
            },
          },
          {
            src: img('petzone/mobile-light/variant-picker'),
            alt: "Petzone variant picker on a phone for Churu Cat Puree: size and flavor options, the chosen variant's price and stock, and a button to add it to the ticket",
            caption: 'Picking a size and flavor',
            es: {
              alt: 'Selector de variantes de Petzone en el celular para Churu Cat Puree: opciones de tamaño y sabor, el precio y la disponibilidad de la variante elegida y un botón para agregarla al ticket',
              caption: 'Elegir tamaño y sabor',
            },
          },
          {
            src: img('petzone/mobile-light/variants'),
            alt: "Petzone product record on a phone, open as a sheet on its variants tab: sizes, flavors and each variant's price",
            caption: "A product's variants, in a sheet from the bottom",
            es: {
              alt: 'Ficha de producto de Petzone en el celular, abierta como panel en la pestaña de variantes: tamaños, sabores y el precio de cada variante',
              caption: 'Las variantes de un producto, en un panel desde abajo',
            },
          },
          {
            src: img('petzone/mobile-light/customer'),
            alt: 'Petzone customer record on a phone: last purchase, number of purchases, balance, next step and their pet',
            caption: "A customer's household: their pet, purchases and balance",
            es: {
              alt: 'Ficha de cliente de Petzone en el celular: última compra, número de compras, saldo, siguiente paso y su mascota',
              caption: 'El hogar de un cliente: su mascota, sus compras y su saldo',
            },
          },
          {
            src: img('petzone/mobile-light/reports'),
            alt: 'Petzone reports on a phone: a 30-day range with net sales, gross profit, completed tickets and customer balances',
            caption: 'Reports: net sales, profit, tickets and balances',
            es: {
              alt: 'Reportes de Petzone en el celular: un rango de 30 días con ventas netas, ganancia bruta, tickets completados y saldos de clientes',
              caption: 'Reportes: ventas netas, ganancia, tickets y saldos',
            },
          },
        ],
      },
      {
        id: 'dark',
        title: 'Dark theme',
        intro: "The same app in its dark theme, including reports and a customer's record.",
        es: {
          title: 'Tema oscuro',
          intro: 'La misma app en su tema oscuro, incluidos los reportes y la ficha de un cliente.',
        },
        shots: [
          {
            src: img('petzone/desktop-dark/home'),
            alt: "Petzone home in the dark theme: refills to follow up, money to collect, products to replenish, the cash drawer and today's totals",
            caption: "Home: what's owed, what to reorder and the cash drawer",
            es: {
              alt: 'Inicio de Petzone en el tema oscuro: recompras por atender, dinero por cobrar, productos por reponer, el cajón de efectivo y los totales del día',
              caption: 'Inicio: lo que te deben, lo que hay que reponer y el cajón de efectivo',
            },
          },
          {
            src: img('petzone/desktop-dark/register'),
            alt: 'Petzone register in the dark theme with a three-item ticket for a customer and their pet, and cash or QR transfer to pay',
            caption: 'A ticket ready to charge, in cash or by transfer',
            es: {
              alt: 'Caja de Petzone en el tema oscuro con un ticket de tres productos para un cliente y su mascota, y pago en efectivo o por transferencia QR',
              caption: 'Un ticket listo para cobrar, en efectivo o por transferencia',
            },
          },
          {
            src: img('petzone/desktop-dark/variant-picker'),
            alt: "Petzone variant picker in the dark theme for Pro Plan Adult Small Breed: three sizes, each with its price, and the chosen size's stock",
            caption: 'Picking a size, with each price on its button',
            es: {
              alt: 'Selector de variantes de Petzone en el tema oscuro para Pro Plan Adult Small Breed: tres tamaños, cada uno con su precio, y la disponibilidad del tamaño elegido',
              caption: 'Elegir tamaño, con el precio de cada uno en su botón',
            },
          },
          {
            src: img('petzone/desktop-dark/inventory'),
            alt: 'Petzone inventory in the dark theme: products with size, available and committed stock, sale price and reorder status',
            caption: "Inventory: what's available, what's committed and what's running low",
            es: {
              alt: 'Inventario de Petzone en el tema oscuro: productos con tamaño, unidades disponibles y comprometidas, precio de venta y estado de reposición',
              caption: 'Inventario: lo disponible, lo comprometido y lo que se está acabando',
            },
          },
          {
            src: img('petzone/desktop-dark/variants'),
            alt: 'Petzone product panel in the dark theme for Churu Cat Puree: four variants combining size and flavor, each with its SKU, price and stock',
            caption: "A product's variants: every size and flavor with its own SKU and price",
            es: {
              alt: 'Panel de producto de Petzone en el tema oscuro para Churu Cat Puree: cuatro variantes que combinan tamaño y sabor, cada una con su referencia, precio y existencias',
              caption: 'Las variantes de un producto: cada tamaño y sabor con su referencia y su precio',
            },
          },
          {
            src: img('petzone/desktop-dark/reports'),
            alt: 'Petzone reports in the dark theme: profitability by product over 30 days, with units, net sales, profit, margin and days of cover',
            caption: 'Reports: profit, margin and days of cover for each product',
            es: {
              alt: 'Reportes de Petzone en el tema oscuro: rentabilidad por producto en 30 días, con unidades, ventas netas, ganancia, margen y días de cobertura',
              caption: 'Reportes: ganancia, margen y días de cobertura de cada producto',
            },
          },
          {
            src: img('petzone/desktop-dark/customer'),
            alt: 'Petzone customer record in the dark theme: last purchase, number of purchases, balance, their pet and their usual purchases',
            caption: "A customer's record: their pet, purchases, balance and usual buys",
            es: {
              alt: 'Ficha de cliente de Petzone en el tema oscuro: última compra, número de compras, saldo, su mascota y sus compras habituales',
              caption: 'La ficha de un cliente: su mascota, sus compras, su saldo y lo que suele comprar',
            },
          },
        ],
      },
    ],
    url: 'https://petzone-coral.vercel.app',
    scope: 'Product design, build, operations',
    highlights: [
      "A register built for a counter: scan or search, favourites, one-tap ticket",
      "Receipts, plus orders reserved for later payment, pickup or delivery",
      "Inventory by SKU and variant, customers, vendors and reports behind the till",
      "Register, today's tickets and the cash drawer on one screen",
      "Runs the shop's daily trade, not a prototype",
    ],
    summary: "The till and back office running a pet store in Itagüí.",
    description: "Point-of-sale and operations for a pet retail store in Itagüí, Colombia. Fast checkout at the counter, then sales, inventory by SKU and variant, customers and reports behind it. Designed for a counter, not a desk: everything reachable with a thumb, keyboard shortcuts for the till.",
    tags: ['product design', 'pos', 'retail', 'operations', 'ui', 'ux', 'dashboard'],
    es: {
      summary: 'La caja y el back office con los que funciona una tienda de mascotas en Itagüí.',
      scope: 'Diseño de producto, desarrollo, operaciones',
      description: 'Punto de venta y operaciones para una tienda de mascotas en Itagüí, Colombia. Cobro rápido en el mostrador y, detrás, ventas, inventario por referencia y variante, clientes y reportes. Diseñado para un mostrador, no para un escritorio: todo al alcance del pulgar y atajos de teclado para la caja.',
      highlights: [
        'Una caja pensada para el mostrador: escanear o buscar, favoritos y ticket con un toque',
        'Recibos, más pedidos apartados para pagar, recoger o enviar después',
        'Inventario por referencia y variante, clientes, proveedores y reportes detrás de la caja',
        'Caja, tickets del día y cajón de efectivo en una sola pantalla',
        'Se usa en la operación diaria de la tienda, no es un prototipo',
      ],
      tags: ['diseño de producto', 'pos', 'retail', 'operaciones', 'ui', 'ux', 'dashboard'],
      coverAlt: 'Inicio de Petzone en un navegador de escritorio y en un celular',
    },
  },
  {
    slug: 'plaza', title: 'Plaza', client: 'Plazuela', category: 'Type', status: 'shipped', year: 2026,
    cover: { kind: 'image', src: img('plaza/hero-light'), alt: 'Plaza type specimen: the word Plaza on its metric lines, with a yellow card set in Plaza Display Black', fit: 'contain', bg: '#ffffff', pattern: { seed: 29, palette: ['#2b4bdb', '#8fa4ff', '#14161b'] } },
    /* Specimen plates drawn from the v4.200 font files. The sample lines are the specimen's
       own, in Spanish, since Plaza was drawn for a product that speaks it. */
    hero: {
      src: img('plaza/hero-light'),
      alt: 'Plaza specimen page: the word Plaza in Display Black between its cap height, x-height, baseline and descender lines, beside a yellow card reading ¡Pan caliente, queso y mango!',
      caption: 'Plaza on its metric lines, and a market sign in Plaza Display Black',
      es: {
        alt: 'Página del espécimen de Plaza: la palabra Plaza en Display Black entre sus líneas de altura de mayúsculas, altura de x, línea base y descendente, junto a una tarjeta amarilla que dice ¡Pan caliente, queso y mango!',
        caption: 'Plaza sobre sus líneas de medida y un letrero de mercado en Plaza Display Black',
      },
    },
    heroDark: {
      src: img('plaza/hero-dark'),
      alt: 'The same Plaza specimen page on a dark background, beside the yellow card reading ¡Pan caliente, queso y mango!',
      caption: 'Plaza on its metric lines, and a market sign in Plaza Display Black',
      es: {
        alt: 'La misma página del espécimen de Plaza sobre fondo oscuro, junto a la tarjeta amarilla que dice ¡Pan caliente, queso y mango!',
        caption: 'Plaza sobre sus líneas de medida y un letrero de mercado en Plaza Display Black',
      },
    },
    pictures: 'images',
    chapters: [
      {
        id: 'families',
        title: 'Two families, nine weights',
        intro: 'Plaza sets text and interfaces. Plaza Display sets headlines, fitted tighter so big lines pack together. Each comes in nine weights, from Thin to Black.',
        es: {
          title: 'Dos familias, nueve pesos',
          intro: 'Plaza compone textos e interfaces. Plaza Display compone titulares, más ajustada para que las líneas grandes queden compactas. Cada una viene en nueve pesos, de Thin a Black.',
        },
        shots: [
          {
            src: img('plaza/cuts'),
            alt: 'Mercado Fresco set in Plaza Black and in Plaza Display Black, each measured: 9.10 em against 7.74 em',
            caption: 'The same words at Black: in Plaza Display the line runs about 15% shorter',
            es: {
              alt: 'Mercado Fresco en Plaza Black y en Plaza Display Black, cada una medida: 9,10 em contra 7,74 em',
              caption: 'Las mismas palabras en Black: en Plaza Display la línea queda un 15% más corta',
            },
          },
          {
            src: img('plaza/weights'),
            alt: 'Nos vemos en la plaza set nine times, in each weight of Plaza from Thin 100 to Black 900',
            caption: 'Nine weights, from a hairline Thin to a heavy Black',
            es: {
              alt: 'Nos vemos en la plaza compuesto nueve veces, en cada peso de Plaza de Thin 100 a Black 900',
              caption: 'Nueve pesos, desde un Thin finísimo hasta un Black pesado',
            },
          },
          {
            src: img('plaza/sizes'),
            alt: 'Plaza set from 56 px down to 13 px: a question, a line with a price, a checkout line and three short paragraphs',
            caption: 'Down to 13 px, where interface text lives, prices included',
            es: {
              alt: 'Plaza compuesta de 56 px a 13 px: una pregunta, una línea con un precio, una línea de compra y tres párrafos cortos',
              caption: 'Hasta 13 px, donde vive el texto de una interfaz, precios incluidos',
            },
          },
        ],
      },
      {
        id: 'alternates',
        title: 'Alternates and emoticons',
        intro: 'Eight playful letters and a set of faces, each in its own stylistic set. They stay off until you switch them on, so ordinary text never changes.',
        es: {
          title: 'Alternativas y emoticones',
          intro: 'Ocho letras juguetonas y un juego de caras, cada una en su propio set estilístico. Están apagadas hasta que las activas, así que el texto normal nunca cambia.',
        },
        shots: [
          {
            src: img('plaza/alternates'),
            alt: 'Eight alternate letters beside their defaults: a round single-storey a, a round tilted e, a swash g, G without bar, J with top bar, a straight-sided M, a swash Q and a straight-leg R, with their stylistic sets ss01 to ss08',
            caption: 'Eight alternates, ss01 to ss08, each one switched on by itself',
            es: {
              alt: 'Ocho letras alternativas junto a las normales: una a redonda de un solo piso, una e redonda inclinada, una g con floreo, una G sin barra, una J con barra arriba, una M de lados rectos, una Q con floreo y una R de pierna recta, con sus sets estilísticos de ss01 a ss08',
              caption: 'Ocho alternativas, de ss01 a ss08, cada una se activa por separado',
            },
          },
          {
            src: img('plaza/all-at-once'),
            alt: 'Gran Queso Rojo, Jamón y Mango in Plaza Display Black, first with the default letters and then with all eight alternates on',
            caption: 'All eight at once, with one setting',
            es: {
              alt: 'Gran Queso Rojo, Jamón y Mango en Plaza Display Black, primero con las letras normales y después con las ocho alternativas activas',
              caption: 'Las ocho a la vez, con un solo ajuste',
            },
          },
          {
            src: img('plaza/emoticons'),
            alt: 'A typed line with :), <3 and ;) and the same line with the emoticon set on, where they become faces and a heart, above a grid of sixteen faces and symbols',
            caption: 'Typed :) and <3 turn into faces and a heart, but only with the set on',
            es: {
              alt: 'Una línea escrita con :), <3 y ;) y la misma línea con el set de emoticones activo, donde se vuelven caras y un corazón, sobre una cuadrícula de dieciséis caras y símbolos',
              caption: 'Al escribir :) y <3 aparecen caras y un corazón, pero solo con el set activo',
            },
          },
        ],
      },
      {
        id: 'letters',
        title: 'The letters',
        intro: 'Every letter is written once, in Python, as a function of the stem width, so one drawing gives all nine weights. A few choices repeat across the alphabet and give Plaza its voice.',
        es: {
          title: 'Las letras',
          intro: 'Cada letra se escribe una sola vez, en Python, en función del grosor del asta, así que un mismo dibujo da los nueve pesos. Unas pocas decisiones se repiten en todo el alfabeto y le dan a Plaza su voz.',
        },
        shots: [
          {
            src: img('plaza/construction'),
            alt: 'The outlines of the letter a in all nine weights drawn on top of each other, the Regular with its points, beside the stem width of each weight from 34 at Thin to 178 at Black',
            caption: 'One drawing, nine weights: the stem goes from 34 font units at Thin to 178 at Black',
            es: {
              alt: 'Los contornos de la letra a en los nueve pesos, uno sobre otro, la Regular con sus puntos, junto al grosor del asta de cada peso, de 34 en Thin a 178 en Black',
              caption: 'Un dibujo, nueve pesos: el asta va de 34 unidades en Thin a 178 en Black',
            },
          },
          {
            src: img('plaza/details'),
            alt: 'The letters o, n, t, e, i and an exclamation mark on a shared baseline and x-height, with notes on round bowls, notched joins, an angled t, level terminals and round dots',
            caption: 'Round bowls, notched joins, an angled t, level terminals and round dots',
            es: {
              alt: 'Las letras o, n, t, e, i y un signo de exclamación sobre una misma línea base y altura de x, con notas sobre los óvalos redondos, las uniones con muesca, la t en ángulo, los remates rectos y los puntos redondos',
              caption: 'Óvalos redondos, uniones con muesca, una t en ángulo, remates rectos y puntos redondos',
            },
          },
          {
            src: img('plaza/charset'),
            alt: "Plaza's character set in a grid, from punctuation and figures through Latin-1 and Latin Extended-A to arrows and emoticons, above pangrams in Polish, Czech, Turkish, Romanian, Hungarian and German",
            caption: '457 glyphs, enough for Spanish, Portuguese, French, German, Polish, Turkish and more',
            es: {
              alt: 'El juego de caracteres de Plaza en una cuadrícula, de la puntuación y las cifras al latín 1 y el latín extendido A, hasta flechas y emoticones, sobre pangramas en polaco, checo, turco, rumano, húngaro y alemán',
              caption: '457 glifos, suficientes para español, portugués, francés, alemán, polaco, turco y más',
            },
          },
        ],
      },
      {
        id: 'plazuela',
        title: 'In Plazuela',
        intro: 'Plaza replaced two off-the-shelf fonts everywhere in Plazuela: its pages, checkout, emails, share images and the signs painted in the town.',
        es: {
          title: 'En Plazuela',
          intro: 'Plaza reemplazó dos tipografías de catálogo en todo Plazuela: sus páginas, el pago, los correos, las imágenes para compartir y los letreros pintados en el pueblo.',
        },
        shots: [
          {
            src: img('plaza/wordmark'),
            alt: "Plazuela's logo: the plaza mark beside the Plazuela wordmark in green, set in Plaza Display Bold",
            caption: "Plazuela's wordmark, set in Plaza Display Bold",
            es: {
              alt: 'El logo de Plazuela: el símbolo de la plaza junto al logotipo de Plazuela en verde, compuesto en Plaza Display Bold',
              caption: 'El logotipo de Plazuela, compuesto en Plaza Display Bold',
            },
          },
          {
            src: img('plaza/icons'),
            alt: "Plazuela's 3D navigation icons: a compass lettered N, E, S and W, a calendar numbered 1 to 31 and a speech bubble with a question mark",
            caption: 'The navigation icons, lettered in Plaza',
            es: {
              alt: 'Los íconos 3D de navegación de Plazuela: una brújula con N, E, S y W, un calendario numerado del 1 al 31 y un globo de diálogo con un signo de interrogación',
              caption: 'Los íconos de navegación, rotulados en Plaza',
            },
          },
        ],
      },
    ],
    usedOn: 'https://www.plazuela.app/',
    scope: 'Type design, font production',
    highlights: [
      "Two families, Plaza and Plaza Display, each in nine weights from Thin to Black",
      "457 glyphs, covering Spanish, Portuguese, French, German, Polish, Turkish and more",
      "Eight alternate letters and a set of emoticons, off until you switch them on",
      "Kerning, plus tabular figures for prices and tables",
      "Web and desktop fonts, built and checked by script from one parametric source",
    ],
    summary: "Plazuela's own typeface: two families, nine weights each.",
    description: "Plazuela was set in two off-the-shelf fonts. Now it has its own. Plaza is a friendly sans in two cuts: Plaza for text and interfaces, Plaza Display for headlines. It sets everything in Plazuela, from the wordmark and the signs in the town to prices and checkout. I drew it in Python, so all nine weights come from one design.",
    tags: ['type design', 'typeface', 'custom font', 'opentype', 'branding', 'python'],
    es: {
      summary: 'La tipografía propia de Plazuela: dos familias, nueve pesos cada una.',
      scope: 'Diseño tipográfico, producción de fuentes',
      description: 'Plazuela usaba dos tipografías de catálogo. Ahora tiene la suya. Plaza es una sans serif amable en dos versiones: Plaza para textos e interfaces, Plaza Display para titulares. Compone todo en Plazuela, desde el logotipo y los letreros del pueblo hasta los precios y el pago. La dibujé en Python, así que los nueve pesos salen de un mismo diseño.',
      highlights: [
        'Dos familias, Plaza y Plaza Display, cada una en nueve pesos de Thin a Black',
        '457 glifos, suficientes para español, portugués, francés, alemán, polaco, turco y más',
        'Ocho letras alternativas y un juego de emoticones, apagados hasta que los activas',
        'Kerning y cifras tabulares para precios y tablas',
        'Fuentes para web y escritorio, generadas y revisadas por un script desde un solo diseño paramétrico',
      ],
      tags: ['diseño tipográfico', 'tipografía', 'fuente a la medida', 'opentype', 'marca', 'python'],
      coverAlt: 'Espécimen de Plaza: la palabra Plaza sobre sus líneas de medida, con una tarjeta amarilla compuesta en Plaza Display Black',
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
    })),
  };
};
