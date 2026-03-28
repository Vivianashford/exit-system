(function() {
var GA_MEASUREMENT_ID = 'G-SDMM90P63D';
var s = document.createElement('script');
s.async = true;
s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
document.head.appendChild(s);
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID, { send_page_view: true });
var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
function onScroll() {
var scrolled = window.scrollY || window.pageYOffset;
var docHeight = document.documentElement.scrollHeight - window.innerHeight;
if (docHeight <= 0) return;
var pct = Math.round((scrolled / docHeight) * 100);
[25, 50, 75, 100].forEach(function(m) {
if (pct >= m && !scrollMilestones[m]) {
scrollMilestones[m] = true;
gtag('event', 'scroll_depth', { depth_threshold: m, page: 'landing' });
}
});
}
window.addEventListener('scroll', onScroll, { passive: true });
document.addEventListener('click', function(e) {
var a = e.target.closest('a');
if (!a) return;
var href = a.href || '';
if (href && !href.includes(location.hostname)) {
gtag('event', 'outbound_click', { link_url: href, link_text: (a.textContent || '').trim().slice(0, 100) });
}
});
var _origOpenModal = window.openModal;
window.openModal = function() {
gtag('event', 'vsl_play', { event_category: 'video', event_label: 'landing_page_vsl' });
if (typeof _origOpenModal === 'function') _origOpenModal.apply(this, arguments);
};
var _origSubmitForm = window.submitForm;
window.submitForm = function() {
var email = (document.getElementById('email') || {}).value || '';
var revenue = (document.getElementById('revenue') || {}).value || '';
gtag('event', 'optin_submit', { event_category: 'lead', event_label: 'vsl_optin', revenue_range: revenue, has_email: !!email });
if (typeof _origSubmitForm === 'function') return _origSubmitForm.apply(this, arguments);
};
})();