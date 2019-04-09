function populateSlaveModal() {
  let container = $('#slaveRadioContainer')[0];
  let x = 0;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  getSlaves().then(a => {
    console.log(a);
    a.forEach(slave => {
      let radioDiv = document.createElement('div');
      let id = 'radio-' + x++;
      let item = document.createElement('input');
      item.setAttribute('name', 'radio');
      item.setAttribute('id', id);
      item.setAttribute('type', 'radio');

      let text = document.createElement('label');
      text.innerHTML = slave;
      text.setAttribute('for', id);
      text.classList.add('light');
      radioDiv.appendChild(item);
      radioDiv.appendChild(text);
      container.appendChild(radioDiv);
    })
  })
}
