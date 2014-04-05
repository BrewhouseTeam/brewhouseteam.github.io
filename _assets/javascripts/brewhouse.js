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


  // I only have one form on the page but you can be more specific if need be.
  var $form = $('#mc_embed_signup form');

  if ( $form.length > 0 ) {
    $('form input[type="submit"]').bind('click', function ( event ) {
      if ( event ) {
        event.preventDefault();
      }

      // validate_input() is a validation function I wrote,
      // you'll have to substitute this with your own.
      // if ( validate_input($form) ) {
        register($form);
      // }
    });
  }

});

function register($form) {
  $.ajax({
    type: $form.attr('method'),
    url: $form.attr('action'),
    data: $form.serialize(),
    cache       : false,
    dataType    : 'json',
    contentType: "application/json; charset=utf-8",
    error       : function(err) {
      alert("Could not connect to the registration server. Please try again later.");
    },
    success     : function(data) {
      if (data.result != "success") {
        alert(data.msg);
        // Something went wrong, do something to notify the user. maybe alert(data.msg);
      } else {
        alert('all good!');
        // It worked, carry on...
      }
    }
  });
}
