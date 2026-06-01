/**
 * Capacitor / Android Bridge
 *
 * Mimics the Electron IPC API (electronAPI) so the renderer code works
 * identically whether running inside Electron or inside a Capacitor WebView.
 *
 * In Electron: preload.js defines `window.electronAPI`.
 * In Capacitor: this script polyfills the same interface using
 * Capacitor plugins (StatusBar, SplashScreen, etc.).
 */

(function () {
  "use strict";

  // Guard: if electronAPI already exists (we're in Electron), do nothing.
  if (typeof window.electronAPI !== "undefined") return;

  // ─── Check if we're running inside Capacitor ──────────────────────
  const isCapacitor =
    typeof window.Capacitor !== "undefined" &&
    typeof window.Capacitor.platform === "function";

  if (!isCapacitor) {
    // Standalone browser / other — expose a no-op API so the app doesn't crash.
    window.electronAPI = {
      minimizeWindow: () => {},
      maximizeWindow: () => {},
      closeWindow: () => {},
      onWindowMaximized: () => {},
      platform: "web",
      isWindows: false,
      isMac: false,
      isLinux: false,
    };
    return;
  }

  // ─── Android / Capacitor environment ──────────────────────────────
  const { StatusBar, SplashScreen } = window.Capacitor.Plugins;

  /**
   * Detect platform inside Capacitor.
   */
  function getPlatform() {
    try {
      return window.Capacitor.getPlatform(); // "android" | "ios" | "web"
    } catch {
      return "web";
    }
  }

  const plat = getPlatform();

  window.electronAPI = {
    // ── Window controls (no-op on mobile — the shell handles them) ──
    minimizeWindow: () => {
      // On Android, navigating back or finishing is the equivalent.
      if (typeof window.AndroidBridge !== "undefined") {
        window.AndroidBridge.minimize?.();
      }
    },
    maximizeWindow: () => {
      // Mobile screens are always full-screen; no-op.
      if (typeof window.AndroidBridge !== "undefined") {
        window.AndroidBridge.maximize?.();
      }
    },
    closeWindow: () => {
      if (typeof window.AndroidBridge !== "undefined") {
        window.AndroidBridge.close?.();
      } else {
        // Graceful fallback: try to close the tab (may not work in all browsers)
        window.close();
      }
    },

    // ── Window state events (not applicable on mobile) ─────────────
    onWindowMaximized: () => {},

    // ── Platform info ──────────────────────────────────────────────
    platform: plat,
    isWindows: false,
    isMac: false,
    isLinux: false,
    isAndroid: plat === "android",
    isIos: plat === "ios",

    // ── Capacitor-native helpers (exposed for the renderer to use) ─
    capacitor: {
      /** Hide splash screen */
      hideSplash: () => SplashScreen.hide?.(),

      /** Set status bar style ('dark' | 'light') */
      setStatusBarStyle: (style) =>
        StatusBar.setStyle({ style: style === "dark" ? "Dark" : "Light" }),

      /** Set status bar background color (CSS color string) */
      setStatusBarBackground: (color) =>
        StatusBar.setBackgroundColor({ color }),

      /** Show splash screen with optional config */
      showSplash: (config = {}) =>
        SplashScreen.show({
          showDuration: config.duration ?? 2000,
          backgroundColor: config.backgroundColor ?? "#0a0a0a",
          showSpinner: config.showSpinner ?? false,
          androidSpinnerStyle: config.androidSpinnerStyle ?? "small",
        }),

      /** Get the platform string */
      getPlatform: () => plat,
    },
  };
})();
