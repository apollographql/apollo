$(function() {
  FastClick.attach(document.body);

  $('.page').focus();

  $('.js-join-newsletter').click(function(e) {
    e.preventDefault();
    $('.layout').addClass('contact-open');
  });

  $('.overlay-close').click(function(e) {
    e.preventDefault();
    $('.layout').removeClass('contact-open');
  });

  $('#newsletter-form').submit(function(e) {
    e.preventDefault()
    var email = event.target.email.value;
    analytics.identify(email, {email: email});
    analytics.track('web.apollo-newsletter');
    $('.layout').removeClass('contact-open');
  })
});
