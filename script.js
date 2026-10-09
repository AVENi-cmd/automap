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
function saudiMinDate() {
  const [year, month, day] = saudiToday().split('-').map(Number);
  return new Date(year, month - 1, day);
}
function updateSummary() {
  const chosen = packages[packageSelect.value];
  summary.textContent = chosen ? `باقة ${chosen.name} · ${chosen.price} ر.س` : 'اختر باقتك لتجهيز طلب الحجز.';
}
function bookingDateIso(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day ? iso : null;
}
function bookingUrl(branchKey, packageKey, date) {
  date = bookingDateIso(date);
  const branch = branches[branchKey];
  const chosen = packages[packageKey];
  if (!branch || !chosen || !date || date < saudiToday()) return null;
  const message = `مرحبًا أوتو ماب، أرغب في طلب حجز:\nالفرع: ${branch.name}\nالباقة: ${chosen.name}\nالسعر: ${chosen.price} ر.س\nالتاريخ المفضل: ${date}\nيرجى تأكيد توفر الموعد.`;
  return `https://wa.me/${branch.phone}?text=${encodeURIComponent(message)}`;
}
const dateError = document.getElementById('date-error');
let datePicker = null;
function syncBookingMinDate() {
  dateInput.min = saudiToday();
  if (datePicker) datePicker.set('minDate', saudiMinDate());
}
function calendarEnglish(instance) {
  instance.calendarContainer.setAttribute('dir', 'ltr');
  instance.calendarContainer.setAttribute('lang', 'en');
}
if (window.flatpickr) {
  datePicker = window.flatpickr(dateInput, {
    dateFormat: 'd/m/Y',
    disableMobile: true,
    allowInput: false,
    clickOpens: true,
    locale: window.flatpickr.l10ns.default,
    minDate: saudiMinDate(),
    ariaDateFormat: 'F j, Y',
    onReady: (_dates, _text, instance) => calendarEnglish(instance),
    onOpen: (_dates, _text, instance) => {
      calendarEnglish(instance);
      instance.set('minDate', saudiMinDate());
    },
    onChange: () => {
      dateError.hidden = true;
      dateInput.removeAttribute('aria-invalid');
    }
  });
}
syncBookingMinDate();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncBookingMinDate();
});
document.querySelectorAll('[data-package]').forEach(link => {
  link.addEventListener('click', () => {
    packageSelect.value = link.dataset.package;
    updateSummary();
  });
});
packageSelect.addEventListener('change', updateSummary);
dateInput.addEventListener('focus', syncBookingMinDate);
form.addEventListener('submit', event => {
  event.preventDefault();
  syncBookingMinDate();
  if (!form.reportValidity()) return;
  const url = bookingUrl(branchSelect.value, packageSelect.value, dateInput.value);
  if (!url) {
    dateError.hidden = false;
    dateInput.setAttribute('aria-invalid', 'true');
    dateInput.focus();
    if (datePicker) datePicker.open();
    return;
  }
  window.location.assign(url);
});
