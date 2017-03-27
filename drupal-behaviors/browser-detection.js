// eslint-disable-next-line no-unused-vars
function getInternetExplorerVersion() {
  var rv = -1,
    ua,
    re;

  // detect IE 10 an below
  (function () {
    if (navigator.appName === 'Microsoft Internet Explorer') {
      ua = navigator.userAgent;
      re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
      if (re.exec(ua) !== null) {
        rv = parseFloat(RegExp.$1);
      }
    }
  }());

  // detect IE 11
  (function () {
    if (navigator.appName === 'Netscape') {
      ua = navigator.userAgent;
      re = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');
      if (re.exec(ua) !== null) {
        rv = parseFloat(RegExp.$1);
      }
    }
  }());

  return rv;
}
