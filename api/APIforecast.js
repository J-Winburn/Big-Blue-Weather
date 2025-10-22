export default async function handler(req, res) {
  const TOKEN = process.env.TEMPEST_TOKEN;
  const STATION_ID = 81414;
  const API_URL = `https://swd.weatherflow.com/swd/rest/better_forecast?station_id=${STATION_ID}&token=${TOKEN}`;
  
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
}
