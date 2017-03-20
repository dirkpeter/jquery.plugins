'use strict';

(function ($) {
  var pluginName = 'testPlugin',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      var that = this;

      that.element = element;
      that.attributes = ['abc', 'xyz'];
      that.defaults = {
        debug: false
      };
      that.init(options);
    };


  Plugin.prototype = {
    //
    log(txt) {
      if (this.settings.debug === true) {
        // eslint-disable-next-line no-console
        console.log('[' + pluginName + ']', txt);
      }
    },


    //
    update() {
      this.log('update');

      var that = this;
      that.$element.trigger('before-update');

      that.$element.trigger('update');
    },


    //
    create() {
      this.log('create');

      var that = this;

      that.$element.trigger('create');
    },


    // use settings passed to the element using the "data-" attribute
    // settings will supply the used attributes
    importAttrConfig() {
      this.log('importAttrConfig');

      var that = this,
        s = that.settings,
        data = that.$element.data('options');

      if (!data) {
        return false;
      }

      for (const attr of that.attributes) {
        if (Reflect.getOwnPropertyDescriptor(data, attr)) {
          s[attr] = data[attr];
        }
      }

      return s;
    },


    //
    init(options) {
      var that = this;

      that.$element = $(that.element);

      that.settings = $.extend(that.defaults, options);
      that.importAttrConfig();

      that.create();
      that.update();

      that.$element.trigger('init');
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
        if (typeof options === 'string') {
          $.data(that, dataKey)[options](additionaloptions);
        }
      }
    });
  };
}(jQuery));
