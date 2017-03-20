'use strict';
(function ($, window) {
  $.fn.scrollTo = function (options) {
    var $htmlbody = $('html, body'),
      settings = {
        offset:   -60,
        speed:    'slow',
        override: null
      };

    if (options) {
      $.extend(settings, options);
    }

    return this.each(function (i, el) {
      $(el).on('click.scroll', function (e) {
        var idToLookAt;

        if ($(el).attr('href').match(/#/) !== null) {
          e.preventDefault();
          idToLookAt = (settings.override) ? settings.override : $(el).attr('href');
          //see if the user is forcing an ID they want to use
          //if the browser supports it, we push the hash into the pushState for better linking later

          if (history.pushState) {
            history.pushState(null, null, idToLookAt);
            $htmlbody.stop()
              .animate({scrollTop: $(idToLookAt).offset().top + settings.offset}, settings.speed);
          }
          else {
            // if the browser doesn't support pushState, we set the hash after the animation, which may cause issues
            // if you use offset
            $htmlbody.stop()
              .animate({scrollTop: $(idToLookAt).offset().top + settings.offset}, settings.speed, function () {
                //set the hash of the window for better linking
                window.location.hash = idToLookAt;
              });
          }
        }
      });
    });
  };
}(jQuery, window));
