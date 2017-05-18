// http://www.hardcode.nl/subcategory_1/article_317-array-shuffle-function

'use strict';

if (!Reflect.getOwnPropertyDescriptor(Array.prototype, 'shuffle')) {
  Array.prototype.shuffle = () => {
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
