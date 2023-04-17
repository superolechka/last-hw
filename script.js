const baseUrl = 'https://swapi.dev/api/';

let heroCard = document.querySelector('.heroCard');
let overlay = document.querySelector('.overlay');

document.querySelector('.show').addEventListener('click', generateHeroes);
let heroes = document.querySelector('.heroes');

async function generateHeroes() {
  document.querySelector('.navigation').innerHTML = '';
  const response = await fetch(`${baseUrl}people`, {
    method: 'GET'
  });

  let heroes = await response.json();

  document.querySelector(
    '.navigation'
  ).innerHTML = `<button class="navigation-btn left-btn" disabled id="prev"><i class="arrow left"></i></button>
  <button class="navigation-btn right-btn" id="next"><i class="arrow right"></i></button>`;

  let next = document.getElementById('next');
  let prev = document.getElementById('prev');
  next.addEventListener('click', async () => {
    await fetch(heroes.next, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((result) => {
        heroes = result;
        if (heroes.previous !== null) {
          prev.disabled = false;
        }
        if (heroes.previous === 'https://swapi.dev/api/people/?page=8') {
          next.disabled = true;
        }
        renderHeroes(result.results);
      });
  });

  prev.addEventListener('click', async () => {
    if (heroes.previous === 'https://swapi.dev/api/people/?page=8') {
      next.disabled = false;
    }
    if (heroes.previous === null) {
      prev.disabled = true;
    } else {
      prev.disabled = false;
    }
    await fetch(heroes.previous, {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((result) => {
        heroes = result;
        if (heroes.next == 'https://swapi.dev/api/people/?page=2') {
          prev.disabled = false;
        }
        if (heroes.previous === null) {
          prev.disabled = true;
        }
        renderHeroes(result.results);
      });
  });
  renderHeroes(heroes.results);
}

function renderHeroes(heroes) {
  document.querySelector('.heroes').innerHTML = '';

  heroes.forEach((hero) => {
    let listItem = document.createElement('div');
    listItem.classList.add('hero');
    listItem.id = `${hero.url}`;
    listItem.innerHTML = `${hero.name}`;
    document.querySelector('.heroes').append(listItem);
  });
}

heroes.addEventListener('click', () => {
  renderPopup(event.target.id);
});

async function showSingleHero(url) {
  let hero = {
    name: '',
    birth: '',
    gender: '',
    films: [],
    planet: '',
    species: []
  };

  await fetch(url, {
    method: 'GET'
  })
    .then((response) => response.json())
    .then(async (value) => {
      console.log(value);
      hero.name = value.name;
      hero.birth = value.birth_year;
      hero.gender = value.gender;
      let films = [];
      value.films.forEach(async (film) => {
        await fetch(film, {
          method: 'GET'
        })
          .then((response) => response.json())
          .then((title) => {
            films.push(title.title);
          });
      });
      hero.films.push(films);
      await fetch(value.homeworld, { method: 'GET' })
        .then((response) => response.json())
        .then((planet) => (hero.planet = planet.name));
      let species = [];
      value.species.forEach(async (specy) => {
        await fetch(specy, {
          method: 'GET'
        })
          .then((response) => response.json())
          .then((specy) => {
            species.push(specy);
          });
      });
      hero.species.push(species);
    });

  return hero;
}

async function renderPopup(url) {
  let hero = await showSingleHero(url);

  setTimeout(() => {
    console.log(hero.species[0]);
    let species = [];
    hero.species[0].forEach((el) => {
      species.push(el.name);
    });
    let card = document.createElement('div');
    card.innerHTML = `
  <h3>${hero.name}</h3>
  <table>
  <tr>
  <td class="first-col">Birth:</td>
   <td>${hero.birth}</td>
  </tr>
  <tr>
  <td class="first-col">Gender:</td>
   <td>${hero.gender}</td>
  </tr>
   <tr>
  <td class="first-col">Films:</td>
   <td>${hero.films[0].join(',<br />')}</td>
  </tr>
   <tr>
  <td class="first-col">Planet:</td>
   <td>${hero.planet}</td>
  </tr>
    <tr>
  <td class="first-col">Species:</td>
   <td>${species.join(', ')}</td>
  </tr>
  </tr>
  </table>
  <button class="close-btn">Close</button>`;
    heroCard.innerHTML = card.innerHTML;
    heroCard.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.querySelector('.close-btn').addEventListener('click', closePopup);
  }, 2000);
}

overlay.addEventListener('click', closePopup);

function closePopup() {
  heroCard.classList.add('hidden');
  overlay.classList.add('hidden');
}
