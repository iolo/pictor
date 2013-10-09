(function ($) {
  $('#uploadFrame').load(function () {
    var textarea = $('#uploadFrame').contents().find('textarea');
    if (textarea) {
      var result = JSON.parse(textarea.html());
      $('#uploadResultText').html(JSON.stringify(result));
      if (result && !result.error) {
        $('#sourceIdEdit').val(result.id);
      }
    }
  });

  $('#openCropperBtn').click(function () {
    var id = $('#sourceIdEdit').val();

    // XXX: with bootstrap dialog, I can't get valid height until it was shown.
    $('#cropperDialog')
      .on('shown.bs.modal', function() {
        $('#cropper').cropper('destroy').cropper({w: 100, h: 100, src:'/pictor/' + id});
      })
      .modal('show');

    $('#cropper_okBtn').click(function (event) {
      // NOTE: get resize size(nw, nh) and crop box(x, y, w, h)
      var data = $.extend({id: id, converter: 'resizecrop'}, $('#cropper').val());

      var convertAndDownloadRequestUrl = '/pictor/convert?' + $.param(data);
      $('#convertAndDownloadRequestText').html(convertAndDownloadRequestUrl);
      $('#convertAndDownloadResponseImg').attr('src', convertAndDownloadRequestUrl);

      var convertReq = {method: 'post', url: '/pictor/convert', type: 'json', data: data};
      $('#convertRequestText').html(JSON.stringify(convertReq));

      $.ajax(convertReq).then(function (data, status, xhr) {
        $('#convertResponseText').html(JSON.stringify(data));
      });
    });
  });

}(jQuery));
