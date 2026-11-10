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
