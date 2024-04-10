const apiKey = '8f0f6b50be409abe9fcde4983e6597e2';
const searchButton = document.getElementById('search-button');
const city = document.getElementById('city-location');
const cityList = document.getElementById('city-list');
const weatherSection = document.getElementById('weather-section');
const currentWeatherDiv = document.getElementById('current-weather');
let storedCities = JSON.parse(localStorage.getItem('cities')) || [];

// Function to fetch data from API
function getApi(cityName, isSearch) {
  const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&cnt=50&units=metric&appid=${apiKey}`;

  console.log('api secured');

  fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log('Data received:', data);

      const dailyData = {};

      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toDateString();

        if (!dailyData[day]) {
          dailyData[day] = {
            temperatures: [],
            windSpeeds: [],
            humidities: [],
          };
        }

        dailyData[day].temperatures.push(item.main.temp);
        dailyData[day].windSpeeds.push(item.wind.speed);
        dailyData[day].humidities.push(item.main.humidity);
      });

      if (isSearch) {
        displayWeatherData(cityName, dailyData);
      } else {
        displayWeatherInfo(cityName, dailyData);
      }

      updateCityButton(cityName, data.list[0].main.temp);

      let cityIndex = storedCities.findIndex(
        (cityData) => cityData.city === cityName
      );
      if (cityIndex !== -1) {
        storedCities[cityIndex].temperature = data.list[0].main.temp;
      } else {
        storedCities.push({ city: cityName, temperature: data.list[0].main.temp });
      }
      localStorage.setItem('cities', JSON.stringify(storedCities));
    })
    .catch((error) => console.log(error));
}

// Function to display weather data in the weather section
function displayWeatherData(cityName, dailyData) {
  weatherSection.innerHTML = ''; // Clear previous content

  let daysCount = 0;
  for (const day in dailyData) {
    if (daysCount === 5) {
      break;
    }

    if (day !== new Date().toDateString()) {
      const avgTemperature = calculateAverage(dailyData[day].temperatures);
      const avgWindSpeed = calculateAverage(dailyData[day].windSpeeds);
      const avgHumidity = calculateAverage(dailyData[day].humidities);

      const listItem = document.createElement('li');
      const dayInfo = document.createElement('div');

      dayInfo.textContent = `${cityName} - ${day}: Avg Temp: ${avgTemperature}°C, Avg Wind: ${avgWindSpeed} m/s, Avg Humidity: ${avgHumidity}%`;

      listItem.appendChild(dayInfo);
      weatherSection.appendChild(listItem);

      daysCount++;
    }
  }
}

// Function to display weather information inside weatherSection div
function displayWeatherInfo(cityName, dailyData) {
  displayWeatherData(cityName, dailyData);
}

// Function to update city button or add new city button
function updateCityButton(cityName, temperature) {
  let existingButton = document.querySelector(`button[data-city="${cityName}"]`);
  if (existingButton) {
    const fahrenheitTemp = (temperature - 273.15) * 9 / 5 + 32;
    existingButton.textContent = `${cityName}: ${fahrenheitTemp.toFixed(2)}°F`;
  } else {
    const listItem = document.createElement('li');
    const addToList = document.createElement('button');
    addToList.setAttribute('data-city', cityName);

    const fahrenheitTemp = (temperature) * 9 / 5 + 32;
    addToList.textContent = `${cityName}: ${fahrenheitTemp.toFixed(2)}°F`;

    addToList.addEventListener('click', function () {
      getApi(cityName, false); // false indicates button click
    });

    listItem.appendChild(addToList);
    cityList.appendChild(listItem);
  }
}

// Event listener for search button click
searchButton.addEventListener('click', function (event) {
  event.preventDefault();

  console.log(`Button clicked`);
  console.log(`City value:`, city.value);

  getApi(city.value, true); // true indicates search

  localStorage.setItem(`City-Location`, city.value);
});

// Function to calculate average
function calculateAverage(arr) {
  return (arr.reduce((acc, val) => acc + val, 0) / arr.length).toFixed(2);
}

// Function to display cities from local storage on page load
function displayCitiesFromLocalStorage() {
  if (storedCities.length > 0) {
    storedCities.forEach((cityData) => {
      getApi(cityData.city, false); // false indicates button click
    });
  }
}

// Display cities from local storage on page load
displayCitiesFromLocalStorage();

    


