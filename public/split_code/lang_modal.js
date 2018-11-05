function populateLanguageModal() {
  let container = $('#langRadioContainer')[0]
  let x = 0
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  Object.entries(loadedLanguageJSON['Languages']).forEach(([key, value]) => {
    let radioDiv = document.createElement('div')
    let id = 'radio-' + x++
    let item = document.createElement('input')
    item.setAttribute('name', 'radio')
    item.setAttribute('id', id)
    item.setAttribute('type', 'radio')

    let text = document.createElement('label')
    text.innerHTML = key
    text.setAttribute('for', id)
    text.classList.add('light')
    radioDiv.appendChild(item)
    radioDiv.appendChild(text)
    container.appendChild(radioDiv)
  })

  $('input[type=radio]', '#langForm').change(function () {
    setCookie('language', $('input[name=radio]:checked', '#langForm').parent().find('label')[0].innerHTML, 7)
    applyLanguage($('input[name=radio]:checked', '#langForm').parent().find('label')[0].innerHTML)
  })
}

function applyLanguageCookie(lang) {
  language = checkCookieData('language')
  if (language === null) {
    language = 'English'
  }

  loadedLanguageJSON['Languages'][language].forEach(function(lang) {
    if($('#' + lang['id'])[0] != null) {
      $('#' + lang['id'])[0].innerHTML = lang['text']
    }
  })
}

function applyLanguage(lang) {
  language = lang
  loadedLanguageJSON['Languages'][lang].forEach(function(lang) {
    if (lang['id'] === 'connectBtn') {
      $('#' + lang['id'])[0].innerHTML = lang['text'][0]
    } else if ($('#' + lang['id'])[0] != null) {
      $('#' + lang['id'])[0].innerHTML = lang['text']
    }
  })
}

function getLanguageValue(elementId, index) {
  let prom = new Promise(function(resolve, reject) {
    loadedLanguageJSON['Languages'][language].forEach(function(lang) {
      if (lang['id'] === elementId)
      if (elementId === 'connectBtn') {
        resolve(lang['text'][index])
      } else {
        resolve(lang['text'])
      }
    })
  })
  return prom
}
