// Arena UTM Tracker — captures UTM params and maps to GHL source tags
(function() {
  var params = new URLSearchParams(window.location.search);
  var utmSource = params.get('utm_source') || '';
  var utmMedium = params.get('utm_medium') || '';
  var utmCampaign = params.get('utm_campaign') || '';
  var utmTerm = params.get('utm_term') || '';
  var utmContent = params.get('utm_content') || '';
  var referrer = document.referrer || '';

  // Store UTMs if present (preserve across page navigations)
  if (utmSource || utmMedium || utmCampaign) {
    sessionStorage.setItem('arena_utm', JSON.stringify({
      source: utmSource, medium: utmMedium, campaign: utmCampaign,
      term: utmTerm, content: utmContent, referrer: referrer, landingPage: window.location.pathname
    }));
  }

  // Determine lead source tag
  function getSourceTag() {
    var stored = JSON.parse(sessionStorage.getItem('arena_utm') || '{}');
    var src = (stored.source || '').toLowerCase();
    var med = (stored.medium || '').toLowerCase();
    var ref = (stored.referrer || referrer || '').toLowerCase();

    // Paid: any utm_medium with cpc/ppc/paid, or known ad sources
    if (med === 'cpc' || med === 'ppc' || med === 'paid' || med === 'paidsocial' ||
        src === 'facebook' || src === 'fb' || src === 'google' || src === 'gads' ||
        src === 'instagram' || src === 'ig') {
      return 'source-paid';
    }
    // Email: utm_medium=email or utm_source=email/newsletter/mailchimp etc
    if (med === 'email' || src === 'email' || src === 'newsletter' || src === 'mailchimp' ||
        src === 'ghl' || src === 'nurture' || src === 'arena-email') {
      return 'source-email';
    }
    // Event: utm_source=event or utm_medium=event
    if (src === 'event' || med === 'event' || src === 'eventbrite' || src === 'meetup' ||
        src === 'webinar' || med === 'webinar' || src === 'conference') {
      return 'source-event';
    }
    // Organic: everything else (search engines, direct, social shares, blog)
    return 'source-organic';
  }

  // Expose globally for form submissions
  window.ArenaUTM = {
    getSourceTag: getSourceTag,
    getData: function() { return JSON.parse(sessionStorage.getItem('arena_utm') || '{}'); }
  };
})();
