'use strict';

const Weather = (() => {
  const cacheKey = 'barcelona-trip-forecast-v1';
  const refreshInterval = 30 * 60 * 1000;
  const url = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: '41.3874', longitude: '2.1686', timezone: 'Europe/Madrid', forecast_days: '16',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum',
    hourly: 'precipitation_probability,precipitation'
  });
  let cached = null;
  let loading = false;
  let error = '';
  let storageError = '';
  let onChange = () => {};
  const number = value => typeof value === 'number' && Number.isFinite(value);
  const probability = value => number(value) && value >= 0 && value <= 100;
  function validate(payload) {
    if (!payload || payload.timezone !== 'Europe/Madrid') throw new Error('Fuseau météo incorrect');
    for (const [section, fields, timePattern] of [
      ['daily', ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max', 'precipitation_sum'], /^\d{4}-\d{2}-\d{2}$/],
      ['hourly', ['precipitation_probability', 'precipitation'], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/]
    ]) {
      const values = payload[section];
      if (!values || !Array.isArray(values.time) || !values.time.length ||
          !values.time.every(time => typeof time === 'string' && timePattern.test(time)) ||
          !fields.every(field => Array.isArray(values[field]) && values[field].length === values.time.length &&
            values[field].every(value => value === null || (field.includes('probability') ? probability(value) : number(value))))) {
        throw new Error(`Prévisions ${section} incomplètes ou invalides`);
      }
    }
    return payload;
  }
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const saved = JSON.parse(raw);
      if (!number(saved.receivedAt) || saved.receivedAt > Date.now()) throw new Error('Date météo invalide');
      cached = { receivedAt: saved.receivedAt, payload: validate(saved.payload) };
    }
  } catch (reason) {
    console.warn('Lecture des prévisions enregistrées impossible.', reason);
    error = 'Les prévisions enregistrées sont illisibles ou leur stockage est inaccessible.';
  }
  function describe(code) {
    if (code === 0) return { text: 'Ciel dégagé', icon: '☀' };
    if ([1, 2].includes(code)) return { text: 'Éclaircies', icon: '☀' };
    if (code === 3) return { text: 'Ciel couvert', icon: '☁' };
    if ([45, 48].includes(code)) return { text: 'Brouillard', icon: '☁' };
    if ([51, 53, 55, 56, 57].includes(code)) return { text: 'Bruine possible', icon: '☂' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: 'Pluie ou averses', icon: '☂' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: 'Neige possible', icon: '❄' };
    if ([95, 96, 99].includes(code)) return { text: 'Orages possibles', icon: 'ϟ' };
    return { text: 'État du ciel non renseigné', icon: '☁' };
  }
  function day(date) {
    if (!cached) return null;
    const daily = cached.payload.daily;
    const index = daily.time.indexOf(date);
    if (index < 0) return null;
    const min = daily.temperature_2m_min[index];
    const max = daily.temperature_2m_max[index];
    const chance = daily.precipitation_probability_max[index];
    const amount = daily.precipitation_sum[index];
    const hours = cached.payload.hourly;
    return {
      ...describe(daily.weather_code[index]),
      range: number(min) && number(max) ? `${Math.round(min)} à ${Math.round(max)} °C` : 'Températures indisponibles',
      probability: probability(chance) ? chance : null,
      amount: number(amount) && amount >= 0 ? amount : null,
      hours: hours.time.flatMap((time, i) => time.startsWith(date + 'T') ? [{
        time: time.slice(11, 16), probability: hours.precipitation_probability[i], amount: hours.precipitation[i]
      }] : [])
    };
  }
  function status() {
    return {
      loading, error, storageError, receivedAt: cached?.receivedAt,
      stale: Boolean(cached && (Date.now() - cached.receivedAt >= refreshInterval || !navigator.onLine || error)),
      offline: !navigator.onLine
    };
  }
  async function refresh() {
    if (loading) return;
    if (!navigator.onLine) {
      error = 'Vous êtes hors ligne. Impossible d’actualiser les prévisions.';
      onChange();
      return;
    }
    loading = true;
    error = '';
    onChange();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`Service météo : HTTP ${response.status}`);
      const payload = validate(await response.json());
      cached = { receivedAt: Date.now(), payload };
      storageError = '';
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cached));
      } catch (reason) {
        console.warn('Enregistrement des prévisions impossible.', reason);
        storageError = 'Ces prévisions ne pourront pas être conservées hors ligne sur cet appareil.';
      }
    } catch (reason) {
      console.warn('Actualisation météo impossible.', reason);
      error = 'Actualisation impossible. Vérifiez votre connexion ou réessayez plus tard.';
    } finally {
      clearTimeout(timer);
      loading = false;
      onChange();
    }
  }
  function start(callback) {
    onChange = callback;
    refresh();
    setInterval(() => {
      if (!document.hidden) refresh();
    }, refreshInterval);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && (!cached || Date.now() - cached.receivedAt >= refreshInterval)) refresh();
    });
    window.addEventListener('online', refresh);
    window.addEventListener('offline', () => onChange());
  }
  return { day, status, refresh, start };
})();
