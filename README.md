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
