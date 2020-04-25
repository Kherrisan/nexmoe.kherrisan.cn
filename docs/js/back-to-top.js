<<<<<<< HEAD
$(document).ready(function () {
    var $button = $('#back-to-top');
    var $footer = $('footer.footer');
    var $mainColumn = $('.column-main');
    var $leftSidebar = $('.column-left');
    var $rightSidebar = $('.column-right');
    var lastScrollTop = 0;
    var rightMargin = 20;
    var bottomMargin = 20;
    var lastState = null;
    var state = {
        base: {
            classname: 'card has-text-centered',
            left: '',
            width: 64,
            bottom: bottomMargin,
            'border-radius': 4
        }
    };
    state['desktop-hidden'] = Object.assign({}, state.base, {
        classname: state.base.classname + ' rise-up',
    });
    state['desktop-visible'] = Object.assign({}, state['desktop-hidden'], {
        classname: state['desktop-hidden'].classname + ' fade-in',
    });
    state['desktop-dock'] = Object.assign({}, state['desktop-visible'], {
        classname: state['desktop-visible'].classname + ' fade-in',
        width: 40,
        'border-radius': '50%'
    });
    state['mobile-hidden'] = Object.assign({}, state.base, {
        classname: state.base.classname + ' fade-in',
        right: rightMargin
    });
    state['mobile-visible'] = Object.assign({}, state['mobile-hidden'], {
        classname: state['mobile-hidden'].classname + ' rise-up',
    });

    function isStateEquals(prev, next) {
        for (var prop in prev) {
            if (!next.hasOwnProperty(prop) || next[prop] !== prev[prop]) {
                return false;
            }
        }
        for (var prop in next) {
            if (!prev.hasOwnProperty(prop) || prev[prop] !== prev[prop]) {
                return false;
            }
        }
        return true;
    }

    function applyState(state) {
        if (lastState !== null && isStateEquals(lastState, state)) {
            return;
        }
        $button.attr('class', state.classname);
        for (let prop in state) {
            if (prop === 'classname') {
                continue;
            }
            $button.css(prop, state[prop]);
        }
        lastState = state;
    }

    function isDesktop() {
        return window.innerWidth >= 1078;
    }

    function isTablet() {
        return window.innerWidth >= 768 && !isDesktop();
    }

    function isScrollUp() {
        return $(window).scrollTop() < lastScrollTop && $(window).scrollTop() > 0;
    }

    function hasLeftSidebar() {
        return $leftSidebar.length > 0;
    }

    function hasRightSidebar() {
        return $rightSidebar.length > 0;
    }

    function getRightSidebarBottom() {
        if (!hasRightSidebar()) {
            return 0;
        }
        return Math.max.apply(null, $rightSidebar.find('.widget').map(function () {
            return $(this).offset().top + $(this).outerHeight(true);
        }));
    }

    function getScrollTop() {
        return $(window).scrollTop();
    }

    function getScrollBottom() {
        return $(window).scrollTop() + $(window).height();
    }

    function getButtonWidth() {
        return $button.outerWidth(true);
    }

    function getButtonHeight() {
        return $button.outerHeight(true);
    }

    function updateScrollTop() {
        lastScrollTop = $(window).scrollTop();
    }

    function update() {
        // desktop mode or tablet mode with only right sidebar enabled
        if (isDesktop() || (isTablet() && !hasLeftSidebar() && hasRightSidebar())) {
            var nextState;
            var padding = ($mainColumn.outerWidth() - $mainColumn.width()) / 2;
            var maxLeft = $(window).width() - getButtonWidth() - rightMargin;
            var maxBottom = $footer.offset().top + getButtonHeight() / 2 + bottomMargin;
            if (getScrollTop() == 0 || getScrollBottom() < getRightSidebarBottom() + padding + getButtonHeight()) {
                nextState = state['desktop-hidden'];
            } else if (getScrollBottom() < maxBottom) {
                nextState = state['desktop-visible'];
            } else {
                nextState = Object.assign({}, state['desktop-dock'], {
                    bottom: getScrollBottom() - maxBottom + bottomMargin
                });
            }

            var left = $mainColumn.offset().left + $mainColumn.outerWidth() + padding;
            nextState = Object.assign({}, nextState, {
                left: Math.min(left, maxLeft)
            });
            applyState(nextState);
        } else {
            // mobile and tablet mode
            if (!isScrollUp()) {
                applyState(state['mobile-hidden']);
            } else {
                applyState(state['mobile-visible']);
            }
            updateScrollTop();
        }
    }

    update();
    $(window).resize(update);
    $(window).scroll(update);

    $('#back-to-top').on('click', function () {
        $('body, html').animate({ scrollTop: 0 }, 400);
    });
});
=======
"use strict";$(document).ready(function(){var o=$("#back-to-top"),a=$("footer.footer"),d=$(".column-main"),r=$(".column-left"),l=$(".column-right"),c=0,n=null,u={base:{classname:"card has-text-centered",left:"",width:64,bottom:20,"border-radius":4}};function f(e){if(null===n||!function(e,i){for(var n in e)if(!i.hasOwnProperty(n)||i[n]!==e[n])return;for(var n in i)if(!e.hasOwnProperty(n)||e[n]!=e[n])return;return 1}(n,e)){for(var i in o.attr("class",e.classname),e)"classname"!==i&&o.css(i,e[i]);n=e}}function h(){return 1078<=window.innerWidth}function b(){return 0<l.length}function m(){return $(window).scrollTop()+$(window).height()}function w(){return o.outerHeight(!0)}function e(){if(h()||768<=window.innerWidth&&!h()&&!(0<r.length)&&b()){var e,i=(d.outerWidth()-d.width())/2,n=$(window).width()-o.outerWidth(!0)-20,t=a.offset().top+w()/2+20;e=0==$(window).scrollTop()||m()<(b()?Math.max.apply(null,l.find(".widget").map(function(){return $(this).offset().top+$(this).outerHeight(!0)})):0)+i+w()?u["desktop-hidden"]:m()<t?u["desktop-visible"]:Object.assign({},u["desktop-dock"],{bottom:m()-t+20});var s=d.offset().left+d.outerWidth()+i;f(e=Object.assign({},e,{left:Math.min(s,n)}))}else $(window).scrollTop()<c&&0<$(window).scrollTop()?f(u["mobile-visible"]):f(u["mobile-hidden"]),c=$(window).scrollTop()}u["desktop-hidden"]=Object.assign({},u.base,{classname:u.base.classname+" rise-up"}),u["desktop-visible"]=Object.assign({},u["desktop-hidden"],{classname:u["desktop-hidden"].classname+" fade-in"}),u["desktop-dock"]=Object.assign({},u["desktop-visible"],{classname:u["desktop-visible"].classname+" fade-in",width:40,"border-radius":"50%"}),u["mobile-hidden"]=Object.assign({},u.base,{classname:u.base.classname+" fade-in",right:20}),u["mobile-visible"]=Object.assign({},u["mobile-hidden"],{classname:u["mobile-hidden"].classname+" rise-up"}),e(),$(window).resize(e),$(window).scroll(e),$("#back-to-top").on("click",function(){$("body, html").animate({scrollTop:0},400)})});
>>>>>>> f4bcb6d130eff003a8064c877e0e38a67514e600
