function getInternetExplorerVersion() {
  var rv = -1,
    ua,
    re;

  if (navigator.appName === 'Microsoft Internet Explorer') {
    ua = navigator.userAgent;
    re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
    if (re.exec(ua) !== null) {
      rv = parseFloat(RegExp.$1);
    }
  }

  else if (navigator.appName === 'Netscape') {
    ua = navigator.userAgent;
    re = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');
    if (re.exec(ua) !== null) {
      rv = parseFloat(RegExp.$1);
    }
  }
  return rv;
}
