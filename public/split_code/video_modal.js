function playVideo(data) {
  let videoModal = $('#videoModal')[0]
  let videoForm = $('#videoForm')[0]
  videoForm.innerHTML = ''
  let v = document.createElement('VIDEO')
  v.setAttribute('width', '320px')
  v.setAttribute('height', '240px')
  v.setAttribute('controls', '')

  let s = document.createElement('SOURCE')
  s.setAttribute('src', './videos/' + data)
  s.setAttribute('type', 'video/mp4')
  v.appendChild(s)
  videoForm.appendChild(v)
  videoModal.style.display = 'block'

}
