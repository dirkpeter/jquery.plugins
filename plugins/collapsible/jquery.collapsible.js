'use strict';

(function ($) {
  var pluginName = 'collapsible',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      var that = this;

      that.element = element;
      that.parents = ['trigger', 'wrap', 'content'];
      // define the attributes that will be used to override options (defaults)
      that.attributes = ['open', 'indicatorParent', 'trigger', 'content'];
      that.defaults = {
        triggerClass:    'trigger',
        contentClass:    'content',
        open:            false,
        classPrefix:     'collapsible-',
        openClass:       'open',
        closeClass:      'close',
        indicatorClass:  'indicator',
        indicatorParent: false,
        openText:        'Show details',
        closeText:       'Hide details',
        calcDelta() {
          return 0;
        },
        activeToggle:    false
      };
      that._init(options);
    },
    $win = $(window);


  Plugin.prototype = {
    // check if content is visible
    checkViewport() {
      var that = this,
        settings = that.settings,
        off,
        delta;

      if (!settings.open) {
        return false;
      }

      off = that.$wrap.offset().top;
      delta = settings.calcDelta();

      if ($win.scrollTop() > off) {
        $win.scrollTop(off - delta);
      }

      return true;
    },


    // set trigger listener
    setListener() {
      var that = this;

      that.settings.$trigger.on('click.collapsible', function (e) {
        e.preventDefault();
        that.toggle();
        that.checkViewport();
      });
    },


    // remove listener
    unsetListener() {
      this.settings.$trigger.off('click.collapsible');
    },


    // check if the given option is valid
    checkIndicatorParent() {
      var that = this,
        s = that.settings;

      if (!s.indicatorParent) {
        return false;
      }

      for (var i = 0, len = that.parents.length; i < len; i += 1) {
        if (that.parents[i] === s.indicatorParent) {
          return true;
        }
      }

      return false;
    },


    // create an additional element to show the status
    createIndicator() {
      var that = this,
        s = that.settings,
        $appendTo;

      if (!that.checkIndicatorParent()) {
        return false;
      }

      s.$indicator = $('<span></span>')
        .addClass(s.classPrefix + s.indicatorClass);

      switch (s.indicatorParent) {
        case 'parent':
          $appendTo = that.$wrap;
          break;
        case 'trigger':
          $appendTo = s.$trigger;
          break;
        case 'content':
          $appendTo = s.$content;
          break;
      }

      s.$indicator.appendTo($appendTo);
    },


    // create
    create() {
      var that = this,
        s = that.settings,
        $wrap = that.$wrap;

      $wrap.trigger('before-create');

      // make sure we're working with jquery objects
      s.$trigger = (typeof s.trigger === 'object') ? s.trigger : $wrap.find(s.trigger);
      s.$content = (typeof s.content === 'object') ? s.content : $wrap.find(s.content);

      s.$trigger.addClass(s.classPrefix + s.triggerClass);
      s.$content.addClass(s.classPrefix + s.contentClass);

      that.createIndicator();
      that.setListener();
      $wrap.trigger('create');
    },


    // toggle the indicator text
    toggleIndicator(status) {
      var that = this,
        s = that.settings,
        text = (status) ? s.openText : s.closeText;

      if (!s.$indicator) {
        return false;
      }

      s.$indicator.text(text)
        .attr('title', text);
    },


    // toggle the display and set related data
    toggle(status) {
      var that = this,
        s = that.settings;

      // true = open; false = closed
      if (status !== true && status !== false) {
        status = !s.open;
      }

      that.$wrap.trigger('toggle-before', [s.open]);

      that.$wrap.toggleClass(s.classPrefix + s.openClass, status)
        .toggleClass(s.classPrefix + s.closeClass, !status);
      that.toggleIndicator(status);

      if (s.activeToggle) {
        s.$content.toggle(status);
      }

      s.open = status;
      that.$wrap.trigger('toggle', [status]);

      return status;
    },


    // update
    update(status) {
      var that = this;

      that.$wrap.trigger('before-update');
      that.toggle(status);
      that.$wrap.trigger('update');
    },


    // use settings passed to the element using the "data-" attribute
    _importAttrConfig() {
      this._log('importAttrConfig');

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


    // (private) where it all begins
    _init(options) {
      var that = this;

      that.$wrap = $(that.element);

      that.settings = $.extend(that.defaults, options);
      that._importAttrConfig();

      that.create();
      that.update(that.settings.open);

      that.$wrap.trigger('init', [status]);
    },


    // destroy
    destroy() {
      var that = this,
        s = that.settings;

      that.$wrap.trigger('before-destroy', [status]);
      if (s.$indicator) {
        s.$indicator.remove();
      }
      // force show
      that.toggle(true);
      that.unsetListener();
      that.$wrap.trigger('destroy', [status]);
    },


    //
    getStatus() {
      return this.settings.open;
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
