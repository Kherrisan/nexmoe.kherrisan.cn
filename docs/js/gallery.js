<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function () {
    if (typeof ($.fn.lightGallery) === 'function') {
        $('.article').lightGallery({ selector: '.gallery-item' });
    }
    if (typeof ($.fn.justifiedGallery) === 'function') {
        if ($('.justified-gallery > p > .gallery-item').length) {
            $('.justified-gallery > p > .gallery-item').unwrap();
        }
        $('.justified-gallery').justifiedGallery();
    }
});
=======
"use strict";document.addEventListener("DOMContentLoaded",function(){"function"==typeof $.fn.lightGallery&&$(".article").lightGallery({selector:".gallery-item"}),"function"==typeof $.fn.justifiedGallery&&($(".justified-gallery > p > .gallery-item").length&&$(".justified-gallery > p > .gallery-item").unwrap(),$(".justified-gallery").justifiedGallery())});
>>>>>>> f4bcb6d130eff003a8064c877e0e38a67514e600
