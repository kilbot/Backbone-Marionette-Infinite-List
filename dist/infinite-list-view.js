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
	var _ = __webpack_require__(2);

	module.exports = Mn.CompositeView.extend({
	  _page: 1,

	  className: 'list-infinite',

	  template: function(){
	    return '<div></div><ul></ul><div><i class="icon-spinner"></i></div>';
	  },

	  constructor: function(){
	    Mn.CompositeView.apply(this, arguments);

	    this.on('show', function(){
	      this.container = this.$el.parent()[0];
	      this.$el.parent().on('scroll', _.throttle(this.onScroll.bind(this), 1000/60));
	    });

	    this.listenTo(this.collection, {
	      request : this.startLoading,
	      sync    : this.endLoading
	    });
	  },

	  onScroll: function(){
	    if(!this.loading && this.collection.length < this.collection.db.length && this.triggerEvent()){
	      this.appendNextPage();
	    }
	  },

	  triggerEvent: function () {
	    var sH = this.container.scrollHeight,
	        cH = this.container.clientHeight,
	        sT = this.container.scrollTop;
	    var down = sT > (this._sT || 0);
	    this._sT = sT;
	    return down ? sH - cH - sT < 100 : sH - cH - sT === 0;
	  },

	  appendNextPage: function () {
	    var data = {
	      page: ++this._page,
	    };

	    if(this.collection.hasFilters()){
	      data.filter = this.collection.getFilterOptions();
	    }

	    return this.collection.fetch({
	      remove: false,
	      data: data,
	      success: function(self, response, options){
	        console.log(options);
	      }
	    });
	  },

	  hasNextPage: function () {

	  },

	  startLoading: function () {
	    this.loading = true;
	    this.$el.addClass('loading');
	  },

	  endLoading: function () {
	    this.loading = false;
	    this.$el.removeClass('loading');
	    this.onScroll();
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