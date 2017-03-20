/* globals YT */
;(function ($, window, undefined) {
  'use strict';

  var win = window,
    $win = $(window),
    pluginName = 'ytPlayer',
    dataKey = 'plugin_' + pluginName,
    Plugin = function (element, options) {
      this.element = element;
      this.$el = $(this.element);
      this.defaults = {
        elementID: undefined,
        videoID:   undefined,
        height:    '100%',
        width:     '100%',
        // @see https://developers.google.com/youtube/player_parameters?playerVersion=HTML5
        options:   {
          autoplay: false,
          rel:      false
        }
      };
      this.autoIdPrefix = 'yt-player-';
      this.player = undefined;
      this.init(options);
    };


  Plugin.prototype = {
    // preview image
    // @see http://img.youtube.com/vi/ + ID + / + quality + .jpg
    // quality: 'default', '1', '2', '3', 'mqdefault', '0', 'hqdefault', 'maxresdefault'


    // init player
    initPlayer: function () {
      var self = this,
        s = self.settings,
        options;

      if (!s.videoID) {
        console.error('No id given for yt-player.');
        return false;
      }

      options = {
        playerVars: s.options,
        videoId:    s.videoID,
        events:     {
          // @todo event handling
          // 'onReady': onPlayerReady,
          // 'onStateChange': onPlayerStateChange
        }
      };

      if (s.hasOwnProperty('height')) {
        options.height = s.height;
      }

      if (s.hasOwnProperty('width')) {
        options.width = s.width;
      }

      self.player = new YT.Player(s.elementID, options);
    },


    // set an element id if not given
    setElementID: function () {
      var self = this,
        $el = self.$el;

      if (!$el.attr('id')) {
        $el.attr('id', self.autoIdPrefix + ($('[id|="' + self.autoIdPrefix + '"]').length + 1));
      }

      self.settings.elementID = $el.attr('id');
    },


    // create
    create: function () {
      var self = this;

      self.$el.trigger('before-create');
      self.setElementID();
      self.$el.trigger('create');
    },


    // update
    update: function () {
      var self = this;

      self.$el.trigger('before-update');
      self.$el.trigger('update');
    },


    // use settings passed to the element using the "data-" attribute
    importAttrConfig: function () {
      var self = this,
        s = self.settings,
        $el = self.$el,
        opts = $el.data('options'),
        config = $el.data('playerConfig'),
        videoId = $el.data('videoId');

      if (opts) {
        $.extend(s, opts);
      }
      if (config) {
        $.extend(s.options, config);
      }
      if (videoId) {
        s.videoID = videoId;
      }
    },


    // init
    init: function (options) {
      var self = this;

      self.settings = $.extend(self.defaults, options);
      self.importAttrConfig();
      self.create();

      // when the script is loaded
      $win.on('yt-ready', function () {
        self.initPlayer();
        self.update();
        self.$el.trigger('init', [status]);
      });
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


  // listen when the the api is ready and trigger an event
  win.onYouTubeIframeAPIReady = function () {
    $win.trigger('yt-ready');
  };
})(jQuery, window);
