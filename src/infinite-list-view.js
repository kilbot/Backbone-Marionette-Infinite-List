var Mn = require('backbone.marionette');
var _ = require('lodash');

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