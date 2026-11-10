# Barcelone à deux

Carnet de voyage en français du 12 au 16 novembre 2026.
Site statique en HTML, CSS et JavaScript, sans compilation.

## Lancer localement

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrir <http://localhost:8000>.

## Publication et contenu

Le site est publié avec GitHub Pages depuis la racine de la branche `main`.
`data.js` contient le programme, les prix, les lieux, les vols, les sources,
les chapitres historiques et les phrases.

Les horaires et numéros de vol sont publics avec l’accord de l’utilisateur.
Les choix d’étapes et les notes météo sont conservés sur l’appareil.
Le fuseau utilisé est `Europe/Madrid`.

Le mode hors ligne fonctionne après une première ouverture sur localhost ou
HTTPS. Google Maps et les billetteries nécessitent une connexion.
Après une modification, incrémenter le nom du cache dans `sw.js`.

## Déplacements

Marche pour les petits trajets, bus ou tram pour les parcours de moins de
25 minutes, et transports encore privilégiés entre 25 et 30 minutes.
Uber est conditionné à un trajet d’au moins 30 minutes à pied comme en
transports. Le départ commun du lundi vers l’aéroport reste en Uber,
sur demande explicite. Pour les comparaisons non confirmées, le carnet
affiche l’incertitude et un lien de vérification, pas une durée inventée.

Le bus 24 remplace Uber pour le Parc Güell, avec les arrêts, la marche finale,
les sources et une estimation hors attente. Les variantes d’entrée modifient
le trajet dans toutes les vues ; l’accès Carretera del Carmel garde Uber en
option pour ce parcours plus long. Les temps de bus incluent la marche
d’accès mais pas l’attente. Vérifier les horaires et perturbations le jour même.
Les liens Google Maps en mode transports peuvent proposer d’autres modes :
les instructions du carnet précisent les bus à sélectionner.

## Météo actualisée

`weather.js` interroge Open-Meteo pour les coordonnées de Barcelone, sans clé
ni géolocalisation de l’utilisateur. Le service gratuit est destiné à un usage
non commercial. Les prévisions sur 16 jours utilisent le fuseau `Europe/Madrid`.
La date affichée est celle de récupération, pas celle de production du modèle.
Actualisation à l’ouverture, toutes les 30 minutes lorsque la page est visible,
au retour sur une page ancienne et au retour de la connexion. Un bouton permet
aussi une actualisation manuelle.

Températures, ciel, maximum horaire de probabilité de précipitations, cumul
quotidien et détail de 8 h à 22 h sont communs aux vues. Une valeur manquante
n’est jamais assimilée à zéro. Les dernières prévisions sont conservées sur
l’appareil, avec une indication explicite en cas de panne ou de consultation
hors ligne. Les dates absentes restent des notes de planification clairement
identifiées, sans probabilité inventée. Les notes personnelles restent séparées.
