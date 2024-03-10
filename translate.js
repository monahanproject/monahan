let lang = "EN"; // Global variable to track current language state

// Function to toggle the language
function toggleLanguage() {
  lang = lang === "EN" ? "FR" : "EN"; // Toggle language value

  updateLanguageLabel();
  updatePageContent();
  changeEachLangDiv(); // Update all dynamic strings to the current language
}

// Update the language toggle button label
function updateLanguageLabel() {
  const langLabel = document.getElementById("langToggle");
  if (langLabel) {
    langLabel.innerText = lang === "EN" ? "FR" : "EN"; // Switch label between FR and EN
  } else {
    console.error("langToggle element not found");
  }
}

// Update the main content of the page based on the current language
function updatePageContent() {
  const contributorsPage = document.getElementById("contributorsPage");
  if (contributorsPage) {
    contributorsPage.innerHTML = lang === "EN" ? contributorsPageEN : contributorsPageFR;
  } else {
    console.error("contributorsPage element not found");
  }
}

// Update individual strings to the current language
function changeEachString(string) {
  const element = document.getElementById(string.id);
  if (element) {
    element.innerHTML = lang === "FR" ? string.fr : string.en;
  } else {
    console.error(`Element with ID '${string.id}' not found.`);
  }
}

// Update button strings to the current language
function changeEachBtnString(string) {
  const element = document.querySelector("#" + string.id);
  if (element) {
    element.innerHTML = lang === "FR" ? string.fr : string.en;
  } else {
    console.error(`Button element with ID '${string.id}' not found.`);
  }
}

// Apply translations for all registered strings and button strings
function changeEachLangDiv() {
  strings.forEach(changeEachString);
  buttonStrings.forEach(changeEachBtnString);
}

// Initialize the page with the correct language on load
document.addEventListener("DOMContentLoaded", () => {
  updateLanguageLabel();
  updatePageContent();
  changeEachLangDiv(); // Ensure strings are translated on load
});

// Attach the toggleLanguage function to the langToggle element
document.querySelector("#langToggle").addEventListener("click", toggleLanguage);

const strings = [
  { id: "langToggle", en: "FR", fr: "EN" },
  // { id: "engLand", en: "MONAHAN is situated on the traditional unceded territory of the Anishinabe Algonquin Nation, custodians of these lands for millennia.", fr: "MONAHAN est situé sur le territoire traditionnel non cédé de la Nation Anishinabe Algonquine, gardienne de ces terres depuis des millénaires." },
  { id: "artPubArt", en: "ART PUBLIC ART", fr: "ART PUBLIC ART" },
  { id: "curiousEarsTxt", en: "A Sound Piece for Curious Ears", fr: "Une œuvre sonore pour les oreilles curieuses" },
  { id: "aboutH2", en: "ABOUT", fr: "À PROPOS" },
  { id: "soundForCurious", en: "A sound piece for curious ears.", fr: "Une pièce sonore pour les oreilles curieuses." },
  { id: "eachTimeYouClick", en: "Each time you click BEGIN, you’ll hear a unique sound piece, collaged by our algorithm from 173 sound chapters. All these chapters are created by a diverse group of contributors. You’ll hear everything from songs and poems to nature sounds, interviews and stories.", fr: "Chaque fois que vous cliquerez sur BEGIN, vous entendrez une pièce sonore unique, composée par notre algorithme à partir de 173 chapitres sonores. Tous ces chapitres sont créés par un groupe diversifié de contributeurs. Vous entendrez de tout, des chansons et des poèmes aux sons de la nature, en passant par des interviews et des histoires." },
  { id: "ByBringingTogether", en: "By bringing together sounds by human and non-human beings MONAHAN creates an ever-evolving experience. You may hear a chapter you’ve heard before, but this time it’s next to something new.  Like the landscape around you, MONAHAN is always changing.", fr: "En réunissant des sons produits par des êtres humains et non humains, MONAHAN crée une expérience en constante évolution. Il se peut que vous entendiez un chapitre que vous avez déjà entendu, mais cette fois-ci à côté de quelque chose de nouveau.  Comme le paysage qui vous entoure, MONAHAN est en constante évolution." },
  { id: "experienceAnew", en: "Experience the site anew with each visit through dozens of sounds and stories gathered for the Monahan wetlands.", fr: "À chaque visite, l'expérience du site est renouvelée par des dizaines de sons et d'histoires recueillis pour les zones humides de Monahan." },
  { id: "delveInto", en: "Delve into sounds that explore movement, migration, story as medicine, non-human beings, plants as healers, voice, translation, and place.", fr: "Plongez dans des sons qui explorent le mouvement, la migration, l'histoire comme médecine, les êtres non humains, les plantes comme guérisseurs, la voix, la traduction et le lieu." },

  { id: "productionTeamH2", en: "PRODUCTION TEAM", fr: "L'ÉQUIPE DE PRODUCTION" },
  { id: "monH2", en: "MONAHAN", fr: "MONAHAN" },

  { id: "pavedPaths", en: "The paths around the site are paved, and accessible, and include benches.", fr: "Les chemins autour du site sont pavés, accessibles et comprennent des bancs." },
  { id: "smartphoneQRAccess", en: "With a smartphone and data access you can scan a QR code to experience the sound piece.", fr: "Avec un smartphone et un accès aux données, vous pouvez scanner un code QR pour expérimenter l'œuvre sonore." },
  { id: "qrCodeLocations", en: "QR codes are on the main sign located near the bridge and on a selection of benches along the main path.", fr: "Les codes QR se trouvent sur le panneau principal situé près du pont et sur une sélection de bancs le long du chemin principal." },
  { id: "benchQRCodes", en: "The QR codes on the benches are installed on the backrests.", fr: "Les codes QR sur les bancs sont installés sur les dossiers." },
  { id: "noWashrooms", en: "There are no washrooms on site.", fr: "Il n'y a pas de toilettes sur le site." },


  { id: "howToListenH2", en: "HOW TO LISTEN", fr: "COMMENT ÉCOUTER" },
  { id: "scanQR", en: "Scan the QR code", fr: "Scannez le code QR" },
  { id: "arriveWebsite", en: "Arrive at the MONAHAN website", fr: "Arrivez sur le site de MONAHAN" },
  { id: "putHeadphones", en: "Put on your HEADPHONES", fr: "Mettez vos ÉCOUTEURS" },
  { id: "clickBegin", en: "Click BEGIN", fr: "Cliquez sur COMMENCER" },
  { id: "listenSoundPiece", en: "LISTEN to a personalized sound piece", fr: "ÉCOUTEZ une œuvre sonore personnalisée" },
  {
    id: "listenAnywhere",
    en: "You can listen to MONAHAN wherever you are. We suggest spending time outside while listening.",
    fr: "Vous pouvez écouter MONAHAN où que vous soyez. Nous vous suggérons de passer du temps à l'extérieur pendant l'écoute.",
  },

  { id: "howitWorksH2", en: "HOW IT WORKS", fr: "COMMENT ÇA MARCHE" },
  { id: "whereToFindUsH2", en: "WHERE TO FIND US", fr: "OÙ NOUS TROUVER" },
  {
    id: "visit",
    en: "Visit the Monahan Wetlands (or Monahan Drain) in Ottawa, Canada.",
    fr: "Visitez les zones humides de Monahan (ou le drain de Monahan) à Ottawa, au Canada.",
  },
  { id: "accessH2", en: "ACCESSIBILITY", fr: "ACCESSIBILITÉ" },
  {
    id: "finalThanks",
    en: "Thank you for visiting MONAHAN. We hope you will return for a different experience!",
    fr: "Merci de votre visite à MONAHAN. Nous espérons que vous reviendrez pour une expérience différente !",
  },
  // { id: "volumeLower", en: "Lower Volume", fr: "Baisser le volume" },
  // { id: "volumeRaise", en: "Raise Volume", fr: "Augmenter le volume" },
  // { id: "trackDuration", en: "Track duration (seconds):", fr: "Durée du morceau (secondes) :" },
  // { id: "currentTrackName", en: "Track name:", fr: "Nom du morceau :" },
  // { id: "credits", en: "Credits:", fr: "Crédits :" },
  {
    id: "cred",
    en: "MONAHAN was produced by Grimm Pictures and commissioned by the City of Ottawa’s Public Art Program.",
    fr: "MONAHAN a été produit par Grimm Pictures et commandé par le Programme d'art public de la Ville d'Ottawa.",
  },
  { id: "contact", en: "Contact: publicartprogram@ottawa.ca", fr: "Contact : publicartprogram@ottawa.ca" },
  { id: "copyright", en: "©2023 All Rights Reserved", fr: "©2023 Tous droits réservés" },
  { id: "cityArtCollection", en: "City of Ottawa Art Collection", fr: "Collection d'art de la ville d'Ottawa" },
];

const buttonStrings = [
  { id: "invertColoursBtn", en: "Invert Colours", fr: "Inverser les couleurs" },
  { id: "monochromeBtn", en: "Monochrome", fr: "Monochrome" },
  // { id: "textSizeDecreaseBtn", en: "Decrease Text Size", fr: "Diminuer la taille du texte" },
  // { id: "textSizeIncreaseBtn", en: "Increase Text Size", fr: "Augmenter la taille du texte" },
  { id: "resetBtn", en: "Reset", fr: "Réinitialiser" },
  { id: "transcriptButton", en: "TRANSCRIPT", fr: "TRANSCRIPTION" },

  { id: "play-button-text-container", en: "BEGIN", fr: "COMMENCER" },
  // { id: "skipBackwardButton", en: "Skip Backward", fr: "Reculer" },
  // { id: "skipForwardButton", en: "Skip Forward", fr: "Avancer" },
];

const contributorsPageEN = `
  <div>
    <h2>Contributors</h2>
    <p>This is the English version of the contributors page.</p>
    <!-- Add more content here -->
  </div>
`;

const contributorsPageFR = `
  <div>
    <h2>Contributeurs</h2>
    <p>Ceci est la version française de la page des contributeurs.</p>
    <!-- Add more French content here -->
  </div>
`;
