<<<<<<< HEAD
// eslint-disable-next-line no-unused-expressions
!(function(window, document) {
  var runningOnBrowser = typeof window !== 'undefined';
  var supportsIntersectionObserver = runningOnBrowser && 'IntersectionObserver' in window;

  var images = Array.prototype.slice.call(document.querySelectorAll('img[srcset]'));
  if (!images || images.length === 0) {
    return;
  }

  if (supportsIntersectionObserver) {
    var io = new IntersectionObserver(function(changes) {
      changes.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.setAttribute('srcset', target.src);
        target.onload = target.onerror = () => io.unobserve(target);
      });
    }, {
      threshold : [0],
      rootMargin: (window.innerHeight || document.documentElement.clientHeight) + 'px'
    });
    images.map((item) => io.observe(item));
  } else {
    // eslint-disable-next-line no-inner-declarations
    function elementInViewport(el) {
      var rect = el.getBoundingClientRect();
      var height = window.innerHeight || document.documentElement.clientHeight;
      var top = rect.top;
      return (top >= 0 && top <= height * 3) || (top <= 0 && top <= -(height * 2) - rect.height);
    }

    // eslint-disable-next-line no-inner-declarations
    function loadImage(el, fn) {
      var img = new Image();
      var src = el.getAttribute('src');
      img.onload = function() {
        el.srcset = src;
        fn && fn();
      };
      img.srcset = src;
    }

    // eslint-disable-next-line no-undef
    var lazyLoader = new Debouncer(processImages);

    // eslint-disable-next-line no-inner-declarations
    function processImages() {
      for (var i = 0; i < images.length; i++) {
        if (elementInViewport(images[i])) {
          // eslint-disable-next-line no-loop-func
          (function(index) {
            var loadingImage = images[index];
            loadImage(loadingImage, function() {
              images = images.filter(function(t) {
                return loadingImage !== t;
              });
            });
          })(i);
        }
      }
      if (images.length === 0) {
        window.removeEventListener('scroll', lazyLoader, false);
      }
    }

    window.addEventListener('scroll', lazyLoader, false);
    lazyLoader.handleEvent();
  }

})(window, document);
=======
"use strict";!function(i,c){var e=void 0!==i&&"IntersectionObserver"in i,s=Array.prototype.slice.call(c.querySelectorAll("img[srcset]"));if(s&&0!==s.length)if(e){var n=new IntersectionObserver(function(e){e.forEach(function(e){var t=e.target;e.isIntersecting&&(t.setAttribute("srcset",t.src),t.onload=t.onerror=function(){return n.unobserve(t)})})},{threshold:[0],rootMargin:(i.innerHeight||c.documentElement.clientHeight)+"px"});s.map(function(e){return n.observe(e)})}else{var l=new Debouncer(function(){for(var o=0;o<s.length;o++)e=s[o],0,t=e.getBoundingClientRect(),n=i.innerHeight||c.documentElement.clientHeight,(0<=(r=t.top)&&r<=3*n||r<=0&&r<=-2*n-t.height)&&function(){var e,t,n,r,i=s[o];e=i,t=function(){s=s.filter(function(e){return i!==e})},n=new Image,r=e.getAttribute("src"),n.onload=function(){e.srcset=r,t&&t()},n.srcset=r}();var e,t,n,r;0===s.length&&i.removeEventListener("scroll",l,!1)});i.addEventListener("scroll",l,!1),l.handleEvent()}}(window,document);
>>>>>>> 9c564748324edcfc9c7247781d993d1f71dabb84
