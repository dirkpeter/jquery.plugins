'use strict';

(function ($) {
  var pluginName = 'accordion',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      this.element = element;
      this.attributes = ['current', 'trigger', 'content'];
      this.defaults = {
        debug:             false,
        debugCollapsibles: false,
        elements:          $(),
        classPrefix:       'accordion-',
        eventSuffix:       '.' + pluginName + '-plugin',
        elementsClass:     'element',
        trigger:           '.trigger',
        content:           '.content',
        triggerClass:      'trigger',
        contentClass:      'content',
        toggleListener:    true,
        multiple:          false,
        calcDelta() {
          return 0;
        },
        current:           0
      };
      this._init(options);
    };


  Plugin.prototype = {
    // grouped loggin
    _toggleLogging(toggle, suffix = '', ...args) {
      /* eslint-disable no-console */
      var s = this.settings;

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

      var that = this,
        s = that.settings,
        elements = s.elementsCache;

      // eslint-disable-next-line no-extra-parens
      if (parseInt(index, 10) < 0 || (!forceCurrent && s.current === index)) {
        return false;
      }

      // show the new current
      if (showCurrent || typeof showCurrent !== 'boolean') {
        elements[index].toggle(true, true);
      }

      if (s.multiple !== true) {
        // hide all others
        elements.forEach((element, i) => {
          if (i !== index) {
            element.toggle(false, true);
          }
        });
      }

      s.current = index;
      that.$wrap.trigger('set-current', [that.settings.current]);

      return index;
    },


    // (private) listen to the collapsibles
    _setCollapsibleListener() {
      this._log('_setCollapsibleListener');

      var that = this;

      that.$elements.on('toggle' + that.settings.eventSuffix, (e, isOpen) => {
        that._toggleLogging(true, '<element-toggle>', e, isOpen);
        if (isOpen) {
          that.goto($(e.currentTarget).index(), true, false);
        }
        that._toggleLogging();
      });
    },


    // (private) cache the elements to have faster access by id, and not have to cast them each time
    _cacheElementsById() {
      this._log('_cacheElementsById');

      var that = this,
        cache = [];

      that.$elements.each(function (i, el) {
        cache.push($(el).data('plugin_collapsible'));
      });

      that.settings.elementsCache = cache;
    },


    // (private) create
    _create() {
      this._log('_create');

      var that = this,
        s = that.settings;

      // init the collapsibles
      that.$elements.collapsible({
        trigger:   s.trigger,
        content:   s.content,
        calcDelta: s.calcDelta,
        open:      false,
        debug:     s.debugCollapsibles
      });
      that._cacheElementsById();
      that.elementCount = s.elementsCache.length;

      if (s.toggleListener) {
        that._setCollapsibleListener();
      }
    },


    // set the current step
    goto(stepnumber, isIndex) {
      this._log('goto', stepnumber, isIndex);

      var that = this,
        index = stepnumber;

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

      var that = this;

      that.goto(that.settings.current, true);
    },


    // (private) use settings passed to the element using the "data-" attribute
    _importAttrConfig() {
      this._log('_importAttrConfig');

      var that = this,
        s = that.settings,
        data = that.$wrap.data('options');

      if (!data) {
        return false;
      }

      for (const attr of that.attributes) {
        if (Reflect.getOwnPropertyDescriptor(data, attr)) {
          s[attr] = data[attr];
        }
      }

      return that.settings;
    },


    // (private) init
    _init(options) {
      var that = this;

      that.$wrap = $(that.element);

      that.settings = $.extend(that.defaults, options);
      that._toggleLogging(true);
      that._log('_init', options);
      that._importAttrConfig();

      that.$elements = that.$wrap.find(that.settings.elements);
      that._create();
      that.update();

      that.$wrap.trigger('init', [that.settings.current]);
      that._toggleLogging();
    },


    // destroy
    destroy () {
      this._log('destroy');
      // @todo
    },


    //
    getCurrent () {
      this._log('getCurrent');

      return this.settings.current;
    }
  };


  // Plugin wrapper
  $.fn[pluginName] = function (options, additionaloptions) {
    return this.each(function () {
      // eslint-disable-next-line no-invalid-this
      var that = this;

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
