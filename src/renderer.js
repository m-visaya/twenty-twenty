let nextBreak = 10;
let timerInterval = null;
let isPaused = false;
let pendingNextBreak = null;
let notifications = true;
let pauseEveryBreak = false;
let audio = $("#sound-notification")[0];
audio.volume = 0.5;

var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);

var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

let fireNotification = (title, body, icon, sound) => {
  if (notifications) {
    window.electronAPI.fireNotification({
      body: body,
      icon: icon,
      title: title,
      sound: sound,
    });
    sound ? audio.play() : null;
  }
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

  if (seconds == 1 && minutes == 0) {
    if (pauseEveryBreak) pauseTimer();
    resetBreakTimer();
    fireNotification(
      "It's time for a break",
      "Taking frequent breaks reduces eye strain",
      "assets/icon-break-time.png",
      true
    );
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
  resetBreakTimer();
  $("#txt-elapsed-time").text("00:00:00");
};

let resetBreakTimer = () => {
  nextBreak = pendingNextBreak ? pendingNextBreak : nextBreak;
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
    $("#btn-resume-pause2").toggle();
  } else {
    $("#btn-start-timer").toggleClass(["bi-play-fill", "bi-stop-fill"]);
    $("#btn-resume-pause").toggle();

    $("#btn-start-timer2").toggleClass(["bg-yellow", "bg-gray"]);
    $("#btn-start-timer2").text("stop");
    $("#btn-resume-pause2").toggle();

    timerInterval = setInterval(timerFunc, 1000);

    fireNotification(
      "Timer Started",
      `Break time reminder every ${Math.floor(nextBreak / 60)} minutes`,
      "assets/icon-start-timer.png",
      false
    );
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
  $("#body-index").css("transition", "background-color ease 1s");
};

let loadPreferences = async () => {
  let prefs = await window.electronAPI.fetchSettings();
  nextBreak = prefs.breakTimeInterval * 60;
  resetTimer();
  notifications = prefs.notifications;
  pauseEveryBreak = prefs.pauseEveryBreak;
  await toggleAppTheme(prefs.appTheme);

  if (prefs.autoStartTimer) {
    startTimer();
  }
};

let toggleMinimize = () => {
  window.electronAPI.toggleMinimize();
};

let toggleMaximize = () => {
  window.electronAPI.toggleMaximize();
};

let toggleClose = () => {
  window.electronAPI.toggleClose();
};

let toggleAppTheme = async (theme) => {
  if (theme == "system") {
    theme = await window.electronAPI.fetchSetting("isNativeThemeDark");
    theme = theme == true ? "dark" : "light";
  }

  $("#filter-gradient").toggle();

  if (theme == "dark") {
    $("#body-index").removeClass(["bg-white"]);
    $("#body-index").addClass(["bg-dark", "dark-mode"]);
    $("#header-index").addClass("bg-header");
    $("#logo").prop("src", "./assets/logo-light.svg");
  } else {
    $("#body-index").addClass(["bg-white"]);
    $("#body-index").removeClass(["bg-dark", "dark-mode"]);
    $("#header-index").removeClass("bg-header");
    $("#logo").prop("src", "./assets/logo.svg");
  }
  setTimeout(() => $("#filter-gradient").toggle(), 800);
};

let expandWindow = (expand) => {
  if (expand) {
    window.resizeTo(1080, window.innerHeight);
  } else {
    window.resizeTo(500, window.innerHeight);
  }
};

window.electronAPI.onUpdateTheme((_event, value) => {
  toggleAppTheme(value);
});

window.electronAPI.onUpdatePreferences((_event, prefs) => {
  pendingNextBreak = prefs.breakTimeInterval * 60;
  if ((timerInterval === null || isPaused) && nextBreak != pendingNextBreak) {
    nextBreak = pendingNextBreak;
    pendingNextBreak = null;
    resetBreakTimer();
  }
  notifications = prefs.notifications;
  pauseEveryBreak = prefs.pauseEveryBreak;
});

window.electronAPI.onNotificationClose((_event) => {
  audio.pause();
  audio.currentTime = 0;
});

$("#btn-start-timer").on("click", startTimer);
$("#btn-start-timer2").on("click", startTimer);

$("#btn-resume-pause").on("click", pauseTimer);
$("#btn-resume-pause2").on("click", pauseTimer);

$("#btn-settings").on("click", openSettings);

$("#control-minimize").on("click", toggleMinimize);
$("#control-maximize").on("click", toggleMaximize);
$("#control-close").on("click", toggleClose);

$("#body-index").ready(loadPreferences);

$("#section-control-expand").on("click", () => expandWindow(true));
$("#section-control-hide").on("click", () => expandWindow(false));
