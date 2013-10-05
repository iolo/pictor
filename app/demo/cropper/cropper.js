/*!
 * these code is 'demo' purpose only. not yet fully tested!
 */

(function ($) {
  'use strict';

  /**
   * simple image cropper control.
   *
   * @param {*} el
   * @param {*} opts
   * @param {number} [opts.w=0] crop width. 0 for auto. mask width / 3
   * @param {number} [opts.h=0] crop height. 0 for auto. mask height / 3
   * @param {string} [opts.src] image url
   * @constructor
   */
  function Cropper(el, opts) {
    this.el = $(el);
    this.init(opts);
  }

  Cropper.prototype._updateModel = function () {
    var nw = this._image.width();
    var nh = this._image.height();
    var w = this._crop.width();
    var h = this._crop.height();
    var pos = this._image.position();
    var x = -pos.left + parseInt(this._crop.css('border-left-width'), 10);
    var y = -pos.top + parseInt(this._crop.css('border-top-width'), 10);
    this._setValue({nw: nw, nh: nh, x: x, y: y, w: w, h: h});
  };

  Cropper.prototype._updateView = function () {
    if (this._value.w !== this._crop.width() || this._value.h !== this._crop.height()) {
      var marginWidth = this._mask.width() - this._value.w;
      var marginLeft = marginWidth / 2;
      var marginRight = marginWidth - marginLeft;

      var marginHeight = this._mask.height() - this._value.h;
      var marginTop = marginHeight / 2;
      var marginBottom = marginHeight - marginTop;

      this._crop.css({
        'border-right-width': Math.floor(marginRight) + 'px',
        'border-left-width': Math.floor(marginLeft) + 'px',
        'border-top-width': Math.floor(marginTop) + 'px',
        'border-bottom-width': Math.floor(marginBottom) + 'px'
      });
      //assert(this._value.w === this._crop.width());
      //assert(this._value.h === this._crop.height());
    }

    // image not yet loaded... load it now!
    if (this._src && this._src !== this._image.attr('src')) {
      this._image.attr('src', this._src);
      // finally _updateView() will be called from _image_onload()
      return;
    }

    this._image.css({
      left: Math.floor(parseInt(this._crop.css('border-left-width'), 10) - this._value.x) + 'px',
      top: Math.floor(parseInt(this._crop.css('border-top-width'), 10) - this._value.y) + 'px',
      width: Math.floor(this._value.nw) + 'px',
      height: Math.floor(this._value.nh) + 'px'
    });
  };

  Cropper.prototype._setValue = function (value) {
    this._value.nw = Math.floor(value.nw);
    this._value.nh = Math.floor(value.nh);
    this._value.x = Math.floor(Math.min(Math.max(0, value.x), value.nw - value.w));
    this._value.y = Math.floor(Math.min(Math.max(0, value.y), value.nh - value.h));
    this._value.w = value.w;
    this._value.h = value.h;
    this.el.prop('value', this._value).data('value', this._value).trigger('crop', this._value);
    //this._updateView();
  };

  Cropper.prototype._setImagePos = function (x, y) {
    var minX = -this._value.nw + (this._mask.width() - parseInt(this._crop.css('border-right-width'), 10));
    var maxX = parseInt(this._crop.css('border-left-width'), 10);
    var minY = -this._value.nh + (this._mask.height() - parseInt(this._crop.css('border-bottom-width'), 10));
    var maxY = parseInt(this._crop.css('border-top-width'), 10);
    this._image.css({
      left: Math.floor(Math.min(Math.max(x, minX), maxX)) + 'px',
      top: Math.floor(Math.min(Math.max(y, minY), maxY)) + 'px'
    });
    //this._updateModel();
  };

  Cropper.prototype._mask_mousedown = function (event) {
    this._dragging = true;
    this._dragX = event.pageX;
    this._dragY = event.pageY;
    $(document).on({
      'mousemove': $.proxy(this._mask_onmousemove, this),
      'mouseup': $.proxy(this._mask_onmouseup, this)
    });
    return false;
  };

  Cropper.prototype._mask_onmousemove = function (event) {
    var pos = this._image.position();
    this._setImagePos(pos.left + event.pageX - this._dragX, pos.top + event.pageY - this._dragY);
    this._updateModel();
    this._dragX = event.pageX;
    this._dragY = event.pageY;
    return false;
  };

  Cropper.prototype._mask_onmouseup = function (event) {
    this._dragging = false;
    $(document).off({
      'mousemove': this._mask_onmousemove,
      'mouseup': this._mask_onmouseup
    });
    return false;
  };

  Cropper.prototype._slider_onslide = function (event, value) {
    var nw = this._image.prop('naturalWidth') * value;
    var nh = this._image.prop('naturalHeight') * value;
    var w = this._crop.width();
    var h = this._crop.height();
    var x = (this._value.x + (w / 2)) * nw / this._value.nw - (w / 2);
    var y = (this._value.y + (h / 2)) * nh / this._value.nh - (h / 2);
    this._setValue({nw: nw, nh: nh, x: x, y: y, w: w, h: h});
    this._updateView();
    return false;
  };

  Cropper.prototype._image_onload = function () {
    var nw = this._image.prop('naturalWidth');
    var nh = this._image.prop('naturalHeight');
    var w = this._crop.width();
    var h = this._crop.height();
    var x = (nw - w) / 2;
    var y = (nh - h) / 2;
    this._value = {nw: nw, nh: nh, x: x, y: y, w: w, h: h};

    // initial scale -> fit to mask
    // min scale -> fit to crop
    var scale, min;
    if (nw > nh) { // landscape
      scale = this._mask.height() / nh;
      min = h / nh;
    } else { // portrait
      scale = this._mask.width() / nw;
      min = w / nw;
    }


    this._slider
      .slider('destroy')
      .slider({value: scale, min: min, max: 2.0});

    this._slider_onslide(null, scale);
    // finally, _updateView() will be called from _slider_onslide()
  };

  Cropper.prototype.getValue = function () {
    return this._value;
  };

  Cropper.prototype.setValue = function (value) {
    this._setValue($.extend(this._value, value));
    this._updateView();
  };

  Cropper.prototype.init = function (opts) {
    this.opts = $.extend({}, Cropper.DEFAULTS, opts);

    this.el.empty().html(this.opts.template);

    this._mask = this.el.find('.cropper-mask');
    this._image = this.el.find('.cropper-image');
    this._crop = this.el.find('.cropper-crop');
    this._slider = this.el.find('.slider');

    this._mask.on('mousedown', $.proxy(this._mask_mousedown, this));
    this._image.on('load', $.proxy(this._image_onload, this));
    this._slider.on('slide', $.proxy(this._slider_onslide, this));

    this._dragging = false;
    this._dragX = 0;
    this._dragY = 0;

    this._value = {w: this.opts.w, h: this.opts.h};
    this._src = this.opts.src;

    this._updateView();
  };

  Cropper.prototype.destroy = function () {
    this.el.removeData('cropper').children().remove();
  };

  Cropper.DEFAULTS = {
    template: '<div class="cropper-mask"><img class="cropper-image" /><div class="cropper-crop"></div></div><div class="slider"></div>',
    w: 100,
    h: 100,
    src: ''
  };

  //
  // jquery plugin boilerplate
  //

  var cropperOld = $.fn.cropper;

  $.fn.cropper = function (opts) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('cropper');
      if (!data) {
        data = new Cropper(this, $.extend({}, $this.data(), (typeof opts === 'object') && opts));
        $this.data('cropper', data);
      }
      if (typeof opts === 'string') {
        data[opts].apply(data, args);
      }
    });
  };

  $.fn.cropper.Constructor = Cropper;

  $.fn.cropper.noConflict = function () {
    $.fn.cropper = cropperOld;
    return this;
  };

}(jQuery));
