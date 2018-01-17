'use strict';

// eslint-disable-next-line max-statements
(function ($) {
  const pluginName = 'scrollSpy',
    dataKey = 'plugin_' + pluginName,

    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      const that = this;

      that.element = element;
      that.attributes = ['offset', 'sections'];
      that.defaults = {
        debug:                 false,
        // selector
        sectionsSelector:      ['section', '[data-nav-item]'],
        titleSelector:         'h1, h2',
        navID:                 pluginName.toLowerCase(),
        navAttach:             'body',
        // config
        baseClass:             pluginName.toLowerCase(),
        currentClass:          'current',
        delta:                 0,
        dataNavAttr:           'nav',
        eventSuffix:           '.' + pluginName + '-plugin',
        hideOnMobile:          true,
        itemDataAttr:          'nav-item',
        mobileMaxWidth:        990,
        navSectionClassPrefix: 'nav-section--',
        scrollDuration:        500,
        timer:                 undefined,
        timerDelay:            100
      };
      that.timer = undefined;
      // config
      that.winWidth = undefined;
      that.winHeight = undefined;
      // elements
      that.$element = undefined;
      that.$attach = undefined;
      that.$sections = $();
      that.$list = undefined;
      // init
      that._init(options);
    },
    $win = $(window);


  Plugin.prototype = {
    // (private) logging for development
    _log(txt, ...args) {
      if (this.settings.debug === true) {
        // eslint-disable-next-line no-console
        console.log('[' + pluginName + ':' + txt + ']', args);
      }
    },


    //
    _setCurrent() {
      this._log('_setCurrent');

      const that = this,
        s = that.settings,
        top = Math.round($(window).scrollTop() - (that.winHeight / 100 * 50));

      that.$items.removeClass(s.currentClass);

      that.$sections.each((i, el) => {
        const $section = $(el);

        if (top < $section.offset) {
          $section.$nav.addClass(s.currentClass);
        }
      });

      return true;
    },


    //
    update() {
      this._log('update');

      const that = this,
        settings = that.settings;

      that.winHeight = Math.ceil($win.height());
      that.winWidth = Math.floor($win.width());

      //
      for (const section of settings.sections) {
        section.offset = Math.floor(section.$el.offset().top);
      }

      that.$nav.toggle(settings.hideOnMobile && that.winWidth > settings.mobileMaxWidth);

      that._setCurrent();
      that.$element.trigger('update');
    },


    //
    _collectSections() {
      this._log('_collectSections');

      const that = this,
        settings = that.settings;
      let $sections = $();

      $(settings.sectionsSelector.join(', '))
        .each((i, el) => {
          const $section = $(el),
            data = {
              $el:   $section,
              title: undefined,
              $nav:  undefined
            },
            dataTitle = $section.data(settings.itemDataAttr);

          if (dataTitle) {
            data.title = dataTitle;
          }
          else {
            data.title = $section.find(settings.titleSelector).text();
          }

          if (data.title !== undefined && dataTitle !== false) {
            $section.addClass(settings.navSectionClassPrefix + data.title.toLowerCase().replace(' ', '-'));

            if (data.title) {
              $section.data(data);
              $sections = $sections.add($section);
            }
          }
        });

      that.$sections = $sections;
    },


    //
    _scrollToSection(section) {
      this._log('_scrollToSection');

      const settings = this.settings,
        off = Math.floor(section.$el.offset().top),
        top = off - settings.delta - parseInt(section.$el.css('margin-top'), 10);

      section.offset = off;

      $('html, body').animate({scrollTop: top}, settings.scrollDuration, 'swing');
    },


    //
    _setListener() {
      this._log('_setListener');

      const that = this,
        settings = that.settings;

      // nav-click
      that.$items.on('click.' + pluginName, (e) => {
        e.preventDefault();
        that._scrollToSection($(e.currentTarget).data(settings.itemDataAttr));
      });

      // set current item
      $win.on('scroll.' + pluginName, () => {
        if (!settings.hideOnMobile || that.winWidth > settings.mobileMaxWidth) {
          that._setCurrent();
        }
      });

      // trigger a recalc of the section-offsets
      $win.on('resize.' + pluginName, () => {
        clearTimeout(that.timer);
        that.timer = setTimeout(that.update, settings.timerDelay);
      });
    },


    //
    _createMarkup() {
      this._log('_createMarkup');

      const that = this,
        settings = that.settings;
      let $items = $();

      // nav
      that.$nav = $('<nav>', {
        id:    settings.navID,
        class: settings.baseClass + '--wrap'
      });

      // ul
      that.$list = $('<ul class="' + settings.baseClass + '--list" />')
        .appendTo(that.$nav);

      // items
      that.$sections.each((i, el) => {
        const $section = $(el),
          data = $section.data(),
          $item = $('<li class="' + settings.baseClass + '--list-item"><span>' + data.title + '</span></li>')
          .data(settings.itemDataAttr, $section)
          .appendTo(that.$list);

        $section.data('$nav', $item);
        $items = $items.add($item);
      });

      // attach to dom
      that.$nav.appendTo(that.$attach);

      that.$items = $items;
    },


    //
    create() {
      this._log('create');

      const that = this;

      that.$attach = $(that.settings.navAttach);

      that._collectSections();
      that._createMarkup();
      that._setListener();

      that.$element.trigger('create');
    },


    // use settings passed to the element using the "data-" attribute
    _importAttrConfig() {
      this._log('_importAttrConfig');

      const that = this,
        s = that.settings,
        data = that.$element.data();

      for (const attr of that.attributes) {
        if (data.hasOwnProperty(attr)) {
          // handle exceptions
          switch (attr) {
            case 'center':
              s[attr] = {
                lat: data[attr][0],
                lng: data[attr][1]
              };
              break;

            default:
              s[attr] = data[attr];
              break;
          }
        }
      }

      return that.settings;
    },


    // (private) where the fun begins
    _init(options) {
      const that = this,
        settings = $.extend(that.defaults, options);

      that.$element = $(that.element);

      that.settings = settings;
      that._importAttrConfig();

      that.create();
      that.update();

      that.$element.trigger('init');
    }
  };


  // Plugin wrapper
  $.fn[pluginName] = function (options, additionaloptions) {
    return this.each(function () {
      // eslint-disable-next-line no-invalid-this
      const that = this;

      if (!$.data(that, dataKey)) {
        $.data(that, dataKey, new Plugin(that, options));
      }
      else if (Plugin.prototype[options]) {
        // prevent execution of private functions
        if (typeof options === 'string' && options.substr(0, 1) !== '_') {
          $.data(that, dataKey)[options](additionaloptions);
        }
      }
    });
  };
}(jQuery));
