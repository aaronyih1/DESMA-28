/******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};

/******/  // The require function
/******/  function __webpack_require__(moduleId) {

/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;

/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      exports: {},
/******/      id: moduleId,
/******/      loaded: false
/******/    };

/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/    // Flag the module as loaded
/******/    module.loaded = true;

/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }


/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;

/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;

/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";

/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {


  // Browser distrubution of the A-Frame component.
  (function (AFRAME) {
    if (!AFRAME) {
      console.error('Component attempted to register before AFRAME was available.');
      return;
    }

    (AFRAME.aframeCore || AFRAME).registerComponent('no-click', __webpack_require__(1));

  }(window.AFRAME));
/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {



// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

AFRAME.registerComponent('no-click-look-controls', {
  schema: {
    enabled: { default: true },
    maxpitch: {default: PI_2},
    maxyaw: {default: PI_2 * 6},

    init: function () {
      console.log("THIS IS WOKRING ");
      var scene = this.el.sceneEl;
      this.setupMouseControls();
      this.setupHMDControls();
      this.attachEventListeners();
      scene.addBehavior(this);
      this.previousPosition = new THREE.Vector3();
      this.deltaPosition = new THREE.Vector3();
    },

    setupMouseControls: function () {
      this.canvasEl = document.querySelector('a-scene').canvas;
      // The canvas where the scene is painted
      this.hovering = false;
      this.pitchObject = new THREE.Object3D();
      this.yawObject = new THREE.Object3D();
      this.yawObject.position.y = 10;
      this.yawObject.add(this.pitchObject);
    },

    setupHMDControls: function () {
      this.dolly = new THREE.Object3D();
      this.euler = new THREE.Euler();
      this.controls = new THREE.VRControls(this.dolly);
      this.zeroQuaternion = new THREE.Quaternion();
    },

    attachEventListeners: function () {
      var canvasEl = document.querySelector('a-scene');

      // Mouse Events
      canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
      canvasEl.addEventListener('mouseout', this.onMouseOut.bind(this), true);
      canvasEl.addEventListener('mouseover', this.onMouseOver.bind(this), true);
      // Touch events
      canvasEl.addEventListener('touchstart', this.onTouchStart.bind(this));
      canvasEl.addEventListener('touchmove', this.onTouchMove.bind(this));
      canvasEl.addEventListener('touchend', this.onTouchEnd.bind(this));
    },

    update: function () {
      if (!this.data.enabled) { return; }
      this.controls.update();
      this.updateOrientation();
      this.updatePosition();
    },

    updateOrientation: (function () {
      var hmdEuler = new THREE.Euler();
      hmdEuler.order = 'YXZ';
      return function () {
        var pitchObject = this.pitchObject;
        var yawObject = this.yawObject;
        var hmdQuaternion = this.calculateHMDQuaternion();
        hmdEuler.setFromQuaternion(hmdQuaternion);
        this.el.setAttribute('rotation', {
          x: THREE.Math.radToDeg(hmdEuler.x) + THREE.Math.radToDeg(pitchObject.rotation.x),
          y: THREE.Math.radToDeg(hmdEuler.y) + THREE.Math.radToDeg(yawObject.rotation.y),
          z: THREE.Math.radToDeg(hmdEuler.z)
        });
      };
    })(),

    calculateHMDQuaternion: (function () {
      var hmdQuaternion = new THREE.Quaternion();
      return function () {
        var dolly = this.dolly;
        if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
          this.zeroOrientation();
          this.zeroed = true;
        }
        hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
        return hmdQuaternion;
      };
    })(),

    updatePosition: (function () {
      var position = new THREE.Vector3();
      var quaternion = new THREE.Quaternion();
      var scale = new THREE.Vector3();
      return function () {
        var el = this.el;
        var deltaPosition = this.calculateDeltaPosition();
        var currentPosition = el.getComputedAttribute('position');
        this.el.object3D.matrixWorld.decompose(position, quaternion, scale);
        deltaPosition.applyQuaternion(quaternion);
        el.setAttribute('position', {
          x: currentPosition.x + deltaPosition.x,
          y: currentPosition.y + deltaPosition.y,
          z: currentPosition.z + deltaPosition.z
        });
      };
    })(),

    calculateDeltaPosition: function () {
      var dolly = this.dolly;
      var deltaPosition = this.deltaPosition;
      var previousPosition = this.previousPosition;
      deltaPosition.copy(dolly.position);
      deltaPosition.sub(previousPosition);
      previousPosition.copy(dolly.position);
      return deltaPosition;
    },

    updateHMDQuaternion: (function () {
      var hmdQuaternion = new THREE.Quaternion();
      return function () {
        var dolly = this.dolly;
        this.controls.update();
        if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
          this.zeroOrientation();
          this.zeroed = true;
        }
        hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
        return hmdQuaternion;
      };
    })(),

    zeroOrientation: function () {
      var euler = new THREE.Euler();
      euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
      // Cancel out roll and pitch. We want to only reset yaw
      euler.z = 0;
      euler.x = 0;
      this.zeroQuaternion.setFromEuler(euler);
    },

    getMousePosition: function(event) {
      console.log(event);
      var canvasEl = this.canvasEl;
      var rect = canvasEl.getBoundingClientRect();

      // Returns a value from -100 to 100 for X and Y representing the percentage of the max-yaw and max-pitch from the center of the canvas
      // -100 is far left or top, 100 is far right or bottom
      return {x: -2 * (50 - event.clientX - rect.left), y: -2 * (50 - event.clientY - rect.top)};
    },

    onMouseMove: function (event) {
      console.log(event);
      var pos = getMousePosition(event);
      var x = pos.x;
      var y = pos.y;
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;

      if (!this.hovering || !this.data.enabled) { return; }

      yawObject.rotation.y = this.maxyaw * x;
      pitchObject.rotation.x = this.maxpitch * y;
    },

    onMouseOver: function (event) {
      console.log(event);
      this.hovering = true;
    },

    onMouseOut: function (event) {
      console.log(event);
      this.hovering = false;
    },

    onTouchStart: function (e) {
      console.log(e);
      if (e.touches.length !== 1) { return; }
      this.touchStart = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
      this.touchStarted = true;
    },

    onTouchMove: function (e) {
      console.log(e);
      var deltaY;
      var yawObject = this.yawObject;
      if (!this.touchStarted) { return; }
      deltaY = 2 * Math.PI * (e.touches[0].pageX - this.touchStart.x) / this.canvasEl.clientWidth;
      // Limits touch orientaion to to yaw (y axis)
      yawObject.rotation.y -= deltaY * 0.5;
      this.touchStart = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
    },

    onTouchEnd: function () {
      this.touchStarted = false;
    }
});