import debounce from 'lodash.debounce';
import { error, notice } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/mobile/dist/PNotifyMobile.css';

const refs = {
  input: document.querySelector('#search-box'),
  list: document.querySelector('#country-list'),
  info: document.querySelector('#country-info'),
};

refs.input.addEventListener('input', debounce(onSearch, 300));

function onSearch(e) {
  const value = e.target.value.trim();

  if (!value) {
    clearMarkup();
    return;
  }

  fetchCountries(value)
    .then(data => {
      if (data.length > 10) {
        clearMarkup();
        notice({ text: 'Too many matches. Try again.' });
        return;
      }

      if (data.length >= 2 && data.length <= 10) {
        renderList(data);
      }

      if (data.length === 1) {
        renderInfo(data[0]);
      }
    })
    .catch(() => {
      clearMarkup();
      error({ text: 'Oops, there is no country with that name' });
    });
}

function fetchCountries(name) {
  return fetch(
    `https://restcountries.com/v3.1/name/${name}?fields=name,capital,population,flags,languages`
  ).then(res => {
    if (!res.ok) {
      throw new Error(res.status);
    }
    return res.json();
  });
}

function renderList(countries) {
  refs.info.innerHTML = '';

  const markup = countries
    .map(c => {
      return `
        <li>
          <img src="${c.flags.svg}" width="30">
          ${c.name.official}
        </li>
      `;
    })
    .join('');

  refs.list.innerHTML = markup;
}

function renderInfo(country) {
  refs.list.innerHTML = '';

  const languages = Object.values(country.languages).join(', ');

  const markup = `
    <h2>
      <img src="${country.flags.svg}" width="40">
      ${country.name.official}
    </h2>
    <p><b>Capital:</b> ${country.capital}</p>
    <p><b>Population:</b> ${country.population}</p>
    <p><b>Languages:</b> ${languages}</p>
  `;

  refs.info.innerHTML = markup;
}

function clearMarkup() {
  refs.list.innerHTML = '';
  refs.info.innerHTML = '';
}