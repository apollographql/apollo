$(function() {
  // Designveloper Dev
  wow = new WOW({
    boxClass:     'wow',      // default
    animateClass: 'animated', // default
    offset:       0,          // default
    mobile:       true,       // default
    live:         true        // default
  })
  wow.init();
  $('.menu-mobile').click(function() {
    $('.primary-block-menu').addClass('slide-in');
    $('html').css("overflow", "hidden");
    $('#overlay').show();
    return false;
  });
  $('#overlay, .responsive-nav-close').click(function() {
    $('.primary-block-menu').removeClass('slide-in');
    $('html').css("overflow", "auto");
    $('#overlay').hide();
    return false;
  });
  if($('.apollo-testimonial').length > 0){
    $('.apollo-testimonial').unslider();
  }

  // End Designveloper Dev

  FastClick.attach(document.body);

  $('.page').focus();
  if (location.hash == "#slack"){
    $('.layout').addClass('overlay-open slack');
  }

  if (location.hash == "#newsletter"){
    $('.layout').addClass('overlay-open contact');
  }

  $('.js-join-newsletter').click(function(e) {
    e.preventDefault();
    $('.layout').addClass('overlay-open contact');
  });

  $('.js-join-slack').click(function(e) {
    e.preventDefault();
    $('.layout').addClass('overlay-open slack');
  });

  $('.overlay-close').click(function(e) {
    e.preventDefault();
    $('.layout').attr('class', 'layout');
  });

  $('#newsletter-form').submit(function(e) {
    e.preventDefault();
    var email = e.target.email.value;
    var latestformsubmit = 'Apollo Newsletter Subscription';
    analytics.identify(email, {email: email, LatestFormSubmit: latestformsubmit});
    analytics.track('web.apollo-newsletter');
    $('.newsletter-form').addClass('confirmed');
    setTimeout(function(){
      $('.layout').attr('class', 'layout');
    }, 1200);
  });

  $('#slack-form').submit(function(e) {
    e.preventDefault();
    var email = e.target.email.value;
    var latestformsubmit = 'Apollo Slack Signup';
    var inviteuri = "https://29268947-a94c-4d45-baa2-9641a9848cad.trayapp.io?email=" + email;
    $.get(inviteuri);
    analytics.identify(email, {email: email, LatestFormSubmit: latestformsubmit});
    analytics.track('web.apollo-slack');
    $('.slack-form').addClass('confirmed');

    setTimeout(function(){
      $('.layout').attr('class', 'layout');
    }, 1200);
  });

  $('#consultation-form').submit(function(e) {
    e.preventDefault();
    var email = e.target.email.value;
    var firstname = e.target.firstname.value;
    var lastname = e.target.lastname.value;
    var company = e.target.company.value;
    var message = e.target.message.value;
    var latestformsubmit = 'Apollo Developer Support';

    analytics.identify(email, {email: email, firstName: firstname, lastName: lastname, company: company, Message__c: message, LatestFormSubmit: latestformsubmit});
    $('.consultation-form').addClass('confirmed');
    analytics.track('web.apollo-devsub');
  });


    $('#optics-form').submit(function(e) {
    e.preventDefault();
    var email = e.target.email.value;
    var firstname = e.target.firstname.value;
    var lastname = e.target.lastname.value;
    var company = e.target.company.value;
    var existingGraphQLLanguage = e.target.existingGraphQLLanguage.value;
    var message = e.target.message.value;
    var latestformsubmit = 'Apollo Optics Contact';

    analytics.identify(email, {email: email, firstName: firstname, lastName: lastname, company: company, Message__c: message, Existing_GraphQL_Language__c: existingGraphQLLanguage, LatestFormSubmit: latestformsubmit});
    $('.consultation-form').addClass('confirmed');
    analytics.track('web.apollo-optics');
  });
});
