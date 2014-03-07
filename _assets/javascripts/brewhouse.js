(function() {

  var $document = $(document),
      $navbar   = $('#navbar-main');

  $document.scroll(function() {

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
    }

    $rootNode.animate({
      scrollTop: $(href).offset().top
    }, 1500, 'easeInOutExpo', addHrefToHash);

    return false;
  });

})();
