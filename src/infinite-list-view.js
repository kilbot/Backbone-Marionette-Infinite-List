var Mn = require('backbone.marionette');
var hbs = require('handlebars');
var Tmpl = require('./infinite-list-view.hbs');
var _ = require('lodash');

module.exports = Mn.CompositeView.extend({
  template: hbs.compile(Tmpl),

  onShow: function () {
    this.container = this.$el.parent()[0];
    this.$el.parent().on('scroll', _.throttle(this.onScroll.bind(this), 1000/60));
    this.appendNextPage();
  },

  onScroll: function(){
    if(!this.loading && this.triggerEvent()){
      this.appendNextPage();
    }
  },

  /**
   * Is user scrolling down && overflow < 100
   * - added clientHeight check to prevent false trigger when div not drawn
   * @returns {boolean}
   */
  triggerEvent: function () {
    var sH = this.container.scrollHeight,
        cH = this.container.clientHeight,
        sT = this.container.scrollTop;
    var down = sT > (this._sT || 0);
    this._sT = sT;

    return down && (sH - cH - sT < 100);
  },

  appendNextPage: function () {
    var self = this;
    this.startLoading();
    this.collection.appendNextPage()
      .then(function () {
        self.endLoading();
      })
      .catch(function (err) {
        console.log(err);
      });
  },

  startLoading: function () {
    this.loading = true;
    this.$el.addClass('loading');
  },

  endLoading: function () {
    this.loading = false;
    this.$el.removeClass('loading');
  }
});