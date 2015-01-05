jQuery(function($) {

  var $document = $(document),
    $navbar     = $('.navbar-main'),
    $rootNode   = $('html, body'),
    $footer     = $('footer');

  $footer.find('.copyright-year').html('2015');

  $document.scroll(function() {

    if ($document.scrollTop() >= 5) {
      $navbar.addClass('sticky');
    } else {
      $navbar.removeClass('sticky');
    }

  });

  $('a.internal').on('click', function(){
    var href = $.attr(this, 'href');

    var addHrefToHash = function() {
      window.location.hash = href;
    };

    $rootNode.animate({
      scrollTop: $(href).offset().top
    }, 1500, 'easeInOutExpo', addHrefToHash);

    return false;
  });

  if(window.location.search.indexOf("brewPubStart") > -1){
    var $elem = $('h1#brew-pub-start');

    $rootNode.animate({
      scrollTop: $elem.offset().top - 30
    }, 1500, 'easeInOutExpo');

  }

  if ( $("video.team-video").length ){
    if($(window).width() > 750) {
      $("video.team-video")[0].preload = "auto";
      $("video.team-video")[0].autoplay = true;
      $("video.team-video")[0].play();
    };
  };

});

$(window).resize(function() {
  if ( $("video.team-video").length ){
    if($(window).width() > 750) {
      $("video.team-video")[0].preload = "auto";
      $("video.team-video")[0].autoplay = true;
      $("video.team-video")[0].play();
    };
  };
});

