import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';

const DEBOUNCE_DELAY = 300;

const inputCountryEl = document.querySelector('#search-box');
const outputCountryListEl = document.querySelector('.country-list');
const outputCountryInfoEl = document.querySelector('.country-info');

inputCountryEl.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(evt) {
  const inputedText = evt.target.value.trim();
  clearCountryListAndInfo();
  if (inputedText) {
    fetchCountries(inputedText)
      .then(data => {
        if (data.length > 10) {
          Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );
          console.log('Забагато', data.length);
        } else if (data.length === 1) {
          createCountryInfo(data);

          [data] = data;
          const {
            name: { official },
          } = data;
          if (official == 'Russian Federation') {
            Report.failure('Russia is a terrorist state!', '', 'Yes of course');
          }
        } else {
          createCountryList(data);
          console.log('Список', data.length);
        }
      })
      .catch(error => {
        console.log(error);
        Notify.failure('Oops, there is no country with that name');
      });
  }
}

function clearCountryListAndInfo() {
  outputCountryListEl.innerHTML = '';
  outputCountryInfoEl.innerHTML = '';
}

function createCountryList(countryList) {
  const makeListItem = country => {
    const {
      name: { official },
      flags: { svg },
    } = country;
    return `<li class="country-list__item"><img class="country-list__item-image" src="${svg}" alt="${official}"></img>${official}</li>`;
  };
  const markup = countryList.map(country => makeListItem(country)).join('');

  outputCountryListEl.innerHTML = markup;

  outputCountryListEl.addEventListener('click', clickOnSelectedCountry, {
    once: true,
  });
}

function createCountryInfo([country]) {
  const {
    name: { official },
    capital,
    population,
    flags: { svg },
    languages,
  } = country;

  const markup = `<div class="country-info__item"><img class="country-info__country-flag" src="${svg}" alt="${official}"><span class="country-info__country-name">${official}</span></div><p><span class="country-info__item-info">Capital: </span> ${capital}</p><p><span class="country-info__item-info">Population: </span> ${population} pers.</p><p><span class="country-info__item-info">Languages: </span> ${Object.values(
    languages
  )}</p>`;

  outputCountryInfoEl.innerHTML = markup;
}

function clickOnSelectedCountry(evt) {
  if (evt.currentTarget !== evt.target) {
    const currentEl = evt.target;
    const selectedCountry =
      currentEl.getAttribute('alt') || currentEl.innerText;

    fetchCountries(selectedCountry)
      .then(data => {
        createCountryInfo(data);
        outputCountryListEl.innerHTML = '';
      })
      .catch(error => {
        console.log(error);
        Notify.failure('Oops, there is no country with that name');
      });

    if (selectedCountry == 'Russian Federation') {
      Report.failure('Russia is a terrorist state!', '', 'Yes of course');
    }
  }
}
