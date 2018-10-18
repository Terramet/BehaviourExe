function clearPlaylists() {
  var response = confirm('Are you sure you want to delete all playlists? This is irreversible!')
  if (response) {
    data = {'playlists': []}
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: window.location.href + 'playlists/clear',
      success: function(data) {
        console.log('Playlists deleted.')
      }
    })
  }
}
