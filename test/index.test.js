import trieSearch from '../src';

describe('trie search', () => {
  it('should find terms in text', async () => {
    const text = 'Odell Beckham is a turkey stank wallet';
    const terms = ['Odell Beckham'];
    const results = await trieSearch(terms, text);
    expect(results.length).toBe(1);
  });
  it('should handle multiple terms in text', async () => {
    const text = 'Odell Beckham is a turkey stank wallet Tom Brady weird shoe boy';
    const terms = ['Odell Beckham', 'Tom Brady'];
    const results = await trieSearch(terms, text);
    expect(results.length).toBe(2);
  });
  it('should return duplicates unless unique option passed', async () => {
    const text = 'Odell Beckham is a turkey stank wallet Tom Brady weird shoe boy Odell Beckham third toe swing bottle Odell Beckham';
    const terms = ['Odell Beckham', 'Tom Brady'];
    const results = await trieSearch(terms, text);
    expect(results.length).toBe(4);
  });

  it('should return uniques if unique option passed', async () => {
    const text = 'Odell Beckham is a turkey Tom Brady stank wallet Tom Brady weird shoe boy Odell Beckham third toe swing bottle Odell Beckham';
    const terms = ['Odell Beckham', 'Tom Brady'];
    const results = await trieSearch(terms, text, { unique: true });
    expect(results.length).toBe(2);
  });

  it('should return uniques if unique option passed', async () => {
    const text = 'Odell Beckham is a turkey Tom Brady stank wallet Tom Brady weird shoe boy Odell Beckham third toe swing bottle Odell Beckham';
    const terms = ['Odell Beckham', 'Tom Brady'];
    const results = await trieSearch(terms, text, { withCounts: true });
    expect(results.length).toBe(2);
    expect(results[0][1]).toBe(3);
  });
});
