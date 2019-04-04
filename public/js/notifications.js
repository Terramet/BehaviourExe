function alertMessage(value, cb) {
  let tmpl = document.getElementById('error-template');
  $('#message-holder')[0].appendChild(tmpl.content.cloneNode(true));
  $('#message-value-error')[0].innerHTML = '<i class="fa fa-times-circle"></i> ' + value;
  $('#message-value-error')
    .css('opacity', '1')
    .hide()
    .fadeIn(4000)
    .delay(4000)
    .fadeOut(4000, () => {
      $('message-value-error')
        .remove();
      if (cb) {
        cb();
      }
    });

  return false;
}

function infoMessage(value, cb) {
  let tmpl = document.getElementById('info-template');
  $('#message-holder')[0].appendChild(tmpl.content.cloneNode(true));
  $('#message-value-info')[0].innerHTML = '<i class="fa fa-info-circle"></i> ' + value;
  $('#message-value-info')
    .css('opacity', '1')
    .hide()
    .fadeIn(4000)
    .delay(4000)
    .fadeOut(4000, () => {
      $('#message-value-info')
        .remove();
      if (cb) {
        cb();
      }
    });

  return false;
}
