function playVideo(data) {
  let vModal = $('#videoModal')[0];
  let vForm = $('#videoForm')[0];

  vForm.innerHTML = '';
  let v = document.createElement('VIDEO');
  v.setAttribute('width', '320px');
  v.setAttribute('height', '240px');
  v.setAttribute('controls', '');

  let s = document.createElement('SOURCE');
  s.setAttribute('src', './videos/' + data);
  s.setAttribute('type', 'video/mp4');
  v.appendChild(s);
  vForm.appendChild(v);
  vModal.style.display = 'block';
}
