'use strict';

(function ($, window) {
  const pluginName = 'mobileMenu',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      const that = this;

      that.element = element;
      // define the attributes that will be used to override options (defaults)
      that.attributes = ['center', 'zoom'];
      that.defaults = {
        debug:                false,
        // classes
        baseClass:            'mobile-menu',
        bodyMenuClass:        'has-mobile-menu',
        menuOpenClass:        'mobile-menu-open',
        toggleButtonClass:    'toggle-mobile-menu',
        // text
        toggleButtonTxt:      'Toggle mobile menu',
        toggleSubmenuTxt:     'Toggle Submenu',
        // config
        collapsible:          false,
        bufferTime:           500,
        dataAttr:             'mobile-menu',
        eventPostfix:         '.mobile-menu',
        menuStatus:           false,
        mobileMenuBreakpoint: 768
      };
      // config
      that.buffer = undefined;
      // elements
      that.$body = $('body');
      that.$win = $(window);
      that.$element = undefined;
      that.$menu = undefined;
      that.$mobile = undefined;
      that.$mobileWrap = undefined;
      that.$mobileBody = undefined;
      that.$mobileHead = undefined;
      that.$mobileToggle = undefined;
      that.$toggle = undefined;
      that.$toggleParent = undefined;
      // init
      that._init(options);
    };


  Plugin.prototype = {
    // (private) logging for development
    _log(txt, ...args) {
      if (this.settings.debug === true) {
        // eslint-disable-next-line no-console
        console.log('[' + pluginName + ':' + txt + ']', args);
      }
    },


    //
    toggle(forceStatus) {
      this._log('toggle', forceStatus);

      const that = this,
        settings = that.settings;
      let status = forceStatus;

      if (forceStatus === undefined) {
        status = !settings.menuStatus;
      }

      that.$body.toggleClass(settings.menuOpenClass, status);
      settings.menuStatus = status;
      that.$element.trigger('toggle');
    },


    //
    _createToggleButton() {
      this._log('_createToggleButton');

      const that = this,
        $btn = $('<button type="button"></button>'),
        title = that.settings.toggleButtonTxt;

      $btn.text(title)
        .attr('title', title)
        .addClass(that.settings.toggleButtonClass);

      return $btn;
    },


    //
    _createHead() {
      this._log('_createHead');

      const that = this,
        settings = that.settings,
        $mobileHead = $('<header class="' + settings.baseClass + '-head"></header>'),
        $mobileToggle = that._createToggleButton();

      // @todo refactor use selector from settings
      $('.navbar-brand')
        .clone()
        .appendTo($mobileHead);

      $mobileToggle.prependTo($mobileHead);
      $mobileHead.appendTo(that.$mobileWrap);

      that.$mobileHead = $mobileHead;
      that.$mobileToggle = $mobileToggle;
    },


    //
    _createBody() {
      this._log('_createBody');

      const that = this,
        settings = that.settings,
        $mobileBody = $('<div class="' + settings.baseClass + '-body"></div>'),
        $mobile = that.$element.clone()
          .attr('id', 'mobile-menu')
          .addClass(settings.baseClass)
          .appendTo($mobileBody);

      $mobile.find('.active-trail')
        .attr('data-options', '{"open":true}');
      $mobile.find('.expanded')
        .append('<a href="#" class="submenu-trigger">' + settings.toggleSubmenuTxt + '</a>');

      $mobileBody.appendTo(that.$mobileWrap);

      // @todo only if enabled (set config option)
      if (settings.collapsible === true) {
        $mobile.find('.expanded')
          .collapsible({
            trigger: '.submenu-trigger',
            menu:    '.sub-menu'
          });

        $mobile.on('click', '.submenu-trigger', function (e) {
          e.stopPropagation();
        });
      }

      that.$mobileBody = $mobileBody;
      that.$mobile = $mobile;
    },


    // basic dom manipulations
    create() {
      this._log('create');

      const that = this,
        settings = that.settings,
        $mobileWrap = $('<div class="' + settings.baseClass + '-wrap"></div>'),
        $toggleParent = $('.navbar-header'),
        $toggle = that._createToggleButton()
          .appendTo($toggleParent);

      that.$toggleParent = $toggleParent;
      that.$toggle = $toggle;
      that.$mobileWrap = $mobileWrap;

      that._createHead();
      that._createBody();

      // attach the whole thingy to the dom
      $mobileWrap.wrapInner('<div class="' + settings.baseClass + '-container"></div>')
        .appendTo(that.$body);


      that.$element.trigger('create');
    },


    // en- / disable the mobile menu
    toggleStatus() {
      this._log('toggleStatus');

      const that = this,
        settings = that.settings;

      that.$body.toggleClass(settings.bodyMenuClass, that.$win.width() < settings.mobileMenuBreakpoint);
    },


    //
    setListener() {
      this._log('setListener');

      const that = this,
        settings = that.settings;

      // toggle the mobile menu
      that.$body.on('click' + settings.eventPostfix, '.' + settings.toggleButtonClass, (e) => {
        e.stopPropagation();
        that.toggle();
      });

      // close the menu
      that.$body.on('click' + settings.eventPostfix, () => {
        if (that.$body.hasClass(settings.menuOpenClass)) {
          that.toggle();
        }
      });

      //
      that.$win.on('resize.mobile', () => {
        clearTimeout(that.buffer);
        that.buffer = setTimeout(that.toggleStatus, settings.bufferTime);
      });
    },


    // init
    _init(options) {
      const that = this,
        settings = $.extend(that.defaults, options);

      that.$element = $(that.element);
      // that.$menu = $(this); @todo refactor selector usage to $element
      that.settings = settings;

      that._log('_init', options);

      that.create();
      that.setListener();
      that.$win.trigger('resize.mobile');

      that.$element.trigger('init', options);
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
}(jQuery, window));
