/*!
 * these code is 'demo' purpose only. not yet fully tested!
 */
(function ($) {
  'use strict';

  /**
   * simple slider control.
   *
   * @param {*} el
   * @param {*} opts
   * @param {string} [opts.orientation='horizontal']  'vertical' is NOT yet supported!
   * @param {number} [opts.min=0]
   * @param {number} [opts.max=100]
   * @param {number} [opts.step=0] 0 for auto. (max - min) / 10
   * @param {number} [opts.value=0]
   * @constructor
   */
  function Slider(el, opts) {
    this.el = $(el);
    this.init(opts);
  }

  Slider.prototype._updateModel = function () {
    var pos = this._knob.position();
    var value;
    switch (this.opts.orientation) {
      case 'vertical':
        value = pos.top / (this._bar.height() - this._knob.height()) * (this._max - this._min) + this._min;
        break;
      default: //case 'horizontal'
        value = pos.left / (this._bar.width() - this._knob.width()) * (this._max - this._min) + this._min;
        break;
    }
    this._setValue(value);
  };

  Slider.prototype._updateView = function () {
    switch (this.opts.orientation) {
      case 'vertical':
        var y = (this._value - this._min) * (this._bar.height() - this._knob.height()) / (this._max - this._min);
        this._knob.css('top', Math.floor(y) + 'px');
        break;
      default: //case 'horizontal':
        var x = (this._value - this._min) * (this._bar.width() - this._knob.width()) / (this._max - this._min);
        this._knob.css('left', Math.floor(x) + 'px');
        break;
    }
  };

  Slider.prototype._setValue = function (value) {
    this._value = Math.min(Math.max(value, this._min), this._max);
    this.el.data('value', this._value).prop('value', this._value).trigger('slide', this._value);
    //this._updateView();
  };

  Slider.prototype._setKnobPos = function (pos) {
    switch (this.opts.orientation) {
      case 'vertical':
        var y = Math.min(Math.max(pos - (this._knob.height() / 2), 0), this._bar.height() - this._knob.height());
        this._knob.css('top', Math.floor(y) + 'px');
        break;
      default: //case 'horizontal'
        var x = Math.min(Math.max(pos - (this._knob.width() / 2), 0), this._bar.width() - this._knob.width());
        this._knob.css('left', Math.floor(x) + 'px');
        break;
    }
    //this._updateModel();
  };

  Slider.prototype._knob_onmousedown = function (event) {
    this._dragging = true;
    this._dragX = event.pageX;
    this._dragY = event.pageY;
    $(document).on({
      'mousemove': $.proxy(this._knob_onmousemove, this),
      'mouseup': $.proxy(this._knob_onmouseup, this)
    });
    return false;
  };

  Slider.prototype._knob_onmousemove = function (event) {
    switch (this.opts.orientation) {
      case 'vertical':
        this._setKnobPos(event.pageY - this._bar.offset().top);
        break;
      default: //case 'horizontal'
        this._setKnobPos(event.pageX - this._bar.offset().left);
        break;
    }
    this._updateModel();
    return false;
  };

  Slider.prototype._knob_onmouseup = function (event) {
    if (this._dragging) {
      this._dragging = false;
      $(document).off({
        'mousemove': this._knob_onmousemove,
        'mouseup': this._knob_onmouseup
      });
    }
    return false;
  };

  Slider.prototype._bar_onclick = function (event) {
    if (event.currentTarget === event.target) {
      switch (this.opts.orientation) {
        case 'vertical':
          this._setKnobPos(event.pageY - this._bar.offset().top);
          break;
        default: //case 'horizontal'
          this._setKnobPos(event.pageX - this._bar.offset().left);
          break;
      }
      this._updateModel();
    }
    return false;
  };

  Slider.prototype._decr_onclick = function (event) {
    this._setValue(this._value - this._step);
    this._updateView();
    return false;
  };

  Slider.prototype._incr_onclick = function (event) {
    this._setValue(this._value + this._step);
    this._updateView();
    return false;
  };

  Slider.prototype.getValue = function () {
    return this._value;
  };

  Slider.prototype.setValue = function (value) {
    this._setValue(value);
    this._updateView();
  };

  Slider.prototype.init = function (opts) {
    this.opts = $.extend({}, Slider.DEFAULTS, opts);

    this.el.empty().html(this.opts.template);

    this._bar = this.el.find('.slider-bar');
    this._knob = this.el.find('.slider-knob');
    this._decr = this.el.find('.slider-decr');
    this._incr = this.el.find('.slider-incr');

    this._knob.on('mousedown', $.proxy(this._knob_onmousedown, this));
    this._bar.on('click', $.proxy(this._bar_onclick, this));
    this._decr.on('click', $.proxy(this._decr_onclick, this));
    this._incr.on('click', $.proxy(this._incr_onclick, this));

    this._dragging = false;
    this._dragX = 0;
    this._dragY = 0;

    this._min = this.opts.min;
    this._max = this.opts.max;
    // default step: 1/10 of range
    this._step = this.opts.step || ((this._max - this._min) / 10);

    //this._setValue(this.opts.value);
    this._value = this.opts.value;

    this._updateView();
  };

  Slider.prototype.destroy = function () {
    this.el.removeData('slider').children().remove();
  };

  Slider.DEFAULTS = {
    template: '<div class="slider-decr"></div><div class="slider-bar"><div class="slider-knob"></div></div><div class="slider-incr"></div>',
    orientation: 'horizontal',
    min: 0,
    max: 100,
    step: 0, // 0 for auto = (max - min) / 10
    value: 0
  };

  //
  // jquery plugin boilerplate
  //

  var sliderOld = $.fn.slider;

  $.fn.slider = function (opts) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('slider');
      if (!data) {
        data = new Slider(this, $.extend({}, $this.data(), (typeof opts === 'object') && opts));
        $this.data('slider', data);
      }
      if (typeof opts == 'string') {
        data[opts].apply(data, args);
      }
    });
  };

  $.fn.slider.Constructor = Slider;

  $.fn.slider.noConflict = function () {
    $.fn.slider = sliderOld;
    return this;
  };

}(jQuery));
