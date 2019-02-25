function saveAssigned() {
  let m = $('#mainBehaviour')[0];
  let p = $('#positiveBehaviour')[0];
  let n = $('#negativeBehaviour')[0];

  let mp = null;
  let pp = null;
  let np = null;

  for (let i = 0; i < loadedPlaylists.length; i++) {
    if (loadedPlaylists[i].getName() === m.options[m.selectedIndex].innerHTML) {
      mp = loadedPlaylists[i];
    } else if (loadedPlaylists[i].getName() === n.options[n.selectedIndex].innerHTML) {
      pp = loadedPlaylists[i];
    } else if (loadedPlaylists[i].getName() === p.options[p.selectedIndex].innerHTML) {
      np = loadedPlaylists[i];
    }
  }

  if (mp === pp || mp === np || np === pp) {
    alertMessage('Is it highly suggested that you choose a different playlist for each button.'
     + ' Failing to do so will cause un-expected behaviour.');
  }

  assigned = new Assigned(mp, pp, np);
  ses.setAssigned(assigned);

  // $('#assignModal')[0].style.display = 'none'

  console.log('Successfully assigned: <br/>'
  + mp.getName() + ' as the main behaviour list. <br/>'
  + pp.getName() + ' as the positive behaviour list. <br/>'
  + np.getName() + ' as the negative behaviour list.');
}
