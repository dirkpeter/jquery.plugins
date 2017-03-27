// eslint-disable strict
// object fit
// Modernizr support required
Drupal.behaviors.__THEME__ObjectFit = {
  attach () {
    if (!Modernizr.objectfit) {
      $('picture').once('object-fit')
        .each(function () {
          var $container = $(this),
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
