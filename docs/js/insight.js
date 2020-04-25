<<<<<<< HEAD
/**
 * Insight search plugin
 * @author PPOffice { @link https://github.com/ppoffice }
 */
(function ($, CONFIG) {
    var $main = $('.ins-search');
    var $input = $main.find('.ins-search-input');
    var $wrapper = $main.find('.ins-section-wrapper');
    var $container = $main.find('.ins-section-container');
    $main.parent().remove('.ins-search');
    $('body').append($main);

    function section (title) {
        return $('<section>').addClass('ins-section')
            .append($('<header>').addClass('ins-section-header').text(title));
    }

    function searchItem (icon, title, slug, preview, url) {
        return $('<div>').addClass('ins-selectable').addClass('ins-search-item')
            .append($('<header>').append($('<i>').addClass('fa').addClass('fa-' + icon))
                .append($('<span>').addClass('ins-title').text(title != null && title !== '' ? title : CONFIG.TRANSLATION['UNTITLED']))
                .append(slug ? $('<span>').addClass('ins-slug').text(slug) : null))
            .append(preview ? $('<p>').addClass('ins-search-preview').text(preview) : null)
            .attr('data-url', url);
    }

    function sectionFactory (type, array) {
        var sectionTitle;
        var $searchItems;
        if (array.length === 0) return null;
        sectionTitle = CONFIG.TRANSLATION[type];
        switch (type) {
            case 'POSTS':
            case 'PAGES':
                $searchItems = array.map(function (item) {
                    // Use config.root instead of permalink to fix url issue
                    return searchItem('file', item.title, null, item.text.slice(0, 150), item.link);
                });
                break;
            case 'CATEGORIES':
            case 'TAGS':
                $searchItems = array.map(function (item) {
                    return searchItem(type === 'CATEGORIES' ? 'folder' : 'tag', item.name, item.slug, null, item.link);
                });
                break;
            default:
                return null;
        }
        return section(sectionTitle).append($searchItems);
    }

    function parseKeywords (keywords) {
        return keywords.split(' ').filter(function (keyword) {
            return !!keyword;
        }).map(function (keyword) {
            return keyword.toUpperCase();
        });
    }

    /**
     * Judge if a given post/page/category/tag contains all of the keywords.
     * @param Object            obj     Object to be weighted
     * @param Array<String>     fields  Object's fields to find matches
     */
    function filter (keywords, obj, fields) {
        var keywordArray = parseKeywords(keywords);
        var containKeywords = keywordArray.filter(function (keyword) {
            var containFields = fields.filter(function (field) {
                if (!obj.hasOwnProperty(field))
                    return false;
                if (obj[field].toUpperCase().indexOf(keyword) > -1)
                    return true;
            });
            if (containFields.length > 0)
                return true;
            return false;
        });
        return containKeywords.length === keywordArray.length;
    }

    function filterFactory (keywords) {
        return {
            POST: function (obj) {
                return filter(keywords, obj, ['title', 'text']);
            },
            PAGE: function (obj) {
                return filter(keywords, obj, ['title', 'text']);
            },
            CATEGORY: function (obj) {
                return filter(keywords, obj, ['name', 'slug']);
            },
            TAG: function (obj) {
                return filter(keywords, obj, ['name', 'slug']);
            }
        };
    }

    /**
     * Calculate the weight of a matched post/page/category/tag.
     * @param Object            obj     Object to be weighted
     * @param Array<String>     fields  Object's fields to find matches
     * @param Array<Integer>    weights Weight of every field
     */
    function weight (keywords, obj, fields, weights) {
        var value = 0;
        parseKeywords(keywords).forEach(function (keyword) {
            var pattern = new RegExp(keyword, 'img'); // Global, Multi-line, Case-insensitive
            fields.forEach(function (field, index) {
                if (obj.hasOwnProperty(field)) {
                    var matches = obj[field].match(pattern);
                    value += matches ? matches.length * weights[index] : 0;
                }
            });
        });
        return value;
    }

    function weightFactory (keywords) {
        return {
            POST: function (obj) {
                return weight(keywords, obj, ['title', 'text'], [3, 1]);
            },
            PAGE: function (obj) {
                return weight(keywords, obj, ['title', 'text'], [3, 1]);
            },
            CATEGORY: function (obj) {
                return weight(keywords, obj, ['name', 'slug'], [1, 1]);
            },
            TAG: function (obj) {
                return weight(keywords, obj, ['name', 'slug'], [1, 1]);
            }
        };
    }

    function search (json, keywords) {
        var WEIGHTS = weightFactory(keywords);
        var FILTERS = filterFactory(keywords);
        var posts = json.posts;
        var pages = json.pages;
        var tags = json.tags;
        var categories = json.categories;
        return {
            posts: posts.filter(FILTERS.POST).sort(function (a, b) { return WEIGHTS.POST(b) - WEIGHTS.POST(a); }).slice(0, 5),
            pages: pages.filter(FILTERS.PAGE).sort(function (a, b) { return WEIGHTS.PAGE(b) - WEIGHTS.PAGE(a); }).slice(0, 5),
            categories: categories.filter(FILTERS.CATEGORY).sort(function (a, b) { return WEIGHTS.CATEGORY(b) - WEIGHTS.CATEGORY(a); }).slice(0, 5),
            tags: tags.filter(FILTERS.TAG).sort(function (a, b) { return WEIGHTS.TAG(b) - WEIGHTS.TAG(a); }).slice(0, 5)
        };
    }

    function searchResultToDOM (searchResult) {
        $container.empty();
        for (var key in searchResult) {
            $container.append(sectionFactory(key.toUpperCase(), searchResult[key]));
        }
    }

    function scrollTo ($item) {
        if ($item.length === 0) return;
        var wrapperHeight = $wrapper[0].clientHeight;
        var itemTop = $item.position().top - $wrapper.scrollTop();
        var itemBottom = $item[0].clientHeight + $item.position().top;
        if (itemBottom > wrapperHeight + $wrapper.scrollTop()) {
            $wrapper.scrollTop(itemBottom - $wrapper[0].clientHeight);
        }
        if (itemTop < 0) {
            $wrapper.scrollTop($item.position().top);
        }
    }

    function selectItemByDiff (value) {
        var $items = $.makeArray($container.find('.ins-selectable'));
        var prevPosition = -1;
        $items.forEach(function (item, index) {
            if ($(item).hasClass('active')) {
                prevPosition = index;
                return;
            }
        });
        var nextPosition = ($items.length + prevPosition + value) % $items.length;
        $($items[prevPosition]).removeClass('active');
        $($items[nextPosition]).addClass('active');
        scrollTo($($items[nextPosition]));
    }

    function gotoLink ($item) {
        if ($item && $item.length) {
            location.href = $item.attr('data-url');
        }
    }

    $.getJSON(CONFIG.CONTENT_URL, function (json) {
        if (location.hash.trim() === '#ins-search') {
            $main.addClass('show');
        }
        $input.on('input', function () {
            var keywords = $(this).val();
            searchResultToDOM(search(json, keywords));
        });
        $input.trigger('input');
    });

    var touch = false;
    $(document).on('click focus', '.navbar-main .search', function () {
        $main.addClass('show');
        $main.find('.ins-search-input').focus();
    }).on('click touchend', '.ins-search-item', function (e) {
        if (e.type !== 'click' && !touch) {
            return;
        }
        gotoLink($(this));
        touch = false;
    }).on('click touchend', '.ins-close', function (e) {
        if (e.type !== 'click' && !touch) {
            return;
        }
        $('.navbar-main').css('pointer-events', 'none');
        setTimeout(function(){
            $('.navbar-main').css('pointer-events', 'auto');
        }, 400);
        $main.removeClass('show');
        touch = false;
    }).on('keydown', function (e) {
        if (!$main.hasClass('show')) return;
        switch (e.keyCode) {
            case 27: // ESC
                $main.removeClass('show'); break;
            case 38: // UP
                selectItemByDiff(-1); break;
            case 40: // DOWN
                selectItemByDiff(1); break;
            case 13: //ENTER
                gotoLink($container.find('.ins-selectable.active').eq(0)); break;
        }
    }).on('touchstart', function (e) {
        touch = true;
    }).on('touchmove', function (e) {
        touch = false;
    });
})(jQuery, window.INSIGHT_CONFIG);
=======
"use strict";!function(a,r){var e=a(".ins-search"),n=e.find(".ins-search-input"),s=e.find(".ins-section-wrapper"),o=e.find(".ins-section-container");function c(n,t,e,i,s){return a("<div>").addClass("ins-selectable").addClass("ins-search-item").append(a("<header>").append(a("<i>").addClass("fa").addClass("fa-"+n)).append(a("<span>").addClass("ins-title").text(null!=t&&""!==t?t:r.TRANSLATION.UNTITLED)).append(e?a("<span>").addClass("ins-slug").text(e):null)).append(i?a("<p>").addClass("ins-search-preview").text(i):null).attr("data-url",s)}function i(t,n){var e,i,s;if(0===n.length)return null;switch(e=r.TRANSLATION[t],t){case"POSTS":case"PAGES":i=n.map(function(n){return c("file",n.title,null,n.text.slice(0,150),n.link)});break;case"CATEGORIES":case"TAGS":i=n.map(function(n){return c("CATEGORIES"===t?"folder":"tag",n.name,n.slug,null,n.link)});break;default:return null}return s=e,a("<section>").addClass("ins-section").append(a("<header>").addClass("ins-section-header").text(s)).append(i)}function l(n){return n.split(" ").filter(function(n){return!!n}).map(function(n){return n.toUpperCase()})}function u(n,e,i){var t=l(n);return t.filter(function(t){return 0<i.filter(function(n){return!!e.hasOwnProperty(n)&&(-1<e[n].toUpperCase().indexOf(t)||void 0)}).length}).length===t.length}function f(n,s,t,a){var r=0;return l(n).forEach(function(n){var i=new RegExp(n,"img");t.forEach(function(n,t){if(s.hasOwnProperty(n)){var e=s[n].match(i);r+=e?e.length*a[t]:0}})}),r}function p(n,t){var e,i,s={POST:function(n){return f(e,n,["title","text"],[3,1])},PAGE:function(n){return f(e,n,["title","text"],[3,1])},CATEGORY:function(n){return f(e,n,["name","slug"],[1,1])},TAG:function(n){return f(e,n,["name","slug"],[1,1])}},a=(i=e=t,{POST:function(n){return u(i,n,["title","text"])},PAGE:function(n){return u(i,n,["title","text"])},CATEGORY:function(n){return u(i,n,["name","slug"])},TAG:function(n){return u(i,n,["name","slug"])}}),r=n.posts,o=n.pages,c=n.tags,l=n.categories;return{posts:r.filter(a.POST).sort(function(n,t){return s.POST(t)-s.POST(n)}).slice(0,5),pages:o.filter(a.PAGE).sort(function(n,t){return s.PAGE(t)-s.PAGE(n)}).slice(0,5),categories:l.filter(a.CATEGORY).sort(function(n,t){return s.CATEGORY(t)-s.CATEGORY(n)}).slice(0,5),tags:c.filter(a.TAG).sort(function(n,t){return s.TAG(t)-s.TAG(n)}).slice(0,5)}}function t(n){var t=a.makeArray(o.find(".ins-selectable")),e=-1;t.forEach(function(n,t){a(n).hasClass("active")&&(e=t)});var i=(t.length+e+n)%t.length;a(t[e]).removeClass("active"),a(t[i]).addClass("active"),function(n){if(0!==n.length){var t=s[0].clientHeight,e=n.position().top-s.scrollTop(),i=n[0].clientHeight+n.position().top;i>t+s.scrollTop()&&s.scrollTop(i-s[0].clientHeight),e<0&&s.scrollTop(n.position().top)}}(a(t[i]))}function d(n){n&&n.length&&(location.href=n.attr("data-url"))}e.parent().remove(".ins-search"),a("body").append(e),a.getJSON(r.CONTENT_URL,function(t){"#ins-search"===location.hash.trim()&&e.addClass("show"),n.on("input",function(){var n=a(this).val();!function(n){for(var t in o.empty(),n)o.append(i(t.toUpperCase(),n[t]))}(p(t,n))}),n.trigger("input")});var h=!1;a(document).on("click focus",".navbar-main .search",function(){e.addClass("show"),e.find(".ins-search-input").focus()}).on("click touchend",".ins-search-item",function(n){"click"!==n.type&&!h||(d(a(this)),h=!1)}).on("click touchend",".ins-close",function(n){"click"!==n.type&&!h||(a(".navbar-main").css("pointer-events","none"),setTimeout(function(){a(".navbar-main").css("pointer-events","auto")},400),e.removeClass("show"),h=!1)}).on("keydown",function(n){if(e.hasClass("show"))switch(n.keyCode){case 27:e.removeClass("show");break;case 38:t(-1);break;case 40:t(1);break;case 13:d(o.find(".ins-selectable.active").eq(0))}}).on("touchstart",function(n){h=!0}).on("touchmove",function(n){h=!1})}(jQuery,window.INSIGHT_CONFIG);
>>>>>>> f4bcb6d130eff003a8064c877e0e38a67514e600
