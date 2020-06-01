<<<<<<< HEAD
// eslint-disable-next-line no-unused-vars
function createObserver(func, obid) {
  var runningOnBrowser = typeof window !== 'undefined';
  var isBot = (runningOnBrowser && !('onscroll' in window)) || (typeof navigator !== 'undefined'
    && /(gle|ing|ro|msn)bot|crawl|spider|yand|duckgo/i.test(navigator.userAgent));
  var supportsIntersectionObserver = runningOnBrowser && 'IntersectionObserver' in window;
  if (!isBot && supportsIntersectionObserver) {
    var io = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        func();
        io.disconnect();
      }
    }, {
      threshold : [0],
      rootMargin: (window.innerHeight || document.documentElement.clientHeight) + 'px'
    });
    io.observe(document.getElementById(obid));
  } else {
    func();
  }
}

// eslint-disable-next-line no-unused-vars
function addScript(url, onload) {
  var s = document.createElement('script');
  s.setAttribute('src', url);
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('charset', 'UTF-8');
  s.async = false;
  if (typeof onload === 'function') {
    if (window.attachEvent) {
      s.onreadystatechange = function() {
        var e = s.readyState;
        if (e === 'loaded' || e === 'complete') {
          s.onreadystatechange = null;
          onload();
        }
      };
    } else {
      s.onload = onload;
    }
  }
  var e = document.getElementsByTagName('script')[0]
    || document.getElementsByTagName('head')[0]
    || document.head || document.documentElement;
  e.parentNode.insertBefore(s, e);
}

// eslint-disable-next-line no-unused-vars
function addCssLink(url) {
  var l = document.createElement('link');
  l.setAttribute('rel', 'stylesheet');
  l.setAttribute('type', 'text/css');
  l.setAttribute('href', url);
  var e = document.getElementsByTagName('link')[0]
    || document.getElementsByTagName('head')[0]
    || document.head || document.documentElement;
  e.parentNode.insertBefore(l, e);
}
=======
"use strict";function createObserver(t,e){var n="undefined"!=typeof window,r=n&&!("onscroll"in window)||"undefined"!=typeof navigator&&/(gle|ing|ro|msn)bot|crawl|spider|yand|duckgo/i.test(navigator.userAgent),o=n&&"IntersectionObserver"in window;if(!r&&o){var a=new IntersectionObserver(function(e){e[0].isIntersecting&&(t(),a.disconnect())},{threshold:[0],rootMargin:(window.innerHeight||document.documentElement.clientHeight)+"px"});a.observe(document.getElementById(e))}else t()}function addScript(e,t){var n=document.createElement("script");n.setAttribute("src",e),n.setAttribute("type","text/javascript"),n.setAttribute("charset","UTF-8"),n.async=!1,"function"==typeof t&&(window.attachEvent?n.onreadystatechange=function(){var e=n.readyState;"loaded"!==e&&"complete"!==e||(n.onreadystatechange=null,t())}:n.onload=t);var r=document.getElementsByTagName("script")[0]||document.getElementsByTagName("head")[0]||document.head||document.documentElement;r.parentNode.insertBefore(n,r)}function addCssLink(e){var t=document.createElement("link");t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),t.setAttribute("href",e);var n=document.getElementsByTagName("link")[0]||document.getElementsByTagName("head")[0]||document.head||document.documentElement;n.parentNode.insertBefore(t,n)}
>>>>>>> 9c564748324edcfc9c7247781d993d1f71dabb84
