;(function ($, undefined) {
  'use strict';

  var pluginName = 'collapsible',
    dataKey = 'plugin_' + pluginName,
    Plugin = function (element, options) {
      this.element = element;
      this.parents = ['trigger', 'wrap', 'content'];
      this.attributes = ['open', 'indicatorParent', 'trigger', 'content'];
      this.defaults = {
        trigger:         undefined,
        triggerClass:    'trigger',
        content:         undefined,
        contentClass:    'content',
        open:            false,
        classPrefix:     'collapsible-',
        openClass:       'open',
        closeClass:      'close',
        indicatorClass:  'indicator',
        indicatorParent: false,
        openText:        'Show details',
        closeText:       'Hide details',
        calcDelta:       function () {
          return 0;
        },
        activeToggle:    false
      };
      this.init(options);
    },
    $win = $(window);


  Plugin.prototype = {
    // check if content is visible
    checkViewport: function () {
      var self = this,
        settings = self.settings,
        off,
        delta;

      if (!settings.open) {
        return false;
      }

      off = self.$wrap.offset().top;
      delta = settings.calcDelta();

      if ($win.scrollTop() > off) {
        $win.scrollTop(off - delta);
      }
    },


    // set trigger listener
    setListener: function () {
      var self = this;

      self.settings.$trigger.on('click.collapsible', function (e) {
        e.preventDefault();
        self.toggle();
        self.checkViewport();
      });
    },


    // remove listener
    unsetListener: function () {
      this.settings.$trigger.off('click.collapsible');
    },


    // check if the given option is valid
    checkIndicatorParent: function () {
      var self = this,
        s = self.settings;

      if (!s.indicatorParent) {
        return false;
      }

      for (var i = 0, len = self.parents.length; i < len; i += 1) {
        if (self.parents[i] === s.indicatorParent) {
          return true;
        }
      }

      return false;
    },


    // create an additional element to show the status
    createIndicator: function () {
      var self = this,
        s = self.settings,
        $appendTo;

      if (!self.checkIndicatorParent()) {
        return false;
      }

      s.$indicator = $('<span></span>')
        .addClass(s.classPrefix + s.indicatorClass);

      switch (s.indicatorParent) {
        case 'parent':
          $appendTo = self.$wrap;
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
    create: function () {
      var self = this,
        s = self.settings,
        $wrap = self.$wrap;

      $wrap.trigger('before-create');

      // make sure we're working with jquery objects
      s.$trigger = (typeof s.trigger === 'object') ? s.trigger : $wrap.find(s.trigger);
      s.$content = (typeof s.content === 'object') ? s.content : $wrap.find(s.content);

      s.$trigger.addClass(s.classPrefix + s.triggerClass);
      s.$content.addClass(s.classPrefix + s.contentClass);

      self.createIndicator();
      self.setListener();
      $wrap.trigger('create');
    },


    // toggle the indicator text
    toggleIndicator: function (status) {
      var self = this,
        s = self.settings,
        text = (status) ? s.openText : s.closeText;

      if (!s.$indicator) {
        return false;
      }

      s.$indicator.text(text)
        .attr('title', text);
    },


    // toggle the display and set related data
    toggle: function (status) {
      var self = this,
        s = self.settings;

      // true = open; false = closed
      if (status !== true && status !== false) {
        status = !s.open;
      }

      self.$wrap.trigger('toggle-before', [s.open]);

      self.$wrap.toggleClass(s.classPrefix + s.openClass, status)
        .toggleClass(s.classPrefix + s.closeClass, !status);
      self.toggleIndicator(status);

      if (s.activeToggle) {
        s.$content.toggle(status);
      }

      s.open = status;
      self.$wrap.trigger('toggle', [status]);
      return true;
    },


    // update
    update: function (status) {
      var self = this;

      self.$wrap.trigger('before-update');
      self.toggle(status);
      self.$wrap.trigger('update');
    },


    // use settings passed to the element using the "data-" attribute
    importAttrConfig: function () {
      var self = this,
        s = self.settings,
        data = self.$wrap.data('options'),
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


    // init
    init: function (options) {
      var self = this;

      self.$wrap = $(self.element);

      self.settings = $.extend(self.defaults, options);
      self.importAttrConfig();

      self.create();
      self.update(self.settings.open);

      self.$wrap.trigger('init', [status]);
    },


    // destroy
    destroy: function () {
      var self = this,
        s = self.settings;

      self.$wrap.trigger('before-destroy', [status]);
      if (s.$indicator) {
        s.$indicator.remove();
      }
      self.toggle(true); // force show
      self.unsetListener();
      self.$wrap.trigger('destroy', [status]);
    },


    //
    getStatus: function () {
      return this.settings.open;
    }
  };


  // Plugin wrapper
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      var $this = $(this),
        plugin = $this.data(dataKey);

      // has plugin instantiated ?
      if (plugin instanceof Plugin) {
        // if have options arguments, call plugin.init() again
        if (typeof options !== 'undefined') {
          plugin.init(options);
        }
      }
      else {
        plugin = new Plugin(this, options);
        $this.data(dataKey, plugin);
      }
    });
  };
})(jQuery);