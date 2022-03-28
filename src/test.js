let timerInterval = null;
const nextBreak = 5;

$("#txt-break-time").text(
  `${Math.floor(nextBreak / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(nextBreak % 60)
    .toString()
    .padStart(2, "0")}`
);

$("#btn-start-timer").on("click", function () {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;

    $("#btn-start-timer").toggleClass(["bg-yellow", "bg-gray"]);
    $("#btn-start-timer").text("start");
    $("#txt-elapsed-time").text("00:00:00");
    $("#txt-break-time").text("00:00");
  } else {
    $("#btn-start-timer").toggleClass(["bg-yellow", "bg-gray"]);
    $("#btn-start-timer").text("stop");

    timerInterval = setInterval(() => {
      //elapsed time timer
      let currTime = $("#txt-elapsed-time").text().trim();
      let seconds = parseInt(currTime.slice(6));
      let minutes = parseInt(currTime.slice(3, 5));
      let hours = parseInt(currTime.slice(0, 2));

      if (seconds < 59) {
        seconds += 1;
        seconds = seconds.toString().padStart(2, "0");
        minutes = minutes.toString().padStart(2, "0");
        hours = hours.toString().padStart(2, "0");
      } else {
        seconds = "00";
        if (minutes < 59) {
          minutes += 1;
          minutes = minutes.toString().padStart(2, "0");
          hours = hours.toString().padStart(2, "0");
        } else {
          minutes = "00";
          if (hours < 99) {
            hours += 1;
            hours = hours.toString().padStart(2, "0");
          } else {
            hours = "00";
            minutes = "00";
            seconds = "00";
          }
        }
      }
      $("#txt-elapsed-time").text(`${hours}:${minutes}:${seconds}`);

      //break time timer
      currTime = $("#txt-break-time").text().trim();

      seconds = parseInt(currTime.slice(3));
      minutes = parseInt(currTime.slice(0, 2));
      $("#timer-base").css(
        "stroke-dasharray",
        `${((minutes * 60 + seconds) / nextBreak) * 252} ${252}`
      );

      if (seconds > 0) {
        seconds -= 1;
        seconds = seconds.toString().padStart(2, "0");
        minutes = minutes.toString().padStart(2, "0");
      } else {
        seconds = "59";
        if (minutes > 0) {
          minutes -= 1;
          minutes = minutes.toString().padStart(2, "0");
        } else {
          minutes = "19";
        }
      }
      $("#txt-break-time").text(`${minutes}:${seconds}`);
    }, 1000);
  }
});
