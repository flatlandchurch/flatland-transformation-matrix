const ORDER = ['character', 'home', 'relationships', 'industry', 'society', 'talents'];

function replaceHash() {
  const path = getHash();
  if (!path) {
    window.history.replaceState('', null, '#/character');
  }
}

function getHash() {
  return window.location.hash.replace('#', '');
}

function getSegments(hash) {
  return hash.split('/').slice(1);
}

function titleate(name) {
  return `${name[0].toUpperCase()}${name.slice(1)}`;
}

function setUpNav([category]) {
  const currentIdx = ORDER.findIndex((p) => p === category);

  if (category === 'character') {
    document.getElementById('next').href = `#/home`;
    document.getElementById('prev').className = 'deactivate';
  } else if (category === 'talents') {
    document.getElementById('prev').href = `#/society`;
    document.getElementById('next').className = 'deactivate';
  } else {
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');

    prev.href = `#/${ORDER[currentIdx - 1]}`;
    prev.className = '';
    next.href = `#/${ORDER[currentIdx + 1]}`;
    next.className = '';
  }
  document.querySelector('header h1').innerText = titleate(ORDER[currentIdx]);
}

function wait(ms) {
  return new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
}

async function route([category, goal, type, sub]) {
  document.querySelector('[data-category].active').className = 'category';
  document.querySelector(`[data-category="${category}"]`).className = 'category active';

  if (type) {
    document.getElementById('discipline-modal').style.display = 'block';
    document.querySelector('#discipline-modal .modal__content').innerHTML = document.querySelector(`[data-discipline="${sub}"]`).innerText;
    await wait(50);
    document.querySelector('#discipline-modal .modal__container').className = 'modal__container active';
  } else {
    document.getElementById('discipline-modal').style.display = 'none';
    document.querySelector('#discipline-modal .modal__container').className = 'modal__container';
    document.querySelector('#discipline-modal .modal__content').innerHTML = '';
  }
}

function closeModal() {
  const [category] = getSegments(getHash());
  window.location.hash = `#/${category}`;
}

(() => {
  replaceHash();
  const segments = getSegments(getHash());
  setUpNav(segments);
  route(segments);
})();

window.addEventListener('hashchange', (e) => {
  const segments = getSegments(getHash());
  setUpNav(segments);
  route(segments);
});
