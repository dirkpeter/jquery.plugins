// sticky header
Drupal.behaviors.__THEME__StickyHeader = {
  attach: function () {
    var $header = $('.site-header--main--bottom'),
      stickyClass = 'is-fixed',
      eventPostfix = '.sticky-header',
      $win = $(window),
      offset;

    $header.once('sticky-header')
      .each(function () {
        $win.on('scroll' + eventPostfix, function () {
          $header.toggleClass(stickyClass, $win.scrollTop() >= offset);
        })
          .on('resize.sticky-header', function () {
            $header.removeClass(stickyClass);
            offset = $header.offset().top;
            $win.trigger('scroll' + eventPostfix);
          })
          .trigger('resize' + eventPostfix);
      });
  }
};
