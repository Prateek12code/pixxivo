// The official Pixxivo Instagram account was confirmed by the project owner.
// Optional override for future account changes; validate against Instagram's hostname.
const configured = (import.meta.env.VITE_PIXXIVO_INSTAGRAM_URL || '').trim();
const fallback = 'https://www.instagram.com/pixxivo/';
const verified = /^https:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/.test(configured);
const instagram = verified ? configured : fallback;

document.querySelectorAll('footer .pixxivo-instagram').forEach(link => {
  link.href = instagram;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});
