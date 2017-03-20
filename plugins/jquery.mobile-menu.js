'use strict';

(function ($, window) {
  $.fn.mobileMenu = function () {
    var $menu = $(this),
      $body = $('body'),
      $win = $(window),
      toggleButtonTxt = 'Toggle mobile menu',
      toggleSubmenuTxt = 'Toggle Submenu',
      baseClass = 'mobile-menu',
      bodyMenuClass = 'has-mobile-menu',
      menuOpenClass = 'mobile-menu-open',
      toggleButtonClass = 'toggle-mobile-menu',
      $toggleParent = $('.navbar-header'),
      dataAttr = 'mobile-menu',
      eventPostfix = '.mobile-menu',
      menuStatus = false,
      mobileMenuBreakpoint = 768,
      $mobile,
      $mobileWrap,
      $mobileBody,
      $mobileHead,
      $mobileToggle,
      $toggle,
      bufferTime = 500,
      buffer;

    //
    function toggleMenu(status) {
      status = (status === true || status === false) ? status : !menuStatus;
      $body.toggleClass(menuOpenClass, status);
      menuStatus = status;
      this.$element.trigger('toggle');
    }

    //
    function createToggleButton() {
      var $btn = $('<button type="button"></button>'),
        title = toggleButtonTxt;

      $btn.text(title)
        .attr('title', title)
        .addClass(toggleButtonClass);

      return $btn;
    }

    //
    function createHead() {
      $mobileHead = $('<header class="' + baseClass + '-head"></header>');

      // toggle button
      $mobileToggle = createToggleButton();
      $mobileToggle.prependTo($mobileHead);

      $('.navbar-brand').clone()
        .appendTo($mobileHead);

      $mobileHead.appendTo($mobileWrap);
    }

    //
    function createBody() {
      $mobileBody = $('<div class="' + baseClass + '-body"></div>');

      // copy the main menu
      $mobile = $menu.clone()
        .attr('id', 'mobile-menu')
        .addClass(baseClass)
        .appendTo($mobileBody);

      $mobile.find('.active-trail')
        .attr('data-options', '{"open":true}');
      $mobile.find('.expanded')
        .append('<a href="#" class="submenu-trigger">' + toggleSubmenuTxt + '</a>');

      $mobileBody.appendTo($mobileWrap);

      $mobile.find('.expanded')
        .collapsible({
          trigger: '.submenu-trigger',
          menu:    '.sub-menu'
        });

      $mobile.on('click', '.submenu-trigger', function (e) {
        e.stopPropagation();
      });
    }

    // basic dom manipulations
    function create() {
      $mobileWrap = $('<div class="' + baseClass + '-wrap"></div>');

      // toggle button on main menu
      $toggle = createToggleButton();
      $toggle.appendTo($toggleParent);

      createHead();
      createBody();

      // attach the whole thingy to the dom
      $mobileWrap.wrapInner('<div class="' + baseClass + '-container"></div>')
        .appendTo($body);
      this.trigger('create');
    }

    // en- / disable the mobile menu
    function toggleMenuStatus() {
      $body.toggleClass(bodyMenuClass, $win.width() < mobileMenuBreakpoint);
    }

    //
    function setListener() {
      // toggle the mobile menu
      $body.on('click' + eventPostfix, '.' + toggleButtonClass, function (e) {
        e.stopPropagation();
        toggleMenu();
      });

      // close the menu
      $body.on('click' + eventPostfix, function () {
        if ($body.hasClass(menuOpenClass)) {
          toggleMenu();
        }
      });

      //
      $win.on('resize.mobile', function () {
        clearTimeout(buffer);
        buffer = setTimeout(toggleMenuStatus, bufferTime);
      });
    }

    // init
    (function init() {
      // prevent multiple executions
      if ($body.data(dataAttr) === true) {
        return false;
      }
      $body.data(dataAttr, true);

      create();
      setListener();
      $win.trigger('resize.mobile');
      this.$element.trigger('init');
    })();

    return this;
  };
}(jQuery, window));
