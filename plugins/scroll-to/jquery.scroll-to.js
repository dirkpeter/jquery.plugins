'use strict';

(function ($, window) {
  $.fn.scrollTo = function (options) {
    return this.each((i, el) => {
      const $el = $(el),
        $htmlBody = $('html, body'),
        settings = {
          offset:   0,
          speed:    'slow',
          override: null
        };

      if (options) {
        $.extend(settings, options);
      }

      $el.on('click.scroll', function (e) {
        let idToLookAt = $el.attr('href');

        // eslint-disable-next-line newline-per-chained-call
        if ($el.attr('href').match(/#/) !== null) {
          e.preventDefault();
          if (settings.override) {
            idToLookAt = settings.override;
          }

          if (history.pushState) {
            history.pushState(null, null, idToLookAt);
            $htmlBody.stop()
              .animate({scrollTop: $(idToLookAt).offset().top + settings.offset}, settings.speed);
          }
          else {
            // if the browser doesn't support pushState, we set the hash after the animation, which may cause issues
            // if you use offset
            $htmlBody.stop()
              .animate({scrollTop: $(idToLookAt).offset().top + settings.offset}, settings.speed, () => {
                // set the hash of the window for better linking
                window.location.hash = idToLookAt;
              });
          }
        }
      });
    });
  }
}(jQuery, window));
