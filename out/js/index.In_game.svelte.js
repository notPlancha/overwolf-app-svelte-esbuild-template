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
          this.onGameInfoUpdated = (update2) => {
            if (!update2 || !update2.gameInfo) {
              return;
            }
            if (!update2.runningChanged && !update2.gameChanged) {
              return;
            }
            if (update2.gameInfo.isRunning) {
              if (this._delegate.onGameStarted) {
                this._delegate.onGameStarted(update2.gameInfo);
              }
            } else {
              if (this._delegate.onGameEnded) {
                this._delegate.onGameEnded(update2.gameInfo);
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
      var OWWindow4 = class {
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
      exports.OWWindow = OWWindow4;
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

  // node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  var src_url_equal_anchor;
  function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
      src_url_equal_anchor = document.createElement("a");
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
  }
  var is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function element(name) {
    return document.createElement(name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_data(text2, data) {
    data = "" + data;
    if (text2.wholeText !== data)
      text2.data = data;
  }
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  var seen_callbacks = /* @__PURE__ */ new Set();
  var flushidx = 0;
  function flush() {
    const saved_component = current_component;
    do {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = /* @__PURE__ */ new Set();
  var outros;
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block))
        return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2)
            block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
          on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance4, create_fragment4, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: null,
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance4 ? instance4(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment4 ? create_fragment4($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };

  // src/assets/Header.svelte
  var import_dist = __toESM(require_dist(), 1);
  function create_else_block(ctx) {
    let button;
    let mounted;
    let dispose;
    return {
      c() {
        button = element("button");
        button.innerHTML = `<img src="img/window/restore.svg" alt="restore button" class="svelte-1dx64x8"/>`;
        attr(button, "id", "restoreButton");
        attr(button, "class", "svelte-1dx64x8");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        if (!mounted) {
          dispose = listen(button, "click", ctx[6]);
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(button);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block(ctx) {
    let button;
    let mounted;
    let dispose;
    return {
      c() {
        button = element("button");
        button.innerHTML = `<img src="img/window/maximize.svg" alt="maximize button" class="svelte-1dx64x8"/>`;
        attr(button, "id", "maximizeButton");
        attr(button, "class", "svelte-1dx64x8");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        if (!mounted) {
          dispose = listen(button, "click", ctx[5]);
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(button);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment(ctx) {
    let header;
    let img0;
    let img0_src_value;
    let t0;
    let h1;
    let t2;
    let button0;
    let t3;
    let t4;
    let button1;
    let setDrag_action;
    let mounted;
    let dispose;
    function select_block_type(ctx2, dirty) {
      if (!ctx2[2])
        return create_if_block;
      return create_else_block;
    }
    let current_block_type = select_block_type(ctx, -1);
    let if_block = current_block_type(ctx);
    return {
      c() {
        header = element("header");
        img0 = element("img");
        t0 = space();
        h1 = element("h1");
        h1.textContent = "Sample App / desktop window";
        t2 = space();
        button0 = element("button");
        button0.innerHTML = `<img src="img/window/minimize.svg" alt="minimize button" class="svelte-1dx64x8"/>`;
        t3 = space();
        if_block.c();
        t4 = space();
        button1 = element("button");
        button1.innerHTML = `<img src="img/window/maximize.svg" alt="maximize button" class="svelte-1dx64x8"/>`;
        if (!src_url_equal(img0.src, img0_src_value = ctx[0]))
          attr(img0, "src", img0_src_value);
        attr(img0, "alt", "header icon");
        attr(img0, "class", "svelte-1dx64x8");
        attr(h1, "class", "svelte-1dx64x8");
        attr(button0, "id", "minimizeButton");
        attr(button0, "class", "svelte-1dx64x8");
        attr(button1, "id", "closeButton");
        attr(button1, "class", "svelte-1dx64x8");
        attr(header, "id", "header");
        attr(header, "class", "svelte-1dx64x8");
      },
      m(target, anchor) {
        insert(target, header, anchor);
        append(header, img0);
        append(header, t0);
        append(header, h1);
        append(header, t2);
        append(header, button0);
        append(header, t3);
        if_block.m(header, null);
        append(header, t4);
        append(header, button1);
        if (!mounted) {
          dispose = [
            listen(button0, "click", ctx[4]),
            listen(button1, "click", ctx[7]),
            action_destroyer(setDrag_action = ctx[3].call(null, header))
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 1 && !src_url_equal(img0.src, img0_src_value = ctx2[0])) {
          attr(img0, "src", img0_src_value);
        }
        if_block.p(ctx2, dirty);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(header);
        if_block.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let { headerIconPath = "img/window/header_icon.svg" } = $$props;
    let { window: window2 } = $$props;
    let maximized;
    function setDrag(node) {
      window2.dragMove(node);
    }
    const click_handler = () => {
      window2.minimize();
    };
    const click_handler_1 = () => {
      window2.maximize();
    };
    const click_handler_2 = () => {
      window2.restore();
    };
    const click_handler_3 = () => {
      window2.close();
    };
    $$self.$$set = ($$props2) => {
      if ("headerIconPath" in $$props2)
        $$invalidate(0, headerIconPath = $$props2.headerIconPath);
      if ("window" in $$props2)
        $$invalidate(1, window2 = $$props2.window);
    };
    return [
      headerIconPath,
      window2,
      maximized,
      setDrag,
      click_handler,
      click_handler_1,
      click_handler_2,
      click_handler_3
    ];
  }
  var Header = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { headerIconPath: 0, window: 1 });
    }
  };
  var Header_default = Header;

  // src/In_game.svelte
  var import_dist3 = __toESM(require_dist(), 1);

  // src/assets/Counter.svelte
  function create_fragment2(ctx) {
    let button;
    let span;
    let t0;
    let t1;
    let mounted;
    let dispose;
    return {
      c() {
        button = element("button");
        span = element("span");
        t0 = text("Counter: ");
        t1 = text(ctx[0]);
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, span);
        append(span, t0);
        append(span, t1);
        if (!mounted) {
          dispose = listen(button, "click", ctx[1]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 1)
          set_data(t1, ctx2[0]);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(button);
        mounted = false;
        dispose();
      }
    };
  }
  function instance2($$self, $$props, $$invalidate) {
    let counter = 0;
    const click_handler = () => {
      $$invalidate(0, counter += 1);
    };
    return [counter, click_handler];
  }
  var Counter = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance2, create_fragment2, safe_not_equal, {});
    }
  };
  var Counter_default = Counter;

  // src/background.mts
  var import_dist2 = __toESM(require_dist(), 1);

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
      this.desktopWindow = new import_dist2.OWWindow("desktop");
      this.inGameWindow = new import_dist2.OWWindow("in-game");
      this.gameListener = new import_dist2.OWGameListener({
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
        import_dist2.OWGames.getRunningGameInfo().then((gameRunning) => {
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

  // src/In_game.svelte
  function create_fragment3(ctx) {
    let header;
    let t0;
    let main;
    let h1;
    let t2;
    let counter;
    let current;
    header = new Header_default({
      props: { window: ctx[0] }
    });
    counter = new Counter_default({});
    return {
      c() {
        create_component(header.$$.fragment);
        t0 = space();
        main = element("main");
        h1 = element("h1");
        h1.textContent = "Hello from In_game!";
        t2 = space();
        create_component(counter.$$.fragment);
        attr(main, "class", "svelte-1m2kz86");
      },
      m(target, anchor) {
        mount_component(header, target, anchor);
        insert(target, t0, anchor);
        insert(target, main, anchor);
        append(main, h1);
        append(main, t2);
        mount_component(counter, main, null);
        current = true;
      },
      p: noop,
      i(local) {
        if (current)
          return;
        transition_in(header.$$.fragment, local);
        transition_in(counter.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(header.$$.fragment, local);
        transition_out(counter.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(header, detaching);
        if (detaching)
          detach(t0);
        if (detaching)
          detach(main);
        destroy_component(counter);
      }
    };
  }
  function instance3($$self) {
    const appController = AppController.getInstance();
    let desktopWindow = appController.desktopWindow;
    return [desktopWindow];
  }
  var In_game = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance3, create_fragment3, safe_not_equal, {});
    }
  };
  var In_game_default = In_game;

  // temp/index.In_game.svelte.ts
  var app = new In_game_default({
    target: document.getElementById("app")
  });
  var index_In_game_svelte_default = app;
})();
