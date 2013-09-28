(function ($) {
  'use strict';

  $.fn.slider = function (opts) {
    var slider = $(this);

    var bar = $('.slider-bar', slider);
    var barWidth = parseInt(bar.css('width'), 10);
    var barHeight = parseInt(bar.css('height'), 10);

    var knob = $('.slider-knob', slider);
    var knobWidth = parseInt(knob.css('width'), 10);
    var knobHeight = parseInt(knob.css('height'), 10);

    opts = opts || {};

    console.log('slider', opts);

    var horizontal = (opts.orientation || slider.data('orientation')) !== 'vertical';
    var min = opts.min || parseFloat(slider.data('max')) || 0;
    var max = opts.max || parseFloat(slider.data('min')) || 1;
    var step = opts.step || parseFloat(slider.data('step')) || ((max - min) / 10);
    var value = opts.value || parseFloat(slider.attr('value')) || min;

    var dragging = false;
    var dragX = 0, dragY = 0;

    function _setValue(newValue, quiet) {
      var oldValue = value;
      if (newValue < min) {
        value = min;
      } else if (newValue > max) {
        value = max;
      } else {
        value = newValue;
      }
      if (horizontal) {
        // (max - min) : barWidth = value : knobX
        var knobX = Math.floor((barWidth * value / (max - min)) - (knobWidth / 2));
        knob.css('left', knobX + 'px');
      } else {
        var knobY = Math.floor((barHeight * value / (max - min)) - (knobHeight / 2));
        knob.css('top', knobY + 'px');
      }
      if (!quiet) {
        slider.trigger('change', value);
      }
      return oldValue;
    }

    function _setValueWithPos(pos) {
      if (horizontal) {
        _setValue(pos / barWidth * (max - min));
      } else {
        _setValue(pos / barHeight * (max - min));
      }
    }

    function knob_onmousedown(event) {
      dragging = true;
      dragX = event.pageX;
      dragY = event.pageY;
      $(document).bind('mousemove', knob_onmousemove).bind('mouseup', knob_onmouseup);
      return false;
    }

    function knob_onmousemove(event) {
      if (dragging) {
        _setValueWithPos(event.pageX - dragX);
      }
      return false;
    }

    function knob_onmouseup(event) {
      dragging = false;
      $(document).unbind('mousemove', knob_onmousemove).unbind('mouseup', knob_onmouseup);
      return false;
    }

    slider.val = function (newValue) {
      if (newValue !== undefined) {
        return _setValue(newValue, true);
      }
      return value;
    };

    bar.click(function (event) {
      _setValueWithPos(event.offsetX);
      return false;
    });

    knob.bind('mousedown', knob_onmousedown);

    $('.slider-decr', slider).click(function () {
      _setValue(value - step);
    });
    $('.slider-incr', slider).click(function () {
      _setValue(value + step);
    });

    _setValue(value, true);

    return slider;
  };

  $.fn.cropper = function (opts) {
    var cropper = $(this);

    var image = $('img.cropper-image', cropper);
    var naturalWidth = image.prop('naturalWidth');
    var naturalHeight = image.prop('naturalHeight');
    var imageX = 0, imageY = 0, imageWidth = naturalWidth, imageHeight = naturalHeight;

    var mask = $('.cropper-mask', cropper);
    var maskWidth = parseInt(mask.css('width'), 10);
    var maskHeight = parseInt(mask.css('height'), 10);

    var crop = $('.cropper-crop', cropper);
    var cropX = parseInt(crop.css('left'), 10);
    var cropY = parseInt(crop.css('top'), 10);
    var cropWidth = parseInt(crop.css('width'), 10);
    var cropHeight = parseInt(crop.css('width'), 10);

    opts = opts || {};

    var dragging = false;
    var dragX = 0, dragY = 0;

    function _setZoomScale(scale) {
      imageWidth = naturalWidth * scale;
      imageHeight = naturalHeight * scale;
      imageX = (maskWidth - imageWidth) / 2;
      imageY = (maskHeight - imageHeight) / 2;
      image.css({
        left: Math.floor(imageX) + 'px',
        top: Math.floor(imageY) + 'px',
        width: Math.floor(imageWidth) + 'px',
        height: Math.floor(imageHeight) + 'px'
      });
    }

    function image_onload() {
      naturalWidth = image.prop('naturalWidth');
      naturalHeight = image.prop('naturalHeight');
      imageWidth = naturalWidth;
      imageHeight = naturalHeight;

      // initial scale -> fit to mask
      var scale = maskWidth / naturalWidth;
      var minScale = 0.1;
      var maxScale = 2.0;

      var slider = $('.slider', cropper).slider({value: scale, min: minScale, max: maxScale});
      slider.bind('change', function (event, value) {
        _setZoomScale(value);
      });

      _setZoomScale(scale);
    }

    function mask_mousedown(event) {
      dragging = true;
      dragX = event.pageX;
      dragY = event.pageY;
      $(document).bind('mousemove', mask_onmousemove).bind('mouseup', mask_onmouseup);
      return false;
    }

    function mask_onmousemove(event) {
      if (dragging) {
        var dx = event.pageX - dragX;
        var dy = event.pageY - dragY;
        dragX = event.pageX;
        dragY = event.pageY;
        imageX += dx;
        imageY += dy;
        if (imageX < (-imageWidth + cropWidth)) {
          imageX = -imageWidth + cropWidth;
        } else if (imageX > (maskWidth - cropWidth)) {
          imageX = maskWidth - cropWidth;
        }
        if (imageY < (-imageHeight + cropHeight)) {
          imageY = -imageHeight + cropHeight;
        } else if (imageY > maskHeight - cropHeight) {
          imageY = maskHeight - cropHeight;
        }
        image.css({
          left: imageX + 'px',
          top: imageY + 'px'
        });
      }
      return false;
    }

    function mask_onmouseup(event) {
      dragging = false;
      $(document).unbind('mousemove', mask_onmousemove).unbind('mouseup', mask_onmouseup);
      return false;
    }

    cropper.setImage = function (src) {
      image.attr('src', src);
    };

    cropper.getParams = function () {
      if (imageWidth === naturalWidth && imageHeight === naturalHeight) {
        return {
          converter: 'crop',
          w: cropWidth,
          h: cropHeight,
          x: -Math.floor(imageX) + cropX,
          y: -Math.floor(imageY) + cropY
        };
      }
      return {
        converter: 'resizecrop',
        nw: Math.floor(imageWidth),
        nh: Math.floor(imageHeight),
        w: cropWidth,
        h: cropHeight,
        x: -Math.floor(imageX) + cropX,
        y: -Math.floor(imageY) + cropY
      };
    };

    image.bind('load', image_onload);
    mask.bind('mousedown', mask_mousedown);

    cropper.setImage(opts.src);

    return cropper;
  };

}(jQuery));
