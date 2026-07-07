(function () {
  "use strict";

  var desktop = document.getElementById("desktop");
  var openWindows = [];
  var topZ = 100;

  function windowEl(name) {
    return document.getElementById("window-" + name);
  }

  function bringToFront(win) {
    topZ += 1;
    win.style.zIndex = topZ;
    document.querySelectorAll(".window").forEach(function (w) { w.classList.remove("active"); });
    win.classList.add("active");
  }

  function openWindow(name, wallpaperClass) {
    var win = windowEl(name);
    if (!win) return;

    if (wallpaperClass) {
      desktop.className = wallpaperClass;
    }

    if (!win.classList.contains("open")) {
      win.classList.add("open");
      win.style.animation = "none";
      // restart pop-in animation
      void win.offsetWidth;
      win.style.animation = "";
      if (openWindows.indexOf(name) === -1) openWindows.push(name);
    }
    bringToFront(win);
  }

  function closeWindow(name) {
    var win = windowEl(name);
    if (!win) return;
    win.classList.remove("open");
    openWindows = openWindows.filter(function (n) { return n !== name; });
    if (openWindows.length === 0) {
      desktop.className = "wallpaper-default";
    }
  }

  function minimizeWindow(name) {
    var win = windowEl(name);
    if (!win) return;
    win.style.transition = "transform 260ms ease, opacity 260ms ease";
    win.style.transform = "scale(.1) translateY(600px)";
    win.style.opacity = "0";
    setTimeout(function () {
      win.classList.remove("open");
      win.style.transition = "";
      win.style.transform = "";
      win.style.opacity = "";
      openWindows = openWindows.filter(function (n) { return n !== name; });
      if (openWindows.length === 0) desktop.className = "wallpaper-default";
    }, 260);
  }

  function toggleZoom(name) {
    var win = windowEl(name);
    if (!win) return;
    win.classList.toggle("maximized");
  }

  // Icon + dock clicks
  document.querySelectorAll("[data-window]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openWindow(btn.getAttribute("data-window"), btn.getAttribute("data-wallpaper"));
    });
  });

  // "Go to desktop" (wordmark + dock finder icon)
  document.querySelectorAll('[data-action="go-desktop"]').forEach(function (el) {
    el.addEventListener("click", function () {
      document.querySelectorAll(".window.open").forEach(function (w) {
        w.classList.remove("open");
      });
      openWindows = [];
      desktop.className = "wallpaper-default";
    });
  });

  // Traffic lights
  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      closeWindow(el.getAttribute("data-close"));
    });
  });
  document.querySelectorAll("[data-min]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      minimizeWindow(el.getAttribute("data-min"));
    });
  });
  document.querySelectorAll("[data-zoom]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleZoom(el.getAttribute("data-zoom"));
    });
  });

  // Bring window to front on click anywhere inside it
  document.querySelectorAll(".window").forEach(function (win) {
    win.addEventListener("mousedown", function () { bringToFront(win); });
  });

  // Dragging via titlebar
  document.querySelectorAll(".titlebar").forEach(function (bar) {
    var win = bar.closest(".window");
    var dragging = false;
    var offsetX = 0, offsetY = 0;

    function start(clientX, clientY) {
      dragging = true;
      var rect = win.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;
      bringToFront(win);
    }
    function move(clientX, clientY) {
      if (!dragging) return;
      var x = clientX - offsetX;
      var y = clientY - offsetY;
      y = Math.max(24, y);
      win.style.left = x + "px";
      win.style.top = y + "px";
    }
    function end() { dragging = false; }

    bar.addEventListener("mousedown", function (e) {
      if (e.target.closest(".traffic")) return;
      start(e.clientX, e.clientY);
    });
    window.addEventListener("mousemove", function (e) { move(e.clientX, e.clientY); });
    window.addEventListener("mouseup", end);

    bar.addEventListener("touchstart", function (e) {
      if (e.target.closest(".traffic")) return;
      var t = e.touches[0];
      start(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (!dragging) return;
      var t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener("touchend", end);
  });

  // Live clock
  function updateClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    var now = new Date();
    var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var h = now.getHours();
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    var m = now.getMinutes().toString().padStart(2, "0");
    el.textContent = days[now.getDay()] + " " + months[now.getMonth()] + " " + now.getDate() +
      "  " + h12 + ":" + m + " " + ampm;
  }
  updateClock();
  setInterval(updateClock, 1000 * 15);

})();
