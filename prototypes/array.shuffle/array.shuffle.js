// http://www.hardcode.nl/subcategory_1/article_317-array-shuffle-function

'use strict';

if (!Array.prototype.hasOwnProperty('shuffle')) {
  Array.prototype.shuffle = () => {
    // not an invlalid this
    // eslint-disable-next-line no-invalid-this
    const that = this;
    let i = that.length,
      p,
      t;

    while (i > 0) {
      i -= 1;
      p = Math.floor(Math.random() * i);
      t = that[i];
      that[i] = that[p];
      that[p] = t;
    }

    return that;
  };
}
