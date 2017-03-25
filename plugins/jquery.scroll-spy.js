;(function ($, undefined) {
  'use strict';

  var pluginName = 'scrollSpy',
    dataKey = 'plugin_' + pluginName,
    Plugin = function (element, options) {
      this.element = element;
      this.attributes = ['offset', 'sections'];
      this.timer = undefined;
      this.winWidth = undefined;
      this.winHeight = undefined;
      this.defaults = {
        debug:                 false,
        delta:                 0,
        navID:                 pluginName.toLowerCase(),
        baseClass:             pluginName.toLowerCase(),
        dataNavAttr:           'nav',
        itemDataAttr:          'nav-item',
        navSectionClassPrefix: 'nav-section--',
        currentClass:          'current',
        selectors:             ['section', '[data-nav-item]'],
        $parent:               'body',
        timerDelay:            100,
        timer:                 undefined,
        scrollDuration:        500,
        hideOnMobile:          true,
        mobileMaxWidth:        990,
        sections:              []
      };
      this.init(options);
    };


  Plugin.prototype = {
    //
    _log: function (txt) {
      if (this.settings.debug === true) {
        console.log('[' + pluginName + ']', txt);
      }
    },


    //
    _setCurrent: function () {
      this._log('_setCurrent');

      var self = this,
        s = self.settings,
        top = Math.round($(window).scrollTop() - self.winHeight / 100 * 50);

      self.$items.removeClass(s.currentClass);

      for (let section of s.sections) {
        if (top < section.offset) {
          section.$nav.addClass(s.currentClass);
          return false;
        }
      }
    },


    //
    update: function () {
      this._log('update');

      var self = this,
        s = self.settings,
        $win = $(window);

      self.winHeight = Math.ceil($win.height());
      self.winWidth = Math.floor($win.width());

      //
      for (let section of s.sections) {
        section.offset = Math.floor(section.$el.offset().top);
      }

      self.$nav.toggle(s.hideOnMobile && self.winWidth > s.mobileMaxWidth);

      self._setCurrent();
      self.$element.trigger('update');
    },


    //
    _collectSections: function () {
      this._log('_collectSections');

      var self = this,
        s = self.settings,
        sections = [];

      $(s.selectors.join(', ')).each(function () {
        var $section = $(this),
          data = {
            $el:   $section,
            title: undefined,
            $nav:  undefined
          },
          dataTitle = $section.data(s.itemDataAttr);

        if (dataTitle) {
          data.title = dataTitle;
        }
        else {
          data.title = $section.find('.titlebar h3').text();
        }

        if (data.title !== undefined && dataTitle !== false) {
          $section.addClass(s.navSectionClassPrefix + data.title.toLowerCase().replace(' ', '-'));

          if (data.title) {
            sections.push(data);
          }
        }
      });

      s.sections = sections;
    },


    //
    _scrollToSection: function (section) {
      this._log('_scrollToSection');

      var s = this.settings,
        off = Math.floor(section.$el.offset().top),
        top = off - s.delta - parseInt(section.$el.css('margin-top'), 10);

      section.offset = off;

      $('html, body').animate({scrollTop: top}, s.scrollDuration, 'swing');
    },


    //
    _setListener: function () {
      this._log('_setListener');

      var self = this,
        s = self.settings,
        $win = $(window);

      // nav-click
      self.$items.on('click.' + pluginName, function (e) {
        e.preventDefault();
        self._scrollToSection($(this).data(s.itemDataAttr));
      });

      // set current item
      $win.on('scroll.' + pluginName, function () {
        if (!s.hideOnMobile || self.winWidth > s.mobileMaxWidth) {
          self._setCurrent();
        }
      });

      // trigger a recalc of the section-offsets
      $win.on('resize.' + pluginName, function () {
        clearTimeout(self.timer);
        self.timer = setTimeout(function () {
          self.update();
        }, s.timerDelay);
      });
    },


    //
    _createMarkup: function () {
      this._log('_createMarkup');

      var self = this,
        s = self.settings;

      // nav
      self.$nav = $('<nav>', {
        id:    s.navID,
        class: s.baseClass + '--wrap'
      });

      // ul
      self.$list = $('<ul class="' + s.baseClass + '--list' + '" />')
        .appendTo(self.$nav);

      // items
      self.$items = $();
      for (let section of s.sections) {
        section.$nav = $('<li class="' + s.baseClass + '--list-item"><span>' + section.title + '</span></li>')
          .data(s.itemDataAttr, section)
          .appendTo(self.$list);
        self.$items = self.$items.add(section.$nav);
      }

      // attach to dom
      self.$nav.appendTo($(s.$parent));
    },


    //
    create: function () {
      this._log('create');

      var self = this;
      self._collectSections();
      self._createMarkup();
      self._setListener();

      self.$element.trigger('create');
    },


    // use settings passed to the element using the "data-" attribute
    _importAttrConfig: function () {
      var self = this,
        s = self.settings,
        data = self.$element.data('options'),
        attr;

      if (!data) {
        return false;
      }

      for (var i = 0, len = self.attributes.length; i < len; i += 1) {
        attr = self.attributes[i];
        if (data.hasOwnProperty(attr)) {
          s[attr] = data[attr];
        }
      }
    },


    //
    init: function (options) {
      var self = this;

      self.$element = $(self.element);

      self.settings = $.extend(self.defaults, options);
      self._importAttrConfig();

      self.create();
      self.update();

      self.$element.trigger('init');
    }
  };


  // Plugin wrapper
  $.fn[pluginName] = function (options, additionaloptions) {
    return this.each(function () {
      if (!$.data(this, dataKey)) {
        $.data(this, dataKey, new Plugin(this, options));
      }
      else if (Plugin.prototype[options]) {
        // prevent execution of private functions
        if (typeof options === 'string' && options.substr(0, 1) !== '_') {
          $.data(this, dataKey)[options](additionaloptions);
        }
      }
    });
  };
})(jQuery);