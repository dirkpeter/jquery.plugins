'use strict';

// sticky header
Drupal.behaviors.__THEME__StickyHeader = {
  attach () {
    const $header = $('.site-header'),
      stickyClass = 'is-fixed',
      eventPostfix = '.sticky-header',
      $win = $(window);
    let offset;

    $header.once('sticky-header')
      .each(() => {
        $win.on('scroll' + eventPostfix, () => {
          $header.toggleClass(stickyClass, $win.scrollTop() >= offset);
        })
          .on('resize.sticky-header', () => {
            $header.removeClass(stickyClass);
            offset = $header.offset().top;
            $win.trigger('scroll' + eventPostfix);
          })
          .trigger('resize' + eventPostfix);
      });
  }
};
