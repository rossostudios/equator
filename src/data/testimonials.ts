export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Two letters for the avatar. */
  initials: string;
  /** Hue 0-360 for the avatar colour. */
  hue: number;
}

/**
 * Real words only. Nothing goes in here until the person has actually said it
 * and is happy to be quoted by name.
 *
 * `company` is matched against a project's `client` in work.ts, so adding an
 * entry also places the quote on that project's case study page.
 *
 * { quote: '…', name: 'Ana Ruiz', role: 'Store owner', company: 'Petzone', initials: 'AR', hue: 28 },
 */
export const testimonials: Testimonial[] = [];
