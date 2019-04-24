function createPlaylist() {
  console.log('Getting behaviours list.');
  return listBehaviours();
}

function listBehaviours() {
  if (robot !== undefined) {
    Promise.resolve(robot.getBehaviours()).then(function (array) {
      // Create the list element:
      let list = $('#behaveListAvailable')[0];
      list.innerHTML = '';
      for (let i = 0; i < array.length; i++) {
        if (!array[i].includes('/') && !array[i].includes('.')) {
          // Create the list item:
          let item = document.createElement('li');

          item.classList.add("drag-item");

          // Set its contents:
          item.appendChild(document.createTextNode(array[i]));

          // Add it to the list:
          list.appendChild(item);
        }
      }
    });

    return true;
  } else {
    alert('You need to connect to the robot first');
    return false;
  }
}
