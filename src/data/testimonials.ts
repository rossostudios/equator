export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  hue: number;
}

export const testimonials: Testimonial[] = [
  { quote: 'Christopher turned a rough idea into a product people in our town actually use. He thinks about the business, not just the screens.', name: 'Plazuela team', role: 'Founders', company: 'Plazuela', initials: 'PZ', hue: 160 },
  { quote: 'Checkout went from a chore to a tap. Staff picked up the new POS in an afternoon and we have not looked back.', name: 'Petzone', role: 'Store owner', company: 'Petzone', initials: 'PT', hue: 28 },
  { quote: 'Fast replies, clear thinking, no ego. Every round of feedback came back better than we asked for.', name: 'Client', role: 'Product lead', company: 'Plazuela', initials: 'CL', hue: 230 },
];
