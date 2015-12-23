//
// Add classes to section when visible for animation
//

var sections = [];
var topOffset = 300;

$('.recap-section').each(function() {
  var section = $(this)
  sections.push(section);
})

$(window).scroll(function() {
  var scroll = $(window).scrollTop() + topOffset;
  if(scroll > sections[0].offset().top) {
    $(sections[0]).addClass('animate-section');
    sections.shift();
  }
})