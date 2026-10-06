/** Original, individually generated sprites. Every PNG has its own alpha canvas. */
export const banhMiArt = (name: string) => `/art/banh-mi/v1/${name}.png`;

export const ingredientArtNames: Record<string, string> = {
  bread: 'bread', egg: 'egg', pork: 'pork', pate: 'pate',
  cha_lua: 'cha-lua', cucumber: 'cucumber', pickles: 'pickles',
  herb: 'herbs', chili: 'chili', mayo: 'mayo',
  pepper_sauce: 'pepper-sauce', tea: 'tea', milk: 'milk',
  condensed_milk: 'condensed-milk', coffee: 'coffee',
};

export const customerPortraits = Array.from({ length: 5 }, (_, index) =>
  banhMiArt(`customer-${index + 1}`),
);

export const getCustomerPortrait = (orderId: string) => {
  const hash = Array.from(orderId).reduce((value, char) =>
    (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  return customerPortraits[hash % customerPortraits.length];
};
