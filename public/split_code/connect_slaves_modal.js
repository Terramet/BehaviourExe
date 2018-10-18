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
