;(function ($, undefined) {
  'use strict';

  var pluginName = 'accordion',
    dataKey = 'plugin_' + pluginName,
    Plugin = function (element, options) {
      this.element = element;
      this.attributes = ['current', 'trigger', 'content'];
      this.defaults = {
        classPrefix:    'accordion-',
        elements:       undefined,
        elementsClass:  'element',
        trigger:        undefined,
        triggerClass:   'trigger',
        content:        undefined,
        contentClass:   'content',
        toggleListener: true,
        multiple:       false,
        calcDelta:      function () {
          return 0;
        },
        current:        0
      };
      this.init(options);
    };


  Plugin.prototype = {
    // close all but the current
    setCurrent: function (index, showCurrent, forceCurrent) {
      var self = this,
        s = self.settings,
        elements = s.elementsCache,
        i, len;

      forceCurrent = forceCurrent || false;
      if (index === undefined || (!forceCurrent && s.current === index)) {
        return false;
      }

      // show the new current
      if (showCurrent || showCurrent === undefined) {
        elements[index].toggle(true);
      }

      if (s.multiple !== true) {
        // hide all others
        for (i = 0, len = elements.length; i < len; i += 1) {
          if (i !== index) {
            elements[i].toggle(false);
          }
        }
      }

      s.current = index;
    },


    // listen to the collapsibles
    setCollapsibleListener: function () {
      var self = this;

      self.$elements.on({
        toggle: function (e, isOpen) {
          if (isOpen) {
            self.setCurrent($(this).index(), false);
          }
        }
      });
    },


    // cache the elements to have faster access by id, and not have to cast them each time
    cacheElementsById: function () {
      var self = this,
        cache = [];

      self.$elements.each(function (i, el) {
        cache.push($(el).data('plugin_collapsible'));
      });

      self.settings.elementsCache = cache;
    },


    // create
    create: function () {
      var self = this,
        s = self.settings;

      // init the collapsibles
      self.$elements.collapsible({
        trigger:   s.trigger,
        content:   s.content,
        calcDelta: s.calcDelta,
        open:      false
      });
      self.cacheElementsById();
      self.elementCount = s.elementsCache.length;

      if (s.toggleListener) {
        self.setCollapsibleListener();
      }
    },


    // set the current step
    goto: function (stepnumber, isIndex) {
      var self = this,
        index = stepnumber;
      isIndex = isIndex || false;

      if (!isIndex) {
        index = parseInt(stepnumber, 10) - 1;
      }

      if (index < 0 || index >= self.elementCount) {
        return false;
      }

      self.setCurrent(index, true, true);
    },


    // update
    update: function () {
      var self = this;

      self.goto(self.settings.current, true);
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
      var self = this,
        $wrap = self.$wrap = $(self.element);

      self.settings = $.extend(self.defaults, options);
      self.importAttrConfig();

      // get jq-objects
      self.$elements = $wrap.find(self.settings.elements);

      self.create();
      self.update();

      self.$wrap.trigger('init', [status]);
    },


    // destroy
    destroy: function () {
      //
    },


    //
    getCurrent: function () {
      return this.settings.current;
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