/* global YT */

'use strict';

(function ($) {
  const pluginName = 'ytPlayer',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      const that = this;

      that.element = element;
      that.$el = $(this.element);
      that.defaults = {
        debug:     false,
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
      that.autoIdPrefix = 'yt-player-';
      that.player = undefined;
      that.init(options);
    },
    win = window,
    $win = $(window);


  Plugin.prototype = {
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


    // preview image
    // @see http://img.youtube.com/vi/ + ID + / + quality + .jpg
    // quality: 'default', '1', '2', '3', 'mqdefault', '0', 'hqdefault', 'maxresdefault'

    //
    _initPlayer() {
      this._log('_initPlayer');

      const that = this,
        settings = that.settings,
        options = {};

      if (!settings.videoID) {
        // eslint-disable-next-line no-console
        console.error('[YT 01] No id given for yt-player.');

        return false;
      }

      options.playerVars = settings.options;
      options.videoId = settings.videoID;
      options.events = {
        // @todo event handling
        // 'onReady': onPlayerReady,
        // 'onStateChange': onPlayerStateChange
      };

      if (settings.hasOwnProperty('height')) {
        options.height = settings.height;
      }

      if (settings.hasOwnProperty('width')) {
        options.width = settings.width;
      }

      that.player = new YT.Player(settings.elementID, options);

      return that.player;
    },


    // set an element id if not given
    _setElementID() {
      this._log('setElementID');

      const that = this,
        $el = that.$el;

      if (!$el.attr('id')) {
        $el.attr('id', that.autoIdPrefix + ($('[id|="' + that.autoIdPrefix + '"]').length + 1));
      }

      that.settings.elementID = $el.attr('id');
    },


    // create
    create() {
      this._log('create');

      const that = this;

      that.$el.trigger('before-create');
      that._setElementID();
      that.$el.trigger('create');
    },


    // update
    update() {
      this._log('update');

      const $el = this.$el;

      $el.trigger('before-update');
      $el.trigger('update');
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


    // init
    init(options) {
      const that = this;

      that.settings = $.extend(that.defaults, options);
      that._log('_init', options);
      that._importAttrConfig();
      that.create();

      that.$element = $(that.element);

      // when the script is loaded
      $win.on('yt-ready', () => {
        that._initPlayer();
        that.update();
        that.$el.trigger('init', [status]);
      });
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


  // listen when the the api is ready and trigger an event
  win.onYouTubeIframeAPIReady = function () {
    $win.trigger('yt-ready');
  };
}(jQuery));
