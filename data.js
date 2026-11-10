'use strict';

const SOURCES = {
  airportBus: ['Aena · Accès en bus', 'https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/bus.html'],
  aerob: ['Aerobús · Lignes et arrêts', 'https://aerobusbarcelona.es/?lang=en'],
  bus24: ['TMB · Bus 24', 'https://www.tmb.cat/en/barcelona/buses/-/lineabus/24'],
  parkAccess: ['Parc Güell · Accès et marche depuis les arrêts', 'https://parkguell.barcelona/en/planning-your-visit/how-to-get-there'],
  parkBusEstimate: ['Rome2Rio · Praktik Bakery vers Parc Güell en bus', 'https://www.rome2rio.com/Bus/Praktik-Bakery-Barcelona/Park-G%C3%BCell'],
  cable: ['Téléphérique · Horaires et tarifs', 'https://www.telefericodebarcelona.com/horarios/'],
  cableHistory: ['Téléphérique · Histoire', 'https://www.telefericodebarcelona.com/history-and-technical-data/'],
  maria: ['Santa Maria del Mar · Histoire', 'https://www.santamariadelmar.barcelona/en/history/'],
  mariaTickets: ['Santa Maria del Mar · Horaires et tarifs', 'https://www.santamariadelmar.barcelona/en/opening-hours-and-admission-fees/'],
  born: ['Patrimoni · El Born', 'https://patrimoni.gencat.cat/es/node/1398'],
  muhba: ['Ville de Barcelone · MUHBA', 'https://guia.barcelona.cat/es/detall/museu-d-historia-de-barcelona-placa-del-rei_92086011563.html'],
  cathedral: ['MNAC · Cathédrale de Barcelone', 'https://historiesdelgotic.museunacional.cat/en/el-gotic-catala/barcelona-cathedral/'],
  zoo: ['Zoo · Site et billetterie', 'https://zoobarcelona.cat/es'],
  zooHistory: ['Zoo · Histoire', 'https://zoobarcelona.cat/en/history'],
  raval: ['Faseela · Centre Islàmic del Raval', 'https://www.faseela.org/barcelona/centro-islamico-del-raval-de-barcelona'],
  alternative: ['Masjidbox · Centre Cultural Islàmic Català', 'https://masjidbox.com/tiempos-de-oracion/centre-cultural-islamic-catala'],
  migration: ['Université de Barcelone · Migrations', 'https://www.ub.edu/geocrit/b3w-1094.htm'],
  sagrada: ['Sagrada Família · Les façades', 'https://sagradafamilia.org/es/galeria-fotografica'],
  pedrera: ['La Pedrera · Billet Essential', 'https://www.lapedrera.com/en/tickets/la-pedrera-essential/'],
  park: ['Parc Güell · Prix et horaires', 'https://parkguell.barcelona/en/planning-your-visit/prices-and-times/'],
  parkConditions: ['Parc Güell · Conditions du billet et modifications', 'https://parkguell.barcelona/en/planning-your-visit/faqs'],
  gaudi: ['Sagrada Família · Casa Museu Gaudí', 'https://sagradafamilia.org/es/casa-museo-gaudi'],
  gracia: ['Barcelona Turisme · Gràcia', 'https://bid.barcelonaturisme.com/wv3/en/page/1072/gracia-and-park-guell.html'],
  airport: ['Aena · Terminaux et départs', 'https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/airport-services/categories-and-terminals/departures-area.html'],
  medieval: ['Histoire · Barcelone musulmane', 'https://www.historia.egv.es/montjuic/musulmans/index.html'],
  medievalCity: ['Histoire · Conquête et gouvernement musulman', 'https://www.historia.egv.es/barcelona/medieval/musulmanes.html'],
  cerda: ['Barcelona Turisme · Plan Cerdà', 'https://www.barcelonaturisme.com/wv3/es/page/5419/barcelona-turisme.html']
};
const PLACES = {
  catalunya: { name: 'Plaça de Catalunya', query: 'Plaça de Catalunya Barcelona' },
  airport: { name: 'Aéroport de Barcelone El Prat', query: 'Aéroport Josep Tarradellas Barcelona El Prat BCN' },
  t1: { name: 'Aéroport BCN · Terminal T1', query: 'Barcelona El Prat Airport Terminal 1 departures' },
  t2: { name: 'Aéroport BCN · Terminal T2', query: 'Barcelona El Prat Airport Terminal 2 departures' },
  sofitel: { name: 'Sofitel Barcelona Skipper', query: 'Sofitel Barcelona Skipper Avinguda del Litoral 10 Barcelona', address: 'Avinguda del Litoral, 10' },
  praktik: { name: 'Praktik Bakery', query: 'Praktik Bakery Carrer de Provença 279 Barcelona', address: 'Carrer de Provença, 279' },
  tower: { name: 'Torre de Sant Sebastià', query: 'Torre de Sant Sebastià Passeig de Joan de Borbó Barcelona' },
  born: { name: 'Santa Maria del Mar', query: 'Basílica de Santa Maria del Mar Plaça de Santa Maria Barcelona' },
  muhba: { name: 'MUHBA · Plaça del Rei', query: 'MUHBA Plaça del Rei Barcelona' },
  cathedral: { name: 'Parvis de la cathédrale', query: 'Pla de la Seu Barcelona' },
  zoo: { name: 'Zoo · Entrée du Parc de la Ciutadella', query: 'Zoo de Barcelona entrada Parc de la Ciutadella Passeig de Picasso' },
  raval: { name: 'Centre Islàmic del Raval', query: 'Centre Islàmic del Raval Carrer de la Lluna 11 Barcelona', address: 'Carrer de la Lluna, 11' },
  alternative: { name: 'Centre Cultural Islàmic Català', query: 'Centre Cultural Islàmic Català Carrer de Rafael Capdevila Barcelona', address: 'Carrer de Rafael Capdevila' },
  nativity: { name: 'Plaça de Gaudí · Façade de la Nativité', query: 'Plaça de Gaudí Barcelona' },
  passion: { name: 'Plaça de la Sagrada Família · Façade de la Passion', query: 'Plaça de la Sagrada Família Barcelona' },
  pedrera: { name: 'La Pedrera · Entrée', query: 'La Pedrera Casa Milà entrada Passeig de Gràcia 92 Barcelona' },
  shopping: { name: 'Passeig de Gràcia', query: 'Passeig de Gràcia Barcelona' },
  park: { name: 'Parc Güell · Entrée à choisir selon le billet', query: 'Park Güell Barcelona' },
  gracia: { name: 'Plaça de la Vila de Gràcia', query: 'Plaça de la Vila de Gràcia Barcelona' }
};
const VISITS = [
  { id: 'cable', name: 'Téléphérique du Port', adult: 2000, two: 4000, type: 'Aller et retour', status: 'À vérifier', source: 'cable' },
  { id: 'zoo', name: 'Zoo de Barcelone', adult: 2140, two: 4280, approximate: true, type: 'Entrée adulte', status: 'À vérifier', source: 'zoo' },
  { id: 'pedrera', name: 'La Pedrera', adult: 2900, two: 5800, type: 'Billet Essential', status: 'À réserver', source: 'pedrera' },
  { id: 'park', name: 'Parc Güell', adult: 1800, two: 3600, type: 'Billet général', status: 'À réserver', source: 'park' },
  { id: 'muhba', name: 'MUHBA', adult: 730, two: 1460, type: 'Entrée Plaça del Rei', status: 'À vérifier', optional: true, source: 'muhba' }
];
const FLIGHTS = [
  { time: '12 h 10', airline: 'Air France', number: 'AF1349', label: 'Votre vol' },
  { time: '12 h 35', airline: 'Vueling', number: 'VY8132', label: 'Son vol' }
];
const route = (from, to, mode, duration, extra = {}) => ({ from, to, mode, duration, ...extra });
const DAYS = [
  {
    date: '2026-11-12', weekday: 'Jeudi', day: '12', title: 'De la mer aux vieilles pierres', subtitle: 'Barceloneta, téléphérique et vieille ville', icon: '☀', weather: '15 à 23 °C', forecast: 'Plutôt ensoleillé, un peu de vent le matin.', note: 'Première sortie ensemble à 15 h', phrases: ['cableLast'],
    steps: [
      { id: 'arrival', time: '10 h 45', minute: 645, timeKind: 'fixed', label: 'Arrivée à Barcelone', place: 'sofitel', summary: 'Arrivée, hôtel et repos', overviewTime: '10 h 45',
        body: 'Horaire d’arrivée du vol communiqué : 10 h 45. Il rejoint le Sofitel et se repose. Vous commencez votre première sortie ensemble à 15 h, pas avant.',
        route: route('airport', 'sofitel', 'driving', '25 à 40 min', { label: 'Taxi ou Uber', airportAlternative: true, reason: 'Trajet long : l’Aerobús seul prend environ 35 min, avant la liaison vers le Sofitel. Vérifiez le trajet complet avant le départ.' }),
        sources: ['airportBus', 'aerob'], details: 'Pour le taxi, rejoignez la station de votre terminal. Pour Uber, suivez le point de prise en charge indiqué dans l’application. Le temps de route commence au départ de l’aéroport et n’inclut pas les bagages.' },
      { id: 'beach', time: '15 h', minute: 900, timeKind: 'fixed', label: 'Barceloneta, au fil de l’eau', place: 'tower', summary: 'Sortie du Sofitel · Barceloneta', overviewTime: '15 h',
        route: route('sofitel', 'tower', 'walking', '20 à 25 min'),
        body: 'Sortez du Sofitel à 15 h. Longez la plage vers la Torre de Sant Sebastià. Vous pouvez faire un détour par la Plaça de la Barceloneta.',
        observe: 'Autour de la place, regardez les rues étroites et régulières : elles gardent le tracé du quartier aménagé au XVIIIᵉ siècle.',
        story: 'Le quartier maritime de la Barceloneta remonte à 1753. Cette ville au bord de l’eau raconte une autre époque que les ruelles médiévales que vous découvrirez en fin de journée.', sources: ['born'] },
      { id: 'cable', time: 'Vers 15 h 30', minute: 930, label: 'Le port vu du ciel', place: 'tower', summary: 'Téléphérique du Port', visit: 'cable', overviewTime: '15 h 30',
        body: 'Depuis la Torre de Sant Sebastià, prenez le téléphérique vers Miramar et faites l’aller et retour si la file est raisonnable. Vérifiez la circulation et le dernier retour avant de monter.',
        details: 'Si le téléphérique est fermé ou si l’attente est trop longue, continuez à pied vers El Born. En alternative, l’aller simple coûte 12,50 € par adulte. Le budget retient uniquement l’aller et retour.',
        story: 'Conçu pour l’Exposition internationale de 1929, le téléphérique ouvre en 1931. Pendant la guerre civile espagnole, les câbles sont retirés et les tours servent à la défense du port.',
        sources: ['cable', 'cableHistory'] },
      { id: 'born', time: 'Vers 17 h', minute: 1020, label: 'Flâner dans El Born', place: 'born', summary: 'El Born · Santa Maria del Mar', overviewTime: '17 h',
        route: route('tower', 'born', 'walking', '20 à 25 min'),
        body: 'Flânez autour de Santa Maria del Mar et du Passeig del Born. Prenez un café si vous en avez envie. La visite intérieure de la basilique reste en option, hors budget.',
        observe: 'Si vous entrez dans la basilique, observez la finesse et l’espacement des piliers de la nef. Consultez les horaires et les tarifs avant de décider.',
        story: 'La construction de Santa Maria del Mar commence en 1329 dans un quartier de marins, de marchands et de portefaix. L’ancien marché du Born abrite des vestiges de rues et de maisons de la Barcelone autour de 1700, à l’époque du siège de 1714.',
        sources: ['maria', 'mariaTickets', 'born'] },
      { id: 'muhba', time: 'Vers 17 h 30, si vous avez le temps', minute: 1050, label: 'Sous les rues, Barcino', place: 'muhba', summary: 'MUHBA · Plaça del Rei', overviewTime: '17 h 30', optional: true, visit: 'muhba',
        route: route('born', 'muhba', 'walking', '5 à 10 min'),
        body: 'Une étape facultative avant la suite de la balade. Le musée ferme à 19 h. Vérifiez l’accès et le temps disponible avant d’acheter un billet.',
        story: 'Sous la Plaça del Rei, les vestiges de Barcino révèlent la colonie romaine à l’origine de Barcelone. C’est une manière de lire la ville par ses couches, bien avant le quartier gothique.', sources: ['muhba'] },
      { id: 'gothic', time: 'En début de soirée', minute: 1140, label: 'Le quartier gothique à petits pas', place: 'cathedral', summary: 'Quartier gothique et dîner', overviewTime: 'Soirée',
        route: route('muhba', 'cathedral', 'walking', '3 à 5 min', { fallback: route('born', 'cathedral', 'walking', '10 à 15 min'), skipId: 'muhba' }),
        body: 'Rejoignez le parvis de la cathédrale puis dînez dans le quartier. L’observation depuis le parvis est gratuite. Une éventuelle visite intérieure est séparée du budget.',
        observe: 'Comparez la façade de la cathédrale avec Santa Maria del Mar. Leurs apparences ne correspondent pas toutes à la même époque.',
        story: 'La cathédrale est dédiée à la Sainte Croix et à sainte Eulalie. Sa grande façade néogothique a été réalisée à la fin du XIXᵉ siècle à partir de plans du XVᵉ siècle.',
        sources: ['cathedral'], history: 'muslim' }
    ]
  },
  {
    date: '2026-11-13', weekday: 'Vendredi', day: '13', title: 'Un vendredi tout en douceur', subtitle: 'Zoo, jumuaa et nouvelle adresse', icon: '☀', weather: '13 à 22 °C', forecast: 'Grand soleil.', note: 'La prière, puis les valises et l’installation', phrases: ['bags', 'prayer', 'women', 'entranceMosque'],
    steps: [
      { id: 'checkout', time: 'Vers 10 h', minute: 600, label: 'Les valises peuvent attendre', place: 'sofitel', summary: 'Checkout · Valises au Sofitel', overviewTime: '10 h',
        body: 'Faites votre checkout au Sofitel et demandez à la réception de garder les valises. Vous les récupérerez après la prière et le déjeuner.' },
      { id: 'zoo', time: 'Après le checkout, vers 10 h 15', minute: 615, label: 'Une matinée au zoo', place: 'zoo', summary: 'Zoo de Barcelone', overviewTime: '10 h 15', visit: 'zoo',
        route: route('sofitel', 'zoo', 'walking', '10 à 15 min'),
        body: 'Rejoignez l’entrée publique du zoo à l’intérieur du Parc de la Ciutadella, côté Passeig de Picasso. Vérifiez l’entrée indiquée sur le site du zoo. Visez une sortie vers midi pour garder une marge avant la prière.',
        details: 'Le tarif d’environ 21,40 € par adulte reste à confirmer sur la billetterie. Aucun billet n’est présenté comme réservé.',
        story: 'Le zoo ouvre en 1892 après l’achat d’une collection privée d’animaux par la ville. La collection est alors installée dans le Parc de la Ciutadella.', sources: ['zoo', 'zooHistory'] },
      { id: 'jumuaa', time: '13 h 10 · Arrivée visée à 12 h 50', minute: 790, label: 'Jumuaa dans le Raval', place: 'raval', summary: 'Jumuaa · Arrivée à 12 h 50', overviewTime: '13 h 10', confirm: true, timeKind: 'fixed', free: true,
        route: route('zoo', 'raval', 'walking', '30 à 40 min', { alternative: route('zoo', 'raval', 'driving', '15 à 25 min', { label: 'Uber' }), reason: 'La marche reste le choix principal. Avant de choisir Uber, vérifiez les bus : prenez un bus si le trajet complet est inférieur à 25 min. Uber reste une option si marche et bus ou tram demandent chacun au moins 30 min.', checkTransit: true }),
        body: 'Centre Islàmic del Raval, Carrer de la Lluna, 11. Le premier créneau affiché est à 13 h 10, les suivants à 13 h 45 et 14 h 30. Confirmez les horaires auprès de la mosquée, ainsi que l’accès à un espace femmes si besoin.',
        details: 'Si 13 h pile est important pour vous, le Centre Cultural Islàmic Català, Carrer de Rafael Capdevila, affiche 13 h. C’est une autre mosquée et un autre trajet. Vérifiez cet horaire avant de changer de destination.',
        alternativeMosque: true,
        story: 'L’immigration pakistanaise a marqué la vie du Raval à travers ses commerces, ses associations et ses lieux de prière. Cette histoire est celle d’un quartier contemporain et de ses habitants, distincte de la Barcelone sous domination musulmane au Moyen Âge.',
        sources: ['raval', 'alternative', 'migration'], history: 'migration' },
      { id: 'luggage', time: 'Après la prière et le déjeuner', minute: 870, label: 'Déjeuner, puis récupérer les valises', place: 'sofitel', summary: 'Déjeuner · Retour au Sofitel', overviewTime: 'Après',
        route: route('raval', 'sofitel', 'driving', '15 à 25 min', { label: 'Uber si trajet long', alternative: route('raval', 'sofitel', 'walking', '35 à 45 min'), checkTransit: true, reason: 'À pied : 35 à 45 min. Le temps exact en bus ou tram depuis Carrer de la Lluna n’est pas confirmé. Choisissez le bus si le trajet complet est inférieur à 25 min ; conservez Uber seulement si marche et transports demandent chacun au moins 30 min. Entre 25 et 30 min, privilégiez les transports.' }),
        body: 'Prenez le temps de déjeuner dans le Raval. Revenez ensuite au Sofitel pour récupérer les valises. L’horaire est indicatif et peut glisser.' },
      { id: 'praktik', time: 'Installation à partir de 15 h', minute: 900, timeKind: 'fixed', label: 'Poser vos valises au Praktik Bakery', place: 'praktik', summary: 'Praktik Bakery · Installation', overviewTime: 'Dès 15 h',
        route: route('sofitel', 'praktik', 'driving', '15 à 25 min', { label: 'Uber si trajet long', checkTransit: true, reason: 'Avec les valises, comparez le trajet complet, marche vers les arrêts et depuis les arrêts comprise. Aucun trajet de moins de 25 min en bus ou tram n’est confirmé ici. Prenez les transports si le trajet est court ; gardez Uber uniquement si marche et transports prennent chacun au moins 30 min.' }),
        body: 'Votre nouvelle adresse jusqu’au lundi : Carrer de Provença, 279. L’installation est possible à partir de 15 h. Le reste de la journée est libre, sans course contre la montre.' }
    ]
  },
  {
    date: '2026-11-14', weekday: 'Samedi', day: '14', title: 'Gaudí, les yeux grands ouverts', subtitle: 'Sagrada Família et La Pedrera', icon: '☁', weather: '11 à 18 °C', forecast: 'Plutôt nuageux, avec une averse possible l’après midi.', note: 'Sagrada Família : extérieur uniquement', phrases: ['entrance', 'tickets', 'available'],
    steps: [
      { id: 'nativity', time: 'Vers 10 h 30', minute: 630, label: 'La Nativité, côté jardin', place: 'nativity', summary: 'Sagrada Família · Extérieur', overviewTime: '10 h 30', free: true,
        route: route('praktik', 'nativity', 'walking', '20 à 25 min'),
        body: 'Premier arrêt à la Plaça de Gaudí. Ce parcours est uniquement extérieur, gratuit et sans billet. Prévoyez 30 à 45 min sur place pour découvrir les deux façades.',
        observe: 'Regardez la basilique depuis le bassin, puis approchez pour repérer la naissance de Jésus, les animaux et les végétaux sculptés.',
        story: 'La façade de la Nativité présente un univers foisonnant autour de la naissance du Christ. Prenez le temps de distinguer les scènes et les formes de la nature, plutôt que de tout regarder d’un seul coup.', sources: ['sagrada'], history: 'gaudi' },
      { id: 'passion', time: 'Vers 10 h 50', minute: 650, label: 'La Passion, un autre langage', place: 'passion', summary: 'Façade de la Passion', overviewTime: '10 h 50', free: true,
        route: route('nativity', 'passion', 'walking', '5 à 10 min'),
        body: 'Contournez la basilique jusqu’à la Plaça de la Sagrada Família, sans entrer dans le monument.',
        observe: 'Les figures anguleuses de Josep Maria Subirachs racontent les derniers jours du Christ. Comparez leur sobriété au décor foisonnant de la Nativité.', sources: ['sagrada'] },
      { id: 'pause', time: 'En fin de matinée et à midi', minute: 720, label: 'Une vraie pause entre les visites', place: 'praktik', summary: 'Café, déjeuner et pause', overviewTime: 'À midi',
        route: route('passion', 'praktik', 'walking', '20 à 25 min'),
        body: 'Choisissez un café, déjeunez tranquillement et prenez du repos à l’hôtel si vous en avez envie. Le créneau de La Pedrera est proposé, pas réservé.' },
      { id: 'pedrera', time: 'Vers 15 h 30', minute: 930, label: 'La Pedrera, une maison qui ondule', place: 'pedrera', summary: 'La Pedrera · Casa Milà', overviewTime: '15 h 30', visit: 'pedrera',
        route: route('praktik', 'pedrera', 'walking', '3 à 5 min', { direct: route('passion', 'pedrera', 'walking', '20 à 25 min') }),
        body: 'Le créneau de 15 h 30 est une proposition : vérifiez la disponibilité du billet Essential. Si vous venez directement de la Sagrada Família, comptez 20 à 25 min à pied.',
        observe: 'Repérez les ondulations de la façade puis, sur le toit, les cheminées qui ressemblent à des guerriers.',
        story: 'Gaudí construit la Casa Milà entre 1906 et 1912. Son surnom, La Pedrera, évoque une carrière de pierre. La façade et ses lignes souples changent la perception de cet immeuble de l’Eixample.', sources: ['pedrera'] },
      { id: 'shopping', time: 'Après la visite', minute: 1035, label: 'Les vitrines du Passeig de Gràcia', place: 'shopping', summary: 'Boutiques et Passeig de Gràcia', overviewTime: 'Après',
        route: route('pedrera', 'shopping', 'walking', '5 à 10 min'),
        body: 'Flânez dans les rues commerçantes si le temps le permet. En option, continuez vers Rambla de Catalunya.',
        observe: 'Aux carrefours, regardez les angles coupés des immeubles du plan Cerdà, adopté en 1859. Ils ouvrent des perspectives sur les rues.', sources: ['cerda'] }
    ]
  },
  {
    date: '2026-11-15', weekday: 'Dimanche', day: '15', title: 'Sur les hauteurs, puis à Gràcia', subtitle: 'Parc Güell et places de village', icon: '☀', weather: '13 à 20 °C', forecast: 'Éclaircies et quelques averses.', note: 'Le programme suit aussi la météo', phrases: ['tickets', 'available'],
    steps: [
      { id: 'park', time: 'Vers 11 h', minute: 660, label: 'Parc Güell, un quartier rêvé', place: 'park', summary: 'Parc Güell', overviewTime: '11 h', visit: 'park',
        route: route('praktik', 'park', 'transit', '25 à 35 min', {
          label: 'Bus 24 puis marche',
          instructions: 'Marchez jusqu’à Pg de Gràcia · Diagonal. Prenez le bus 24 direction El Carmel et descendez à Trav de Dalt · Torrent de les Flors. Rejoignez à pied l’accès côté Carrer de Larrard et Carrer d’Olot. Environ 11 à 16 min à bord, environ 10 min de marche finale et quelques minutes pour rejoindre l’arrêt : prévoyez 25 à 35 min hors attente. Ce trajet n’est pas garanti sous 25 min. Le bus reste le choix proposé ; comparez le temps complet avant de partir.',
          sources: ['bus24', 'parkAccess', 'parkBusEstimate'],
          entranceVariants: {
            santuari: route('praktik', 'park', 'transit', '25 à 30 min', { label: 'Bus 24 puis marche', instructions: 'Bus 24 depuis Pg de Gràcia · Diagonal, direction El Carmel, jusqu’à Trav de Dalt · La Granja. Continuez à pied vers Avinguda del Santuari de Sant Josep de la Muntanya. Vérifiez l’accès sur votre billet et prévoyez la montée. Estimation hors attente.', sources: ['bus24', 'parkAccess'] }),
            carmel: route('praktik', 'park', 'transit', '30 à 40 min', { label: 'Bus 24 puis marche', instructions: 'Restez dans le bus 24 direction El Carmel jusqu’à C N Catalunya · Park Güell, puis marchez vers l’entrée Carretera del Carmel. Cet accès est plus long que celui de Carrer d’Olot. Vérifiez les arrêts et les perturbations TMB avant le départ.', alternative: route('praktik', 'park', 'driving', '15 à 25 min', { label: 'Uber' }), reason: 'Pour cette entrée, la marche depuis l’hôtel et le trajet en bus dépassent environ 30 min. Uber reste une option, avec la marche finale depuis le point de dépose.', sources: ['bus24', 'parkAccess'] })
          }
        }),
        body: 'Vérifiez la météo horaire avant de choisir votre créneau. Privilégiez le bus 24 puis la marche plutôt qu’Uber. Choisissez l’entrée indiquée sur votre billet : le trajet et sa durée s’adaptent à cet accès. Prévoyez l’attente du bus en plus.',
        parkEntrance: true,
        details: 'S’il pleut pendant le créneau, faites une pause à Gràcia et consultez les conditions du billet. Une modification ou un remboursement ne sont pas garantis.',
        observe: 'Regardez les chemins et l’entrée en imaginant le quartier résidentiel qui devait s’élever sur la colline.',
        story: 'En 1900, Gaudí commence à aménager pour Eusebi Güell un projet de quartier résidentiel privé. Sur la soixantaine de maisons prévues, seules deux sont construites.', sources: ['park', 'parkConditions', 'gaudi', 'bus24', 'parkAccess', 'parkBusEstimate'] },
      { id: 'gracia', time: 'Après le parc', minute: 810, label: 'Gràcia, d’une place à l’autre', place: 'gracia', summary: 'Gràcia · Déjeuner et flânerie', overviewTime: 'Après',
        route: route('park', 'gracia', 'walking', '25 à 35 min'),
        body: 'Descendez vers la Plaça de la Vila de Gràcia. Déjeuner et balade dans les rues commerçantes, si le temps le permet.',
        story: 'Gràcia était une commune à part avant son rattachement à Barcelone en 1897. Ses petites places et les rues autour gardent une ambiance de village.', sources: ['gracia'] },
      { id: 'return', time: 'À votre rythme', minute: 1020, label: 'Retour au Praktik Bakery', place: 'praktik', summary: 'Retour à l’hôtel', overviewTime: 'Plus tard',
        route: route('gracia', 'praktik', 'walking', '15 à 20 min'),
        body: 'Rejoignez l’hôtel à pied. La fin de journée est libre : laissez une place à ce qui vous aura plu en chemin.' }
    ]
  },
  {
    date: '2026-11-16', weekday: 'Lundi', day: '16', title: 'Un dernier café, et à bientôt', subtitle: 'Départ ensemble en Uber', icon: '☀', weather: '11 à 20 °C', forecast: 'Quelques éclaircies.', note: 'Aucune visite · Objectif aéroport vers 10 h', phrases: ['terminal'], flights: FLIGHTS,
    steps: [
      { id: 'airport', time: 'Vers 9 h · Arrivée visée vers 10 h', minute: 540, label: 'Départ ensemble en Uber', place: 'airport', summary: 'Uber vers l’aéroport', overviewTime: '9 h',
        route: route('praktik', 'airport', 'driving', '25 à 45 min', { label: 'Uber', reason: 'Exception choisie : vous partez ensemble en Uber le lundi, quelle que soit la durée des transports en commun.' }),
        body: 'Valises et checkout au Praktik Bakery, avec un petit déjeuner à l’hôtel si le temps le permet. Aucune visite aujourd’hui. Partez ensemble vers 9 h pour viser une arrivée à l’aéroport vers 10 h.',
        details: 'Vérifiez les deux cartes d’embarquement avant de choisir le terminal dans Uber. Vueling opère au terminal T1. Ne supposez pas que les deux départs utilisent le même terminal. Les temps de route dépendent du trafic.',
        terminal: true, sources: ['airport'] }
    ]
  }
];
const HISTORY = [
  {
    id: 'barcino', era: 'FIN DU Ier SIÈCLE AVANT NOTRE ÈRE', title: 'Barcino, la ville sous la ville',
    paragraphs: [
      'Avant la grande ville méditerranéenne, il y a Barcino, une colonie romaine fondée à la fin du Ier siècle avant notre ère, à l’époque de l’empereur Auguste. Son centre se trouve dans ce qui est aujourd’hui le quartier gothique. La Barcelone antique est donc moins lointaine qu’elle ne paraît : vous marchez au dessus de ses vestiges.',
      'Sous la Plaça del Rei, le parcours archéologique du MUHBA permet de découvrir cette ville enfouie. Les restes de rues et de bâtiments invitent à imaginer la vie quotidienne, les déplacements et le travail, plutôt qu’une Rome faite uniquement de grands monuments. La visite donne une échelle concrète à une histoire de plus de deux millénaires.',
      'La place actuelle raconte aussi la manière dont une ville se transforme sans effacer entièrement ce qui la précède. Les constructions médiévales et les espaces d’aujourd’hui se superposent aux niveaux antiques. Gardez cette idée en tête pendant votre balade : dans la vieille ville, quelques mètres peuvent vous faire changer de siècle.'
    ],
    detail: 'À repérer : si vous choisissez le MUHBA, regardez la position des vestiges par rapport au niveau de la place actuelle. En ressortant, comparez ce que vous avez vu sous terre avec les bâtiments autour de vous.',
    sources: ['muhba'], day: 0, step: 'muhba'
  },
  {
    id: 'muslim', era: 'VIIIe SIÈCLE → 801', title: 'Barcelone sous domination musulmane',
    paragraphs: [
      'Au VIIIᵉ siècle, après l’expansion des pouvoirs musulmans dans la péninsule Ibérique, Barcelone passe sous domination musulmane. Cette période dure moins d’un siècle. Elle place la ville dans l’histoire d’al Andalus, mais aussi dans un espace de frontières où les alliances et les rapports de force évoluent.',
      'Les gouverneurs de Barcelone ne sont pas de simples exécutants éloignés de Cordoue. Leurs relations avec le pouvoir de l’émirat et avec les souverains francs passent aussi par des négociations et des rivalités. En 801, les forces de Louis le Pieux prennent la ville après un siège. Barcelone entre alors dans l’orbite carolingienne et devient un point d’appui au sud des Pyrénées.',
      'Cette histoire est importante même si votre promenade ne vous montre pas un grand monument conservé de cette époque. Santa Maria del Mar est bien plus tardive, tout comme la façade actuelle de la cathédrale. Pour comprendre cette période, il faut distinguer les textes et la chronologie de ce que les bâtiments visibles permettent réellement d’observer.'
    ],
    detail: 'À repérer : utilisez la vieille ville comme un support pour replacer les époques, sans attribuer ses arcs ou ses décors à la présence musulmane. L’esthétique andalouse du carnet est un choix graphique, pas une preuve historique.',
    sources: ['medieval', 'medievalCity'], day: 0, step: 'gothic'
  },
  {
    id: 'gothic', era: 'À PARTIR DE 1329', title: 'Ville marchande et art gothique',
    paragraphs: [
      'Au XIVᵉ siècle, Barcelone participe à la puissance maritime de la couronne d’Aragon. Dans le quartier de la Ribera, près du port, vivent marins, pêcheurs, marchands et artisans. Commencée en 1329, Santa Maria del Mar est liée à cette prospérité et à une population qui souhaite une église plus vaste que l’ancienne paroisse.',
      'Sa construction mobilise des dons, des métiers et des savoirs très différents. Les bastaixos, les portefaix du port, participent à cet effort collectif aux côtés d’autres ouvriers et artisans. L’église est achevée en cinquante quatre ans, une durée relativement courte pour un édifice de cette ampleur. Son unité architecturale contribue à la force de l’espace intérieur.',
      'Si vous entrez, regardez comment les piliers fins et espacés laissent le regard circuler dans la nef. Cet art chrétien s’exprime aussi par la lumière et les proportions, pas seulement par les images. La basilique a toutefois changé au fil du temps : l’incendie de 1936 a notamment détruit une partie de son mobilier et de son décor.'
    ],
    detail: 'Deux architectures à comparer : Santa Maria del Mar est une église gothique médiévale. La grande façade néogothique de la cathédrale date de la fin du XIXᵉ siècle, d’après des plans du XVᵉ. Le mot « gothique » ne suffit donc pas à dater tout ce que vous voyez.',
    sources: ['maria', 'cathedral'], day: 0, step: 'born'
  },
  {
    id: 'maritime', era: '1714 · 1753', title: 'Du siège à la ville maritime',
    paragraphs: [
      'Le 11 septembre 1714, Barcelone capitule après le siège des troupes de Philippe V, dans le contexte de la guerre de Succession d’Espagne. Le conflit ne laisse pas seulement une mémoire politique : il transforme aussi des quartiers entiers. Une partie de la Ribera est détruite pour permettre la construction de la forteresse de la Ciutadella.',
      'Sous l’ancien marché du Born, les vestiges de rues et de maisons rendent ces bouleversements très concrets. Vous pouvez y imaginer un quartier habité autour de 1700, avant sa disparition. Le bâtiment de fer qui les abrite appartient à une autre époque : l’ancien marché date de 1876. À lui seul, le lieu réunit donc plusieurs histoires de la ville.',
      'La Barceloneta, aménagée à partir de 1753, raconte ensuite une nouvelle organisation du quartier maritime. Autour de sa place, les petites rues étroites mais régulières contrastent avec les détours de la vieille ville. Entre le Born et la plage, observez ces différences de tracé : elles sont aussi parlantes que les dates.'
    ],
    detail: 'À repérer : comparez les rues régulières de la Barceloneta avec les ruelles du Born. Si vous entrez dans l’ancien marché, distinguez bien les vestiges du quartier et la structure métallique du XIXᵉ siècle qui les protège.',
    sources: ['born'], day: 0, step: 'beach'
  },
  {
    id: 'gaudi', era: '1859 · 1900 · 1906', title: 'L’Eixample et les rêves de Gaudí',
    paragraphs: [
      'Le plan Cerdà de 1859 donne un nouveau cadre à l’extension de Barcelone. L’Eixample se reconnaît à sa trame régulière et aux angles coupés des immeubles, qui ouvrent les carrefours. Après les rues de la vieille ville, le changement d’échelle est frappant : les perspectives se prolongent et les intersections deviennent de véritables espaces.',
      'Gaudí travaille dans cette ville en transformation. Entre 1906 et 1912, il construit la Casa Milà, surnommée La Pedrera. Sa façade ondulante et ses cheminées sculpturales tranchent avec l’idée d’un immeuble simplement composé de lignes droites. Pendant votre visite, passez du détail à l’ensemble : une fenêtre, un balcon, puis tout le mouvement de la façade.',
      'Au Parc Güell, commencé en 1900 pour Eusebi Güell, le projet est d’abord celui d’un quartier résidentiel privé. Sur la soixantaine de maisons prévues, seules deux sont construites. Imaginez les chemins comme les liaisons d’un quartier qui n’a pas abouti. En descendant vers Gràcia, vous retrouvez encore une autre histoire urbaine : celle d’une commune indépendante jusqu’à son rattachement à Barcelone en 1897.'
    ],
    detail: 'L’art chrétien à la Sagrada Família : depuis la rue uniquement, comparez la Nativité, qui raconte la naissance de Jésus dans un décor végétal foisonnant, avec les figures anguleuses de la Passion de Subirachs. Le contraste entre abondance et sobriété vous aide à lire deux moments de la vie du Christ.',
    sources: ['cerda', 'pedrera', 'gaudi', 'sagrada', 'gracia'], day: 2, step: 'nativity',
    also: { day: 3, step: 'park', label: 'Retrouver le Parc Güell' }
  },
  {
    id: 'migration', era: 'ÉPOQUE CONTEMPORAINE', title: 'Le Raval, un quartier de migrations',
    paragraphs: [
      'Le Raval ne se résume ni à ses monuments ni à une seule communauté. Son histoire urbaine associe des espaces autrefois agricoles et religieux, puis l’industrialisation et les logements ouvriers du XIXᵉ siècle. Les migrations contemporaines s’inscrivent dans ce quartier déjà transformé par le travail, la densité de l’habitat et les arrivées successives.',
      'L’immigration pakistanaise y a notamment marqué la vie des commerces, des associations et des lieux de prière. Les boutiques peuvent être des lieux de rencontre autant que des activités économiques. Une étude de l’Université de Barcelone publiée en 2014 examine justement les liens qui se construisent entre leurs travailleurs et leur environnement, au sein de la communauté comme avec d’autres habitants.',
      'Pendant votre promenade, regardez le quartier à hauteur de rue : les courses, les échanges et les usages des espaces publics. Il s’agit d’une histoire contemporaine, faite de parcours de vie différents, et non du prolongement direct de la domination musulmane médiévale. La jumuaa du vendredi est avant tout un moment de prière, dans un lieu vivant, pas une visite patrimoniale.'
    ],
    detail: 'À repérer : la diversité des commerces et de la vie associative, sans réduire les habitants à une origine ou à une religion. À la mosquée, demandez confirmation des horaires et des espaces accessibles, puis respectez les usages du lieu.',
    sources: ['migration', 'raval'], day: 1, step: 'jumuaa'
  }
];
const PHRASES = [
  { title: 'Se repérer', items: [
    ['directions', 'Perdón, ¿cómo llegamos a esta dirección?', 'Pardon, quel chemin faut il prendre pour aller à cette adresse ?'],
    ['walking', '¿Se puede ir andando?', 'On peut y aller à pied ?'],
    ['entrance', '¿Dónde está la entrada?', 'Où est l’entrée ?']
  ] },
  { title: 'Hôtel et Uber', items: [
    ['bags', '¿Podemos dejar las maletas aquí y recogerlas más tarde?', 'On peut laisser les valises ici et les récupérer plus tard ?'],
    ['driver', '¿Dónde nos recoge el conductor?', 'Où est ce que le chauffeur nous récupère ?'],
    ['terminal', 'A la terminal uno del aeropuerto, por favor.', 'Au terminal un de l’aéroport, s’il vous plaît.']
  ] },
  { title: 'Billets et visites', items: [
    ['tickets', 'Dos entradas de adulto, por favor.', 'Deux billets adultes, s’il vous plaît.'],
    ['returnTicket', '¿Cuánto cuesta el billete de ida y vuelta?', 'Combien coûte le billet aller et retour ?'],
    ['cableLast', '¿A qué hora sale el último teleférico de vuelta?', 'À quelle heure part le dernier téléphérique pour le retour ?'],
    ['available', '¿Quedan entradas para hoy?', 'Il reste des billets pour aujourd’hui ?']
  ] },
  { title: 'Mosquée', items: [
    ['prayer', '¿A qué hora empieza la oración del viernes?', 'À quelle heure commence la prière du vendredi ?'],
    ['women', '¿Hay un espacio para mujeres?', 'Il y a un espace pour les femmes ?'],
    ['entranceMosque', '¿Por dónde se entra?', 'Où se trouve l’entrée ?']
  ] },
  { title: 'Restaurant', items: [
    ['halal', '¿La carne es halal?', 'La viande est halal ?'],
    ['pork', '¿Este plato lleva cerdo o alcohol?', 'Il y a du porc ou de l’alcool dans ce plat ?'],
    ['bill', 'La cuenta, por favor.', 'L’addition, s’il vous plaît.']
  ] }
];
