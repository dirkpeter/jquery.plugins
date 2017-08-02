/* global google */

'use strict';

// eslint-disable-next-line max-statements
(function ($) {
  const pluginName = 'officeLocator',
    dataKey = 'plugin_' + pluginName,
    // eslint-disable-next-line func-style
    Plugin = function (element, options) {
      const that = this;

      that.element = element;
      // define the attributes that will be used to override options (defaults)
      that.attributes = ['center', 'zoom'];
      that.defaults = {
        debug:           false,
        // selector
        addressSelector: '.field--name-field-address',
        citySelector:    '.locality',
        contentSelector: '.field--name-field-viewfield-office-locator',
        latLngSelector:  '.field--name-field-latitude-longitude-address',
        locatorSelector: '.field--name-field-viewfield-office-locator',
        mailSelector:    '.field--name-field-mail',
        mapSelector:     '.office-locator--map',
        officeSelector:  '.field--name-field-viewfield-office-locator .node--type-office',
        phoneSelector:   '.field--name-field-phone-number',
        titleSelector:   '.field--name-node-title h2',
        typeSelector:    '.field--name-field-office-type',
        // config
        classPrefix:     'office-locator--',
        dataIDKey:       'officeLocatorID',
        detailsText:     'Details',
        mapIDPrefix:     'office-locator-',
        // map
        center:          {
          // Bern
          lat: 46.9479739,
          lng: 7.447446799999966
        },
        mapOptions:      {
          scrollwheel:       false,
          streetViewControl: false,
          mapTypeControl:    false,
          styles:            [
            {
              "featureType": "administrative",
              "elementType": "labels.text.fill",
              "stylers":     [{"color": "#444444"}]
            },
            {
              "featureType": "landscape",
              "elementType": "all",
              "stylers":     [{"color": "#f2f2f2"}]
            },
            {
              "featureType": "poi",
              "elementType": "all",
              "stylers":     [{"visibility": "off"}]
            },
            {
              "featureType": "road",
              "elementType": "all",
              "stylers":     [
                {"saturation": -100}, {"lightness": 45}]
            },
            {
              "featureType": "road.highway",
              "elementType": "all",
              "stylers":     [{"visibility": "simplified"}]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.icon",
              "stylers":     [{"visibility": "off"}]
            },
            {
              "featureType": "transit",
              "elementType": "all",
              "stylers":     [{"visibility": "off"}]
            },
            {
              "featureType": "water",
              "elementType": "all",
              "stylers":     [
                {"color": "#46bcec"}, {"visibility": "on"}]
            },
            {
              "featureType": "water",
              "elementType": "geometry.fill",
              "stylers":     [
                {"visibility": "on"},
                {"color": "#0089d9"}
              ]
            }]
        },
        zoom:            10,
        zoomToFit:       true,
        markerIcon:      {
          representative: '/themes/custom/vetrotech/dist/images/office-representative.svg',
          sales_office:   '/themes/custom/vetrotech/dist/images/office-sales.svg'
        },
        apiKey:          false
      };
      // config
      that.tokenScriptURL = '@key@';
      that.ScriptURL = '//maps.googleapis.com/maps/api/js?key=@key@';
      that.map = undefined;
      that.mapID = undefined;
      that.mapOverlay = undefined;
      that.marker = [];
      // elements
      that.$content = undefined;
      that.$element = undefined;
      that.$locator = undefined;
      that.$offices = undefined;
      // init
      that._init(options);
    };


  Plugin.prototype = {
    // (private) logging for development
    _log(txt, ...args) {
      if (this.settings.debug === true) {
        // eslint-disable-next-line no-console
        console.log('[' + pluginName + ':' + txt + ']', args);
      }
    },


    //
    update() {
      this._log('update');
    },


    //
    _setListener() {
      this._log('_setListener');

      const that = this;

      // scroll to details from map overlay
      that.$map.on('click', '.gm-style-iw .button', (e) => {
        e.preventDefault();

        that._log('<button:click>', e);

        const $el = $(e.currentTarget),
          hash = $el.attr('href').substr(1),
          $target = that.$element.find('[name="' + hash + '"]');

        $('html, body')
          .stop()
          .animate({scrollTop: $target.offset().top - 100}, 500, 'swing');
        window.location.hash = hash;
      });
    },


    //
    _getElementValue($el, selector) {
      this._log('_getElementValue', $el, selector);

      return $el.find(selector)
        .text()
        .trim();
    },


    //
    _createOverlayContent(data) {
      this._log('_createOverlayContent', data);

      const that = this,
        settings = that.settings;

      return '<div class="' + settings.classPrefix + '--overlay">' +
        '<header class="type-' + data.type + '">' + data.city + '</header>' +
        data.address +
        '<div class="email"><a href="mailto:' + data.email + '">' + data.email + '</a></div>' +
        '<div class="phone"><a href="tel:' + data.phone + '">' + data.phone + '</a></div>' +
        '<div class="action"><a href="#' + data.anchor + '" class="button">' + settings.detailsText + '</a></div>' +
        '</div>';
    },


    //
    _createMarker(data) {
      this._log('_createMarker', data);

      const that = this,
        marker = new google.maps.Marker({
          position: data.latLng,
          map:      that.map,
          icon:     that.settings.markerIcon[data.type]
        });

      marker.addListener('click', () => {
        that.mapOverlay.setContent(that._createOverlayContent(data));
        that.mapOverlay.open(that.map, marker);
      });

      that.marker.push(marker);
    },


    //
    _parseOffices() {
      this._log('parseOffices');

      const that = this,
        settings = that.settings;

      that.$offices.each((i, el) => {
        const $el = $(el),
          geo = $el.find(settings.latLngSelector).data('geo'),
          data = {
            address: $el.find(settings.addressSelector)
                       .html(),
            anchor:  that.mapID + '--' + i,
            email:   that._getElementValue($el, settings.mailSelector),
            latLng:  {
              lat: geo[0],
              lng: geo[1]
            },
            phone:   that._getElementValue($el, settings.phoneSelector),
            title:   that._getElementValue($el, settings.titleSelector),
            type:    that._getElementValue($el, settings.typeSelector),
            city:    that._getElementValue($el, settings.citySelector)
          };

        // set anchor
        // $('<a name="' + data.anchor + '"></a>').insertBefore($el);
        $el.find('h3').wrap('<a name="' + data.anchor + '" class="title"></a>');

        // append data
        $el.data(data);
        that._createMarker(data);
      });
    },


    //
    _createMapID() {
      this._log('_createMapID');

      const that = this,
        $body = $('body'),
        settings = that.settings,
        dateIDKey = settings.dataIDKey,
        data = $body.data();
      let id;

      if (data.hasOwnProperty(dateIDKey)) {
        id = data[dateIDKey] + 1;
      }
      else {
        id = 1;
      }

      $body.data(dateIDKey, id);
      that.mapID = settings.mapIDPrefix + id;

      return that.mapID;
    },


    //
    _createMap() {
      this._log('_createMap');

      const that = this,
        settings = that.settings,
        $map = that.$element.find(settings.mapSelector);

      // init the map
      $map.attr('id', that._createMapID());
      that.map = new google.maps.Map(
        document.getElementById(that.mapID),
        $.extend(
          {
            zoom:   settings.zoom,
            center: settings.center
          },
          settings.mapOptions
        )
      );

      // create the overlay
      that.mapOverlay = new google.maps.InfoWindow({
        maxWidth: 300
      });

      // cache elements
      that.$map = $map;
    },


    //
    _setCenter() {
      this._log('_setCenter');

      const that = this,
        settings = that.settings,
        bounds = new google.maps.LatLngBounds();

      // only set bounds, if markers are available
      if (that.marker.length) {
        that.marker.forEach((marker) => {
          bounds.extend(marker.getPosition());
        });

        that.map.fitBounds(bounds);

        // set a max-zoom
        setTimeout(() => {
          if (that.map.getZoom() > settings.zoom) {
            that.map.setZoom(settings.zoom);
          }
        }, 2000);
      }
    },


    //
    _create() {
      this._log('_create');

      const that = this,
        settings = that.settings;

      // cache elements
      that.$content = that.$element.find(settings.contentSelector);
      that.$locator = that.$element.find(settings.locatorSelector);
      that.$offices = that.$element.find(settings.officeSelector);

      // build the markup
      that._createMap();
      that._parseOffices();
      that._setCenter();
    },


    // use settings passed to the element using the "data-" attribute
    _importAttrConfig() {
      this._log('_importAttrConfig');

      const that = this,
        s = that.settings,
        data = that.$element.data();

      for (const attr of that.attributes) {
        if (data.hasOwnProperty(attr)) {
          // handle exceptions
          switch (attr) {
            case 'center':
              s[attr] = {
                lat: data[attr][0],
                lng: data[attr][1]
              };
              break;

            default:
              s[attr] = data[attr];
              break;
          }
        }
      }

      return that.settings;
    },


    // menu-data request
    _fetchScript() {
      this._log('_fetchScript');

      const that = this,
        settings = that.settings;

      return $.ajax({
        url:      that.ScriptURL.replace(that.tokenScriptURL, settings.apiKey),
        dataType: 'script'
      })
        .then((data) => data);
    },


    // (private) where the fun begins
    _init(options) {
      const that = this;

      that.$element = $(that.element);

      const settings = $.extend(that.defaults, options);

      that.settings = settings;

      that._log('_init', options);
      that._importAttrConfig();

      if (settings.apiKey) {
        that._fetchScript()
          .done(() => {
            that._create();
            that._setListener();
            that.update();

            that.$element.trigger('init', options);
          });
      }
      else {
        // warn message should be shown
        // eslint-disable-next-line no-console
        console.warn('[OL:1] No Google Maps API Key provided!');
      }
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
