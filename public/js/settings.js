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
