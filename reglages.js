// Réglages de la page de présentation de Kisma : le seul fichier à toucher pour les liens.
window.KISMA = {
  // Numéro WhatsApp de l'équipe, au format international sans « + » ni espaces (ex. 221XXXXXXXXX).
  // Vide : les boutons « Essayer » mènent à la section Télécharger. À renseigner (voir docs/questions-ouvertes.md).
  whatsapp: '33621697527',

  // Message prérempli dans WhatsApp.
  message: "Nangadef ! Je veux essayer Kisma 30 jours dans ma quincaillerie.",

  // Liens des stores, à remplir à la publication. Vide : le badge affiche « Bientôt ».
  // Les valeurs %%…%% sont remplacées par le workflow de publication (.github/workflows/publication.yml) ;
  // restées telles quelles (aperçu local), elles comptent comme vides.
  stores: {
    android: '',
    ios: '',
    windows: 'https://github.com/mohamet003/baba-site/releases/latest/download/Kisma-Setup.exe',
  },

  // Le film de présentation (étape 15.3), servi par le serveur de Kisma comme les tutos (/srv/baba/tutos de la VM).
  // Tant qu'un fichier ne répond pas, la section du film reste cachée. Vide : pas de film.
  film: {
    large: 'https://kisma-api.duckdns.org/tutos/film-16x9.mp4',
    debout: 'https://kisma-api.duckdns.org/tutos/film-9x16.mp4',
    affiche_large: 'film-16x9.jpg',
    affiche_debout: 'film-9x16.jpg',
  },
};
