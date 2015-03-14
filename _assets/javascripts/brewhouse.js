jQuery(function($) {

  var $document = $(document),
    $navbar     = $('.navbar-main'),
    $rootNode   = $('html, body'),
    $footer     = $('footer'),
    $offcanvasToggle = $('.js-navbar-toggle-offcanvas');


  // All offcanvas related code
  var toggleOffcanvasMenu = function(){
    var $offcanvasMenu = $('.offcanvas-menu'), moveTo;
    $offcanvasMenu.css('height', $(window).height());

    if (parseInt($('.offcanvas-menu').css('top')) < 0) {
      moveTo = 0;
    } else {
      moveTo = -($(window).height());
    };

    $offcanvasMenu.velocity({ top: moveTo }, { duration: 100, easing: 'easeInCirc' });
  };

  $offcanvasToggle.on('click', toggleOffcanvasMenu);
  $('.offcanvas-menu').find('a.internal').on('click', toggleOffcanvasMenu);



  // Set Copyright Year
  $footer.find('.copyright-year').html('2015');


  // Set Sticky on scroll (should also be on page load)
  $document.scroll(function() {
    if ($document.scrollTop() >= 5) {
      $navbar.addClass('sticky');
    } else {
      $navbar.removeClass('sticky');
    }
  });

  // Have menu items which point to content on this page scroll the body
  $('a.internal').on('click', function(){
    var href = $.attr(this, 'href');

    var addHrefToHash = function() {
      window.location.hash = href;
    };

    $rootNode.animate({
      scrollTop: $(href).offset().top
    }, 1500, 'ease-in-out', addHrefToHash);

    return false;
  });

  // A hack for pushing people down to the content, I think this can be removed now but needs testing
  if(window.location.search.indexOf("brewPubStart") > -1){
    var $elem = $('h1#brew-pub-start');

    $rootNode.animate({
      scrollTop: $elem.offset().top - 30
    }, 1500, 'easeInOutExpo');

  }

  // Refactor this video stuff into one func
  if ( $("video.team-video").length ){
    if($(window).width() > 750) {
      $("video.team-video")[0].preload = "auto";
      $("video.team-video")[0].autoplay = true;
      $("video.team-video")[0].play();
    };
  };

});

$(window).resize(function() {
  // Refactor this video stuff into one func
  if ( $("video.team-video").length ){
    if($(window).width() > 750) {
      $("video.team-video")[0].preload = "auto";
      $("video.team-video")[0].autoplay = true;
      $("video.team-video")[0].play();
    };
  };
});

