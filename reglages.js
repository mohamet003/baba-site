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
};
