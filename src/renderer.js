let nextBreak = 10;
let timerInterval = null;
let isPaused = false;

let fireNotification = (body, title = null) => {
  new Notification(title || "twenty-twenty", {
    body: body,
    icon: "./assets/icon.png",
  });
};

let timerFunc = () => {
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
    `${((minutes * 60 + seconds - 2) / nextBreak) * 252} ${252}`
  );

  if (seconds == 0 && minutes == 0) {
    pauseTimer();
    resetBreakTimer();
    fireNotification((body = "It's time for a break"));
    return;
  }

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
      resetBreakTimer();
    }
  }
  $("#txt-break-time").text(`${minutes}:${seconds}`);
};

let resetTimer = () => {
  $("#txt-break-time").text(
    `${Math.floor(nextBreak / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(nextBreak % 60)
      .toString()
      .padStart(2, "0")}`
  );
  $("#timer-base").css("stroke-dasharray", "252 252");
  $("#txt-elapsed-time").text("00:00:00");
};

let resetBreakTimer = () => {
  $("#txt-break-time").text(
    `${Math.floor(nextBreak / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(nextBreak % 60)
      .toString()
      .padStart(2, "0")}`
  );
  $("#timer-base").css("stroke-dasharray", "252 252");
};

let startTimer = () => {
  $(".timer-svg").toggleClass("animation-expand");
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = false;

    resetTimer();

    $("#btn-start-timer").toggleClass(["bi-play-fill", "bi-stop-fill"]);
    $("#btn-resume-pause").removeClass(["bi-pause-fill", "bi-play-fill"]);
    $("#btn-resume-pause").addClass("bi-pause-fill");
    $("#btn-resume-pause").toggle();

    $("#btn-start-timer2").toggleClass(["bg-yellow", "bg-gray"]);
    $("#btn-start-timer2").text("start");

    $("#btn-resume-pause2").removeClass(["bi-pause-fill", "bi-play-fill"]);
    $("#btn-resume-pause2").addClass("bi-pause-fill");
  } else {
    $("#btn-start-timer").toggleClass(["bi-play-fill", "bi-stop-fill"]);
    $("#btn-resume-pause").toggle();

    $("#btn-start-timer2").toggleClass(["bg-yellow", "bg-gray"]);
    $("#btn-start-timer2").text("stop");

    timerInterval = setInterval(timerFunc, 1000);

    fireNotification((body = "Timer started"));
  }
};

let pauseTimer = () => {
  if (!timerInterval) {
    return;
  }

  $("#btn-resume-pause").toggleClass(["bi-pause-fill", "bi-play-fill"]);
  $("#btn-resume-pause2").toggleClass(["bi-pause-fill", "bi-play-fill"]);

  if (!isPaused) {
    clearInterval(timerInterval);
    isPaused = true;
  } else {
    timerInterval = setInterval(timerFunc, 1000);
    isPaused = false;
  }
};

let openSettings = () => {
  window.electronAPI.openSettings();
};

let closeSettings = () => {
  let prefs = {
    breakTimeInterval: $("#prefs-breakTimeInterval").val(),
    notifications: !!$("#prefs-desktopNotifications").prop("checked") || false,
    launchOnStartup: !!$("#prefs-launchOnStartup").prop("checked") || false,
    autoStartTimer: !!$("#prefs-autoStartTimer").prop("checked") || false,
  };

  window.electronAPI.closeSettings(prefs);
};

let loadSettings = async () => {
  const prefs = await window.electronAPI.fetchSettings();
  $("#prefs-breakTimeInterval").val(prefs.breakTimeInterval);
  $("#prefs-desktopNotifications").prop("checked", prefs.notifications);
  $("#prefs-launchOnStartup").prop("checked", prefs.launchOnStartup);
  $("#prefs-autoStartTimer").prop("checked", prefs.autoStartTimer);
};

let loadPreferences = async () => {
  const prefs = await window.electronAPI.fetchSettings();
  nextBreak = prefs.breakTimeInterval * 60;
  resetTimer();
};

let toggleDarkMode = () => {
  $("#btn-darkmode").toggleClass([
    "text-gray",
    "text-yellow",
    "bi-moon-stars-fill",
    "bi-sun-fill",
  ]);

  $("#body-settings").toggleClass(["bg-white", "bg-dark", "dark-mode"]);
  $("#body-index").toggleClass(["bg-white", "bg-dark", "dark-mode"]);
  $("#header-index").toggleClass("bg-header");

  $("#filter-gradient").toggle();
  setTimeout(() => $("#filter-gradient").toggle(), 800);

  if ($("#body-index").hasClass("bg-dark")) {
    $("#logo").prop("src", "./assets/logo-light.svg");
    window.electronAPI.setDarkMode(true);
  } else {
    window.electronAPI.setDarkMode(false);
    $("#logo").prop("src", "./assets/logo.svg");
  }
};

$("#btn-start-timer").on("click", startTimer);
$("#btn-start-timer2").on("click", startTimer);

$("#btn-resume-pause").on("click", pauseTimer);
$("#btn-resume-pause2").on("click", pauseTimer);

$("#btn-settings").on("click", openSettings);
$("#btn-close-settings").on("click", closeSettings);

$("#btn-darkmode").on("click", toggleDarkMode);

$("body-settings").ready(loadSettings);
$("body-index").ready(loadPreferences);