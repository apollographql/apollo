$(function() {
  FastClick.attach(document.body);

  $('.page').focus();

  if (location.hash == "#slack"){
    $('.layout').addClass('overlay-open slack');
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
    e.preventDefault()
    var email = event.target.email.value;
    var latestformsubmit = 'Apollo Newsletter Subscription'
    analytics.identify(email, {email: email, LatestFormSubmit: latestformsubmit});
    analytics.track('web.apollo-newsletter');
    $('.newsletter-form').addClass('confirmed');

    setTimeout(function(){
      $('.layout').attr('class', 'layout');
    }, 1200);
  })

  $('#slack-form').submit(function(e) {
    e.preventDefault()
    var email = event.target.email.value;
    var latestformsubmit = 'Apollo Slack Signup'
    var inviteuri = "https://29268947-a94c-4d45-baa2-9641a9848cad.trayapp.io?email=" + email
    $.get(inviteuri);
    analytics.identify(email, {email: email, LatestFormSubmit: latestformsubmit});
    analytics.track('web.apollo-slack');
    $('.slack-form').addClass('confirmed');

    setTimeout(function(){
      $('.layout').attr('class', 'layout');
    }, 1200);
  })

  $('#consultation-form').submit(function(e) {
    e.preventDefault()
    var email = event.target.email.value;
    var firstname = event.target.firstname.value;
    var lastname = event.target.lastname.value;
    var company = event.target.company.value;
    var message = event.target.message.value;
    var latestformsubmit = 'Apollo Developer Support'

    analytics.identify(email, {email: email, firstName: firstname, lastName: lastname, company: company, Message__c: message, LatestFormSubmit: latestformsubmit});
    $('.consultation-form').addClass('confirmed');
    analytics.track('web.apollo-devsub');
  })
}
);
