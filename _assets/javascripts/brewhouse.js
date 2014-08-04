jQuery(function($) {

  var $document   = $(document),
      $navbar     = $('.navbar-main'),
      $blogBanner = $('#banner-blog'),
      $blogImage  = $('img', $blogBanner),
      lastScroll, now, _delta;

  // Parallax banner
  // if ($blogBanner.length && $blogImage.length){
  //   _delta = $blogImage.height() - $blogBanner.height();
  // }

  $document.scroll(function() {
    // Parallax banner
    // now = new Date().valueOf();

    // if (lastScroll && now - lastScroll < 50){
    //   return;
    // } else {
    //   lastScroll = now;
    // }

    // if ($blogBanner.length && $blogImage.length && _delta > 0){
    //   var newTop = Math.max(-_delta, -$document.scrollTop() / 4);
    //   console.log(newTop);
    //   $blogImage.css({marginTop: newTop});
    // }
    // END Parallax banner

    if ($document.scrollTop() >= 5) {
      $navbar.addClass('sticky');
    } else {
      $navbar.removeClass('sticky');
    }
  });

  var $rootNode = $('html, body');
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

  if($(window).width() > 750) {
    $("video.team-video")[0].autoplay = true;
  }

});

$(window).resize(function() {
  if($(window).width() > 750) {
    $("video.team-video")[0].autoplay = true;
  };
});

