wow = new WOW({
  boxClass:     'wow',      // default
  animateClass: 'animated', // default
  offset:       0,          // default
  mobile:       true,       // default
  live:         true        // default
})
wow.init();
if($('.apollo-testimonial').length > 0){
  $('.apollo-testimonial').unslider();
}

$('.menu-mobile a').on( "click", function() {
    $('.right-header').toggleClass('mobile-active');
});
