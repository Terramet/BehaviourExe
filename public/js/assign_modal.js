function saveAssigned() {
  let m = $('#mainBehaviour')[0];

  let p = null;

  for (let i = 0; i < loadedPlaylists.length; i++) {
    if (loadedPlaylists[i].getName() === m.options[m.selectedIndex].innerHTML) {
      p = loadedPlaylists[i];
    }
  }

  assigned = new Assigned(p);
  ses.setAssigned(assigned);
  
  console.log('Successfully assigned: <br/>'
  + p.getName() + ' as the main behaviour list. <br/>')
}

//Don't look at it, your eyes will bleed
function checkBehaveList(p) {
  return new Promise(function (resolve, reject) {
    p.getMain().list.forEach(b => {
      robot.isBehaviorInstalled(b)
        .then((a) => {
          if (!a) {
            return resolve(false);
          } else if (b === p.getMain().list[p.getMain().list.length - 1]) {
            p.getPos().list.forEach(b => {
              robot.isBehaviorInstalled(b)
                .then((a) => {
                  if (!a) {
                    return resolve(false);
                  } else if (b === p.getPos().list[p.getPos().list.length - 1]) {
                    p.getNeg().list.forEach(b => {
                      robot.isBehaviorInstalled(b)
                        .then((a) => {
                          if (!a) {
                            return resolve(false);
                          } else if (b === p.getNeg().list[p.getNeg().list.length - 1]) {
                            return resolve(true);
                          }
                        });
                    });
                  }
                });
            });
          }
        });
    });
  });
}
