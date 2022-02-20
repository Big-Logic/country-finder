"use strict";

const searchInput = document.querySelector("#search__input");
const searchBtn = document.querySelector(".search__btn");

const countriesWrapper = document.querySelector(".countries__wrapper");

const details = document.querySelector(".details");
const detailsFlagWrap = document.querySelector(".details__flagwrap");
const detailsName = document.querySelector(".details-name");
const detailsCapital = document.querySelector(".details-capital");
const detailsContinent = document.querySelector(".details-continent");
const detailsSubregion = document.querySelector(".details-subregion");
const detailsRead = document.querySelector(".details_read");
const detailsMapWrap = document.querySelector(".details__mapwrap");
const detailsCurrency = document.querySelector(".details-currency");
const detailsLanguage = document.querySelector(".details-lang");
const detailsTimezone = document.querySelector(".details-timezone");

// const detailsContent = document.querySelector(".details__content");

class CountryDetails {
  constructor(selectedItem, description, name) {
    this._selectedItem = selectedItem;
    this._description = description;
    this._name = name;

    this.makeDisplay();
  }

  makeDisplay() {
    this._selectedItem.firstElementChild.textContent = this._description;
    this._selectedItem.lastElementChild.textContent = this._name;
  }
}

class CountryData {
  allCountries = [];
  activeCountry;
  constructor() {
    this._fetchCountry();
    this._eventListeners();
  }

  _eventListeners() {
    searchInput.addEventListener("input", this._implementSearch.bind(this));
  }

  _fetchCountry() {
    const allCountry = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (response.ok) {
          const jsonResponse = await response.json();
          // console.log(jsonResponse);
          this._getAllCountriesNames(jsonResponse);
        }

        if (!response.ok) {
          throw new Error("Error while Getting countries");
        }
      } catch (err) {
        console.error(err.message);
      }
      console.log("Fetching");
    };

    allCountry();
  }

  _getAllCountriesNames(countries) {
    countries.forEach((country) => {
      this.allCountries.push([country.name.common, country.flags.png]);
    });
    //console.log(this.allCountries);
  }

  _implementSearch(e) {
    const dataToCheck = searchInput.value;
    if (dataToCheck === "") {
      countriesWrapper.innerHTML = "";
      countriesWrapper.innerHTML =
        "<p>Matching countries will display here. Search any country</p>";
    }

    if (dataToCheck !== "") {
      const formatDataForSearch =
        dataToCheck.slice(0, 1).toUpperCase() +
        dataToCheck.slice(1).toLowerCase();
      console.log(formatDataForSearch);
      const filterArray = this.allCountries.filter((ele) => {
        return ele[0].startsWith(formatDataForSearch.trim());
      });

      console.log(filterArray);

      if (filterArray.length <= 0) {
        countriesWrapper.innerHTML = "";
        countriesWrapper.innerHTML =
          "<p>Country not found. Please check your input or check if you are connected to the internet</p>";
      }

      if (filterArray.length >= 1) {
        countriesWrapper.innerHTML = "";
        filterArray.forEach((ele) => {
          this._displayCountriesMatchingResults(ele);
        });

        const countryWrapper = document.querySelectorAll(".country__wrapper");
        countryWrapper.forEach((ele) => {
          ele.addEventListener(
            "click",
            this._getCountryNameFromClick.bind(this)
          );
        });
      }
    }
  }

  _displayCountriesMatchingResults(countr) {
    let countryName = countr[0];
    if (countryName.length > 23) {
      countryName = countr[0].slice(0, 20).padEnd(25, ".");
    }
    const html = `
        <div class="country__wrapper">
           <div class="country__flagwrap">
             <img src=${countr[1]} class="country__flag">
           </div>
           <div class="country__name"><p class="country__self">${countryName}</p></div>
        </div>
     `;

    countriesWrapper.insertAdjacentHTML("beforeend", html);
  }

  _getCountryNameFromClick(e) {
    const targetElement = e.target;
    console.log(targetElement);
    const countryName =
      targetElement.closest(".country__wrapper").lastElementChild
        .firstElementChild;
    console.log(countryName.textContent);

    this._fetchSingleCountry(countryName.textContent);
  }

  _fetchSingleCountry(country) {
    const getCountry = async () => {
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/name/${country}`
        );

        if (response.ok) {
          const jsonResponse = await response.json();
          this.activeCountry = jsonResponse[0];
          console.log(this.activeCountry);
          this._displayCountryDetail();
        }

        if (!response.ok) {
          throw new Error("Error while fetching");
        }
      } catch (err) {
        console.error(err.message);
      }
    };

    getCountry();
  }

  _displayCountryDetail() {
    details.classList.add("details__show");
    const countryFlag = this.activeCountry.flags.png;
    detailsFlagWrap.innerHTML = `<img src=${countryFlag} alt="Country flag" class="details__flag">`;

    function renderMap(selectedItem) {
      const map = L.map("map").setView(selectedItem.latlng, 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    }
    renderMap(this.activeCountry);

    const selectedCountryDetails = [
      detailsName,
      detailsCapital,
      detailsContinent,
      detailsSubregion,
      detailsCurrency,
      detailsLanguage,
      detailsTimezone,
    ];

    const contentDescriptions = [
      "Country Name",
      "Capital",
      "Continent",
      "Subregion",
      "Currency",
      "Language(s)",
      "Timezone(s)",
    ];

    function getArrayListedEle(selectedItem) {
      const makeString = [];
      for (let valu of Object.values(selectedItem)) {
        makeString.push(valu);
      }

      if (makeString.length === 1) {
        return makeString[0];
      } else if (makeString.length > 1) {
        return makeString.join(", ");
      }
    }

    function getCurrencies(selectedItem) {
      let theCurrency = [];

      for (let theValue of Object.values(selectedItem)) {
        theCurrency.push(theValue);
        // console.log(theValue);
      }
      return `${theCurrency[0].name} --- ${theCurrency[0].symbol}`;
    }
    // console.log(getCurrencies(this.activeCountry.currencies));
    const contentName = [
      this.activeCountry.name.common,
      this.activeCountry.capital[0],
      this.activeCountry.region,
      this.activeCountry.subregion,
      getCurrencies(this.activeCountry.currencies),
      getArrayListedEle(this.activeCountry.languages),
      this.activeCountry.timezones[0],
    ];
    console.log(contentName);

    selectedCountryDetails.forEach((ele, i) => {
      new CountryDetails(ele, contentDescriptions[i], contentName[i]);
    });

    const countryName = this.activeCountry.name.common;

    detailsRead.setAttribute(
      "href",
      `https://en.wikipedia.org/wiki/${countryName}`
    );
    detailsRead.textContent = `Read about ${countryName}`;
  }
}

const app = new CountryData();
