function populateSlavesModal() {
  let container = $('#slaveCheckBoxContainer')[0]
  let x = 0
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  $.when(getSlaves()).then(function(data) {
    data.forEach((i) => {
      let checkboxDiv = document.createElement('div')
      let id = 'checkbox-' + x++
      let item = document.createElement('input')
      item.setAttribute('name', 'checkbox')
      item.setAttribute('id', id)
      item.setAttribute('type', 'checkbox')

      let text = document.createElement('label')
      text.innerHTML = i
      text.setAttribute('for', id)
      text.classList.add('light')
      checkboxDiv.appendChild(item)
      checkboxDiv.appendChild(text)
      container.appendChild(checkboxDiv)
    })
  })
}

function connectToSlaves(slaves) {
  let ip = timeoutPromise(5000, robot.getIP())
  ip.then(response => {
    slaves.forEach((slave) => {
      socket.emit('sendToSlave', {
        socket: slave,
        masterSocket: socket.id,
        message: response
      });
    })
  })
}

function getCheckedBoxes() {
  let elements = $('input[name=checkbox]:checked', '#connectSlavesModal').toArray();
  let names = []
  for(let i = 0; i < elements.length; i++) {
    names.push($('label[for='+ elements[i].id +']').text())
  }
  return names
}
