$(document).ready(function() {
  let clock;

  // Grab the current date
  let currentDate = new Date();

  // Target future date/24 hour time/Timezone.
  // -03:00 is Brazil standard time - the country has had no DST since 2019,
  // so the offset is fixed and safe to write out. Spelling it out here avoids
  // depending on a timezone database that can (and did) ship stale rules.
  let targetDate = new Date("2026-09-12T16:30:00-03:00");

  // Calculate the difference in seconds between the future and current date
  let diff = targetDate.getTime() / 1000 - currentDate.getTime() / 1000;

  clock = $(".clock").FlipClock(Math.max(0, diff), {
    clockFace: "DailyCounter",
    countdown: true,
    autostart: diff > 0,
  });

  // Check when timer reaches 0, then stop at 0
  setTimeout(() => checktime(), 1000);

  function checktime() {
    t = clock.getTime();
    if (t <= 0) {
      clock.setTime(0);
    }
    setTimeout(() => checktime(), 1000);
  }
});
