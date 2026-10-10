// Brick colours, kept apart from the 3D code so the page can name them without loading three.js.

/** Close to the real brick colours, which is most of why it reads as a toy. */
export const C = {
  white: '#F4F4F4', black: '#1B2A34', red: '#C91A09', blue: '#0055BF', yellow: '#F2CD37',
  green: '#237841', bgreen: '#4B9F4A', lime: '#BBE90B', orange: '#FE8A18', lorange: '#F8BB3D',
  tan: '#E4CD9E', dtan: '#958A73', brown: '#582A12', nougat: '#AA7D55',
  lgray: '#A0A5A9', dgray: '#6C6E68', azure: '#36AEBF', dazure: '#078BC9', aqua: '#B3D7D1',
  pink: '#E4ADC8', rose: '#F4A6B8', magenta: '#C870A0', navy: '#0A3463', purple: '#7E57D9',
  clay: '#B4532C', clay2: '#9C4424', forest: '#184632',
  /* The lamp heads: a warm pale yellow that reads as a bulb. */
  lamp: '#FFE08A',
  /* Me: skin, hair and beard, the black overshirt, jeans, the gold chain. */
  skin: '#E0A97E', skin2: '#C98B60', hair: '#2A1D17', jacket: '#22262B', denim: '#2B3E57', gold: '#D9AE45',
};

/** What visitors can build with on the lot, in the order the swatches show. */
export const SWATCHES = [C.red, C.yellow, C.blue, C.green, C.white, C.orange];
