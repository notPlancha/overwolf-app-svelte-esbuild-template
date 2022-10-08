(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@overwolf/overwolf-api-ts/dist/ow-listener.js
  var require_ow_listener = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/ow-listener.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OWListener = void 0;
      var OWListener = class {
        constructor(delegate) {
          this._delegate = delegate;
        }
        start() {
          this.stop();
        }
      };
      exports.OWListener = OWListener;
    }
  });

  // node_modules/@overwolf/overwolf-api-ts/dist/ow-game-listener.js
  var require_ow_game_listener = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/ow-game-listener.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OWGameListener = void 0;
      var ow_listener_1 = require_ow_listener();
      var OWGameListener2 = class extends ow_listener_1.OWListener {
        constructor(delegate) {
          super(delegate);
          this.onGameInfoUpdated = (update) => {
            if (!update || !update.gameInfo) {
              return;
            }
            if (!update.runningChanged && !update.gameChanged) {
              return;
            }
            if (update.gameInfo.isRunning) {
              if (this._delegate.onGameStarted) {
                this._delegate.onGameStarted(update.gameInfo);
              }
            } else {
              if (this._delegate.onGameEnded) {
                this._delegate.onGameEnded(update.gameInfo);
              }
            }
          };
          this.onRunningGameInfo = (info) => {
            if (!info) {
              return;
            }
            if (info.isRunning) {
              if (this._delegate.onGameStarted) {
                this._delegate.onGameStarted(info);
              }
            }
          };
        }
        start() {
          super.start();
          overwolf.games.onGameInfoUpdated.addListener(this.onGameInfoUpdated);
          overwolf.games.getRunningGameInfo(this.onRunningGameInfo);
        }
        stop() {
          overwolf.games.onGameInfoUpdated.removeListener(this.onGameInfoUpdated);
        }
      };
      exports.OWGameListener = OWGameListener2;
    }
  });

  // node_modules/@overwolf/overwolf-api-ts/dist/timer.js
  var require_timer = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/timer.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Timer = void 0;
      var Timer = class {
        constructor(delegate, id) {
          this._timerId = null;
          this.handleTimerEvent = () => {
            this._timerId = null;
            this._delegate.onTimer(this._id);
          };
          this._delegate = delegate;
          this._id = id;
        }
        static async wait(intervalInMS) {
          return new Promise((resolve) => {
            setTimeout(resolve, intervalInMS);
          });
        }
        start(intervalInMS) {
          this.stop();
          this._timerId = setTimeout(this.handleTimerEvent, intervalInMS);
        }
        stop() {
          if (this._timerId == null) {
            return;
          }
          clearTimeout(this._timerId);
          this._timerId = null;
        }
      };
      exports.Timer = Timer;
    }
  });

  // node_modules/@overwolf/overwolf-api-ts/dist/ow-games-events.js
  var require_ow_games_events = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/ow-games-events.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OWGamesEvents = void 0;
      var timer_1 = require_timer();
      var OWGamesEvents = class {
        constructor(delegate, requiredFeatures, featureRetries = 10) {
          this.onInfoUpdates = (info) => {
            this._delegate.onInfoUpdates(info.info);
          };
          this.onNewEvents = (e) => {
            this._delegate.onNewEvents(e);
          };
          this._delegate = delegate;
          this._requiredFeatures = requiredFeatures;
          this._featureRetries = featureRetries;
        }
        async getInfo() {
          return new Promise((resolve) => {
            overwolf.games.events.getInfo(resolve);
          });
        }
        async setRequiredFeatures() {
          let tries = 1, result;
          while (tries <= this._featureRetries) {
            result = await new Promise((resolve) => {
              overwolf.games.events.setRequiredFeatures(this._requiredFeatures, resolve);
            });
            if (result.status === "success") {
              console.log("setRequiredFeatures(): success: " + JSON.stringify(result, null, 2));
              return result.supportedFeatures.length > 0;
            }
            await timer_1.Timer.wait(3e3);
            tries++;
          }
          console.warn("setRequiredFeatures(): failure after " + tries + " tries" + JSON.stringify(result, null, 2));
          return false;
        }
        registerEvents() {
          this.unRegisterEvents();
          overwolf.games.events.onInfoUpdates2.addListener(this.onInfoUpdates);
          overwolf.games.events.onNewEvents.addListener(this.onNewEvents);
        }
        unRegisterEvents() {
          overwolf.games.events.onInfoUpdates2.removeListener(this.onInfoUpdates);
          overwolf.games.events.onNewEvents.removeListener(this.onNewEvents);
        }
        async start() {
          console.log(`[ow-game-events] START`);
          this.registerEvents();
          await this.setRequiredFeatures();
          const { res, status } = await this.getInfo();
          if (res && status === "success") {
            this.onInfoUpdates({ info: res });
          }
        }
        stop() {
          console.log(`[ow-game-events] STOP`);
          this.unRegisterEvents();
        }
      };
      exports.OWGamesEvents = OWGamesEvents;
    }
  });

  // node_modules/@overwolf/overwolf-api-ts/dist/ow-games.js
  var require_ow_games = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/ow-games.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OWGames = void 0;
      var OWGames2 = class {
        static getRunningGameInfo() {
          return new Promise((resolve) => {
            overwolf.games.getRunningGameInfo(resolve);
          });
        }
        static classIdFromGameId(gameId) {
          let classId = Math.floor(gameId / 10);
          return classId;
        }
        static async getRecentlyPlayedGames(limit = 3) {
          return new Promise((resolve) => {
            if (!overwolf.games.getRecentlyPlayedGames) {
              return resolve(null);
            }
            overwolf.games.getRecentlyPlayedGames(limit, (result) => {
              resolve(result.games);
            });
          });
        }
        static async getGameDBInfo(gameClassId) {
          return new Promise((resolve) => {
            overwolf.games.getGameDBInfo(gameClassId, resolve);
          });
        }
      };
      exports.OWGames = OWGames2;
    }
  });

  // node_modules/@overwolf/overwolf-api-ts/dist/ow-hotkeys.js
  var require_ow_hotkeys = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/ow-hotkeys.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OWHotkeys = void 0;
      var OWHotkeys = class {
        constructor() {
        }
        static getHotkeyText(hotkeyId, gameId) {
          return new Promise((resolve) => {
            overwolf.settings.hotkeys.get((result) => {
              if (result && result.success) {
                let hotkey;
                if (gameId === void 0)
                  hotkey = result.globals.find((h) => h.name === hotkeyId);
                else if (result.games && result.games[gameId])
                  hotkey = result.games[gameId].find((h) => h.name === hotkeyId);
                if (hotkey)
                  return resolve(hotkey.binding);
              }
              resolve("UNASSIGNED");
            });
          });
        }
        static onHotkeyDown(hotkeyId, action) {
          overwolf.settings.hotkeys.onPressed.addListener((result) => {
            if (result && result.name === hotkeyId)
              action(result);
          });
        }
      };
      exports.OWHotkeys = OWHotkeys;
    }
  });

  // node_modules/@overwolf/overwolf-api-ts/dist/ow-window.js
  var require_ow_window = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/ow-window.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OWWindow = void 0;
      var OWWindow2 = class {
        constructor(name = null) {
          this._name = name;
          this._id = null;
        }
        async restore() {
          let that = this;
          return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.restore(id, (result) => {
              if (!result.success)
                console.error(`[restore] - an error occurred, windowId=${id}, reason=${result.error}`);
              resolve();
            });
          });
        }
        async minimize() {
          let that = this;
          return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.minimize(id, () => {
            });
            return resolve();
          });
        }
        async maximize() {
          let that = this;
          return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.maximize(id, () => {
            });
            return resolve();
          });
        }
        async hide() {
          let that = this;
          return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.hide(id, () => {
            });
            return resolve();
          });
        }
        async close() {
          let that = this;
          return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            const result = await this.getWindowState();
            if (result.success && result.window_state !== "closed") {
              await this.internalClose();
            }
            return resolve();
          });
        }
        dragMove(elem) {
          elem.className = elem.className + " draggable";
          elem.onmousedown = (e) => {
            e.preventDefault();
            overwolf.windows.dragMove(this._name);
          };
        }
        async getWindowState() {
          let that = this;
          return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.getWindowState(id, resolve);
          });
        }
        static async getCurrentInfo() {
          return new Promise(async (resolve) => {
            overwolf.windows.getCurrentWindow((result) => {
              resolve(result.window);
            });
          });
        }
        obtain() {
          return new Promise((resolve, reject) => {
            const cb = (res) => {
              if (res && res.status === "success" && res.window && res.window.id) {
                this._id = res.window.id;
                if (!this._name) {
                  this._name = res.window.name;
                }
                resolve(res.window);
              } else {
                this._id = null;
                reject();
              }
            };
            if (!this._name) {
              overwolf.windows.getCurrentWindow(cb);
            } else {
              overwolf.windows.obtainDeclaredWindow(this._name, cb);
            }
          });
        }
        async assureObtained() {
          let that = this;
          return new Promise(async (resolve) => {
            await that.obtain();
            return resolve();
          });
        }
        async internalClose() {
          let that = this;
          return new Promise(async (resolve, reject) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.close(id, (res) => {
              if (res && res.success)
                resolve();
              else
                reject(res);
            });
          });
        }
      };
      exports.OWWindow = OWWindow2;
    }
  });

  // node_modules/@overwolf/overwolf-api-ts/dist/index.js
  var require_dist = __commonJS({
    "node_modules/@overwolf/overwolf-api-ts/dist/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() {
          return m[k];
        } });
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
            __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_ow_game_listener(), exports);
      __exportStar(require_ow_games_events(), exports);
      __exportStar(require_ow_games(), exports);
      __exportStar(require_ow_hotkeys(), exports);
      __exportStar(require_ow_listener(), exports);
      __exportStar(require_ow_window(), exports);
    }
  });

  // src/background.mts
  var import_dist = __toESM(require_dist(), 1);

  // Manifest.mts
  var manifest = {
    UID: "samplea-app",
    manifest_version: 1,
    type: "WebApp",
    permissions: ["GameInfo", "Hotkeys"],
    max_rotation_log_files: 20,
    meta: {
      name: "first app",
      author: "author name",
      version: "0.0.0.1",
      "minimum-overwolf-version": "128.0.0.1",
      description: "A plain text description",
      dock_button_title: "first app",
      icon: "icons/IconMouseOver.png",
      icon_gray: "icons/IconMouseNormal.png",
      launcher_icon: "icons/desktop-icon.ico",
      splash_image: "icons/IconMouseOver.png",
      window_icon: "icons/IconMouseOver.png"
    },
    data: {
      start_window: "background",
      game_targeting: {
        type: "dedicated",
        game_ids: [108681, 108682, 108683, 108684]
      },
      windows: {
        "background": {
          file: "background.mts",
          background_optimization: false,
          is_background_page: true,
          debug_url: "localhost:11101",
          optimize_accelerate_rendering: true,
          disable_auto_dpi_sizing: false,
          restrict_to_game_bounds: false,
          disable_hardware_acceleration: false
        },
        "in_game": {
          file: "In_game.svelte",
          transparent: false,
          debug_url: "localhost:11102",
          show_in_taskbar: false,
          in_game_only: true,
          clickthrough: false,
          optimize_accelerate_rendering: true,
          disable_auto_dpi_sizing: false,
          restrict_to_game_bounds: false,
          disable_hardware_acceleration: false,
          size: {
            width: 500,
            height: 500
          }
        },
        "desktop": {
          file: "Desktop.svelte",
          desktop_only: true,
          native_window: true,
          size: {
            width: 500,
            height: 500
          },
          debug_url: "localhost:11103",
          optimize_accelerate_rendering: true,
          disable_auto_dpi_sizing: false,
          restrict_to_game_bounds: false,
          disable_hardware_acceleration: false
        }
      }
    }
  };

  // src/background.mts
  var _AppController = class {
    constructor() {
      this.desktopWindow = new import_dist.OWWindow("desktop");
      this.inGameWindow = new import_dist.OWWindow("in-game");
      this.gameListener = new import_dist.OWGameListener({
        onGameStarted(info) {
          const cont = _AppController.getInstance();
          cont.desktopWindow.close();
          cont.inGameWindow.restore();
        },
        onGameEnded(info) {
          const cont = _AppController.getInstance();
          cont.desktopWindow.restore();
          cont.inGameWindow.close();
        }
      });
      overwolf.extensions.onAppLaunchTriggered.addListener((e) => {
        if (!e || e.origin.includes("gamelaunchevent"))
          return;
        import_dist.OWGames.getRunningGameInfo().then((gameRunning) => {
          if (gameRunning.isRunning && gameRunning.id in manifest.data.game_targeting.game_ids) {
            this.inGameWindow.restore();
            this.desktopWindow.close();
          } else {
            this.inGameWindow.close();
            this.desktopWindow.restore();
          }
        });
      });
    }
    static getInstance() {
      if (_AppController._instance === null)
        _AppController._instance = new _AppController();
      return _AppController._instance;
    }
  };
  var AppController = _AppController;
  AppController._instance = null;
})();
