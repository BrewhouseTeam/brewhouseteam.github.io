//
// Add classes to section when visible in Window
//

$(document).ready(function() {
  showRecapSections()
});

$(window).scroll(function() {
  showRecapSections()
})


function isScrolledIntoView(e) {
  var $e = $(e);
  var $window = $(window);

  var docView = $window.scrollTop() + $window.height() - 200;

  var eTop = $e.offset().top;

  return (eTop <= docView);
}

function showRecapSections() {
  $('.recap-section').each(function(i) {
    if (isScrolledIntoView(this) === true) {
      $(this).addClass('animate-section');
    }
  });
}
;
