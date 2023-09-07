export default (cards: { c0: number; c1: number; c2: number; c3: number }) => {
  return Object.values(cards).filter(Boolean).sort().join(',');
};
