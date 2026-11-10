'use strict';

const main = document.querySelector('#main');
const storageKey = 'barcelone-a-deux-v1';
const tripDates = DAYS.map(day => day.date);
let storageWarning = '';
function readState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Format non reconnu');
    return saved;
  } catch (error) {
    console.warn('Lecture du carnet impossible.', error);
    storageWarning = 'Les choix enregistrés sont illisibles ou le stockage est indisponible. Vos changements resteront visibles pour cette ouverture.';
    return {};
  }
}
const savedState = readState();
const state = {
  progress: savedState.progress && typeof savedState.progress === 'object' ? savedState.progress : {},
  weather: savedState.weather && typeof savedState.weather === 'object' ? savedState.weather : {},
  terminal: ['t1', 't2'].includes(savedState.terminal) ? savedState.terminal : '',
  terminalVerified: savedState.terminalVerified === true,
  parkEntrance: ['olot', 'carmel', 'santuari'].includes(savedState.parkEntrance) ? savedState.parkEntrance : ''
};
const parkEntrances = {
  olot: { name: 'Parc Güell · Carrer d’Olot', query: 'Park Güell entrada Carrer d’Olot Barcelona' },
  carmel: { name: 'Parc Güell · Carretera del Carmel', query: 'Park Güell entrada Carretera del Carmel Barcelona' },
  santuari: { name: 'Parc Güell · Sant Josep de la Muntanya', query: 'Park Güell entrada Avinguda del Santuari de Sant Josep de la Muntanya Barcelona' }
};
const clockFormat = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
function madridNow(date = new Date()) {
  const parts = Object.fromEntries(clockFormat.formatToParts(date).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minute: Number(parts.hour) * 60 + Number(parts.minute), time: `${parts.hour} h ${parts.minute}` };
}
let currentClock = madridNow();
let selectedDay = Math.max(0, tripDates.indexOf(currentClock.date));
let manualDay = false;
let currentTab = '';
let toastTimer;
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const money = cents => (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
const getVisit = id => VISITS.find(visit => visit.id === id);
const progressKey = (day, step) => `${DAYS[day].date}:${step.id}`;
const getProgress = (day, step) => ['done', 'skipped'].includes(state.progress[progressKey(day, step)]) ? state.progress[progressKey(day, step)] : '';
function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 6000);
}
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('Enregistrement du carnet impossible.', error);
    notify('Impossible de mémoriser sur cet appareil. Vos choix restent actifs pour cette ouverture.');
    return false;
  }
}
function external(url, text, className = '') {
  return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="${className}">${text}<span class="sr-only"> (nouvel onglet)</span></a>`;
}
function resolvePlace(id) {
  if (id === 'airport' && state.terminal && state.terminalVerified) return PLACES[state.terminal];
  if (id === 'park' && state.parkEntrance) return parkEntrances[state.parkEntrance];
  return PLACES[id];
}
function mapsURL(to, from, mode = 'walking') {
  const destination = resolvePlace(to);
  if (!from) return `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: destination.query })}`;
  return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', origin: resolvePlace(from).query, destination: destination.query, travelmode: mode })}`;
}
function mapsButton(place, label = 'Ouvrir dans Google Maps', className = 'btn secondary small') {
  const text = label.includes('Google Maps') ? label : `${label} · Google Maps`;
  return external(mapsURL(place), `${text} <span aria-hidden="true">↗</span>`, className);
}
function sourceLinks(ids = []) {
  if (!ids.length) return '';
  return `<div class="sources">Sources : ${ids.map(id => external(SOURCES[id][1], escapeHTML(SOURCES[id][0]))).join('')}</div>`;
}
function badge(text, kind = '') { return `<span class="badge ${kind}">${text}</span>`; }
function stepBadges(step) {
  return `<div class="badge-row">${badge(step.timeKind === 'fixed' ? 'Heure fixe' : 'Heure indicative', step.timeKind === 'fixed' ? 'fixed' : '')}${step.optional ? badge('En option', 'optional') : ''}${step.confirm ? badge('Horaire à confirmer', 'confirm') : ''}</div>`;
}
function priceText(visit) {
  return `${visit.approximate ? 'Environ ' : ''}${money(visit.adult)} par adulte · ${money(visit.two)} pour deux`;
}
function tripNote() {
  return `<p class="practical-note">Marche en priorité pour les trajets courts, puis bus ou tram si le parcours complet prend moins de 25 min. Entre 25 et 30 min, privilégiez encore les transports. Uber seulement si marche et transports prennent chacun au moins 30 min, sauf le départ ensemble du lundi vers l’aéroport. Les temps incluent la marche d’accès lorsqu’un bus est indiqué, mais excluent l’attente, les files et les bagages. Vérifiez les départs et perturbations le jour même. Les heures indicatives peuvent glisser. Tous les horaires suivent l’heure locale de Barcelone, Europe/Madrid. Aucun billet n’est présenté comme réservé.</p>`;
}
function flightInfo(flights) {
  return `<div class="flight-info">${flights.map(flight => `<p><strong>${flight.time} · ${flight.airline} ${flight.number}</strong><br>${flight.label}</p>`).join('')}<p>Horaires de vol communiqués pour le lundi 16 novembre. Vérifiez les deux cartes d’embarquement et les terminaux avant le départ.</p></div>`;
}
function hotelCard() {
  return `<section class="side-card"><p class="eyebrow">VOS POINTS DE REPÈRE</p><h3>Deux adresses, un séjour</h3>
    ${[['sofitel', 'JEUDI → VENDREDI', 'Première nuit, au bord de la mer.'], ['praktik', 'VENDREDI → LUNDI', 'Installation vendredi à partir de 15 h.']].map(([id, dates, detail]) => `<div class="hotel"><span class="hotel-label">${dates}</span><strong>${PLACES[id].name}</strong><p>${PLACES[id].address}<br>${detail}</p>${mapsButton(id, 'Retrouver l’hôtel', 'text-button')}</div>`).join('')}
    <details class="trip-info"><summary>Infos voyage</summary><p>Jeudi : arrivée communiquée à 10 h 45. Première sortie ensemble à 15 h.</p><p><a href="#today/4">Retrouver vos vols dans la journée du lundi.</a></p>${mapsButton('airport', 'Retrouver l’aéroport', 'text-button')}</details></section>`;
}
function weatherFor(day) {
  const live = Weather.day(day.date);
  if (live) return { ...live, forecast: live.text, live: true };
  const edit = state.weather[day.date];
  return { ...(edit && typeof edit.range === 'string' && typeof edit.forecast === 'string' ? edit : { range: day.weather, forecast: day.forecast }), icon: day.icon, live: false };
}
function weatherSummary(day) {
  const weather = weatherFor(day);
  return `${escapeHTML(weather.forecast)}${weather.live ? ` · Précipitations : ${weather.probability === null ? 'probabilité indisponible' : `${weather.probability} % au maximum sur une heure`}${weather.amount === null ? '' : ` · ${weather.amount.toLocaleString('fr-FR')} mm prévus`}` : ' · Note de planification, non actualisée. Probabilité de pluie indisponible.'}`;
}
function weatherStatus() {
  const status = Weather.status();
  const date = status.receivedAt ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(status.receivedAt) : '';
  return `<div class="weather-status" role="status"><p>${date ? `Prévisions récupérées le ${date}, heure de Barcelone.${status.stale ? ' Données en mémoire, non actualisées.' : ''}` : 'Aucune prévision actualisée reçue pour le moment.'}${status.loading ? ' Actualisation en cours…' : ''}</p>
    ${status.error || status.offline ? `<p class="weather-error">${escapeHTML(status.error || 'Vous êtes hors ligne. Les prévisions affichées proviennent de la mémoire de cet appareil.')}</p>` : ''}
    ${status.storageError ? `<p class="weather-error">${escapeHTML(status.storageError)}</p>` : ''}
    <p>Source : ${external('https://open-meteo.com/', 'Open-Meteo')} · Prévisions, pas une observation en direct. Actualisation toutes les 30 min lorsque le carnet est ouvert.</p>
    <button class="btn secondary small" data-weather-refresh ${status.loading ? 'disabled' : ''}>${status.loading ? 'Actualisation…' : 'Actualiser la météo'}</button></div>`;
}
function weatherDetails(day) {
  const weather = weatherFor(day);
  const hours = weather.live ? weather.hours.filter(hour => hour.time >= '08:00' && hour.time <= '22:00') : [];
  return `<div class="weather-card-top"><span class="weather-symbol" aria-hidden="true">${weather.icon}</span><h3>${escapeHTML(weather.range)}</h3></div><p>${weatherSummary(day)}</p>
    ${weather.live ? '' : '<p class="small">Cette date n’est pas disponible dans les prévisions reçues. Note initiale consultée le 10 novembre 2026, ou note personnelle de cet appareil.</p>'}
    ${hours.length ? `<details><summary>Possibilités de pluie heure par heure · 8 h à 22 h</summary><p class="small">Probabilité de précipitations supérieures à 0,1 mm pour l’heure qui précède l’horaire affiché. Le pourcentage quotidien est le maximum horaire, pas la probabilité de pluie sur toute la journée.</p><div class="rain-hours">${hours.map(hour => `<div><span>${hour.time.replace(':', ' h ')}</span><strong>${hour.probability === null ? 'Indisponible' : `${hour.probability} %`}</strong><span>${hour.amount === null ? 'Quantité inconnue' : `${hour.amount.toLocaleString('fr-FR')} mm`}</span></div>`).join('')}</div></details>` : ''}
    ${weatherStatus()}`;
}
function refreshWeatherUI() {
  main.querySelectorAll('[data-weather-header]').forEach(element => {
    const day = DAYS.find(day => day.date === element.dataset.weatherHeader);
    const weather = weatherFor(day);
    element.innerHTML = `<span class="weather-symbol" aria-hidden="true">${weather.icon}</span><span>${escapeHTML(weather.range)}</span>`;
    element.setAttribute('aria-label', `${weather.range}, ${weather.forecast}`);
  });
  main.querySelectorAll('[data-weather-summary]').forEach(element => {
    element.innerHTML = weatherSummary(DAYS.find(day => day.date === element.dataset.weatherSummary));
  });
  main.querySelectorAll('[data-weather-details]').forEach(element => {
    const open = element.querySelector('details')?.open;
    element.innerHTML = weatherDetails(DAYS.find(day => day.date === element.dataset.weatherDetails));
    if (open && element.querySelector('details')) element.querySelector('details').open = true;
  });
  main.querySelectorAll('[data-weather-status]').forEach(element => { element.innerHTML = weatherStatus(); });
}
function renderOverview() {
  main.innerHTML = `<div class="section-heading"><div><p class="eyebrow">LE VOYAGE EN UN REGARD</p><h2>Cinq jours à savourer</h2><p>Un fil conducteur, pas une course. Gardez de la place pour l’imprévu.</p></div><span class="section-count">12 → 16 novembre</span></div>
    <div class="overview-layout"><div class="days">${DAYS.map((day, index) => {
      const weather = weatherFor(day);
      return `<article class="day-card"><div class="day-card-top"><div class="date-block"><span>${day.weekday.slice(0, 3)}.</span><strong>${day.day}</strong><span>NOV.</span></div><div><h3>${day.title}</h3><p class="day-subtitle">${day.subtitle}</p></div><div class="day-weather" data-weather-header="${day.date}" aria-label="${escapeHTML(`${weather.range}, ${weather.forecast}`)}"><span class="weather-symbol" aria-hidden="true">${weather.icon}</span><span>${escapeHTML(weather.range)}</span></div></div>
      <div class="mini-timeline">${day.steps.map(step => `${step.route ? `<div class="mini-route">${routeLabel(activeRoute(step.route, index))} · ${activeRoute(step.route, index).duration}</div>` : ''}<div class="mini-step"><span class="mini-time">${step.overviewTime}</span><div class="mini-name">${step.summary}${step.optional ? '<span class="mini-badge">En option</span>' : ''}${step.confirm ? '<span class="mini-badge">À confirmer</span>' : ''}${step.visit ? `<span class="mini-price">${priceText(getVisit(step.visit))}</span>` : ''}</div></div>`).join('')}${day.flights ? day.flights.map(flight => `<div class="mini-step"><span class="mini-time">${flight.time}</span><div class="mini-name">${flight.airline} ${flight.number}<span class="mini-price">${flight.label} · Horaire communiqué</span></div></div>`).join('') : ''}<p class="mini-forecast" data-weather-summary="${day.date}">${weatherSummary(day)}</p></div>
      <div class="day-card-bottom"><span class="day-note">${day.note}</span><a class="text-button" href="#today/${index}">Voir la journée <span aria-hidden="true">↗</span></a></div></article>`;
    }).join('')}</div><aside>${hotelCard()}</aside></div>
    <div data-weather-status>${weatherStatus()}</div>${tripNote()}`;
}
function routeLabel(value) { return value.mode === 'walking' ? 'À pied' : (value.label || 'Voiture'); }
function activeRoute(value, dayIndex) {
  if (value.skipId && state.progress[`${DAYS[dayIndex].date}:${value.skipId}`] === 'skipped') return value.fallback;
  if (value.entranceVariants?.[state.parkEntrance]) return value.entranceVariants[state.parkEntrance];
  return value;
}
function renderRoute(value, dayIndex) {
  const selected = activeRoute(value, dayIndex);
  return `<div class="route-card"><div class="route-title">Comment y aller</div><strong>${escapeHTML(resolvePlace(selected.from).name)} → ${escapeHTML(resolvePlace(selected.to).name)}</strong><p>${routeLabel(selected)} · ${selected.duration}</p>${external(mapsURL(selected.to, selected.from, selected.mode), 'Ouvrir l’itinéraire dans Google Maps ↗', 'text-button')}
    ${selected.instructions ? `<p>${escapeHTML(selected.instructions)}</p>` : ''}
    ${selected.reason ? `<p>${escapeHTML(selected.reason)}</p>` : ''}
    ${selected.mode === 'transit' || selected.checkTransit ? `<p>Dans Google Maps, choisissez un parcours en bus ou tram. Le lien « transports » peut aussi proposer d’autres modes ; il ne garantit pas la ligne indiquée ici.</p>` : ''}
    ${selected.checkTransit ? external(mapsURL(selected.to, selected.from, 'transit'), 'Comparer les bus et trams dans Google Maps ↗', 'text-button') : ''}
    ${selected.sources ? sourceLinks(selected.sources) : ''}
    ${selected.alternative ? `<p>Autre option : ${routeLabel(selected.alternative)} · ${selected.alternative.duration}</p>${external(mapsURL(selected.alternative.to, selected.alternative.from, selected.alternative.mode), 'Cette option dans Google Maps ↗', 'text-button')}` : ''}
    ${value.direct ? `<p>Depuis la Sagrada Família directement : ${value.direct.duration} à pied.</p>${external(mapsURL(value.direct.to, value.direct.from, value.direct.mode), 'Trajet direct dans Google Maps ↗', 'text-button')}` : ''}
    ${value.fallback && selected === value ? `<p>Sans le MUHBA : depuis Santa Maria del Mar, ${value.fallback.duration} à pied.</p>${external(mapsURL(value.fallback.to, value.fallback.from), 'Sans le musée dans Google Maps ↗', 'text-button')}` : ''}
    ${value.airportAlternative ? `<details><summary>Autre option : Aerobús puis marche ou bus</summary><p>Aerobús A1 depuis T1 ou A2 depuis T2 jusqu’à Plaça de Catalunya, environ 35 min. Puis comparez la marche et les bus vers le Sofitel. Pour cette seconde partie, Uber seulement si marche et transports demandent chacun au moins 30 min. Attente et correspondance non comprises.</p>${external(SOURCES.aerob[1], 'Lignes et arrêts officiels Aerobús ↗', 'text-button')}${external(mapsURL('sofitel', 'catalunya', 'transit'), 'Bus depuis Plaça de Catalunya · Google Maps ↗', 'text-button')}</details>` : ''}</div>`;
}
function terminalBox() {
  return `<div class="terminal-box"><strong>Avant d’ouvrir votre itinéraire</strong><p>Vérifiez les deux cartes d’embarquement. Sans confirmation, Google Maps vise l’aéroport en général.</p><label for="terminal-select">Terminal prévu</label><select id="terminal-select"><option value="">Aéroport, terminal non confirmé</option><option value="t1" ${state.terminal === 't1' ? 'selected' : ''}>Terminal T1</option><option value="t2" ${state.terminal === 't2' ? 'selected' : ''}>Terminal T2</option></select><label><input id="terminal-verified" type="checkbox" ${state.terminalVerified ? 'checked' : ''} ${!state.terminal ? 'disabled' : ''}>J’ai vérifié les deux cartes d’embarquement</label></div>`;
}
function parkBox() {
  return `<div class="terminal-box"><label for="park-entrance">Entrée vérifiée sur votre billet</label><select id="park-entrance"><option value="">Choisir après vérification du billet</option>${Object.entries(parkEntrances).map(([id, place]) => `<option value="${id}" ${state.parkEntrance === id ? 'selected' : ''}>${place.name}</option>`).join('')}</select><p>Sans choix, le lien ouvre le parc en général, pas une entrée garantie. Les temps de marche varient selon l’accès.</p></div>`;
}
function stepControls(dayIndex, step) {
  const progress = getProgress(dayIndex, step);
  return `<div class="step-controls">${progress ? `<span class="status-text">${progress === 'done' ? '✓ Terminée, à votre demande' : 'Étape passée, à votre demande'}</span><button class="btn secondary small" data-progress="" data-step="${step.id}">Revenir sur ce choix</button>` : `<button class="btn secondary small" data-progress="done" data-step="${step.id}">✓ Terminée</button><button class="btn secondary small" data-progress="skipped" data-step="${step.id}">Passer cette étape</button>`}</div>`;
}
function nextStep(dayIndex, clock = madridNow()) {
  const day = DAYS[dayIndex];
  const available = day.steps.filter(step => !getProgress(dayIndex, step));
  if (!available.length) return null;
  if (day.date !== clock.date) return available[0];
  return available.find(step => step.minute >= clock.minute) || available[available.length - 1];
}
function nextCard(dayIndex) {
  const step = nextStep(dayIndex);
  if (!step) return `<section class="next-card"><p class="eyebrow">À VOTRE RYTHME</p><h3>La journée vous appartient</h3><p>Vous avez marqué toutes les étapes comme terminées ou passées. Vous pouvez revenir sur chacun de ces choix ci dessous.</p></section>`;
  const visit = getVisit(step.visit);
  const currentRoute = step.route && activeRoute(step.route, dayIndex);
  return `<section class="next-card"><p class="eyebrow">PROCHAINE ÉTAPE <span>·</span> ${madridNow().time} À BARCELONE</p><h3>${step.id === 'jumuaa' ? 'Jumuaa à 13 h 10' : step.label}</h3>${stepBadges(step)}<p><strong>${step.id === 'jumuaa' ? 'Arrivée visée à 12 h 50' : step.time}</strong></p>${currentRoute ? `<p>Depuis ${escapeHTML(resolvePlace(currentRoute.from).name)} · ${routeLabel(currentRoute).toLowerCase()} · ${currentRoute.duration}</p>` : ''}
    ${currentRoute?.reason ? `<p class="small">${escapeHTML(currentRoute.reason)}</p>` : ''}
    ${visit ? `<p>${priceText(visit)}</p><p class="small">${visit.type} · ${visit.status}</p>` : step.free ? '<p>Gratuit</p>' : ''}
    <div class="button-row">${currentRoute ? external(mapsURL(currentRoute.to, currentRoute.from, currentRoute.mode), 'Ouvrir l’itinéraire dans Google Maps ↗', 'btn') : mapsButton(step.place, 'Ouvrir dans Google Maps', 'btn')}${visit ? external(SOURCES[visit.source][1], 'Billets officiels ↗', 'btn secondary') : ''}<a href="#step-${step.id}" class="btn secondary">Voir les détails ↓</a></div>
    ${step.terminal ? '<p class="small">Terminal non confirmé ? Le lien vise l’aéroport. Choisissez un terminal dans la fiche après vérification des deux cartes.</p>' : ''}
    <p class="small">Suggestion selon l’heure, pas une étape validée. Les étapes précédentes restent à votre choix, y compris si leur horaire est passé.</p>${stepControls(dayIndex, step)}</section>`;
}
function renderStep(step, index, dayIndex) {
  const visit = getVisit(step.visit);
  const progress = getProgress(dayIndex, step);
  return `${step.route ? renderRoute(step.route, dayIndex) : ''}<article class="step-card ${progress === 'done' ? 'is-done' : progress === 'skipped' ? 'is-skipped' : ''}" id="step-${step.id}">
    <div class="step-head"><span class="step-number">${String(index + 1).padStart(2, '0')}</span><div><p class="step-time">${step.time}</p><h3>${step.label}</h3>${stepBadges(step)}</div></div>
    <div class="step-body"><p>${step.body}</p></div>
    ${step.terminal ? terminalBox() : ''}${step.parkEntrance ? parkBox() : ''}
    ${step.observe ? `<div class="detail-box"><strong>Le détail à repérer</strong><p>${step.observe}</p></div>` : ''}
    ${step.details ? `<div class="detail-box"><strong>À savoir avant de partir</strong><p>${step.details}</p></div>` : ''}
    ${visit ? `<p class="price-line">${priceText(visit)}</p><p class="ticket-type">${visit.type} · ${visit.status}${visit.approximate ? ' · Tarif à confirmer' : ''}</p>` : step.free ? '<p class="price-line">Gratuit · Aucun billet nécessaire</p>' : ''}
    <div class="button-row">${mapsButton(step.place, step.parkEntrance ? 'Google Maps · Accès choisi' : 'Ouvrir le lieu dans Google Maps')}${visit ? external(SOURCES[visit.source][1], 'Billets officiels ↗', 'btn small') : ''}${step.id === 'born' ? external(SOURCES.mariaTickets[1], 'Intérieur en option · Horaires et tarifs ↗', 'btn secondary small') : ''}</div>
    ${step.alternativeMosque ? `<div class="detail-box"><strong>Option 13 h · Autre mosquée, autre trajet</strong><p>${PLACES.alternative.name}, ${PLACES.alternative.address}. Horaire affiché à confirmer. Ce trajet n’est pas celui du Centre Islàmic del Raval.</p><div class="button-row">${external(mapsURL('alternative', 'zoo', 'driving'), 'Google Maps · Zoo → Autre mosquée en voiture ↗', 'btn secondary small')}${mapsButton('alternative', 'Localiser cette mosquée')}</div></div>` : ''}
    ${step.story ? `<details><summary>Une histoire à emporter</summary><p>${step.story}</p></details>` : ''}
    ${step.history ? `<p class="sources"><a href="#history/${step.history}">Lire le chapitre « ${HISTORY.find(chapter => chapter.id === step.history).title} » ↗</a></p>` : ''}
    ${sourceLinks(step.sources)}${stepControls(dayIndex, step)}</article>`;
}
function getPhrase(id) {
  const item = PHRASES.flatMap(group => group.items).find(phrase => phrase[0] === id);
  if (id !== 'terminal') return item;
  if (state.terminal && state.terminalVerified) return ['terminal', `A la terminal ${state.terminal === 't1' ? 'uno' : 'dos'} del aeropuerto, por favor.`, `Au terminal ${state.terminal === 't1' ? 'un' : 'deux'} de l’aéroport, s’il vous plaît.`];
  return ['terminal', 'Al aeropuerto, por favor. Tenemos que confirmar la terminal.', 'À l’aéroport, s’il vous plaît. Nous devons confirmer le terminal.'];
}
function shortcuts(day) {
  return `<section class="phrase-shortcut"><h4>Les mots qui vous seront utiles</h4>${day.phrases.map(id => `<button data-large="${id}" lang="es">${getPhrase(id)[1]} <span aria-hidden="true">↗</span></button>`).join('')}<a class="text-button" href="#spanish">Tout l’espagnol pratique ↗</a></section>`;
}
function weatherCard(day) {
  const note = state.weather[day.date] || { range: day.weather, forecast: day.forecast };
  return `<section class="weather-card"><div data-weather-details="${day.date}">${weatherDetails(day)}</div><details><summary>Votre note météo personnelle</summary><p>Cette note ne remplace pas les prévisions actualisées.</p>${state.weather[day.date] ? `<p>${escapeHTML(note.range)} · ${escapeHTML(note.forecast)}</p>` : ''}<form id="weather-form"><label>Températures<input name="range" value="${escapeHTML(note.range)}" required maxlength="60"></label><label>Votre note<input name="forecast" value="${escapeHTML(note.forecast)}" required maxlength="250"></label><button class="btn small" type="submit">Enregistrer la note</button></form></details></section>`;
}
function renderToday() {
  const day = DAYS[selectedDay];
  main.innerHTML = `<div class="section-heading"><div><p class="eyebrow">VOTRE JOURNÉE, PAS À PAS</p><h2>${day.weekday} ${day.day} novembre</h2><p>${day.subtitle}</p></div><label class="sr-only" for="day-select">Choisir une journée</label><select id="day-select" class="day-select">${DAYS.map((item, index) => `<option value="${index}" ${selectedDay === index ? 'selected' : ''}>${item.weekday} ${item.day} novembre</option>`).join('')}</select></div>
    <div class="today-layout"><div><div id="next-step">${nextCard(selectedDay)}</div>${weatherCard(day)}${day.steps.map((step, index) => renderStep(step, index, selectedDay)).join('')}${day.flights ? `<section class="step-card flight-card"><p class="eyebrow">LUNDI 16 NOVEMBRE</p><h3>Vos vols de retour</h3>${badge('Heure fixe', 'fixed')}<div class="step-body">${flightInfo(day.flights)}</div></section>` : ''}</div><aside>${shortcuts(day)}${hotelCard()}<div class="gentle-note"><strong>Le programme s’adapte à vous</strong>« Terminée » et « Passer cette étape » sont des choix manuels, réversibles et mémorisés ici. L’heure ne coche jamais une étape à votre place.</div></aside></div>${tripNote()}`;
}
function renderHistory() {
  main.innerHTML = `<div class="section-heading"><div><p class="eyebrow">LES LIEUX ONT UNE MÉMOIRE</p><h2>Barcelone, au fil des siècles</h2><p>Quelques clés pour regarder autrement les rues que vous traversez.</p></div></div><div class="timeline">${HISTORY.map(chapter => `<article class="history-chapter" id="history-${chapter.id}"><p class="history-era">${chapter.era}</p><h3>${chapter.title}</h3>${chapter.paragraphs.map(paragraph => `<p class="history-text">${escapeHTML(paragraph)}</p>`).join('')}<div class="detail-box"><p>${chapter.detail}</p></div>${sourceLinks(chapter.sources)}<div class="button-row"><a href="#today/${chapter.day}/${chapter.step}" class="btn secondary small">Voir dans le programme ↗</a>${chapter.also ? `<a href="#today/${chapter.also.day}/${chapter.also.step}" class="btn secondary small">${chapter.also.label} ↗</a>` : ''}</div></article>`).join('')}</div>`;
}
function renderSpanish() {
  main.innerHTML = `<div class="section-heading"><div><p class="eyebrow">QUELQUES MOTS, BEAUCOUP DE LIENS</p><h2>On se comprend ?</h2><p>Un peu d’espagnol pour vous sentir à l’aise au quotidien.</p></div><span class="section-count">16 phrases utiles</span></div><p class="spanish-notice">Les phrases restent disponibles hors ligne après la mise en mémoire du carnet. « Afficher en grand » vous permet de les montrer à quelqu’un. La phrase du terminal suit votre choix vérifié dans la journée du lundi. Sans vérification, elle demande de confirmer le terminal.</p><div class="spanish-grid">${PHRASES.map(group => `<section class="phrase-group"><h3>${group.title}</h3>${group.items.map(item => {
    const phrase = getPhrase(item[0]);
    return `<article class="phrase-card" id="phrase-${phrase[0]}"><p class="spanish-phrase" lang="es">${phrase[1]}</p><p class="french-phrase">${phrase[2]}</p><div class="phrase-actions"><button data-large="${phrase[0]}">⤢ Afficher en grand</button><button data-copy="${phrase[0]}">Copier ↗</button></div></article>`;
  }).join('')}</section>`).join('')}</div>`;
}
function routePage({ scroll = true } = {}) {
  const [rawTab, dayOrChapter, step] = location.hash.slice(1).split('/');
  if (rawTab.startsWith('step-')) return;
  const tab = ['overview', 'today', 'history', 'spanish'].includes(rawTab) ? rawTab : (tripDates.includes(madridNow().date) ? 'today' : 'overview');
  if (tab === 'today' && dayOrChapter !== undefined && /^[0-4]$/.test(dayOrChapter)) {
    selectedDay = Number(dayOrChapter);
    manualDay = true;
  } else if (tab === 'today' && !manualDay) selectedDay = Math.max(0, tripDates.indexOf(madridNow().date));
  currentTab = tab;
  document.querySelectorAll('[data-tab]').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tab);
    if (link.dataset.tab === tab) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  ({ overview: renderOverview, today: renderToday, history: renderHistory, spanish: renderSpanish })[tab]();
  const titles = { overview: 'Vue d’ensemble', today: `${DAYS[selectedDay].weekday} ${DAYS[selectedDay].day} novembre`, history: 'Histoire de Barcelone', spanish: 'Espagnol pratique' };
  document.title = `${titles[tab]} · Barcelone à deux`;
  if (scroll) {
    const target = tab === 'history' && dayOrChapter ? document.getElementById(`history-${dayOrChapter}`) : tab === 'today' && step ? document.getElementById(`step-${step}`) : main;
    target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    if (target !== main) {
      target?.classList.add('anchor-highlight');
      target?.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
    } else main.focus({ preventScroll: true });
  }
}
function refreshToday() {
  const y = window.scrollY;
  const focused = document.activeElement?.id;
  renderToday();
  window.scrollTo({ top: y, behavior: 'instant' });
  if (focused) document.getElementById(focused)?.focus({ preventScroll: true });
}
function showPhrase(id) {
  const phrase = getPhrase(id);
  if (!phrase) return;
  document.querySelector('#large-phrase').textContent = phrase[1];
  document.querySelector('#large-translation').textContent = phrase[2];
  document.querySelector('#phrase-dialog').showModal();
}
main.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'day-select') {
    manualDay = true;
    location.hash = `today/${target.value}`;
  }
  if (target.id === 'terminal-select') {
    state.terminal = target.value;
    state.terminalVerified = false;
    persist();
    refreshToday();
  }
  if (target.id === 'terminal-verified') {
    state.terminalVerified = Boolean(state.terminal && target.checked);
    persist();
    refreshToday();
  }
  if (target.id === 'park-entrance') {
    state.parkEntrance = target.value;
    persist();
    refreshToday();
  }
});
main.addEventListener('submit', event => {
  if (event.target.id !== 'weather-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  const range = form.get('range').trim();
  const forecast = form.get('forecast').trim();
  if (!range || !forecast) { notify('Renseignez les températures et les prévisions.'); return; }
  state.weather[DAYS[selectedDay].date] = { range, forecast };
  const stored = persist();
  refreshToday();
  if (stored) notify('Votre note météo est enregistrée sur cet appareil.');
});
main.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-weather-refresh')) await Weather.refresh();
  if (button.hasAttribute('data-progress')) {
    const step = DAYS[selectedDay].steps.find(item => item.id === button.dataset.step);
    const key = progressKey(selectedDay, step);
    if (button.dataset.progress) state.progress[key] = button.dataset.progress;
    else delete state.progress[key];
    persist();
    refreshToday();
    // Keep keyboard focus near the choice even when the suggested step changes.
    main.querySelector(`#step-${step.id} .step-controls button`)?.focus({ preventScroll: true });
  }
  if (button.dataset.large) showPhrase(button.dataset.large);
  if (button.dataset.copy) {
    const phrase = getPhrase(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(phrase[1]);
      notify('Phrase copiée.');
    } catch (error) {
      console.warn('Copie indisponible.', error);
      notify('La copie est indisponible. La phrase s’ouvre en grand pour la sélectionner.');
      showPhrase(button.dataset.copy);
    }
  }
});
document.querySelector('.dialog-close').addEventListener('click', () => document.querySelector('#phrase-dialog').close());
document.querySelector('#phrase-dialog').addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
  }
});
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
});
let foldedForPrint = [];
window.addEventListener('beforeprint', () => {
  foldedForPrint = Array.from(main.querySelectorAll('details:not([open])'));
  foldedForPrint.forEach(details => { details.open = true; });
});
window.addEventListener('afterprint', () => {
  foldedForPrint.forEach(details => { details.open = false; });
  foldedForPrint = [];
});
window.addEventListener('hashchange', () => routePage());
routePage({ scroll: Boolean(location.hash) || tripDates.includes(currentClock.date) });
if (storageWarning) notify(storageWarning);
Weather.start(refreshWeatherUI);

setInterval(() => {
  const now = madridNow();
  if (now.date !== currentClock.date && !manualDay) {
    selectedDay = Math.max(0, tripDates.indexOf(now.date));
    if (currentTab === 'today') renderToday();
  } else if (currentTab === 'today' && now.minute !== currentClock.minute) {
    document.querySelector('#next-step').innerHTML = nextCard(selectedDay);
  }
  currentClock = now;
}, 15000);

let offlineReady = false;
function updateOfflineStatus() {
  document.querySelector('#offline-state').textContent = !navigator.onLine
    ? 'Vous êtes hors ligne · Maps et billetteries nécessitent une connexion'
    : offlineReady ? 'Carnet disponible hors ligne · Maps et billets avec connexion' : 'Carnet local · Mise en mémoire hors ligne en cours';
}
window.addEventListener('online', updateOfflineStatus);
window.addEventListener('offline', updateOfflineStatus);
if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
    offlineReady = true;
    updateOfflineStatus();
  }).catch(error => {
    console.warn('Mode hors ligne indisponible.', error);
    document.querySelector('#offline-state').textContent = 'Mode hors ligne indisponible. Gardez cette page ouverte ou imprimez le carnet.';
  });
} else {
  document.querySelector('#offline-state').textContent = 'Pour le mode hors ligne, ouvrez le carnet via localhost ou un hébergement HTTPS.';
}
