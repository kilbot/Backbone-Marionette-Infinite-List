var FilterBehavior =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Mn = __webpack_require__(1);
	var _ = __webpack_require__(2);

	module.exports = Mn.Behavior.extend({

	  ui: {
	    search: 'input[type=search]',
	    clear : '*[data-action="clear"]',
	    sync  : '*[data-action="sync"]'
	  },

	  events: {
	    'keyup @ui.search': 'search',
	    'click @ui.clear' : 'clear',
	    'click @ui.sync'  : 'sync'
	  },

	  /**
	   *
	   */
	  search: function(){
	    var value = this.ui.search.val();
	    if( value === '' ){
	      return this.clear();
	    }
	    this.query(value);
	  },

	  query: _.debounce( function(value){
	    this.view.collection.setFilter('search', value);
	  }, 149),

	  sync: function(e){
	    if(e) { e.preventDefault(); }
	    this.view.collection.fullSync();
	  },

	  clear: function(e) {
	    if(e) { e.preventDefault(); }
	    this.view.collection.removeFilter('search');
	    this.ui.search.val('');
	  }

	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = Marionette;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = _;

/***/ }
/******/ ]);