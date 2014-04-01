jQuery(function($) {

  var $document   = $(document),
      $navbar     = $('.navbar-main'),
      $blogBanner = $('#banner-blog'),
      $blogImage  = $('img', $blogBanner),
      lastScroll, now, delta;

  if ($blogBanner.length && $blogImage.length){
    delta = $blogImage.height() - $blogBanner.height();
    console.log(delta);
  }

  $document.scroll(function() {
    now = new Date().valueOf();

    if(lastScroll && now - lastScroll < 25){
      return;
    }else{
      lastScroll = now;
    }

    if ($document.scrollTop() >= 5) {
      $navbar.addClass('sticky');
    } else {
      $navbar.removeClass('sticky');
    }

    if ($blogBanner.length && $blogImage.length && delta > 0){
      $blogImage.css({marginTop: Math.max(-delta, -$document.scrollTop() / 5)});
    }
  });

  var $rootNode = $('html, body');
  $('a.internal').on('click', function(){
    var href = $.attr(this, 'href');

    var addHrefToHash = function() {
      window.location.hash = href;
    }

    $rootNode.animate({
      scrollTop: $(href).offset().top
    }, 1500, 'easeInOutExpo', addHrefToHash);

    return false;
  });
});
