(() => {
  const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  // رنگ هر روز هفته ثابت است؛ پنج رنگ اصلی با دو طیف مکمل برای هفت روز کامل می‌شوند.
  const weekdayColors = ['yellow', 'green', 'blue', 'red', 'purple', 'orange', 'teal'];
  const titleColors = {
    yellow: '#ffdf70', green: '#78e0b4', blue: '#79c7ff', red: '#ff8f9f',
    purple: '#c8a2ff', orange: '#ffad74', teal: '#62ddd0'
  };
  const dayDeck = document.querySelector('#week-cards');

  // Read the current calendar date in Tehran, then do date arithmetic at UTC noon
  // so the result is stable even when the visitor's device uses another time zone.
  const iranParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran', year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(new Date());
  const part = (type) => Number(iranParts.find((item) => item.type === type).value);
  const tehranToday = new Date(Date.UTC(part('year'), part('month') - 1, part('day'), 12));
  const jalaliDate = (date, options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
    new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', ...options }).format(date);

  const todayIndex = (tehranToday.getUTCDay() + 1) % 7; // Saturday is the first day of the Iranian week.
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(tehranToday);
    date.setUTCDate(tehranToday.getUTCDate() + offset);
    const weekdayIndex = (date.getUTCDay() + 1) % 7;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'day-card';
    card.dataset.offset = String(offset);
    card.dataset.color = weekdayColors[weekdayIndex];
    card.setAttribute('aria-label', `${offset === 0 ? 'امروز، ' : ''}${dayNames[weekdayIndex]}، ${jalaliDate(date)}`);
    card.innerHTML = `
      <span class="card-inner" data-watermark="${String(offset + 1).toLocaleString('fa-IR')}">
        <span class="day-label">${offset === 0 ? 'امروز' : `${offset.toLocaleString('fa-IR')}`}</span>
        <svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M8 3v4M16 3v4M3.5 10h17M8.5 15l2 2 4.5-5"></path></svg>
        <strong class="day-name">${dayNames[weekdayIndex]}</strong>
        <span class="day-date">${jalaliDate(date)}</span>
        <em class="day-status">${offset === 0 ? 'تاریخ امروز' : 'روز آینده'}</em>
      </span>`;
    dayDeck.append(card);
    return card;
  });

  let activeIndex = 0;
  function render() {
    document.body.dataset.themeColor = days[activeIndex].dataset.color;
    document.body.style.setProperty('--theme-ink', titleColors[days[activeIndex].dataset.color]);
    days.forEach((card, index) => {
      card.classList.remove('is-active', 'is-previous', 'is-next', 'is-next-two');
      if (index === activeIndex) card.classList.add('is-active');
      else if (index === activeIndex - 1) card.classList.add('is-previous');
      else if (index === activeIndex + 1) card.classList.add('is-next');
      else if (index === activeIndex + 2) card.classList.add('is-next-two');
      card.setAttribute('aria-pressed', String(index === activeIndex));
      card.tabIndex = index >= activeIndex - 1 && index <= activeIndex + 2 ? 0 : -1;
    });
  }
  dayDeck.addEventListener('click', (event) => {
    const card = event.target.closest('.day-card');
    if (!card) return;
    const index = Number(card.dataset.offset);
    if (index >= activeIndex - 1 && index <= activeIndex + 2) { activeIndex = index; render(); }
  });
  render();
})();
