<<<<<<< HEAD
(function ($) {
    $('.article img:not(".not-gallery-item")').each(function () {
        // wrap images with link and add caption if possible
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<div class="has-text-centered is-size-6 has-text-grey caption">' + this.alt + '</div>');
            }
        }
    });

    $('.article > .content > table').each(function () {
        if ($(this).width() > $(this).parent().width()) {
            $(this).wrap('<div class="table-overflow"></div>');
        }
    });

    function adjustNavbar() {
        const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('is-flex-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('is-flex-start');
        }
    }
    adjustNavbar();
    $(window).resize(adjustNavbar);

    $('figure.highlight table').wrap('<div class="highlight-body">');
    if (typeof (IcarusThemeSettings) !== 'undefined' &&
        typeof (IcarusThemeSettings.article) !== 'undefined' &&
        typeof (IcarusThemeSettings.article.highlight) !== 'undefined') {

        $('figure.highlight').addClass('hljs');
        $('figure.highlight .code .line span').each(function () {
            const classes = $(this).attr('class').split(/\s+/);
            if (classes.length === 1) {
                $(this).addClass('hljs-' + classes[0]);
                $(this).removeClass(classes[0]);
            }
        });


        var clipboard = IcarusThemeSettings.article.highlight.clipboard;
        var fold = IcarusThemeSettings.article.highlight.fold;
        fold = fold.trim();

        $('figure.highlight').each(function () {
            if ($(this).find('figcaption').length) {
                $(this).find('figcaption').addClass('level is-mobile');
                $(this).find('figcaption').append('<div class="level-left">');
                $(this).find('figcaption').append('<div class="level-right">');
                $(this).find('figcaption div.level-left').append($(this).find('figcaption').find('span'));
                $(this).find('figcaption div.level-right').append($(this).find('figcaption').find('a'));
            } else {
                if (clipboard || fold) {
                    $(this).prepend('<figcaption class="level is-mobile"><div class="level-left"></div><div class="level-right"></div></figcaption>');
                }
            }
        });

        if (typeof (ClipboardJS) !== 'undefined' && clipboard) {
            $('figure.highlight').each(function () {
                var id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                var button = '<a href="javascript:;" class="copy" title="Copy" data-clipboard-target="#' + id + ' .code"><i class="fas fa-copy"></i></a>';
                $(this).attr('id', id);
                $(this).find('figcaption div.level-right').append(button);
            });
            new ClipboardJS('.highlight .copy');
        }

        if (fold) {
            var button = '<span class="fold">' + (fold === 'unfolded' ? '<i class="fas fa-angle-down"></i>' : '<i class="fas fa-angle-right"></i>') + '</span>';
            $('figure.highlight').each(function () {
                // 此处find ">folded" span,如果有自定义code头,并且">folded"进行处理
                // 使用示例，.md 文件中头行标记">folded"
                // ```java main.java >folded
                // import main.java
                // private static void main(){
                //     // test
                //     int i = 0;
                //     return i;
                // }
                // ```
                if ($(this).find('figcaption').find('span').length > 0) {
                    let spanArr = $(this).find('figcaption').find('span');
                    if (spanArr[0].innerText.indexOf(">folded") > -1) {
                        // 去掉folded
                        spanArr[0].innerText = spanArr[0].innerText.replace(">folded", "")
                        button = '<span class="fold"><i class="fas fa-angle-right"></i></span>';
                        $(this).find('figcaption div.level-left').prepend(button);

                        // 收叠代码块
                        toggleFold(this, true);
                        return;
                    }
                }
                $(this).find('figcaption div.level-left').prepend(button);
                toggleFold(this, fold === 'folded');
            });

            function toggleFold(codeBlock, isFolded) {
                var $toggle = $(codeBlock).find('.fold i');
                !isFolded ? $(codeBlock).removeClass('folded') : $(codeBlock).addClass('folded');
                !isFolded ? $toggle.removeClass('fa-angle-right') : $toggle.removeClass('fa-angle-down');
                !isFolded ? $toggle.addClass('fa-angle-down') : $toggle.addClass('fa-angle-right');
            }

            // $('figure.highlight').each(function () {
            //     toggleFold(this, fold === 'folded');
            // });
            $('figure.highlight figcaption .fold').click(function () {
                var $code = $(this).closest('figure.highlight');
                toggleFold($code.eq(0), !$code.hasClass('folded'));
            });
        }
    }

    var $toc = $('#toc');
    if ($toc.length > 0) {
        var $mask = $('<div>');
        $mask.attr('id', 'toc-mask');

        $('body').append($mask);

        function toggleToc() {
            $toc.toggleClass('is-active');
            $mask.toggleClass('is-active');
        }

        $toc.on('click', toggleToc);
        $mask.on('click', toggleToc);
        $('.navbar-main .catalogue').on('click', toggleToc);
    }

    // hexo-util/lib/is_external_link.js
    function isExternalLink(input, sitehost, exclude) {
        try {
            sitehost = new URL(sitehost).hostname;
        } catch (e) { }

        if (!sitehost) return false;

        // handle relative url
        const data = new URL(input, 'http://' + sitehost);

        // handle mailto: javascript: vbscript: and so on
        if (data.origin === 'null') return false;

        const host = data.hostname;

        if (exclude) {
            exclude = Array.isArray(exclude) ? exclude : [exclude];

            if (exclude && exclude.length) {
                for (const i of exclude) {
                    if (host === i) return false;
                }
            }
        }

        if (host !== sitehost) return true;

        return false;
    }

    if (typeof (IcarusThemeSettings) !== 'undefined' &&
        typeof (IcarusThemeSettings.site.url) !== 'undefined' &&
        typeof (IcarusThemeSettings.site.external_link) !== 'undefined' &&
        IcarusThemeSettings.site.external_link.enable) {
        $('.article .content a').filter(function (i, link) {
            return link.href &&
                !$(link).attr('href').startsWith('#') &&
                link.classList.length === 0 &&
                isExternalLink(link.href,
                    IcarusThemeSettings.site.url,
                    IcarusThemeSettings.site.external_link.exclude);
        }).each(function (i, link) {
            link.relList.add('noopener');
            link.target = '_blank';
        });
    }
})(jQuery);
=======
"use strict";function _createForOfIteratorHelper(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=_unsupportedIterableToArray(e))){var t=0,i=function(){};return{s:i,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,n,r=!0,l=!1;return{s:function(){a=e[Symbol.iterator]()},n:function(){var e=a.next();return r=e.done,e},e:function(e){l=!0,n=e},f:function(){try{r||null==a.return||a.return()}finally{if(l)throw n}}}}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(i):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,a=new Array(t);i<t;i++)a[i]=e[i];return a}!function(a){function e(){var e=a(".navbar-main .navbar-start").outerWidth()+a(".navbar-main .navbar-end").outerWidth();a(document).outerWidth()<e?a(".navbar-main .navbar-menu").addClass("is-flex-start"):a(".navbar-main .navbar-menu").removeClass("is-flex-start")}if(a('.article img:not(".not-gallery-item")').each(function(){0===a(this).parent("a").length&&(a(this).wrap('<a class="gallery-item" href="'+a(this).attr("src")+'"></a>'),this.alt&&a(this).after('<div class="has-text-centered is-size-6 has-text-grey caption">'+this.alt+"</div>"))}),a(".article > .content > table").each(function(){a(this).width()>a(this).parent().width()&&a(this).wrap('<div class="table-overflow"></div>')}),e(),a(window).resize(e),a("figure.highlight table").wrap('<div class="highlight-body">'),"undefined"!=typeof IcarusThemeSettings&&void 0!==IcarusThemeSettings.article&&void 0!==IcarusThemeSettings.article.highlight){a("figure.highlight").addClass("hljs"),a("figure.highlight .code .line span").each(function(){var e=a(this).attr("class").split(/\s+/);1===e.length&&(a(this).addClass("hljs-"+e[0]),a(this).removeClass(e[0]))});var t=IcarusThemeSettings.article.highlight.clipboard,i=IcarusThemeSettings.article.highlight.fold;if(i=i.trim(),a("figure.highlight").each(function(){a(this).find("figcaption").length?(a(this).find("figcaption").addClass("level is-mobile"),a(this).find("figcaption").append('<div class="level-left">'),a(this).find("figcaption").append('<div class="level-right">'),a(this).find("figcaption div.level-left").append(a(this).find("figcaption").find("span")),a(this).find("figcaption div.level-right").append(a(this).find("figcaption").find("a"))):(t||i)&&a(this).prepend('<figcaption class="level is-mobile"><div class="level-left"></div><div class="level-right"></div></figcaption>')}),"undefined"!=typeof ClipboardJS&&t&&(a("figure.highlight").each(function(){var e="code-"+Date.now()+(1e3*Math.random()|0),t='<a href="javascript:;" class="copy" title="Copy" data-clipboard-target="#'+e+' .code"><i class="fas fa-copy"></i></a>';a(this).attr("id",e),a(this).find("figcaption div.level-right").append(t)}),new ClipboardJS(".highlight .copy")),i){var n=function(e,t){var i=a(e).find(".fold i");t?a(e).addClass("folded"):a(e).removeClass("folded"),t?i.removeClass("fa-angle-down"):i.removeClass("fa-angle-right"),t?i.addClass("fa-angle-right"):i.addClass("fa-angle-down")},r='<span class="fold">'+("unfolded"===i?'<i class="fas fa-angle-down"></i>':'<i class="fas fa-angle-right"></i>')+"</span>";a("figure.highlight").each(function(){if(0<a(this).find("figcaption").find("span").length){var e=a(this).find("figcaption").find("span");if(-1<e[0].innerText.indexOf(">folded"))return e[0].innerText=e[0].innerText.replace(">folded",""),r='<span class="fold"><i class="fas fa-angle-right"></i></span>',a(this).find("figcaption div.level-left").prepend(r),void n(this,!0)}a(this).find("figcaption div.level-left").prepend(r),n(this,"folded"===i)}),a("figure.highlight figcaption .fold").click(function(){var e=a(this).closest("figure.highlight");n(e.eq(0),!e.hasClass("folded"))})}}var l=a("#toc");if(0<l.length){var s=function(){l.toggleClass("is-active"),o.toggleClass("is-active")},o=a("<div>");o.attr("id","toc-mask"),a("body").append(o),l.on("click",s),o.on("click",s),a(".navbar-main .catalogue").on("click",s)}"undefined"!=typeof IcarusThemeSettings&&void 0!==IcarusThemeSettings.site.url&&void 0!==IcarusThemeSettings.site.external_link&&IcarusThemeSettings.site.external_link.enable&&a(".article .content a").filter(function(e,t){return t.href&&!a(t).attr("href").startsWith("#")&&0===t.classList.length&&function(e,t,i){try{t=new URL(t).hostname}catch(e){}if(!t)return!1;var a=new URL(e,"http://"+t);if("null"===a.origin)return!1;var n=a.hostname;if((i=i&&(Array.isArray(i)?i:[i]))&&i.length){var r,l=_createForOfIteratorHelper(i);try{for(l.s();!(r=l.n()).done;){if(n===r.value)return!1}}catch(e){l.e(e)}finally{l.f()}}return n!==t}(t.href,IcarusThemeSettings.site.url,IcarusThemeSettings.site.external_link.exclude)}).each(function(e,t){t.relList.add("noopener"),t.target="_blank"})}(jQuery);
>>>>>>> f4bcb6d130eff003a8064c877e0e38a67514e600
