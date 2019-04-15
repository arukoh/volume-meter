const storage = require("electron-json-storage");

let initData = {
  level: {
    warning: 1.0
  }
};

const update = function(data) {
  document.getElementById("warningLevel").value = data.level.warning;
};

storage.get("config", (error, data) => {
  if (error) throw error;

  if (0 === Object.keys(data).length) {
    storage.set("config", initData, error => {
      if (error) throw error;
      update(initData);
    });
  } else {
    update(data);
  }
});

const warningLevel = document.getElementById("warningLevel");
warningLevel.addEventListener("change", event => {
  storage.get("config", (error, data) => {
    if (error) throw error;
    data.level.warning = document.getElementById("warningLevel").value;
    storage.set("config", data, error => {
      if (error) throw error;
    });
  });
});
