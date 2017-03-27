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
        debug:           false,
        trigger:         '.trigger',
        content:         '.content',
        $trigger:        $(),
        $content:        $(),
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
    // (private) logging for development
    _log(txt, ...args) {
      var name = '[' + pluginName + ' :: ' + txt + ']';

      if (this.settings.debug === true) {
        if (args.length) {
          // eslint-disable-next-line no-console
          console.log(name, args);
        }
        else {
          // eslint-disable-next-line no-console
          console.log(name);
        }
      }
    },


    // check if content is visible
    _checkViewport() {
      this._log('_checkViewport');

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
        that.$wrap.trigger('adjust-viewport', [settings.open]);
      }

      return true;
    },


    // set trigger listener
    _setListener() {
      this._log('_setListener');

      var that = this;

      that.settings.$trigger.on('click.collapsible', function (e) {
        that._log('trigger click', e);
        e.preventDefault();
        that.toggle();
        that._checkViewport();
      });
    },


    // remove listener
    _unsetListener() {
      this._log('_unsetListener');
      this.settings.$trigger.off('click.collapsible');
    },


    // check if the given option is valid
    _checkIndicatorParent() {
      this._log('_checkIndicatorParent');

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
    _createIndicator() {
      this._log('_createIndicator');

      var that = this,
        s = that.settings,
        $appendTo;

      if (!that._checkIndicatorParent()) {
        return false;
      }

      s.$indicator = $('<span></span>')
        .addClass(s.classPrefix + s.indicatorClass);

      switch (s.indicatorParent) {
        case 'trigger':
          $appendTo = s.$trigger;
          break;
        case 'content':
          $appendTo = s.$content;
          break;
        case 'parent':
        default:
          $appendTo = that.$wrap;
          break;
      }

      s.$indicator.appendTo($appendTo);

      return true;
    },


    //
    _getJqueryElements () {
      this._log('_getJqueryElements');

      var that = this,
        s = that.settings,
        $wrap = that.$wrap;

      // make sure we're working with jquery objects
      if (typeof s.trigger === 'object') {
        s.$trigger = s.trigger;
      }
      else {
        s.$trigger = $wrap.find(s.trigger);
      }

      if (typeof s.content === 'object') {
        s.$content = s.content;
      }
      else {
        s.$content = $wrap.find(s.content);
      }
    },


    // (private) create
    _create() {
      this._log('_create');

      var that = this,
        s = that.settings,
        $wrap = that.$wrap;

      $wrap.trigger('before-create', [that.settings.open]);

      that._getJqueryElements();

      s.$trigger.addClass(s.classPrefix + s.triggerClass);
      s.$content.addClass(s.classPrefix + s.contentClass);

      that._createIndicator();
      that._setListener();
      $wrap.trigger('create', [that.settings.open]);
    },


    // toggle the indicator text
    _toggleIndicator(status) {
      this._log('_toggleIndicator');

      var that = this,
        s = that.settings,
        text = s.closeText;

      if (status) {
        text = s.openText;
      }

      if (!s.$indicator) {
        return false;
      }

      s.$indicator.text(text)
        .attr('title', text);

      return status;
    },


    //
    _toggleByStatus(status) {
      this._log('_toggleStausClass');
      var that = this,
        s = that.settings;

      that.$wrap.toggleClass(s.classPrefix + s.openClass, status)
        .toggleClass(s.classPrefix + s.closeClass, !status);
      that._toggleIndicator(status);

      if (s.activeToggle) {
        s.$content.toggle(status);
      }
    },


    // toggle the display and set related data
    toggle(setStatus) {
      this._log('toggle');
      var that = this,
        s = that.settings,
        status = setStatus;

      // true = open; false = closed
      if (status !== true && status !== false) {
        status = !s.open;
      }

      this._log('<status>', status);

      that.$wrap.trigger('before-toggle', [s.open, status]);
      that._toggleByStatus(status);
      s.open = status;
      that.$wrap.trigger('toggle', [s.open]);

      return status;
    },


    // update
    update(status) {
      var that = this;

      that._log('update');
      that.$wrap.trigger('before-update', [that.settings.open]);
      that.toggle(status);
      that.$wrap.trigger('update', [that.settings.open]);

      return status;
    },


    // use settings passed to the element using the "data-" attribute
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


    // (private) where it all begins
    _init(options) {
      var that = this;

      that.$wrap = $(that.element);

      that.settings = $.extend(that.defaults, options);
      that._log('_init');
      that._importAttrConfig();

      that._create();
      that.update(that.settings.open);

      that.$wrap.trigger('init', [that.settings.status]);
    },


    // destroy
    destroy() {
      this._log('destroy');

      var that = this,
        s = that.settings;

      that.$wrap.trigger('before-destroy', [status]);
      if (s.$indicator) {
        s.$indicator.remove();
      }
      // force show
      that.toggle(true);
      that._unsetListener();
      that.$wrap.trigger('destroy', [status]);
    },


    //
    getStatus() {
      this._log('getStatus');

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
