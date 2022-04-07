let closeSettings = () => {
  let prefs = {
    breakTimeInterval: $("#prefs-breakTimeInterval").val(),
    notifications: !!$("#prefs-desktopNotifications").prop("checked") || false,
    launchOnStartup: !!$("#prefs-launchOnStartup").prop("checked") || false,
    autoStartTimer: !!$("#prefs-autoStartTimer").prop("checked") || false,
    pauseEveryBreak: !!$("#prefs-pauseEveryBreak").prop("checked") || false,
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
  $("#prefs-pauseEveryBreak").prop("checked", prefs.pauseEveryBreak);

  await toggleAppTheme(prefs.appTheme);
};

let toggleAppTheme = async (theme) => {
  if (theme == "system") {
    theme = await window.electronAPI.fetchSetting("isNativeThemeDark");
    theme = theme == true ? "dark" : "light";
  }

  if (theme == "dark") {
    $("#body-settings").removeClass(["bg-white"]);
    $("#body-settings").addClass(["bg-dark", "dark-mode"]);
  } else {
    $("#body-settings").addClass(["bg-white"]);
    $("#body-settings").removeClass(["bg-dark", "dark-mode"]);
  }

  $("#body-settings").css("transition", "none");
};

$("#btn-close-settings").on("click", closeSettings);

$("#body-settings").ready(loadSettings);

$("#prefs-appTheme").change(function () {
  window.electronAPI.setAppTheme(this.value);
  toggleAppTheme(this.value);

  $("#body-settings").css("transition", "background-color ease 1s");
});
