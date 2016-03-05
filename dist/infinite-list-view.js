var InfiniteListView =
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
	var hbs = __webpack_require__(2);
	var Tmpl = __webpack_require__(3);

	module.exports = Mn.CompositeView.extend({
	  template: hbs.compile(Tmpl),

	  onShow: function(){
	    this.container = this.$el.parent()[0];
	    this.$el.parent().scroll( _.throttle( this.onScroll, 250 ) );
	    this.onScroll();
	  },

	  onScroll: function(){
	    if(this.getOverflow() < 100){
	      this.loadMore();
	    }
	  },

	  /**
	   * returns overflow at bottom in px
	   * - added clientHeight check to prevent false trigger when div not drawn
	   * @returns {number}
	   */
	  getOverflow: function(){
	    var sH = this.container.scrollHeight,
	        cH = this.container.clientHeight,
	        sT = this.container.scrollTop;
	    return sH - cH - sT;
	  },

	  loadMore: function() {
	    this.collection.fetch({ remote: true });
	  }
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = Marionette;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = Handlebars;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "<div></div>\n<ul></ul>\n<div>Loading ...</div>"

/***/ }
/******/ ]);