'use strict';

(function ($) {
  const pluginName = 'accordion',
      dataKey = 'plugin_' + pluginName,
      // eslint-disable-next-line func-style
      Plugin = function (element, options) {
        const that = this;

        that.element = element;
        that.attributes = ['current', 'trigger', 'content'];
        that.defaults = {
          debug: false,
          debugCollapsibles: false,
          // selectors
          content: '.content',
          trigger: '.trigger',
          // classes
          classPrefix: 'accordion-',
          contentClass: 'content',
          elementsClass: 'element',
          triggerClass: 'trigger',
          // config
          elements: $(),
          eventSuffix: '.' + pluginName + '-plugin',
          multiple: false,
          toggleListener: true,
          animated: true,
          calcDelta() {
            return 0;
          },
          current: 0
        };
        // config
        that.current = 0;
        that.elementCount = undefined;
        // elements
        that.$element = undefined;
        that.$elements = undefined;
        // init
        that._init(options);
      };


  Plugin.prototype = {
    // grouped logging
    _toggleLogging(toggle, suffix = '', ...args) {
      /* eslint-disable no-console */
      const s = this.settings;

      if (s.debug) {
        if (toggle) {
          console.group([pluginName, suffix].join(' '), args);
        }
        else {
          console.groupEnd();
        }
      }
      /* eslint-enable no-console */
    },


    // (private) logging for development
    _log(txt, ...args) {
      /* eslint-disable no-console */
      if (this.settings.debug === true) {
        if (args.length) {
          console.log(txt, args);
        }
        else {
          console.log(txt);
        }
      }
      /* eslint-enable no-console */
    },


    // (private) close all but the current
    _setCurrent(index, showCurrent, forceCurrent) {
      this._log('_setCurrent', index, showCurrent, forceCurrent);

      const that = this,
          settings = that.settings,
          elements = settings.elementsCache;

      // eslint-disable-next-line no-extra-parens
      if (parseInt(index, 10) < 0 || (!forceCurrent && that.current === index)) {
        return false;
      }

      // show the new current
      if (showCurrent || typeof showCurrent !== 'boolean') {
        elements[index].toggle(true, true);
      }

      if (settings.multiple !== true) {
        // hide all others
        elements.forEach((element, i) => {
          if (i !== index) {
            element.toggle(false, true);
          }
        });
      }

      that.current = index;
      that.$element.trigger('change', [that.current]);

      return index;
    },


    // (private) listen to the Collapsibles
    _setCollapsibleListener() {
      this._log('_setCollapsibleListener');

      const that = this;

      that.$elements
          .on('toggle' + that.settings.eventSuffix, (e, isOpen) => {
            that._toggleLogging(true, '<element-toggle>', e, isOpen);
            if (isOpen) {
              that.goto($(e.currentTarget)
                  .index(), true, false);
            }
            that._toggleLogging();
          });
    },


    // (private) cache the elements to have faster access by id
    // and not have to cast them each time
    _cacheElementsById() {
      this._log('_cacheElementsById');

      const that = this,
          cache = [];

      that.$elements.each(function (i, el) {
        cache.push($(el)
            .data('plugin_collapsible'));
      });

      that.settings.elementsCache = cache;
    },


    // (private) create
    _create() {
      this._log('_create');

      const that = this,
          settings = that.settings;

      // init the collapsibles
      that.$elements.collapsible({
        trigger: settings.trigger,
        content: settings.content,
        calcDelta: settings.calcDelta,
        open: false,
        debug: settings.debugCollapsibles,
        animated: settings.animated
      });
      that._cacheElementsById();
      that.elementCount = settings.elementsCache.length;

      if (settings.toggleListener) {
        that._setCollapsibleListener();
      }
    },


    // set the current step
    goto(stepnumber, isIndex) {
      this._log('goto', stepnumber, isIndex);

      const that = this;
      let index = stepnumber;

      if (!isIndex) {
        index = parseInt(stepnumber, 10) - 1;
      }

      if (index < 0 || index >= that.elementCount) {
        that._log('index exceeds range (' + index + '/' + that.elementCount + ')');

        return false;
      }

      that._setCurrent(index, true, true);

      return index;
    },


    // update
    update() {
      this._log('update');

      const that = this,
          settings = that.settings;

      that.goto(settings.current, true);
      that.$element.trigger('update', [settings.current]);

      return settings.current;
    },


    // (private) use settings passed to the element using the "data-" attribute
    _importAttrConfig() {
      this._log('_importAttrConfig');

      const that = this,
          s = that.settings,
          data = that.$element.data('options');

      if (!data) {
        return false;
      }

      for (const attr of that.attributes) {
        if (data.hasOwnProperty(attr)) {
          s[attr] = data[attr];
        }
      }

      return that.settings;
    },


    // (private) init
    _init(options) {
      const that = this;

      that.$element = $(that.element);

      that.settings = $.extend(that.defaults, options);
      that._toggleLogging(true);
      that._log('_init', options);
      that._importAttrConfig();

      that.$elements = that.$element.find(that.settings.elements);
      that._create();
      that.update();

      that.$element.trigger('init', [that.settings.current]);
      that._toggleLogging();
    },


    //
    getCurrent() {
      this._log('getCurrent');

      return this.settings.current;
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
