<<<<<<< HEAD
(function () {
    function $() {
        return Array.prototype.slice.call(document.querySelectorAll.apply(document, arguments));
    }

    $('body > .navbar, body > .section, body > .footer').forEach(function (element) {
        element.style.transition = '0s';
        element.style.opacity = '0';
    });
    document.querySelector('body > .navbar').style.transform = 'translateY(-100px)';
    ['.column-main > .card',
     '.column-left > .card, .column-right-shadow > .card',
     '.column-right > .card'].map(function (selector) {
        $(selector).forEach(function (element) {
            element.style.transition = '0s';
            element.style.opacity = '0';
            element.style.transform = 'scale(0.8)';
            element.style.transformOrigin = 'center top';
        });
    });
    setTimeout(function () {
        $('body > .navbar, body > .section, body > .footer').forEach(function (element) {
            element.style.opacity = '1';
            element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        });
        document.querySelector('body > .navbar').style.transform = 'translateY(0)';
        ['.column-main > .card',
         '.column-left > .card, .column-right-shadow > .card',
         '.column-right > .card'].map(function (selector) {
            var i = 1;
            $(selector).forEach(function (element) {
                setTimeout(function () {
                    element.style.opacity = '1';
                    element.style.transform = '';
                    element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, box-shadow 0.3s ease-in-out';
                }, i * 100);
                i++;
            });
        });
    });
})();
=======
"use strict";!function(){function n(){return Array.prototype.slice.call(document.querySelectorAll.apply(document,arguments))}n("body > .navbar, body > .section, body > .footer").forEach(function(t){t.style.transition="0s",t.style.opacity="0"}),document.querySelector("body > .navbar").style.transform="translateY(-100px)",[".column-main > .card",".column-left > .card, .column-right-shadow > .card",".column-right > .card"].map(function(t){n(t).forEach(function(t){t.style.transition="0s",t.style.opacity="0",t.style.transform="scale(0.8)",t.style.transformOrigin="center top"})}),setTimeout(function(){n("body > .navbar, body > .section, body > .footer").forEach(function(t){t.style.opacity="1",t.style.transition="opacity 0.3s ease-out, transform 0.3s ease-out"}),document.querySelector("body > .navbar").style.transform="translateY(0)",[".column-main > .card",".column-left > .card, .column-right-shadow > .card",".column-right > .card"].map(function(t){var o=1;n(t).forEach(function(t){setTimeout(function(){t.style.opacity="1",t.style.transform="",t.style.transition="opacity 0.3s ease-out, transform 0.3s ease-out, box-shadow 0.3s ease-in-out"},100*o),o++})})})}();
>>>>>>> f4bcb6d130eff003a8064c877e0e38a67514e600
