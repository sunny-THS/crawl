function RemoveAllChannel() {
  var ctr = document.querySelector('.container');
  while (ctr.hasChildNodes()) {
      ctr.removeChild(ctr.firstChild);
  }
  fetch('../RemoveAll');
}
function submitChannel() {
  const channelURL = document.querySelector('.channel-input').value;
  fetch('../creators', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({channelURL})
  }).then(res => res.json())
    .then(data =>
      {
        ShowData(data);
        const ctr = document.querySelector('.container');
        ctr.scrollTop = ctr.scrollHeight;
      });
}
function newEl(type, attrs={}) {
  const el = document.createElement(type);
  for (let attr in attrs) {
    const val = attrs[attr];
    if (attr == 'innerText') el.innerText = val;
    else el.setAttribute(attr, val);
  }
  return el;
}

function ShowData(val) {
  const ctr = document.querySelector('.container');
  const card = newEl('div', {class: 'card'});
  const title = newEl('h4', {innerText: val.name});
  const img = newEl('img', {src: val.avatarURL});
  card.appendChild(title);
  card.appendChild(img);
  ctr.appendChild(card);
}
async function loadCreators() {
  const res = await fetch('../creators');
  const creators = await res.json();
  console.log(creators);

  creators.forEach(creator => {
    ShowData(creator);
  });
  return creators;
}
loadCreators();
