


;(function ($, ol, undefined) {
  'use strict';

  var map;

  var overlayPopups = [];

  var visibleFeatures = [];

  var poiVectorSource = new ol.source.Vector({
    features: visibleFeatures
  });

  var poiVectorLayer = new ol.layer.Vector({
    source: poiVectorSource
  });

  ol.Overlay.prototype.show = function () {
    this.setPosition(this.get('coords'));
  };

  ol.Overlay.prototype.hide = function () {
    this.set('coords', this.getPosition());
    this.setPosition(undefined);
  };

  ol.Overlay.prototype.toggle = function () {
    if (this.getPosition() !== undefined) {
      this.hide();
    }
    else {
      this.show();
    }
  };
/*
  var jumpToCoord = function jumpToCoord(coords, zoom) {
    if (typeof(zoom) === 'undefined') {
      zoom = 17;
    }

    var view = map.getView();
    var point = new ol.geom.Point(coords);
    var size = map.getSize();

    view.fit(point, size);
    view.setZoom(zoom);
  };
*/
  var jumpToJena = function jumpToJena() {
    var view = map.getView();
    view.setCenter([683109.119003381, 5645615.72126983]);
    view.setZoom(12);
  };

  var showAllFeatures = function showAllFeatures() {
    var currentFeatures = poiVectorSource.getFeatures();
    var currentFeaturesCoords = [];
    var view = map.getView();

    $.each(currentFeatures, function showAllFeaturesEach() {
      var coords = this.getGeometry().getCoordinates();
      if (typeof(coords) !== 'undefined') {
        currentFeaturesCoords.push(coords);
      }
    });

    if (currentFeaturesCoords.length > 0) {
      var boxExtent = ol.extent.boundingExtent(currentFeaturesCoords);
      view.fit(boxExtent, map.getSize());
    }
  };

  var getPoiFeatures = function getPoiFeatures(element) {
    var feature = new ol.Feature({
        id:         element.attr('data-id'),
        geometry:   new ol.geom.Point([element.attr('data-lon'), element.attr('data-lat')]),
        name:       element.attr('data-title'),
        population: 4000,
        rainfall:   500
      }
    );
    feature.setStyle(new ol.style.Style({
        image: new ol.style.Icon(({
          anchor:       [0.5, 0.5],
          anchorOrigin: 'bottom-left',
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity:      1,
          scale:        1.1,
          src:          'https://map.jena.de/StadtplanOpenLayers/img/marker.png'
        })),
        text:  new ol.style.Text({
          offsetY: -23,
          font:    '11px helvetica,sans-serif',
          text:    element.attr('data-poi-counter').substr(0, 3),
          scale:   1.1,
          fill:    new ol.style.Fill({
            color: '#000'
          }),
          stroke:  new ol.style.Stroke({
            color: 'transparent',
            width: 2
          })
        })
      }
      )
    );
    return feature;
  };

  var updateViewLayer = function updateViewLayer() {
    var tmpFeatures = [];
    poiVectorSource.clear();

    $('.poiData').each(function updateViewLayerEachPoiData() {
      if ($(this).attr('data-lon') !== '' && $(this).attr('data-lat') !== '') {
        if ($(this).attr('data-visible') === 'true') {
          tmpFeatures.push(getPoiFeatures($(this)));
        }
      }
    });

    poiVectorSource.addFeatures(tmpFeatures);
    showAllFeatures();

    if (tmpFeatures.length === 0) {
      jumpToJena();
    }
  };
/*
  var jumpToFeature = function jumpToFeature(poiId) {
    var poiData = $('#poiData' + poiId);
    poiData.attr('data-visible', true);
    updateViewLayer();
    jumpToCoord([poiData.attr('data-lon'), poiData.attr('data-lat')]);
  };
*/
  var poiPopupClose = function poiPopupClose(poiId) {
    var overlayPopup = map.getOverlayById('overlayPopup' + poiId);
    overlayPopup.hide();
  };

  var initPoiData = function initPoiData(callback) {
    var queryPoiDataByStrHnr = [];

    $('.poiData').each(function initPoiDataEach() {
      var me = $(this);

      if (typeof(me.attr('id'))) {
        me.prop('id', 'poiData' + me.attr('data-id'));
      }

      if (me.attr('data-lon') === '' || typeof(me.attr('data-lon')) === 'undefined' && me.attr('data-lat') === '' || typeof(me.attr('data-lat')) === 'undefined') {
        if (me.attr('data-str-hnr') !== '') {
          queryPoiDataByStrHnr.push({
            id:     me.attr('data-id'),
            strhnr: me.attr('data-str-hnr')
          });
        }
        else {
          me.remove();
        }
      }
    });

    if (queryPoiDataByStrHnr.length > 0) {
      $.ajax({
        method: 'GET',
        url:    'https://www.jena.de/stadtplan-api/web/index.php/str_hnr_split/getByStrHnrBulk.json',
        data:   {q: queryPoiDataByStrHnr}
      }).done(function poiDataQueryDone(data) {
        $.each(data, function poiDataQueryDoneEach(i, v) {
          if (v.id && v.lon && v.lat) {
            var poiData = $('#poiData' + v.id);
            poiData.attr('data-lon', v.lon);
            poiData.attr('data-lat', v.lat);
          }
        });

        if (typeof callback === 'function') {
          callback();
        }
      });
    }

    else {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };

  var initPopup = function initPopup() {
    var externalMapService = 'http://maps.google.com';

    if (navigator.userAgent.search('Mac OS') > 0) {
      externalMapService = 'http://maps.apple.com';
    }

    $('.poiPopup').each(function initPopupEach() {
      var me = $(this);
      var poiData = $('#poiData' + me.attr('data-id'));

      if (typeof(me.attr('id'))) {
        me.prop('id', 'poiPopup' + me.attr('data-id'));
      }

      if (me.attr('data-ext-map-link') === 'true') {
        me.append('<a class="popupExtMapLink" href="' + externalMapService + '?q=' + poiData.attr('data-str-hnr') + ', Jena, Deutschland" title="' + me.attr('data-ext-map-title') + '">' + me.attr('data-ext-map-title') + '</a>');
      }

      if (poiData.attr('data-lon') !== '' && poiData.attr('data-lat') !== '') {
        var tmpOverlay = new ol.Overlay({
          id:               'overlayPopup' + $(this).attr('data-id'),
          element:          document.getElementById('poiPopup' + $(this).attr('data-id')),
          positioning:      'bottom-right',
          autoPan:          true,
          autoPanAnimation: {
            duration: 250
          }
        });
        tmpOverlay.set('coords', [poiData.attr('data-lon'), poiData.attr('data-lat')]);
        overlayPopups.push(tmpOverlay);
      }
      else {
        $(this).remove();
      }
    });

  };

  var initToggle = function initToggle() {
    $('.poiToggle').each(function initToggleEach() {
      $(this).on('click', function toggleClick() {
        var poiData = $('#poiData' + $(this).attr('data-id'));
        if (poiData.attr('data-visible') === 'true') {
          poiPopupClose(poiData.attr('data-id'));
          poiData.attr('data-visible', 'false');
        }
        else if (poiData.attr('data-visible') === 'false') {
          poiData.attr('data-visible', 'true');
        }
        updateViewLayer();
      });
    });
  };

  var initMap = function initMap() {
    map = new ol.Map({
      target:   'map',
      logo:     false,
      layers:   [
        new ol.layer.Image({
          title:  'Stadtplan Jena',
          source: new ol.source.ImageWMS({
            'attributions': [new ol.Attribution({
              'html': '&copy; <a href="http://www.jena.de">Stadtverwaltung Jena</a>'
            })],
            'ratio':        2,
            'projection':   new ol.proj.Projection({
              'code':  'EPSG:25832',
              'units': 'm'
            }),
            'url':          'https://map.jena.de/mapcache',
            'params':       {
              'LAYERS':      'Stadtplan',
              'FORMAT':      'image/png',
              'VERSION':     '1.1.1',
              'TRANSPARENT': '',
              'BBOX':        [674000, 5636000, 688000, 5652000]
            }
          })
        })
      ],
      overlays: overlayPopups,
      view:     new ol.View({
        center:      [683109.119003381, 5645615.72126983],
        projection:  new ol.proj.Projection({
          'code':  'EPSG:25832',
          'units': 'm'
        }),
        minZoom:     12,
        maxZoom:     19,
        zoom:        12,
        extent:      [674000, 5636000, 688000, 5652000],
        resolutions: [29.6875, 14.84375, 7.421875, 3.7109375, 1.85546875, 0.927734375, 0.4638671875]
      })
    });

    map.on('click', function mapClick(event) {
      map.forEachFeatureAtPixel(event.pixel, function mapClickForEachFeatureAtPixel(feature) {
        var poiId = feature.get('id');
        var overlayPopup = map.getOverlayById('overlayPopup' + poiId);
        overlayPopup.toggle();
      });
    });
    updateViewLayer();
    map.addLayer(poiVectorLayer);
  };

  {
    initPoiData(function initCallback() {
      initPopup();
      initToggle();
      initMap();
    });
  }

})(jQuery, ol);