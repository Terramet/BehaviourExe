function populateSlaveModal() {
  let container = $('#slaveCheckContainer')[0];
  let x = 0;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  getSlaves().then(a => {
    console.log(a);
    a.forEach(slave => {
      let checkDiv = document.createElement('div');
      let id = 'check-' + x++;
      let item = document.createElement('input');
      item.setAttribute('name', 'radio');
      item.setAttribute('id', id);
      item.setAttribute('type', 'radio');

      let text = document.createElement('label');
      text.innerHTML = slave;
      text.setAttribute('for', id);
      text.classList.add('light');
      checkDiv.appendChild(item);
      checkDiv.appendChild(text);
      container.appendChild(checkDiv);
    })
  })
}

function connectToSlaves(slaves) {
  slaves.forEach((slave) => {
    connectedSlaves.push(slave)
    socket.emit('sendToSlave', {
      socket: slave,
      masterSocket: socket.id,
      message: 'Connect'
    })
  })
}

function getRadioSlaves() {
  let elements = $('input[name=radio]:checked', '#slaveModal').toArray();
  let names = []
  for(let i = 0; i < elements.length; i++) {
    names.push($('label[for='+ elements[i].id +']').text())
  }
  return names
}
