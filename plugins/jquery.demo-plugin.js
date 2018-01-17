'use strict';

// eslint-disable-next-line max-statements
(function ($) {
  const pluginName = 'collapsible',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      const that = this;

      that.element = element;
      // define the attributes that will be used to override options (defaults)
      that.attributes = ['abc', 'xyz'];
      that.defaults = {
        debug: false
      };
      that._init(options);
    };


  Plugin.prototype = {
    // (private) logging for development
    _log(txt, ...args) {
      /* eslint-disable no-console */
      if (this.settings.debug) {
        if (args.length) {
          console.log(txt, args);
        }
        else {
          console.log(txt);
        }
      }
      /* eslint-enable no-console */
    },


    // update the plugin
    update() {
      this._log('update');

      const that = this;

      that.$element.trigger('before-update');

      that.$element.trigger('update');
    },


    // (private) create markup or other requirements
    _create() {
      this._log('create');

      const that = this;

      that.$element.trigger('create');
    },


    // (private) use settings passed to the element using the "data-" attribute
    // settings will supply the used attributes
    _importAttrConfig() {
      this._log('importAttrConfig');

      const that = this,
        settings = that.settings,
        data = that.$element.data('options');

      if (!data) {
        return false;
      }

      for (const attr of that.attributes) {
        if (Reflect.getOwnPropertyDescriptor(data, attr)) {
          settings[attr] = data[attr];
        }
      }

      return settings;
    },


    // (private) where the fun begins
    _init(options) {
      const that = this;

      that.$element = $(that.element);

      that.settings = $.extend(that.defaults, options);
      that._importAttrConfig();

      that._create();
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
