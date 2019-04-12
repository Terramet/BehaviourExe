function advancedFeatures(value) {
  if (value === true || value === 'true') {
    $('#advCheck')
      .prop('checked', true);
    getLanguageValue('advModeON')
      .then(value1 => {
        infoMessage(value1);
      });
  } else {
    $('#advCheck')
      .prop('checked', false);
    getLanguageValue('advModeOFF')
      .then(value1 => {
        infoMessage(value1);
      });
  }

  advFeatureIDs.forEach(element => {
    if (value === true || value === 'true') {
      $('#' + element)[0]
        .style.display = 'block';
    } else {
      $('#' + element)[0]
        .style.display = 'none';
    }
  });
}

$('#settingsSave').click(function () {
  if ($('#robotPassIn')[0].value != "") {
    setCookie('robotPass', $('#robotPassIn')[0].value, 7);
  }

  setCookie('robotControls', $('#robotControlCheck')[0].checked, 7);
  if ($('#robotControlCheck')[0].checked) {
    $('#controlsContainer')[0].style.display = 'block';
  } else {
    $('#controlsContainer')[0].style.display = 'none';
  }
  getLanguageValue('passSave')
    .then(value1 => {
      infoMessage(value1);
    });
});

function updateSettings() {
  let value = checkCookieData('robotControls');
  if (value === true || value === 'true') {
    $('#robotControlCheck').prop('checked', true);
  } else {
    $('#robotControlCheck').prop('checked', false);
  }
}
