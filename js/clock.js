$(document).ready(function() {
  let clock;

  // Grab the current date
  let currentDate = new Date();

  // Target future date/24 hour time/Timezone
  let targetDate = moment.tz("2026-09-12 12:00", "America/Sao_Paulo");

  // Calculate the difference in seconds between the future and current date
  let diff = targetDate / 1000 - currentDate.getTime() / 1000;

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
