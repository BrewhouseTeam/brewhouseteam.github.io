$.fn.scrollEnd = function(callback, timeout) {
  $(this).scroll(function(){
    var $this = $(this);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback,timeout));
  });
};

//jQuery(function($) {
  $(window).scroll(function(){
    $('.party').addClass('scrolling-party')
  })

  $(window).scrollEnd(function(){
    $('.party').removeClass('scrolling-party')
  }, 100);
//});
