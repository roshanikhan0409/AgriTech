const router = require('express').Router();
const Farm = require('../models/Farm');
const WeatherData = require('../models/WeatherData');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');

router.use(protect);

const CACHE_MINUTES = 30;

// Open-Meteo: free, no API key. Requires Node 18+ for global fetch.
async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '7',
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!r.ok) throw new Error('Weather provider error');
  return r.json();
}

// Farming-oriented advisories derived from the forecast
function advisories(daily) {
  const out = [];
  if (!daily) return out;
  daily.time.forEach((date, i) => {
    const rain = daily.precipitation_sum[i];
    const tmax = daily.temperature_2m_max[i];
    const tmin = daily.temperature_2m_min[i];
    const wind = daily.wind_speed_10m_max[i];
    if (rain >= 20) out.push({ date, level: 'high', text: `Heavy rain expected (${rain} mm). Avoid spraying and fertilizer application.` });
    else if (rain >= 5) out.push({ date, level: 'medium', text: `Rain expected (${rain} mm). Postpone irrigation.` });
    if (tmax >= 40) out.push({ date, level: 'high', text: `Extreme heat (${tmax}°C). Irrigate in early morning or evening.` });
    if (tmin <= 5) out.push({ date, level: 'high', text: `Frost risk (${tmin}°C). Protect sensitive crops.` });
    if (wind >= 30) out.push({ date, level: 'medium', text: `Strong winds (${wind} km/h). Avoid pesticide spraying.` });
  });
  return out;
}

router.get('/farm/:farmId', asyncHandler(async (req, res) => {
  const filter = { _id: req.params.farmId };
  if (req.user.role !== 'admin') filter.owner = req.user._id;
  const farm = await Farm.findOne(filter);
  if (!farm) return res.status(404).json({ message: 'Farm not found' });

  const cutoff = new Date(Date.now() - CACHE_MINUTES * 60 * 1000);
  let snap = await WeatherData.findOne({ farm: farm._id, fetchedAt: { $gte: cutoff } }).sort('-fetchedAt');
  if (!snap) {
    const data = await fetchForecast(farm.latitude, farm.longitude);
    snap = await WeatherData.create({ farm: farm._id, current: data.current, daily: data.daily });
  }
  res.json({ farm: { _id: farm._id, name: farm.name, location: farm.location }, current: snap.current, daily: snap.daily, advisories: advisories(snap.daily), fetchedAt: snap.fetchedAt });
}));

module.exports = router;
