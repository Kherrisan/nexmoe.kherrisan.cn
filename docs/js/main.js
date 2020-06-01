<<<<<<< HEAD
// 监听滚动事件
function listenScroll(callback) {
  // eslint-disable-next-line no-undef
  const dbc = new Debouncer(callback);
  window.addEventListener('scroll', dbc, false);
  dbc.handleEvent();
}

// 滚动到指定元素
function scrollToElement(target, offset) {
  var scroll_offset = $(target).offset();
  $('body,html').animate({
    scrollTop: scroll_offset.top + (offset || 0),
    easing   : 'swing'
  });
}

// 顶部菜单的监听事件
function navbarScrollEvent() {
  var navbar = $('#navbar');
  var submenu = $('#navbar .dropdown-menu');
  if (navbar.offset().top > 0) {
    navbar.addClass('navbar-custom');
    navbar.removeClass('navbar-dark');
    submenu.addClass('navbar-custom');
    submenu.removeClass('navbar-dark');
  }
  listenScroll(function() {
    navbar[navbar.offset().top > 50 ? 'addClass' : 'removeClass']('top-nav-collapse');
    submenu[navbar.offset().top > 50 ? 'addClass' : 'removeClass']('dropdown-collapse');
    if (navbar.offset().top > 0) {
      navbar.addClass('navbar-custom');
      navbar.removeClass('navbar-dark');
      submenu.addClass('navbar-custom');
      submenu.removeClass('navbar-dark');
    } else {
      navbar.addClass('navbar-dark');
      submenu.removeClass('navbar-dark');
    }
  });
  $('#navbar-toggler-btn').on('click', function() {
    $('.animated-icon').toggleClass('open');
    $('#navbar').toggleClass('navbar-col-show');
  });
}

// 头图视差的监听事件
function parallaxEvent() {
  var target = $('#background[parallax="true"]');
  var parallax = function() {
    var oVal = $(window).scrollTop() / 5;
    var offset = parseInt($('#board').css('margin-top'), 0);
    var max = 96 + offset;
    if (oVal > max) {
      oVal = max;
    }
    target.css({
      transform          : 'translate3d(0,' + oVal + 'px,0)',
      '-webkit-transform': 'translate3d(0,' + oVal + 'px,0)',
      '-ms-transform'    : 'translate3d(0,' + oVal + 'px,0)',
      '-o-transform'     : 'translate3d(0,' + oVal + 'px,0)'
    });

    var toc = $('#toc');
    if (toc) {
      $('#toc-ctn').css({
        'padding-top': oVal + 'px'
      });
    }
  };
  if (target.length > 0) {
    listenScroll(parallax);
  }
}

// 向下滚动箭头的监听事件
function scrollDownArrowEvent() {
  $('.scroll-down-bar').on('click', function() {
    scrollToElement('#board', -$('#navbar').height());
  });
}

// 向顶部滚动箭头的监听事件
function scrollTopArrowEvent() {
  var topArrow = $('#scroll-top-button');
  if (!topArrow) {
    return;
  }
  var posDisplay = false;
  var scrollDisplay = false;
  // 位置
  var setTopArrowPos = function() {
    var boardRight = document.getElementById('board').getClientRects()[0].right;
    var bodyWidth = document.body.offsetWidth;
    var right = bodyWidth - boardRight;
    posDisplay = right >= 50;
    topArrow.css({
      'bottom': posDisplay && scrollDisplay ? '20px' : '-60px',
      'right' : right - 64 + 'px'
    });
  };
  setTopArrowPos();
  $(window).resize(setTopArrowPos);
  // 显示
  var headerHeight = $('#board').offset().top;
  listenScroll(function() {
    var scrollHeight = document.body.scrollTop + document.documentElement.scrollTop;
    scrollDisplay = scrollHeight >= headerHeight;
    topArrow.css({
      'bottom': posDisplay && scrollDisplay ? '20px' : '-60px'
    });
  });
  // 点击
  topArrow.on('click', function() {
    $('body,html').animate({
      scrollTop: 0,
      easing   : 'swing'
    });
  });
}

$(document).ready(function() {
  navbarScrollEvent();
  parallaxEvent();
  scrollDownArrowEvent();
  scrollTopArrowEvent();
});
=======
"use strict";function listenScroll(o){var a=new Debouncer(o);window.addEventListener("scroll",a,!1),a.handleEvent()}function scrollToElement(o,a){var n=$(o).offset();$("body,html").animate({scrollTop:n.top+(a||0),easing:"swing"})}function navbarScrollEvent(){var o=$("#navbar"),a=$("#navbar .dropdown-menu");0<o.offset().top&&(o.addClass("navbar-custom"),o.removeClass("navbar-dark"),a.addClass("navbar-custom"),a.removeClass("navbar-dark")),listenScroll(function(){o[50<o.offset().top?"addClass":"removeClass"]("top-nav-collapse"),a[50<o.offset().top?"addClass":"removeClass"]("dropdown-collapse"),0<o.offset().top?(o.addClass("navbar-custom"),o.removeClass("navbar-dark"),a.addClass("navbar-custom")):o.addClass("navbar-dark"),a.removeClass("navbar-dark")}),$("#navbar-toggler-btn").on("click",function(){$(".animated-icon").toggleClass("open"),$("#navbar").toggleClass("navbar-col-show")})}function parallaxEvent(){var n=$('#background[parallax="true"]');0<n.length&&listenScroll(function(){var o=$(window).scrollTop()/5,a=96+parseInt($("#board").css("margin-top"),0);a<o&&(o=a),n.css({transform:"translate3d(0,"+o+"px,0)","-webkit-transform":"translate3d(0,"+o+"px,0)","-ms-transform":"translate3d(0,"+o+"px,0)","-o-transform":"translate3d(0,"+o+"px,0)"}),$("#toc")&&$("#toc-ctn").css({"padding-top":o+"px"})})}function scrollDownArrowEvent(){$(".scroll-down-bar").on("click",function(){scrollToElement("#board",-$("#navbar").height())})}function scrollTopArrowEvent(){var n=$("#scroll-top-button");if(n){var t=!1,r=!1,o=function(){var o=document.getElementById("board").getClientRects()[0].right,a=document.body.offsetWidth-o;t=50<=a,n.css({bottom:t&&r?"20px":"-60px",right:a-64+"px"})};o(),$(window).resize(o);var a=$("#board").offset().top;listenScroll(function(){var o=document.body.scrollTop+document.documentElement.scrollTop;r=a<=o,n.css({bottom:t&&r?"20px":"-60px"})}),n.on("click",function(){$("body,html").animate({scrollTop:0,easing:"swing"})})}}$(document).ready(function(){navbarScrollEvent(),parallaxEvent(),scrollDownArrowEvent(),scrollTopArrowEvent()});
>>>>>>> 9c564748324edcfc9c7247781d993d1f71dabb84
