'use strict';
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('booking-form');
const branchSelect = document.getElementById('booking-branch');
const packageSelect = document.getElementById('booking-package');
const dateInput = document.getElementById('booking-date');
const summary = document.getElementById('booking-summary');
const branches = {
  hofuf: { name: 'الهفوف', phone: '966543229006' },
  taraf: { name: 'الطرف', phone: '966543229006' },
  abqaiq: { name: 'بقيق', phone: '966561790099' },
  dammam: { name: 'الدمام', phone: '966543229006' }
};
const packages = {
  economic: { name: 'الاقتصادية', price: '1,199' },
  silver: { name: 'الفضية', price: '1,999' },
  gold: { name: 'الذهبية', price: '2,999' },
  diamond: { name: 'الماسية', price: '7,500' }
};
function saudiToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
function updateSummary() {
  const chosen = packages[packageSelect.value];
  summary.textContent = chosen ? `باقة ${chosen.name} · ${chosen.price} ر.س` : 'اختر باقتك لتجهيز طلب الحجز.';
}
function bookingUrl(branchKey, packageKey, date) {
  const branch = branches[branchKey];
  const chosen = packages[packageKey];
  if (!branch || !chosen || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < saudiToday()) return null;
  const message = `مرحبًا أوتو ماب، أرغب في طلب حجز:\nالفرع: ${branch.name}\nالباقة: ${chosen.name}\nالسعر: ${chosen.price} ر.س\nالتاريخ المفضل: ${date}\nيرجى تأكيد توفر الموعد.`;
  return `https://wa.me/${branch.phone}?text=${encodeURIComponent(message)}`;
}
dateInput.min = saudiToday();
document.querySelectorAll('[data-package]').forEach(link => {
  link.addEventListener('click', () => {
    packageSelect.value = link.dataset.package;
    updateSummary();
  });
});
packageSelect.addEventListener('change', updateSummary);
dateInput.addEventListener('focus', () => { dateInput.min = saudiToday(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  dateInput.min = saudiToday();
  if (!form.reportValidity()) return;
  const url = bookingUrl(branchSelect.value, packageSelect.value, dateInput.value);
  if (url) window.location.assign(url);
});
