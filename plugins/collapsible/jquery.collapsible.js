'use strict';

// eslint-disable-next-line max-statements
(function ($) {
  const pluginName = 'collapsible',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      const that = this;

      that.element = element;
      that.parents = ['trigger', 'wrap', 'content'];
      // define the attributes that will be used to override options (defaults)
      that.attributes = ['open', 'indicatorParent', 'trigger', 'content'];
      that.defaults = {
        debug:           false,
        // selector
        trigger:         '.trigger',
        content:         '.content',
        // config
        eventSuffix:     '.' + pluginName + '-plugin',
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
      // config
      // elements
      // init
      that._init(options);
    },
    $win = $(window);


  Plugin.prototype = {
    // grouped loggin
    _toggleLogging(toggle, suffix = '', ...args) {
      /* eslint-disable no-console */
      if (this.settings.debug) {
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


    // check if content is visible
    _checkViewport() {
      this._log('_checkViewport');

      const that = this,
        settings = that.settings,
        off = that.$wrap.offset().top,
        delta = settings.calcDelta();

      if (!settings.open) {
        return false;
      }

      if ($win.scrollTop() > off) {
        $win.scrollTop(off - delta);
        that.$wrap.trigger('adjust-viewport', [settings.open]);
      }

      return true;
    },


    // set trigger listener
    _setListener() {
      const that = this,
        settings = that.settings;

      that._log('_setListener');

      settings.$trigger.on('click' + settings.eventSuffix, function (e) {
        that._toggleLogging(true, '<$trigger:click>', e);
        e.preventDefault();
        that.toggle();
        that._checkViewport();
        that._toggleLogging();
      });
    },


    // remove listener
    _unsetListener() {
      this._log('_unsetListener');

      const settings = this.settings;

      settings.$trigger.off('click' + settings.eventSuffix);
    },


    // check if the given option is valid
    _checkIndicatorParent() {
      this._log('_checkIndicatorParent');

      const that = this,
        s = that.settings;
      let i,
        len;

      if (!s.indicatorParent) {
        return false;
      }

      for (i = 0, len = that.parents.length; i < len; i += 1) {
        if (that.parents[i] === s.indicatorParent) {
          return true;
        }
      }

      return false;
    },


    // create an additional element to show the status
    _createIndicator() {
      this._log('_createIndicator');

      const that = this,
        settings = that.settings;
      let $appendTo;

      if (!that._checkIndicatorParent()) {
        return false;
      }

      settings.$indicator = $('<span></span>')
        .addClass(settings.classPrefix + settings.indicatorClass);

      switch (settings.indicatorParent) {
        case 'trigger':
          $appendTo = settings.$trigger;
          break;
        case 'content':
          $appendTo = settings.$content;
          break;
        // case 'parent':
        default:
          $appendTo = that.$wrap;
          break;
      }

      settings.$indicator.appendTo($appendTo);

      return true;
    },


    //
    _getJqueryElements () {
      this._log('_getJqueryElements');

      const that = this,
        settings = that.settings,
        $wrap = that.$wrap;

      // make sure we're working with jquery objects
      if (typeof settings.trigger === 'object') {
        settings.$trigger = settings.trigger;
      }
      else {
        settings.$trigger = $wrap.find(settings.trigger);
      }

      if (typeof settings.content === 'object') {
        settings.$content = settings.content;
      }
      else {
        settings.$content = $wrap.find(settings.content);
      }
    },


    // (private) create
    _create() {
      this._log('_create');

      const that = this,
        settings = that.settings,
        $wrap = that.$wrap;

      $wrap.trigger('before-create', [that.settings.open]);

      that._getJqueryElements();

      settings.$trigger.addClass(settings.classPrefix + settings.triggerClass);
      settings.$content.addClass(settings.classPrefix + settings.contentClass);

      that._createIndicator();
      that._setListener();
      $wrap.trigger('create', [that.settings.open]);
    },


    // toggle the indicator text
    _toggleIndicator(status) {
      this._log('_toggleIndicator', status);

      const that = this,
        settings = that.settings;
      let text = settings.closeText;

      if (status) {
        text = settings.openText;
      }

      if (!settings.$indicator) {
        return false;
      }

      settings.$indicator.text(text)
        .attr('title', text);

      return status;
    },


    //
    _toggleByStatus(status) {
      this._log('_toggleStausClass', status);

      const that = this,
        settings = that.settings;

      that.$wrap.toggleClass(settings.classPrefix + settings.openClass, status)
        .toggleClass(settings.classPrefix + settings.closeClass, !status);
      that._toggleIndicator(status);

      if (settings.activeToggle) {
        settings.$content.toggle(status);
      }
    },


    // toggle the display and set related data
    toggle(setStatus, doNotEmitEvent) {
      this._log('toggle', setStatus, doNotEmitEvent);

      const that = this,
        settings = that.settings;
      let status = setStatus;

      // true = open; false = closed
      if (typeof setStatus !== 'boolean') {
        status = !settings.open;
      }

      if (!doNotEmitEvent) {
        that.$wrap.trigger('before-toggle', [settings.open, status]);
      }

      that._toggleByStatus(status);
      settings.open = status;

      if (!doNotEmitEvent) {
        that.$wrap.trigger('toggle', [settings.open]);
      }

      return status;
    },


    // update
    update(status) {
      const that = this;

      that._log('update', status);
      that.$wrap.trigger('before-update', [that.settings.open]);
      that.toggle(status);
      that.$wrap.trigger('update', [that.settings.open]);

      return status;
    },


    // use settings passed to the element using the "data-" attribute
    _importAttrConfig() {
      this._log('_importAttrConfig');

      const that = this,
        settings = that.settings,
        data = that.$wrap.data('options');
      let attr;

      if (!data) {
        return false;
      }

      for (attr of that.attributes) {
        if (Reflect.getOwnPropertyDescriptor(data, attr)) {
          settings[attr] = data[attr];
        }
      }

      return that.settings;
    },


    // (private) where it all begins
    _init(options) {
      const that = this;

      that.$wrap = $(that.element);

      that.settings = $.extend(that.defaults, options);
      that._toggleLogging(true);
      that._log('_init', options);
      that._importAttrConfig();

      that._create();
      that.update(that.settings.open);

      that.$wrap.trigger('init', [that.settings.status]);
      that._toggleLogging();
    },


    // destroy
    destroy() {
      this._log('destroy');

      const that = this,
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
