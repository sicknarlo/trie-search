/**
 * Searches text again an array of terms.
 * @param {array} terms an array of string terms
 * @param {string} text text to search for the terms
 * @returns {array} matched terms
 */
function trieSearch(terms, text, options = {}) {
  if (options.withIndex) {
    return new Promise(resolve => {
      const termSymbol = Symbol('term');
      const baseTrie = terms.reduce((acc, term) => {
        const words = term.split(' ');
        let last = acc;
        words.forEach(word => {
          if (last[word]) {
            last = last[word];
          } else {
            last[word] = {};
            last = last[word];
          }
        });
        last[termSymbol] = term;
        return acc;
      }, {});
      const foundTerms = {};
      let tries = [baseTrie];
      const strippedText = text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/[\r\n]+/g, ' ')
        .split(' ');
      strippedText.forEach((word, i) => {
        const nextTries = [baseTrie];
        tries.forEach(t => {
          // Check if term
          if (t[termSymbol]) {
            if (!foundTerms[t[termSymbol]]) {
              foundTerms[t[termSymbol]] = [];
            }
            foundTerms[t[termSymbol]].push(i);
          }
          const match = t[word];
          if (match) {
            nextTries.push(t[word]);
          }
        });
        tries = nextTries;
      });

      // check last word
      tries.forEach(t => {
        // Check if term
        if (t[termSymbol]) {
          if (!foundTerms[t[termSymbol]]) {
            foundTerms[t[termSymbol]] = [];
          }
          foundTerms[t[termSymbol]].push(i);
        }
      });
      const termsToReturn = [];
      Object.keys(foundTerms).forEach(key => termsToReturn.push([key, foundTerms[key]]));
      resolve(termsToReturn);
    });
  }
  if (options.withCounts) {
    return new Promise(resolve => {
      const termSymbol = Symbol('term');
      const baseTrie = terms.reduce((acc, term) => {
        const words = term.split(' ');
        let last = acc;
        words.forEach(word => {
          if (last[word]) {
            last = last[word];
          } else {
            last[word] = {};
            last = last[word];
          }
        });
        last[termSymbol] = term;
        return acc;
      }, {});
      const foundTerms = {};
      let tries = [baseTrie];
      const strippedText = text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/[\r\n]+/g, ' ')
        .split(' ');
      strippedText.forEach(word => {
        const nextTries = [baseTrie];
        tries.forEach(t => {
          // Check if term
          if (t[termSymbol]) {
            if (!foundTerms[t[termSymbol]]) {
              foundTerms[t[termSymbol]] = 0;
            }
            foundTerms[t[termSymbol]] += 1;
          }
          const match = t[word];
          if (match) {
            nextTries.push(t[word]);
          }
        });
        tries = nextTries;
      });

      // check last word
      tries.forEach(t => {
        // Check if term
        if (t[termSymbol]) {
          if (!foundTerms[t[termSymbol]]) {
            foundTerms[t[termSymbol]] = 0;
          }
          foundTerms[t[termSymbol]] += 1;
        }
      });
      const termsToReturn = [];
      Object.keys(foundTerms).forEach(key => termsToReturn.push([key, foundTerms[key]]));
      resolve(termsToReturn);
    });
  }
  return new Promise(resolve => {
    const termSymbol = Symbol('term');
    const baseTrie = terms.reduce((acc, term) => {
      const words = term.split(' ');
      // let last = { [Symbol('term')]: term };
      let last = acc;
      words.forEach(word => {
        if (last[word]) {
          last = last[word];
        } else {
          last[word] = {};
          last = last[word];
        }
      });
      last[termSymbol] = term;
      return acc;
    }, {});
    const foundTerms = [];
    let tries = [baseTrie];
    const strippedText = text
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/[\r\n]+/g, ' ')
      .split(' ');
    strippedText.forEach(word => {
      const nextTries = [baseTrie];
      tries.forEach(t => {
        // Check if term
        if (t[termSymbol]) {
          foundTerms.push(t[termSymbol]);
        }
        const match = t[word];
        if (match) {
          nextTries.push(t[word]);
        }
      });
      tries = nextTries;
    });

    // check last word
    tries.forEach(t => {
      // Check if term
      if (t[termSymbol]) {
        foundTerms.push(t[termSymbol]);
      }
    });
    resolve(options.unique ? Array.from(new Set(foundTerms)) : foundTerms);
  });
}

function basicSearch(terms, text) {
  return new Promise(resolve => {
    const foundTerms = [];
    terms.forEach(term => {
      const strippedText = text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/[\r\n]+/g, ' ');
      if (strippedText.includes(term)) {
        foundTerms.push(term);
      }
    });
    resolve(foundTerms);
  });
}

export async function benchMark(n, trieOnly, options) {
  const terms = [];
  let text = '';
  for (let i = 0; i < n; i++) {
    const one = Math.random()
      .toString(36)
      .substring(2, 5);
    const two = Math.random()
      .toString(36)
      .substring(2, 5);
    text += one;
    text += ' ';
    text += two;
    text += ' ';
    if (Math.random() > 0.95) {
      terms.push(`${one} ${two}`);
    }
  }
  const trieSearchStart = Date.now();
  const trieSearchResults = await trieSearch(terms, text, options);
  const trieSearchTime = Date.now() - trieSearchStart;

  let compare = {};

  if (!trieOnly) {
    const basicSearchStart = Date.now();
    const basicSearchResults = await basicSearch(terms, text);
    const basicSearchTime = Date.now() - basicSearchStart;

    const trieAdvantage = basicSearchTime - trieSearchTime;
    compare = {
      basic: {
        time: `${basicSearchTime}ms`,
        results: basicSearchResults
      },
      diff: `${trieAdvantage}ms`
    };
  }

  return {
    terms: terms.length,
    trie: {
      time: `${trieSearchTime}ms`,
      results: trieSearchResults
    },
    ...compare
  };
}

export default trieSearch;
