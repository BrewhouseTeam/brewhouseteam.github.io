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
    console.log('clicked');
    var href = $.attr(this, 'href');

    $rootNode.animate({
      scrollTop: $(href).offset().top
    }, 500, function () {
      window.location.hash = href;
    });

    return false;
  });

})();
