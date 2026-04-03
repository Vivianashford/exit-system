/* Arena VSL Page - Modal + GHL Contact Creation
 * Custom HTML form → GHL API (contact upsert + pipeline + email + SMS)
 * GHL workflows will eventually replace email/SMS, but keeping them until then
 */

var WORKER = 'https://arena-api.jean-475.workers.dev';
var GHL_LOCATION = 'LSvdgiiT7ManCRx9CCwE';
var PIPELINE_ID = 'PdlZRdFi8hty46vcVyx8';
var STAGE_NEW_LEAD = 'a72f7c97-f805-4f37-bf8c-8d65816a6870';
var ghlHeaders = {
  'Authorization': 'Bearer proxy',
  'Version': '2021-07-28',
  'Content-Type': 'application/json'
};

function openModal() {
  document.getElementById('modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
  document.body.style.overflow = '';
}

function submitForm() {
  var firstName = document.getElementById('firstName').value.trim();
  var email = document.getElementById('email').value.trim();
  var phone = document.getElementById('phone').value.trim();

  if (!firstName) { alert('Please enter your first name.'); return; }
  if (!email) { alert('Please enter your email address.'); return; }
  if (!phone) { alert('Please enter your phone number.'); return; }

  var btn = document.querySelector('.modal .cta-btn');
  btn.innerHTML = 'Submitting...';
  btn.disabled = true;

  // 1. Upsert contact in GHL
  fetch(WORKER + '/api/ghl/contacts/upsert', {
    method: 'POST',
    headers: ghlHeaders,
    body: JSON.stringify({
      firstName: firstName,
      email: email,
      phone: phone,
      locationId: GHL_LOCATION,
      source: 'Arena VSL Page',
      tags: ['vsl-lead', 'source-organic']
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    var contactId = data.contact ? data.contact.id : null;

    if (contactId) {
      // 2. Create opportunity in Arena Pipeline → New Lead
      fetch(WORKER + '/api/ghl/opportunities/upsert', {
        method: 'POST',
        headers: ghlHeaders,
        body: JSON.stringify({
          pipelineId: PIPELINE_ID,
          locationId: GHL_LOCATION,
          pipelineStageId: STAGE_NEW_LEAD,
          contactId: contactId,
          name: firstName + ' - VSL Lead',
          status: 'open',
          source: 'Arena VSL Page'
        })
      }).catch(function(e) { console.error('Opportunity error:', e); });

      // 3. Send training email
      fetch(WORKER + '/api/ghl/conversations/messages', {
        method: 'POST',
        headers: ghlHeaders,
        body: JSON.stringify({
          type: 'Email',
          contactId: contactId,
          subject: 'Your Free Training: The Transferable Exit System',
          message: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;line-height:1.7;">' +
            '<p>Hey ' + firstName + ',</p>' +
            '<p>Your access to the <strong>Transferable Exit System&trade;</strong> training is ready.</p>' +
            '<p>In this training, you\'ll learn how service-based business owners at $5M-$50M in revenue are removing owner dependency and building businesses that buyers pay full price for.</p>' +
            '<p style="text-align:center;margin:25px 0;"><a href="https://thearenapartners.com/watch.html" style="display:inline-block;padding:14px 36px;background:#C9A84C;color:#0a0a0a;font-weight:bold;text-decoration:none;border-radius:6px;">WATCH THE TRAINING NOW</a></p>' +
            '<p>If you have questions or want to discuss your situation directly, reply to this email.</p>' +
            '<p>Best,<br>Jean Hardy<br>The Arena Partners<br>3555 Timmons Lane, Suite 1140, Houston, TX 77027</p>' +
            '</div>',
          emailFrom: 'The Arena Partners <support@thearenapartners.com>'
        })
      }).catch(function(e) { console.error('Email error:', e); });

      // 4. Send SMS with training link (10 sec delay)
      if (phone) {
        setTimeout(function() {
          fetch(WORKER + '/api/ghl/conversations/messages', {
            method: 'POST',
            headers: ghlHeaders,
            body: JSON.stringify({
              type: 'SMS',
              contactId: contactId,
              message: 'Hey ' + firstName + ', it\'s Jean from The Arena Partners. Here\'s your training link so you don\'t lose it: https://thearenapartners.com/watch.html - Watch it when you\'re ready. I\'ll follow up with a few insights after. - Jean'
            })
          }).catch(function(e) { console.error('SMS error:', e); });
        }, 10000);
      }

      // 5. Notify Jean
      fetch(WORKER + '/api/ghl/contacts/' + contactId + '/notes', {
        method: 'POST',
        headers: ghlHeaders,
        body: JSON.stringify({
          body: 'NEW VSL LEAD\nName: ' + firstName + '\nEmail: ' + email + '\nPhone: ' + phone + '\nSource: Arena VSL Page\nTime: ' + new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'})
        })
      }).catch(function(e) { console.error('Note error:', e); });
    }

    // Redirect to watch page
    window.location.href = 'https://thearenapartners.com/watch.html?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(firstName) + (contactId ? '&cid=' + encodeURIComponent(contactId) : '');
  })
  .catch(function(err) {
    console.error('GHL error:', err);
    window.location.href = 'https://thearenapartners.com/watch.html?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(firstName);
  });
}

// Close modal on backdrop click
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Close modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});
