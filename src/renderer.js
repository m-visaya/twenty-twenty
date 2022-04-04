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

    fireNotification("Timer started");
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
  let prefs = await window.electronAPI.fetchSettings();
  $("#prefs-breakTimeInterval").val(prefs.breakTimeInterval);
  $("#prefs-appTheme").val(prefs.appTheme);
  $("#prefs-desktopNotifications").prop("checked", prefs.notifications);
  $("#prefs-launchOnStartup").prop("checked", prefs.launchOnStartup);
  $("#prefs-autoStartTimer").prop("checked", prefs.autoStartTimer);

  $("#body-settings").css("transition", "none");
};

let loadPreferences = async () => {
  let prefs = await window.electronAPI.fetchSettings();
  nextBreak = prefs.breakTimeInterval * 60;
  resetTimer();
  await toggleAppTheme(prefs.appTheme);
};

let toggleAppTheme = async (theme) => {
  $("#body-settings").css("transition", "background-color ease 1s");

  if (theme == "system") {
    window.electronAPI.setAppTheme(theme);
    theme = await window.electronAPI.fetchSetting("isNativeThemeDark");
    theme = theme == true ? "dark" : "light";
  } else {
    window.electronAPI.setAppTheme(theme);
  }

  $("#filter-gradient").toggle();

  if (theme == "dark") {
    $("#body-settings").removeClass(["bg-white"]);
    $("#body-settings").addClass(["bg-dark", "dark-mode"]);
    $("#body-index").removeClass(["bg-white"]);
    $("#body-index").addClass(["bg-dark", "dark-mode"]);
    $("#header-index").addClass("bg-header");
    $("#logo").prop("src", "./assets/logo-light.svg");
  } else {
    $("#body-settings").addClass(["bg-white"]);
    $("#body-settings").removeClass(["bg-dark", "dark-mode"]);
    $("#body-index").addClass(["bg-white"]);
    $("#body-index").removeClass(["bg-dark", "dark-mode"]);
    $("#header-index").removeClass("bg-header");
    $("#logo").prop("src", "./assets/logo.svg");
  }
  setTimeout(() => $("#filter-gradient").toggle(), 800);
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

window.electronAPI.onUpdateTheme((_event, value) => {
  toggleAppTheme(value);
});

$("#btn-start-timer").on("click", startTimer);
$("#btn-start-timer2").on("click", startTimer);

$("#btn-resume-pause").on("click", pauseTimer);
$("#btn-resume-pause2").on("click", pauseTimer);

$("#btn-settings").on("click", openSettings);
$("#btn-close-settings").on("click", closeSettings);

$("#control-minimize").on("click", toggleMinimize);
$("#control-maximize").on("click", toggleMaximize);
$("#control-close").on("click", toggleClose);

$("#body-index").ready(loadPreferences);
$("#body-settings").ready(loadSettings);

$("#prefs-appTheme").change(function () {
  toggleAppTheme(this.value);
});

var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
