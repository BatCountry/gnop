/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/coord.ts":
/*!*************************!*\
  !*** ./src/ts/coord.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Coord = void 0;\nclass Coord {\n    constructor(x, y) {\n        this.x = x;\n        this.y = y;\n    }\n}\nexports.Coord = Coord;\n\n\n//# sourceURL=webpack://gnop/./src/ts/coord.ts?");

/***/ }),

/***/ "./src/ts/digits.ts":
/*!**************************!*\
  !*** ./src/ts/digits.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.digit = void 0;\nconst DIGITS = {\n    '1': [[2, 0, 1, 6]],\n    '2': [[0, 0, 3, 1], [0, 2, 3, 1], [0, 5, 3, 1], [2, 0, 1, 3], [0, 2, 1, 3]],\n    '3': [[0, 0, 3, 1], [0, 2, 3, 1], [0, 5, 3, 1], [2, 0, 1, 6]],\n    '4': [[0, 0, 1, 3], [2, 0, 1, 6], [0, 2, 3, 1]],\n    '5': [[0, 0, 3, 1], [0, 2, 3, 1], [0, 5, 3, 1], [0, 0, 1, 3], [2, 2, 1, 4]],\n    '6': [[0, 0, 3, 1], [0, 2, 3, 1], [0, 5, 3, 1], [0, 0, 1, 6], [2, 2, 1, 4]],\n    '7': [[0, 0, 3, 1], [2, 0, 1, 6]],\n    '8': [[0, 0, 3, 1], [0, 2, 3, 1], [0, 5, 3, 1], [0, 0, 1, 6], [2, 0, 1, 6]],\n    '9': [[0, 0, 3, 1], [0, 2, 3, 1], [2, 0, 1, 6], [0, 0, 1, 3]],\n    '0': [[0, 0, 1, 5], [0, 0, 3, 1], [2, 0, 1, 5], [0, 5, 3, 1]]\n};\nfunction digit(ctx, n, xOffset) {\n    for (let i of DIGITS[n]) {\n        let [sx, sy, sw, sh] = i;\n        let lw = ctx.lineWidth;\n        ctx.lineWidth = 0;\n        ctx.fillRect(xOffset + sx, 1 + sy, sw, sh);\n        ctx.lineWidth = lw;\n    }\n}\nexports.digit = digit;\n\n\n//# sourceURL=webpack://gnop/./src/ts/digits.ts?");

/***/ }),

/***/ "./src/ts/gamestate.ts":
/*!*****************************!*\
  !*** ./src/ts/gamestate.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.GameState = exports.PADDLE_HEIGHT = void 0;\nconst coord_1 = __webpack_require__(/*! ./coord */ \"./src/ts/coord.ts\");\nexports.PADDLE_HEIGHT = 20;\nclass GameState {\n    constructor() {\n        this.leftScore = 0;\n        this.rightScore = 0;\n        this.ballPos = new coord_1.Coord(0, 0);\n        this.leftPos = new coord_1.Coord(0, 0);\n        this.rightPos = new coord_1.Coord(0, 0);\n        this.reset();\n    }\n    reset() {\n        this.leftScore = 0;\n        this.rightScore = 0;\n        this.ballPos = new coord_1.Coord(0, 50);\n        this.leftPos = new coord_1.Coord(0, 50 - exports.PADDLE_HEIGHT / 2);\n        this.rightPos = new coord_1.Coord(99, 50 - exports.PADDLE_HEIGHT / 2);\n    }\n}\nexports.GameState = GameState;\n\n\n//# sourceURL=webpack://gnop/./src/ts/gamestate.ts?");

/***/ }),

/***/ "./src/ts/index.ts":
/*!*************************!*\
  !*** ./src/ts/index.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst playfield_1 = __webpack_require__(/*! ./playfield */ \"./src/ts/playfield.ts\");\nconst MAXFPS = 3;\nfunction doAnimationFrame(callback) {\n    requestAnimationFrame(callback);\n    setTimeout(() => {\n        doAnimationFrame(callback);\n    }, 1000 / MAXFPS);\n}\nfunction waitForPlayfield() {\n    const pf = '#playfield';\n    return new Promise(resolve => {\n        if (document.querySelector(pf)) {\n            return resolve(document.querySelector(pf));\n        }\n        const observer = new MutationObserver(mutations => {\n            if (document.querySelector(pf)) {\n                resolve(document.querySelector(pf));\n                observer.disconnect();\n            }\n        });\n        observer.observe(document.body, {\n            childList: true,\n            subtree: true\n        });\n    });\n}\nclass Gnop {\n    constructor() {\n        this.game = new playfield_1.Playfield();\n    }\n    doGeometry(canvas, ctx) {\n        // grab the rendering context if we don't have it\n        while (!ctx)\n            ctx = canvas.getContext(\"2d\");\n        // set viewport dimensions\n        canvas.width = window.innerWidth;\n        canvas.height = window.innerHeight;\n        ctx.scale(canvas.width / 100, canvas.height / 100);\n        // set some global canvas rendering style values, could probably have done this in CSS\n        ctx.lineWidth = .2;\n        ctx.strokeStyle = 'white';\n        ctx.fillStyle = 'white';\n        return ctx;\n    }\n    init() {\n        waitForPlayfield().then((canvas) => {\n            // fix the canvas geometry to match the window client rect\n            let ctx = this.doGeometry(canvas);\n            // register an onresize event for fixing the client rect if the window's resized\n            this.doGeometry.bind(this);\n            window.onresize = () => {\n                this.doGeometry(canvas, ctx);\n            };\n            let memoized = this.game.frameCallback(ctx);\n            // start the frame timer\n            doAnimationFrame(memoized);\n        });\n    }\n}\nexports[\"default\"] = Gnop;\nwindow.onload = () => {\n    let gnop = new Gnop();\n    gnop.init();\n};\n\n\n//# sourceURL=webpack://gnop/./src/ts/index.ts?");

/***/ }),

/***/ "./src/ts/playfield.ts":
/*!*****************************!*\
  !*** ./src/ts/playfield.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Playfield = void 0;\nconst gamestate_1 = __webpack_require__(/*! ./gamestate */ \"./src/ts/gamestate.ts\");\nconst digits_1 = __webpack_require__(/*! ./digits */ \"./src/ts/digits.ts\");\nclass Playfield {\n    constructor() {\n        this.gameState = new gamestate_1.GameState();\n    }\n    midpoint_line(ctx) {\n        let hw = 50; // left position is half court width\n        let h = 100; // height of canvas\n        ctx.clearRect(49, 0, 2, 100);\n        ctx.beginPath(); // we're drawing a line from h=0 to h=100%\n        ctx.setLineDash([1, 2.25]);\n        ctx.moveTo(hw, 0); // start at half width, top\n        ctx.lineTo(hw, h); // draw to half width, bottom\n        // finish the path and draw it\n        ctx.closePath();\n        ctx.stroke();\n    }\n    paddles(ctx) {\n        // wipe the paddle row clear\n        ctx.clearRect(0, 0, 1, 100);\n        ctx.clearRect(99, 0, 1, 100);\n        ctx.fillRect(this.gameState.leftPos.x, this.gameState.leftPos.y, 1, gamestate_1.PADDLE_HEIGHT);\n        ctx.fillRect(this.gameState.rightPos.x, this.gameState.rightPos.y, 1, gamestate_1.PADDLE_HEIGHT);\n    }\n    score(ctx) {\n        const digit_offset = 4;\n        ctx.clearRect(0, 0, 100, 10);\n        let s = '' + this.gameState.leftScore;\n        let left = 50 - digit_offset;\n        while (s != '') {\n            (0, digits_1.digit)(ctx, s.slice(-1), left);\n            left -= digit_offset;\n            s = s.slice(0, -1);\n        }\n        s = '' + this.gameState.rightScore;\n        left = 51;\n        while (s != '') {\n            (0, digits_1.digit)(ctx, s.slice(0, 1), left);\n            left += digit_offset;\n            s = s.slice(1);\n        }\n    }\n    frame(ctx, elapsed) {\n        this.score(ctx);\n        this.paddles(ctx);\n        // TODO: simulate and draw the ball\n        // draw the center court line. passing context so we don't need to put null guards everywhere\n        this.midpoint_line(ctx);\n    }\n    frameCallback(ctx) {\n        this.frame.bind(this);\n        return (elapsed) => {\n            this.frame(ctx, elapsed);\n        };\n    }\n}\nexports.Playfield = Playfield;\n\n\n//# sourceURL=webpack://gnop/./src/ts/playfield.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/ts/index.ts");
/******/ 	
/******/ })()
;