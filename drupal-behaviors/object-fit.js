'use strict';

// object fit
// Modernizr support required
Drupal.behaviors.__THEME__ObjectFit = {
  attach () {
    if (!Modernizr.objectfit) {
      $('picture').once('object-fit')
        .each((i, el) => {
          const $container = $(el),
            imgUrl = $container.find('img').prop('src');

          if (imgUrl) {
            $container
              .css('backgroundImage', 'url(' + imgUrl + ')')
              .addClass('bc-object-fit');
          }
        });
    }
  }
};
