//
// Add classes to section when visible in Window
//

var sections = [];
var topOffset = 460;

$('.recap-section').each(function() {
  var section = $(this)
  sections.push(section);
})

$(document).ready(function() {
  animateSection();
});

$(window).scroll(function() {
  animateSection();
})

function animateSection() {
  var scroll = $(window).scrollTop() + topOffset;
  if(scroll > sections[0].offset().top) {
    $(sections[0]).addClass('animate-section');
    sections.shift();
  }
}