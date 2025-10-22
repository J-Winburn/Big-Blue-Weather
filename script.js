const API_URL = "https://swd.weatherflow.com/swd/rest/better_forecast";
const STATION_ID = 81414;

// Fetch forecast data
async function getForecast() {
  const url = `/api/forecast`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("API data:", data);
  return data;
}

// Small helper to format icon + value for the current conditions table
function iconHTML(filename, altText, value) {
  return `
    <div class="icon-cell">
      <img src="icons/${filename}" alt="${altText}" class="table-icon">
      <br>${value}
    </div>
  `;
}

// Keyword-based icon matcher for hourly, and daily forecasts
function getConditionIcon(conditionText = "") {
  const text = conditionText.toLowerCase();

  if (text.includes("rain")) return "rain.svg";
  if (text.includes("thunder")) return "thunderstorms-rain.svg";
  if (text.includes("snow")) return "snow.svg";
  if (text.includes("cloud")) return "partly-cloudy-day.svg";
  if (text.includes("overcast")) return "overcast-day.svg";
  if (text.includes("wind")) return "wind.svg";
  if (text.includes("clear") || text.includes("sun")) return "clear-day.svg";

  return "clear-day.svg";
}

// UPDATE FUNCTION
async function updateWeather() {
  const data = await getForecast();
  const current = data.current_conditions;

  // CURRENT CONDITIONS
  if (current) {
    const iconFile = getConditionIcon(current.conditions);
    const valuesRow = document.getElementById("current-values");

    valuesRow.innerHTML = `
      <td>${iconHTML("thermometer.svg", "Temperature", `${(current.air_temperature * 9/5 + 32).toFixed(1)} °F`)}</td>
      <td>${iconHTML(iconFile, current.conditions, current.conditions)}</td>
      <td>${iconHTML("barometer.svg", "Pressure", `${(current.sea_level_pressure * 0.02953).toFixed(2)} inHg`)}</td>
      <td>${iconHTML("wind.svg", "Wind", `${current.wind_avg} mph (${current.wind_direction_cardinal})`)}</td>
      <td>${iconHTML("raindrop.svg", "Precip Chance", `${current.precip_probability}%`)}</td>
      <td>${iconHTML("humidity.svg", "Humidity", `${current.relative_humidity}%`)}</td>
      <td>${iconHTML("uv-index.svg", "UV Index", `${current.uv}`)}</td>
    `;
  }

  // NEXT 8 HOURS FORECAST
  const hourlyContainer = document.getElementById("hourly-forecast");
  hourlyContainer.innerHTML = "";

  if (data.forecast && data.forecast.hourly) {
    const next8 = data.forecast.hourly.slice(0, 8);

    next8.forEach(hour => {
      const card = document.createElement("div");
      card.className = "hour-card";

      const time = new Date(hour.time * 1000).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hourCycle: "h12"
      });

      const iconFile = getConditionIcon(hour.conditions);

      card.innerHTML = `
        <div class="time">${time}</div>
        <img src="icons/${iconFile}" alt="${hour.conditions}">
        <div>${hour.conditions}</div>
        <div class="temp">${(hour.air_temperature * 9/5 + 32).toFixed(1)} °F</div>
        <div>💧${hour.precip_probability}% </div>
        <div>💨${hour.wind_avg.toFixed(1)} mph </div>
      `;
      hourlyContainer.appendChild(card);
    });
  } else {
    hourlyContainer.innerHTML = "<p>No hourly data available.</p>";
  }

  // NEXT 10 DAYS FORECAST
  const dailyContainer = document.getElementById("daily-forecast");
  dailyContainer.innerHTML = "";

  if (data.forecast && data.forecast.daily) {
    data.forecast.daily.forEach(day => {
      const dayIcon = getConditionIcon(day.conditions);

      const card = document.createElement("div");
      card.className = "ui card";

      card.innerHTML = `
        <div class="content center aligned">
          <div class="header">${day.month_num}/${day.day_num}</div>
          <div class="description">
            <img src="icons/${dayIcon}" alt="${day.conditions}" class="small-weather-icon"><br>
            ${day.conditions}<br>
            High: ${(day.air_temp_high * 9/5 + 32).toFixed(1)} °F<br>
            Low: ${(day.air_temp_low * 9/5 + 32).toFixed(1)} °F<br>
            Precip: ${day.precip_probability}%
          </div>
        </div>
      `;
      dailyContainer.appendChild(card);
    });
  } else {
    dailyContainer.innerHTML = "<p>No daily forecast available.</p>";
  }
}

// BUTTON HANDLER
document.getElementById("refresh").addEventListener("click", updateWeather);
updateWeather();
