function submitChannel() {
  const channelURL = document.querySelector('.channel-input').value;
  fetch('http://localhost:5000/creators', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({channelURL})
  })
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

async function loadCreators() {
  const res = await fetch('http://localhost:5000/creators');
  const creators = await res.json();
  console.log(creators);
  const ctr = document.querySelector('.container');

  creators.forEach(creator => {
    const card = newEl('div', {class: 'card'});
    const title = newEl('h4', {innerText: creator.name});
    const img = newEl('img', {src: creator.avatarURL});
    card.appendChild(title);
    card.appendChild(img);
    ctr.appendChild(card);
  });
}
loadCreators();
