// Assuming state.js still contains these functions:
import { getState, setState, getLangState, setLangState, updateAriaStatusMessage } from "./state.js";

let lang = localStorage.getItem("lang") || "EN"; // Retrieve initial language setting
console.log(lang);

function toggleLanguageAndStorePref() {
  lang = getLangState() === "EN" ? "FR" : "EN"; // Toggle the language
  setLangState(lang); // Update language in localStorage
  updateTexts(); // Update the UI to reflect the new language
}

function updateTexts() {
  // Example function calls that would need to be updated to support dynamic language change
  updateLanguageLabel();
  updatePageContent();
  adjustFontSize("play-button-text-container");
  changeEachLangDiv(); // Update all dynamic strings to the current language

  if (lang === "FR") {
    const playButtonTextContainer = document.getElementById("play-button-text-container");
    playButtonTextContainer.style.left = "40%";
    adjustFontSize("play-button-text-container");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateTexts(); // Initialize texts based on the stored language
});

document.querySelector("#langToggle").addEventListener("click", toggleLanguageAndStorePref);

// function updateLanguageLabel() {
//   // Updates the language toggle button's display
//   const langToggleButton = document.getElementById("langToggle");
//   if (langToggleButton) {
//     langToggleButton.textContent = lang === "EN" ? "Switch to French" : "Switch to English";
//   }
// }

function updateLanguageLabel() {
  var oldLangImage = document.getElementById("langToggle");
  // console.log("Old langImage DOM Object: ", oldLangImage); // Log the DOM object for more details

  if (oldLangImage) {
    // Create a new image element
    var newLangImage = document.createElement("img");
    newLangImage.id = oldLangImage.id; // Copy the id
    newLangImage.alt = "lang new icon"; // Set alt text
    newLangImage.role = "role"; // role

    // Check the current language and set the SVG source accordingly
    if (lang === "EN") {
      newLangImage.src = "images/svg/FR.svg?" + new Date().getTime(); // Use a unique query string to prevent caching
    } else {
      newLangImage.src = "images/svg/EN.svg?" + new Date().getTime(); // Use a unique query string to prevent caching
    }

    // Replace the old image with the new one
    oldLangImage.parentNode.replaceChild(newLangImage, oldLangImage);

    // Log new src for debugging
    // console.log("Replaced lang image with new src: ", newLangImage.src);
  } else {
    console.error("Language image element not found");
  }
}

function updatePageContent() {
  const contributorsPage = document.getElementById("contributorsTeamPageInner");
  const productionPage = document.getElementById("productionTeamPageInner");

  if (contributorsPage) {
    contributorsPage.innerHTML = lang === "EN" ? contributorsPageEN : contributorsPageFR;
  } else {
    console.error("contributorsPage element not found");
  }

  if (productionPage) {
    productionPage.innerHTML = lang === "EN" ? productionPageEN : productionPageFR;
  } else {
    console.error("productionTeamPage element not found");
  }
}

function changeEachLangDiv() {
  strings.forEach(changeEachString);
  buttonStrings.forEach(changeEachBtnString);
}

// Update individual strings to the current language and adjust font sizes for specific elements
function changeEachString(string) {
  const element = document.getElementById(string.id);
  if (element) {
    element.innerHTML = lang === "FR" ? string.fr : string.en;
    adjustFontSize(string.id); // Adjust font size based on language
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
    // console.error(`Button element with ID '${string.id}' not found.`);
  }
}

const strings = [
  { id: "langToggle", en: "FR", fr: "EN" },
  // { id: "engLand", en: "MONAHAN is situated on the traditional unceded territory of the Anishinabe Algonquin Nation, custodians of these lands for millennia.", fr: "MONAHAN est situé sur le territoire traditionnel non cédé de la Nation Anishinabe Algonquine, gardienne de ces terres depuis des millénaires." },
  //  { id: "artPubArt", en: "ART PUBLIC ART", fr: "ART PUBLIC ART" },
  { id: "curiousEarsTxt", en: "A Sound Piece</br> for Curious Ears", fr: "Une pièce sonore </br> pour oreilles curieuses " },
  { id: "aboutH2", en: "ABOUT", fr: "À PROPOS DE" },
  // { id: "PondAltImg", en: "outline of Monahan Pond", fr: "Schéma de l'étang de Monahan" },
  { id: "soundForCurious", en: "A sound piece for curious ears.", fr: "Une pièce sonore pour les oreilles curieuses." },
  {
    id: "eachTimeYouClick",
    en: "Each time you click BEGIN, you’ll hear a unique sound piece, collaged by our algorithm from 173 sound chapters. All these chapters are created by a group of <a href='#contributorsH2'>contributors</a>. You’ll hear everything from songs and poems to nature sounds, interviews and stories.",
    fr: "Chaque fois que vous cliquez sur COMMENCER, vous découvrez une pièce sonore unique, composée par notre algorithme à partir de 173 chapitres sonores. Tous ces chapitres sont créés par un groupe diversifié de <a href='#contributorsH2'>contributrices et contributeurs</a>. Vous entendrez de tout : des chansons et des poèmes aux sons de la nature, en passant par des interviews et des histoires.",
  },
  {
    id: "ByBringingTogether",
    en: "By bringing together sounds by human and non-human beings MONAHAN creates an ever-evolving experience. You may hear a chapter you’ve heard before, but this time it’s next to something new.  Like the landscape around you, MONAHAN is always changing.",
    fr: "En rassemblant des sons produits par des êtres humains et non humains, MONAHAN crée une expérience en perpétuel mouvement. Il se peut que vous entendiez un chapitre que vous avez déjà écouté, mais cette fois-ci à la suite de quelque chose de nouveau. Tout comme le paysage qui vous entoure, MONAHAN est en constante évolution.",
  },
  {
    id: "experienceAnew",
    en: "Experience the site anew with each visit through dozens of sounds and stories gathered for the Monahan wetlands.",
    fr: "Découvrez le site à nouveau lors de chacune de vos visites grâce à des dizaines d'histoires et de sons recueillis pour le milieu humide de Monahan.",
  },
  {
    id: "delveInto",
    en: "Delve into sounds that explore movement, migration, story as medicine, plants as healers, voice, translation, and place.",
    fr: "Plongez-vous dans une ambiance sonore qui explore le mouvement, la migration, les récits qui soulagent, les êtres non humains, les plantes qui guérissent, la voix, la traduction et le lieu.",
  },

  // { id: "productionTeamH2", en: "PRODUCTION TEAM", fr: "L'ÉQUIPE DE PRODUCTION" },
  { id: "monH2", en: "MONAHAN", fr: "MONAHAN" },

  {
    id: "pavedPaths",
    en: "The paths around the site are paved and accessible, and include benches.",
    fr: "Les sentiers autour du site sont pavés, accessibles et munis de bancs.",
  },
  {
    id: "smartphoneQRAccess",
    en: "With a smartphone and data access you can scan a QR code to experience the sound piece.",
    fr: "Avec un téléphone intelligent et un accès aux données, vous pouvez scanner un code QR pour découvrir la pièce sonore.",
  },
  {
    id: "qrCodeLocations",
    en: "QR codes are on the main sign located near the bridge and on a selection of benches along the main path.",
    fr: "Les codes QR se trouvent sur le panneau principal situé près du pont et sur le dossier de certains bancs le long du sentier principal.",
  },
  {
    id: "benchQRCodes",
    en: "The QR codes on the benches are installed on the backrests.",
    fr: "On trouve les codes QR sur le dossier des bancs.",
  },
  { id: "noWashrooms", en: "There are no washrooms on site.", fr: "Il n’y a pas de toilettes sur le site." },

  { id: "howToListenH2", en: "HOW TO LISTEN", fr: "COMMENT ÉCOUTER" },
  { id: "scanQR", en: "Scan the QR code", fr: "Scannez le code QR" },
  { id: "arriveWebsite", en: "Arrive at the MONAHAN website", fr: "Accédez au site Web de MONAHAN" },
  { id: "putHeadphones", en: "Put on your HEADPHONES", fr: "Mets tes ÉCOUTEURS" },
  { id: "clickBegin", en: "Click BEGIN", fr: "Cliquez sur COMMENCER" },
  { id: "contributorsH2", en: "CONTRIBUTORS", fr: "CONTRIBUTRICES ET CONTRIBUTEURS" },

  { id: "listenSoundPiece", en: "LISTEN to a personalized sound piece", fr: "ÉCOUTEZ une pièce sonore personnalisée" },
  {
    id: "listenAnywhere",
    en: "You can listen to MONAHAN wherever you are. We suggest spending time outside while listening.",
    fr: "Vous pouvez écouter MONAHAN en tous lieux. Nous vous suggérons de le faire à l’extérieur.",
  },

  { id: "howitWorksH2", en: "HOW IT WORKS", fr: "COMMENT ÇA FONCTIONNE" },
  { id: "whereToFindUsH2", en: "WHERE TO FIND US", fr: "POUR NOUS TROUVER" },
  {
    id: "visit",
    en: "Visit the <a href='https://goo.gl/maps/jjCqS3aNJphNgZaE9' target='blank'>Monahan Wetlands</a> (or Monahan Drain) in Ottawa, Canada.",
    fr: "Visitez le <a href='https://goo.gl/maps/jjCqS3aNJphNgZaE9' target='blank'>milieu humide de Monahan</a> (ou drain Monahan) à Ottawa, Canada.",
  },
  { id: "accessH2", en: "ACCESSIBILITY", fr: "ACCESSIBILITÉ" },
  {
    id: "finalThanks",
    en: "Thank you for visiting MONAHAN.<br>We hope you will return for a different experience!",
    fr: "Merci d’avoir visité MONAHAN.<br>Nous espérons que vous reviendrez pour une expérience différente!",
  },

  {
    id: "thanksSignageFabrication",
    en: 'Thank you to <a href="https://dymech.ca/" target="_blank" rel="noopener noreferrer" aria-label="Visit Dymech website. Link opens in a new tab">Dymech</a> and <a href="https://beaconlite.ca/" target="_blank" rel="noopener noreferrer" aria-label="Visit Beacon Lite website. Link opens in a new tab">Beacon Lite</a> for fabricating the signage, and to <a href="https://www.affinityproductions.tv/" target="_blank" rel="noopener noreferrer" aria-label="Visit Affinity Production Group website. Link opens in a new tab">Affinity Production Group</a> for production support.',
    fr: 'Merci à <a target="_blank" rel="noopener noreferrer" aria-label="Visitez le site web de Dymech. Le lien s"ouvre dans un nouvel onglet" href="https://dymech.ca/">Dymech</a> et <a target="_blank" rel="noopener noreferrer" aria-label="Visitez le site web de Beacon Lite. Le lien s"ouvre dans un nouvel onglet" href="https://beaconlite.ca/">Beacon Lite</a> pour la fabrication de la signalisation et à <a href="https://www.affinityproductions.tv/" target="_blank" rel="noopener noreferrer" aria-label="Visitez le site web de Affinity Production Group. Le lien s"ouvre dans un nouvel onglet">Affinity Production Group</a> pour le soutien à la production.',
  },
  {
    id: "thanksKomiku",
    en: 'Thank you to Komiku for "The place that never gets old", retrieved from <a href="https://citizen-dj.labs.loc.gov/" target="_blank" rel="noopener noreferrer" aria-label="Visit Citizen DJ website at the Library of Congress. Link opens in a new tab">Citizen DJ</a>, Free Music Archive at the Library of Congress, Web Archives Division.',
    fr: 'Merci à Komiku pour "The place that never gets old", extrait de <a href="https://citizen-dj.labs.loc.gov/" target="_blank" rel="noopener noreferrer" aria-label="Visitez le site Web Citizen DJ de la Bibliothèque du Congrès. Le lien s\'ouvre dans un nouvel onglet">Citizen DJ</a>, site Web archivé Free Music Archive de la Bibliothèque du Congrès, Division des archives Web.',
  },
  
  {
    id: "hugeThanks",
    en: "Huge thank you’s go out to:",
    fr: "Un grand merci à :",
  },
  // { id: "volumeLower", en: "Lower Volume", fr: "Baisser le volume" },
  // { id: "volumeRaise", en: "Raise Volume", fr: "Augmenter le volume" },
  {
    id: "cred",
    en: "MONAHAN was produced by Grimm Pictures and commissioned by the <a href='https://ottawa.ca/en/arts-heritage-and-events/public-art-and-city-ottawa-art-collection/public-art' target='_blank' rel='noopener noreferrer' aria-label='Visit City of Ottawa’s Public Art Program website. Link opens in a new tab'>City of Ottawa’s Public Art Program</a>.",
    fr: "MONAHAN a été produit par Grimm Pictures et commandé par le <a href='https://ottawa.ca/fr/arts-patrimoine-et-evenements/art-public-et-collection-dart-de-la-ville-dottawa/art-public' target='_blank' rel='noopener noreferrer' aria-label='Visitez le site du Programme d’art public de la Ville d’Ottawa. Le lien s'ouvre dans un nouvel onglet'>Programme d’art public de la Ville d’Ottawa</a>.",
  },
  
  { id: "contact", en: "Contact: publicartprogram@ottawa.ca", fr: "Pour toutes questions : programmedartpublic@ottawa.ca" },
  { id: "copyright", en: "©2023 All Rights Reserved", fr: "©2023 Tous droits réservés" },
  { id: "cityArtCollection", en: "City of Ottawa Art Collection", fr: "Collection d'art de la ville d'Ottawa" },
];

const buttonStrings = [
  { id: "invertColorsTxt", en: "Invert Colours", fr: "Inverser les couleurs" },
  { id: "textSizeTxt", en: "Text Size", fr: "Taille du Texte" },
  // { id: "textSizeDecreaseBtn", en: "Decrease Text Size", fr: "Diminuer la taille du texte" },
  // { id: "textSizeIncreaseBtn", en: "Increase Text Size", fr: "Augmenter la taille du texte" },
  { id: "resetBtn", en: "Reset", fr: "Réinitialiser" },
  { id: "transcriptButton", en: "TRANSCRIPT", fr: "TRANSCRIPTION" },

  { id: "play-button-text-container", en: "BEGIN", fr: "COMMENCER" },
  // { id: "skipBackwardButton", en: "Skip Backward", fr: "Reculer" },
  // { id: "skipForwardButton", en: "Skip Forward", fr: "Avancer" },
];

const originalFontSizes = {};

function adjustFontSize(elementId) {
  const sizeReductions = {
    curiousEarsTxt: 0.6, // 20% smaller for French
  };

  if (!window.matchMedia("(min-width: 900px)").matches) {
    console.log("Viewport is less than 900px wide");
    // Additional or modified size reductions can be added here
    sizeReductions["play-button-text-container"] = 0.9;
  } else {
    // console.log("Viewport is 900px wide or wider");
    // Adjustments for wider viewports can be applied here
    sizeReductions["play-button-text-container"] = 0.6;
  }

  // Check if the current element's ID is in the sizeReductions object
  if (sizeReductions.hasOwnProperty(elementId)) {
    const element = document.getElementById(elementId);

    if (lang === "FR") {
      if (!originalFontSizes.hasOwnProperty(elementId)) {
        const computedStyle = window.getComputedStyle(element);
        originalFontSizes[elementId] = computedStyle.fontSize;
      }

      const newSize = parseFloat(originalFontSizes[elementId]) * sizeReductions[elementId];
      element.style.fontSize = `${newSize}px`;
    } else {
      // If switching back to English, revert to original font size
      if (originalFontSizes.hasOwnProperty(elementId)) {
        element.style.fontSize = originalFontSizes[elementId];
      }
    }
  } else {
  }
}


const productionPageEN = `

<div class="headerDiv">
  <h2 id="productionTeamH2">PRODUCTION TEAM</h2>
</div>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SARAH ABBOTT</span> <span class="role">ecology & non-human advocacy</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sarah Abbott's website. Link opens in a new tab" href="https://sarahabbott.ca/">Sarah Abbott</a></span>'s research aims to understand and share knowledge of the sentient, sensory relations of trees, plants and nonhumans in general though frameworks that include public/multispecies ethnography, Indigenous ways of knowing, ontological emergence theory, plant science, interspecies communication, and ethnographic filmmaking. Sarah is an associate professor based in the Department of Film at the University of Regina and teaches in the areas of film production, sentient ecologies, ethnographic practice, and climate change. She recently completed her interdisciplinary Doctorate of Social Sciences at Royal Roads University. She received her Master of Fine Arts in Media Arts from Syracuse University and her Bachelor of Arts Honours in Film Studies and Drama from Queen's University. Sarah is a recipient of a Vanier Canada Graduate Scholarship (2014-2017), the Saskatchewan Lieutenant Governor's Arts Award for Arts and Learning (2012), and the City of Regina's Mayor's Arts and Business Award for Innovation in the Arts (2009).</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">JORDAN BELL</span><span class="role">audio engineer</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jordan Bell's LinkedIn profile. Link opens in a new tab" href="https://www.linkedin.com/in/jordan-bell-98899811/?originalSubdomain=ca">Jordan Bell</a></span> is a sound designer, audio engineer, and film mixer from Ottawa. In addition to his training as an audio engineer at Metalworks Studios in Mississauga, Jordan completed a 4-year degree in Sociology at Carleton University. His audio work covers a broad scope, from voice recording, to ADR, to feature film and animation editing and mixing, as well as many corporate clients, all at Affinity Production Group where he has been an engineer for over a decade. When he is not working in the post-production world, Jordan is an active musician. For over 20 years he has worked in the music industry, writing, recording, performing and touring with several different groups.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">BRANDON EDWARDS</span> <span class="role">research assistant</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Brandon Edwards' website. Link opens in a new tab" href="http://brandonedwards.ca/">Brandon Edwards</a></span> is a PhD Candidate in Biology at Carleton University in Ottawa, Ontario. For his thesis, he is developing tools to allow researchers to bring together multiple different types of bird survey data into one statistical model, as well as techniques to control for a person's ability to accurately perceive birds in different environments such as roadsides, forests, open grasslands, etc. He has had a keen interest in nature his entire life, particularly in photographing the world around us. His passion for birds has allowed him to discover many of the other living and non-living things that make up this planet. He brings curiosity and passion for the natural world to his projects.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">RACHEL GRAY</span> <span class="role">content collaborator</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Rachel Gray's website. Link opens in a new tab" href="https://rachelgray.art/">Rachel Gray</a></span> is a Canadian interdisciplinary artist based in Algonquin Territory/Ottawa. Navigating the world with Dyslexia has led her to explore art as a way to create customized language. Through drawing, performance, installation, and storytelling she tries to speak into the places language leaves blank. Her work has been exhibited nationally and internationally. Rachel is also an author, animator, and illustrator, with her graphic novel <span class="italic">Jess</span> adapted into a musical work commissioned by Pacific Opera Victoria. Rachel is deeply connected to the disability arts community, serving as an advocate for accessible art practices, curating exhibitions, and working with organizations and academic institutions to harness art and storytelling. She is a founding member of Ghost Rooster, a disability arts collective, and continues to seek opportunities for collaboration and community connection through art.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SIMON GUIBORD</span><span class="role">graphic designer</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Simon Guibord's website. Link opens in a new tab" href="https://simonguibord.com/">Simon Guibord</a></span> is a graphic designer who works in cultural, academic and commercial circles. He has collaborated with SAW Gallery, Artengine, Ottawa Art Gallery, DAÏMÔN, AXENÉO7, HB magazine, and with artists across the region. He specializes in publications and the development of graphic identities. His work is characterized by a rational and sensitive approach, and a process that promotes research and experimentation. Since 2015, he has taught typography at the University of Quebec in Outaouais.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">MARIE LEBLANC FLANAGAN</span> <span class="role">creative technologist / developer</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Marie LeBlanc Flanagan's website. Link opens in a new tab" href="https://marieflanagan.com/">Marie LeBlanc Flanagan</a></span> is an artist working in the playful spaces between people, related to connection and community. Marie builds experimental video games, playful installations, and cooperative experiences and has an enduring fondness for the possibilities of trash. Marie founded <a target="_blank" rel="noopener noreferrer" aria-label="Visit Wyrd Arts Initiatives website. Link opens in a new tab" href="https://wyrdartsinitiatives.org/">Wyrd Arts Initiatives</a>, a nationwide nonprofit dedicated to encouraging, documenting, and connecting creative expression across Canada; <a target="_blank" rel="noopener noreferrer" aria-label="Visit Drone Day website. Link opens in a new tab" href="http://droneday.org/">Drone Day</a>, an annual international celebration of drone music communities; co-founded <a target="_blank" rel="noopener noreferrer" aria-label="Visit Imaginary Residency website. Link opens in a new tab" href="https://imaginaryresidency.com/">Imaginary Residency</a>, an artist-run online residency, co-founded <a target="_blank" rel="noopener noreferrer" aria-label="Visit Toronto Games Week website. Link opens in a new tab" href="https://torontogamesweek.com/">Toronto Games Week</a> and co-organizes <a target="_blank" rel="noopener noreferrer" aria-label="Visit GAIA Symposium website. Link opens in a new tab" href="http://gaiasymposium.net/">GAIA</a>, a global biennial gathering of playful curators. Marie is on the board of <a target="_blank" rel="noopener noreferrer" aria-label="Visit Inter Arts Matrix website. Link opens in a new tab" href="https://www.interartsmatrix.ca/">Inter Arts Matrix</a>, the <a target="_blank" rel="noopener noreferrer" aria-label="Visit Eastern Bloc website. Link opens in a new tab" href="https://easternbloc.ca/fr">Eastern Bloc</a> artistic programming committee, and has served as a <a target="_blank" rel="noopener noreferrer" aria-label="Visit Polaris Prize website. Link opens in a new tab" href="https://polarismusicprize.ca/">Polaris Prize</a> Juror. Marie's consulting work with artists and arts organizations include <a target="_blank" rel="noopener noreferrer" aria-label="Visit Wizard Zines website. Link opens in a new tab" href="https://wizardzines.com/">Wizard Zines</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit A MAZE. Berlin website. Link opens in a new tab" href="https://2021.amaze-berlin.de/">A MAZE. Berlin</a> International Games and Playful Media Festival, <a target="_blank" rel="noopener noreferrer" aria-label="Visit The Processing Foundation website. Link opens in a new tab" href="https://processingfoundation.org/">The Processing Foundation</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit The School of Machines, Making, and Make-Believe website. Link opens in a new tab" href="https://www.schoolofma.org/">The School of Machines, Making, and Make-Believe</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit Ada X website. Link opens in a new tab" href="https://www.ada-x.org/">Ada X</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit Daily Tous Les Jours website. Link opens in a new tab" href="https://www.dailytouslesjours.com/en">Daily Tous Les Jours</a>, and <a target="_blank" rel="noopener noreferrer" aria-label="Visit Game Arts International Network website. Link opens in a new tab" href="https://gameartsinternational.network/">Game Arts International Network</a>.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">ALLISON O'CONNOR</span> <span class="role roleException">City of Ottawa public art liaison</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Allison O'Connor's LinkedIn profile. Link opens in a new tab" href="https://www.linkedin.com/in/allioconnor/?originalSubdomain=ca">Allison O'Connor</a></span> is a Public Art Officer with the City of Ottawa's Public Art Program. She coordinates and commissions temporary and permanent artworks, as well as a variety of diverse cultural initiatives across the city. Allison is also an internationally touring installation artist who creates artworks that consider the environment and its other-than-human habitants. Allison is an MFA graduate from the School of Visual Arts of New York City, where she received the Paula Rhodes Memorial Award for her thesis writing on public art for ecological remediation. Allison is an apiarist, amateur archer, and mycology enthusiast. Her recent work focuses on the stewardship of seeds.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">LAURA TALER</span> <span class="role">concept & realization</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Laura Taler's website. Link opens in a new tab" href="https://laurataler.ca/">Laura Taler</a></span> is a Romanian-born, award-winning artist, filmmaker, choreographer, and performer with a 30-year career in collaborative art practices. Her experience with public art ranges from large-scale performance works, to projections and screen-based works, to permanent installations. She expertly integrates mediums, pushes boundaries, and uses technology simply and innovatively. Since the beginning of her career Laura has worked collaboratively as the director of a team of artists and technicians. Through her company Grimm Pictures, founded in 1994, she has produced work for a variety of small and large organizations. Laura's strength as an artist lies in her ability to provide a clear vision to the team of experts that she gathers around each project and to guide that vision with precision and flexibility.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">JOCELYN TODD</span> <span class="role">production manager</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jocelyn Todd's website. Link opens in a new tab" href="https://www.remembernowmove.art/">Jocelyn Todd</a></span> is a dancer, choreographer, producer and multi-disciplinary artist currently based in so-called Ottawa. Jocelyn works with the body and its interaction with the present moment, environment, political landscape, sound, space, concept and other bodies. After graduating from The School of Dance with a Diploma in Contemporary Dance Studies, Jocelyn split her time between Canada and England. In London, she delved into self-curated and intensive periods of dance study, and presented her work in the Suffolk High Tide Festival and at London's Robin Howard Theatre. She has also presented her choreographic works in Ottawa. Most recently (2020-2023): <span class="italic">shell</span>, <span class="italic">the A-team</span> and <span class="italic">Time + Light</span>. Jocelyn's film <span class="italic">Gold</span> was presented as part of Dance On Screen at the Mayfair Theatre in Fall 2021. She is deeply thankful for the support of Ottawa Dance Directive and the communities that continue to nurture her, in Ottawa and London.</p>
  </article>
</details>

`;
const productionPageFR = `
<div class="headerDiv">
  <h2 id="productionTeamH2">L'ÉQUIPE DE PRODUCTION</h2>
</div>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SARAH ABBOTT</span> <span class="role">Écologie et défense des droits des non-humains</span>
  </summary>
  <article>
    <p>Dans ses recherches, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sarah Abbott's website. Link opens in a new tab" href="https://sarahabbott.ca/">Sarah Abbott</a></span> cherche à comprendre et à présenter les relations sentientes et sensorielles des arbres, des plantes et des non-humains dans leur ensemble, dans des cadres comprenant l'ethnographie publique ou multi-espèce, les systèmes de connaissance autochtones, la théorie de l'émergence d'un point de vue ontologique, la science des plantes, la communication interespèces et la cinématographie ethnographique. Sarah est professeure agrégée à la Faculté de cinéma de l'Université de Regina dans les domaines de la production cinématographique, l'écologie sensible, la pratique ethnographique et le changement climatique. Elle a récemment obtenu un doctorat interdisciplinaire en sciences sociales à la Royal Roads University. Elle est titulaire d'une maîtrise en arts visuels de l'Université de Syracuse et d'un baccalauréat en études cinématographiques et en art dramatique de l'Université Queen's. Sarah a décroché une bourse d'études supérieures du Canada Vanier (2014-2017), le Prix du lieutenant-gouverneur de la Saskatchewan pour les arts et l'apprentissage (2012) ainsi que le Prix des arts et des affaires du maire de Regina pour l'innovation dans les arts (2009).</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">JORDAN BELL</span><span class="role">ingénieur du son</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jordan Bell's LinkedIn profile. Link opens in a new tab" href="https://www.linkedin.com/in/jordan-bell-98899811/?originalSubdomain=ca">Jordan Bell</a></span> est un concepteur sonore, un ingénieur du son et un monteur sonore pour films d'Ottawa. En plus de sa formation d'ingénieur du son chez Metalworks Studios à Mississauga, Jordan détient un diplôme après quatre ans d'études en sociologie à l'Université Carleton. Son travail dans le monde de l'audio couvre un large éventail : de l'enregistrement vocal à la postsynchronisation, en passant par le montage et le mixage de longs métrages et de films d'animation. Il travaille avec de nombreuses entreprises, toutes au sein du groupe Affinity Production, où il est ingénieur depuis plus d'une dizaine d'années. Lorsqu'il ne travaille pas dans le monde de la postproduction, Jordan est un musicien prolifique. Depuis plus de 20 ans, il travaille dans l'industrie de la musique; il écrit, enregistre et joue ses chansons et fait des tournées avec une multitude de groupes.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">BRANDON EDWARDS</span> <span class="role">assistant à la recherche</span>
  </summary>
  <article>
    <p><a target="_blank" rel="noopener noreferrer" aria-label="Visit Brandon Edwards' website. Link opens in a new tab" href="http://brandonedwards.ca/"><span class="bold">Brandon Edwards</span></a> est candidat au doctorat en biologie à l'Université Carleton d'Ottawa, en Ontario. Dans le cadre de sa thèse, il élabore des outils permettant à la communauté de la recherche de rassembler plusieurs types de données d'enquête sur les oiseaux dans un seul modèle statistique, ainsi que des techniques permettant de contrôler la capacité d'une personne à percevoir les oiseaux avec précision dans différents environnements, comme le bord de la route, la forêt, les prairies... Toute sa vie, Brandon a cultivé une grande passion pour la nature, qui se manifeste surtout dans la photographie. Sa passion pour les oiseaux lui a permis de découvrir de nombreux autres êtres vivants et non vivants qui composent cette planète. Dans ses projets, il amène sa curiosité et sa passion pour la nature.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">RACHEL GRAY</span> <span class="role">collaboratrice de contenu</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Rachel Gray's website. Link opens in a new tab" href="https://rachelgray.art/">Rachel Gray</a></span> est une artiste interdisciplinaire canadienne basée dans le territoire algonquin (Ottawa). Sa dyslexie dans un monde peu adapté l'a amenée à explorer l'art comme un moyen de créer un langage personnalisé. Grâce au dessin, au spectacle, à l'installation et à la narration, elle tente de parler dans ces lieux que le langage laisse vides. Son travail a été exposé au niveau national et international. Rachel est également auteure, animatrice et illustratrice. Son roman graphique <span class="italic">Jess</span> a été adapté en une œuvre musicale sur une commande de Pacific Opera Victoria. Rachel est profondément liée à la communauté artistique des personnes handicapées; elle défend les pratiques artistiques accessibles, organise des expositions et travaille avec des organisations et des institutions universitaires pour exploiter l'art et la narration. Elle est membre fondatrice de Ghost Rooster, un collectif d'artistes handicapés, et ne cesse de chercher des occasions de collaborer et de rejoindre la communauté à travers l'art.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SIMON GUIBORD</span><span class="role">concepteur graphique</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Simon Guibord's website. Link opens in a new tab" href="https://simonguibord.com/">Simon Guibord</a></span> est un concepteur graphique qui travaille dans les milieux culturels, universitaires et commerciaux. Il a collaboré avec la Galerie SAW, Artengine, la Galerie d'art d'Ottawa, DAÏMÔN, AXENÉO7, le magazine HB et des artistes de toute la région. Il se spécialise dans les publications et l'élaboration d'identités graphiques. Son travail se caractérise par une approche rationnelle et sensible, ainsi qu'un processus favorisant la recherche et l'expérimentation. Depuis 2015, il enseigne la typographie à l'Université du Québec en Outaouais.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">MARIE LEBLANC FLANAGAN</span> <span class="role">technologue créatif / développeur</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Marie LeBlanc Flanagan's website. Link opens in a new tab" href="https://marieflanagan.com/">Marie LeBlanc Flanagan</a></span> est un artist qui travaille dans les espaces ludiques entre les gens, dans ces places qui touchent au lien et à la communauté. Marie monte des jeux vidéo expérimentaux, des installations ludiques et des expériences coopératives. Iel a un penchant de longue date pour les possibilités qu'offrent les déchets. Marie est également fondateur de <a target="_blank" rel="noopener noreferrer" aria-label="Visit Wyrd Arts Initiatives website. Link opens in a new tab" href="https://wyrdartsinitiatives.org/">Wyrd Arts Initiatives</a>, une organisation nationale sans but lucratif qui encourage, documente et rassemble l'expression créative au Canada, ainsi que de <a target="_blank" rel="noopener noreferrer" aria-label="Visit Drone Day website. Link opens in a new tab" href="https://droneday.org/">Drone Day</a>, une célébration internationale annuelle des communautés de musique de drone. Marie a cofondé <a target="_blank" rel="noopener noreferrer" aria-label="Visit Imaginary Residency website. Link opens in a new tab" href="https://imaginaryresidency.com/">Imaginary Residency</a>, une résidence en ligne gérée par des artistes, ainsi que la <a target="_blank" rel="noopener noreferrer" aria-label="Visit Toronto Games Week website. Link opens in a new tab" href="https://torontogamesweek.com/">Toronto Games Week</a>. Marie est coorganisateur de <a target="_blank" rel="noopener noreferrer" aria-label="Visit GAIA Symposium website. Link opens in a new tab" href="http://gaiasymposium.net/">GAIA</a>, un rassemblement mondial biennal de conservateurs et conservatrices ludiques; membre du conseil d'administration d'<a target="_blank" rel="noopener noreferrer" aria-label="Visit Inter Arts Matrix website. Link opens in a new tab" href="https://www.interartsmatrix.ca/">Inter Arts Matrix</a> et du comité de programmation artistique d'<a target="_blank" rel="noopener noreferrer" aria-label="Visit Eastern Bloc website. Link opens in a new tab" href="https://easternbloc.ca/fr">Eastern Bloc</a>; et ancienne membre du jury du <a target="_blank" rel="noopener noreferrer" aria-label="Visit Polaris Prize website. Link opens in a new tab" href="https://polarismusicprize.ca/fr/">prix Polaris</a>. Marie est experte-conseil auprès d'artistes et d'organisations artistiques comme <a target="_blank" rel="noopener noreferrer" aria-label="Visit Wizard Zines website. Link opens in a new tab" href="https://wizardzines.com/">Wizard Zines</a>, le festival international de jeux et de médias ludiques <a target="_blank" rel="noopener noreferrer" aria-label="Visit A MAZE. Berlin website. Link opens in a new tab" href="https://2021.amaze-berlin.de/">A MAZE. Berlin</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit The Processing Foundation website. Link opens in a new tab" href="https://processingfoundation.org/">The Processing Foundation</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit The School of Machines, Making, and Make-Believe website. Link opens in a new tab" href="https://www.schoolofma.org/">The School of Machines, Making, and Make-Believe</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit Ada X website. Link opens in a new tab" href="https://www.ada-x.org/">Ada x</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit Daily Tous Les Jours website. Link opens in a new tab" href="https://www.dailytouslesjours.com/">Daily Tous Les Jours</a> et <a target="_blank" rel="noopener noreferrer" aria-label="Visit Game Arts International Network website. Link opens in a new tab" href="https://gameartsinternational.network/">Game Arts International Network</a>.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">ALLISON O'CONNOR</span> <span class="role roleException">agente de liaison d’art public de la Ville d’Ottawa</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Allison O'Connor's LinkedIn profile. Link opens in a new tab" href="https://www.linkedin.com/in/allioconnor/?originalSubdomain=ca">Allison O'Connor</a></span> est agente d'art public au sein du Programme d'art public de la Ville d'Ottawa. Elle coordonne et commande des œuvres d'art temporaires et permanentes, ainsi que diverses initiatives culturelles dans toute la ville. Allison est également une artiste d'installations qui fait des tournées internationales et crée des œuvres d'art soucieuses de l'environnement et de ses habitants autres qu'humains. Allison est titulaire d'une maîtrise en beaux-arts de la School of Visual Arts de New York, où elle a reçu le Paula Rhodes Memorial Award pour sa thèse sur l'art public au service de la réhabilitation écologique. Allison est apicultrice, tireuse à l'arc amateur et passionnée de mycologie. Ses travaux récents portent sur l'intendance des semences.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">LAURA TALER</span> <span class="role">conception et réalisation</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Laura Taler's website. Link opens in a new tab" href="https://laurataler.ca/">Laura Taler</a></span> est une artiste, cinéaste, chorégraphe et interprète de spectacle née en Roumanie maintes fois primée. Forte d'une carrière de 30 ans dans les pratiques artistiques collaboratives, Laura a une expérience de l'art public qui va des spectacles à grande échelle aux installations permanentes, en passant par les projections et les œuvres sur écran. Elle sait varier les médiums, repousser les limites et utiliser la technologie de manière simple et innovante. Depuis le début de sa carrière, Laura travaille en collaboration en tant que directrice d'une équipe d'artistes et de techniciens et techniciennes. Par l'intermédiaire de sa société Grimm Pictures, fondée en 1994, elle a produit des œuvres pour diverses petites et grandes organisations. En tant qu'artiste, elle tire sa force de sa capacité à donner une vision claire à l'équipe chevronnée qu'elle rassemble autour de chaque projet et à concrétiser cette vision avec précision et souplesse.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors2"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">JOCELYN TODD</span><span class="role">directrice de la production</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jocelyn Todd's website. Link opens in a new tab" href="https://www.remembernowmove.art/">Jocelyn Todd</a></span> est une danseuse, chorégraphe, productrice et artiste multidisciplinaire qui vit actuellement à Ottawa. Jocelyn travaille avec le corps et ses interactions avec le moment présent, l'environnement, le paysage politique, le son, l'espace, le concept et les autres corps. Après avoir obtenu un diplôme d'études en danse contemporaine à The School of Dance, Jocelyn a passé son temps à faire la navette entre le Canada et l'Angleterre. À Londres, elle s'est plongée intensément dans des séances d'étude de danse qu'elle organisait elle-même et a présenté son travail au Festival Suffolk High Tide et au Robin Howard Theatre de Londres. Elle a également présenté ses chorégraphies à Ottawa. Ses œuvres récentes (2020-2023) sont <span class="italic">shell</span>, <span class="italic">the A-team</span> et <span class="italic">Time + Light</span>. Son film <span class="italic">Gold</span> a été présenté dans le cadre de Dance On Screen au Mayfair Theatre à l'automne 2021. Elle est profondément reconnaissante du soutien du Centre de danse contemporaine et des communautés qui continuent de l'encourager à Ottawa et à London.</p>
  </article>
</details>


`;
const contributorsPageEN = `
<div class="headerDiv">
  <h2 id="contributorsH2">CONTRIBUTORS</h2>
</div>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SARAH ABBOTT</span>
  </summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sarah Abbott's website. Link opens in a new tab" href="https://sarahabbott.ca/">Sarah Abbott</a></span>
      's research aims to understand and share knowledge of the sentient, sensory relations of trees, plants and nonhumans in general
      though frameworks that include public/multispecies ethnography, Indigenous ways of knowing, ontological emergence theory, plant
      science, interspecies communication, and ethnographic filmmaking. Sarah is an associate professor based in the Department of Film at
      the University of Regina and teaches in the areas of film production, sentient ecologies, ethnographic practice, and climate change.
      She recently completed her interdisciplinary Doctorate of Social Sciences at Royal Roads University. She received her Master of Fine
      Arts in Media Arts from Syracuse University and her Bachelor of Arts Honours in Film Studies and Drama from Queen's University.
      Sarah is a recipient of a Vanier Canada Graduate Scholarship (2014-2017), the Saskatchewan Lieutenant Governor's Arts Award for Arts
      and Learning (2012), and the City of Regina's Mayor's Arts and Business Award for Innovation in the Arts (2009).
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">DIANA BERESFORD-KROEGER</span><span class="role"></span>
  </summary>
  <article>
    <p>
      Botanist, medical biochemist and author
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Diana Beresford-Kroeger's website. Link opens in a new tab" href="https://dianaberesford-kroeger.com/">Diana Beresford-Kroeger</a></span>
      possesses a unique combination of western scientific training and an understanding of the knowledge and methods of a wide variety of traditional
      and alternative sources. Beresford-Kroeger's concept of bioplanning challenges ordinary people to develop a new relationship with
      the natural world, to view the environment as a biological system and to perform the ecological task of replanting the global
      forest. <span class="italic">Her books include To Speak for the Trees</span>, <span class="italic">The Sweetness of a Simple Life</span>,
      <span class="italic">The Global Forest, Arboretum Borealis: A Lifeline of the Planet</span>,
      <span class="italic">Arboretum America: A Philosophy of the Forest</span>, and <span class="italic">A Garden for Life</span>. A
      feature documentary about her work, the Canadian Screen Awards-nominated
      <span class="italic">Call of the Forest: The Forgotten Wisdom of Trees</span>, appeared in 2017. Her latest book, <span class="italic">OurGreen Heart: The Soul and Science of Forests</span>, will be published in September 2024.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">PIERRE-LUC CLÉMENT</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Pierre-Luc Clément's website. Link opens in a new tab" href="https://pierrelucclement.xyz/">Pierre-Luc Clément</a></span> is a self-taught
      multi-disciplinary artist, sound designer, composer and producer who is actively involved in the artistic community in
      Ottawa/Gatineau. Founding member of the groups FET.NAT, KAY-fayb, Or and others, he also works as a percussionist and composer for
      renowned artists and contemporary dance and theatre companies across Canada. He has been listed on the prestigious Polaris short
      list for the album Le mal in 2019, and nominated at l'ADISQ for the producing of
      <span class="italic">Message texte à Nelligan</span> in 2016. He also co-fabricated three children. Prizes include SAW Gallery's New
      work prize in 2020 and two Rideau Prizes for best theatre sound design in 2014 and 2019. Pierre-Luc's work is characterized by the
      always tentative implementation of innovative concepts, approaches and methods. His creations are often intense and polarizing,
      oscillating between the beautiful and the abject while incorporating possibilities for failure.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">ALBERT DUMONT</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Albert Dumont's website. Link opens in a new tab" href="http://albertdumont.com/about/">Albert Dumont</a></span> is an Algonquin spiritual
      advisor, poet, and storyteller from Kitigan Zibi Anishinabeg. His artistic talents touch many areas of the arts community. He was
      the English Poet Laureate for Ottawa from April 2021 to April 2023. He is also a pen & ink artist, actor, and playwright. Albert has
      performed his play <span class="italic">Bloodline</span> several times and has acted in fire prevention videos, TV commercials, and
      plays. Albert has written six books of poetry and short stories, and two children's books. He is the founder of Turtle Moons
      Contemplations, featuring his artwork and poems. Albert was presented with a Human Rights Award by the Public Service Alliance of
      Canada in 2010. In January 2017 he received the DreamKEEPERS Citation for Outstanding Leadership. Albert has dedicated his life to
      promoting Aboriginal spirituality and healing and to protecting the rights of Aboriginal Peoples particularly those of the young. He
      is the father of three daughters, grandfather of five grandchildren and has one great-grandchild.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">LANG ELLIOTT</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold">Lang Elliott</span> is a well-known nature recordist currently specializing in spacious 3D-binaural soundscapes
      gathered in wild areas across North America. To learn more about his work visit
      <a target="_blank" rel="noopener noreferrer" aria-label="Visit Music of Nature website. Link opens in a new tab" href="https://musicofnature.com/">Music of Nature</a>. Many of Lang's best and most immersive soundscapes are
      featured in his popular mobile application
      <a target="_blank" rel="noopener noreferrer" aria-label="Visit Pure Nature 3D Soundscapes app on the App Store. Link opens in a new tab" href="https://apps.apple.com/us/app/pure-nature-3d-soundscapes/id1357380255">Pure Nature 3D Soundscapes</a>,
      which effortlessly transports the listener into the wilds, each recording accompanied by an informative essay describing the habitat
      and what is heard. Lang is also the co-developer of
      <a target="_blank" rel="noopener noreferrer" aria-label="Visit Hear Birds Again app on the App Store. Link opens in a new tab" href="https://apps.apple.com/us/app/hear-birds-again/id6444369779?platform=iphone;">Hear Birds Again</a>, a
      unique new mobile app aimed at birders suffering from high frequency hearing loss. The app works by lowering the pitch of high bird
      songs to bring them into a frequency range where they can once again be heard.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SAM ESSER</span><span class="role"></span>
  </summary>
  <article>
    <p>
      As a Storm Water Field Technician for the City of Ottawa's Stormwater Management Branch, <span class="bold">Sam Esser</span> is part
      of a team dedicated to the revitalization of the Monahan wetlands. This work has seen a significant increase of wetland habitat
      through the propagation and protection of key aquatic plant species. In addition to providing critical habitat for birds, reptiles,
      and fish, these plants clean the water through the absorption and uptake of pollutants from upstream urban stormwater runoff. Sam's
      work extends throughout the city where he assesses the function of different stormwater facilities relative to water quality and
      quantity objectives. Before working for the City, he earned a Master's of Science at McGill University. He has had various
      environmental roles in the private and public sector and even worked aboard commercial fishing vessels in the Bering Sea. When he's
      not at work, you'll find him paddleboarding and fishing up and down the Rideau River.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">CHARLOTTE FRANK</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold">Charlotte Frank</span> is a singer and songwriter trained in bel canto, choral music, and creative writing. She
      has collaborated with multiple artists, writing, recording, and performing music in Ottawa, Berlin, and Montreal since 2015. She
      currently lives in Montreal where she is recording music as a member of the bands Misty Mood and Ezme, both of which released debut
      EPs in 2022 and 2023. Currently pursuing her PhD in English Literature at McGill University, Charlotte recently published a chapbook
      with fellow poets through Collusion Books entitled <span class="italic">Terrifying Friends</span>. She has degrees in the humanities
      and creative writing from Carleton University and Concordia University respectively.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">KIM KILPATRICK</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold">Kim Kilpatrick</span> is a professional storyteller, music therapist, accessibility consultant, and lover of
      nature. She has three one woman shows about living as a blind person in a sighted world:
      <span class="italic">Flying in the Dark</span> (2011), <span class="italic">Raising Stanley/Life with Tulia</span> (2018) and
      <span class="italic">Dangerous Touch</span> (living through COVID when blind 2022). Kim is a featured artist with
      <a target="_blank" rel="noopener noreferrer" aria-label="Visit Ottawa Storytellers website. Link opens in a new tab" href="http://www.ottawastorytellers.ca/">Ottawa Storytellers</a>,
      <a target="_blank" rel="noopener noreferrer" aria-label="Visit MASC website. Link opens in a new tab" href="http://www.masconline.ca/">MASC</a> and
      <a target="_blank" rel="noopener noreferrer" aria-label="Visit Radical Connections website. Link opens in a new tab" href="http://www.radicalconnections.ca/">Radical Connections</a>. She shares her travels with her fifth guide dog
      Ginger, who is a yellow lab and who walked the nature paths with her for this project.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">FIDES KRUCKER</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Fides Krucker's website. Link opens in a new tab" href="https://www.fideskrucker.com/">Fides Krucker</a></span> has sung, produced and created
      contemporary opera and interdisciplinary work in Canada and abroad for forty years. Her book
      <span class="italic"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Reclaiming Calliope book page on Penguin Random House website. Link opens in a new tab" href="https://www.penguinrandomhouse.ca/books/706315/reclaiming-calliope-by-fides-krucker/9781623177065">Reclaiming Calliope: Freeing the Female Voice through Undomesticated Singing</a></span>
      (North Atlantic Books) re-wilds the human voice through body-based emotional integration. In 1991 Fides founded the
      interdisciplinary performance ensemble URGE; their final work received two Dora awards and was published by Playwrights Canada. In
      2018 her company, Good Hair Day Productions --- known for groundbreaking lyric-theatre --- presented
      <span class="italic">In This Body</span> at Canadian Stage with dancers Heidi Strauss, Laurence Lemieux and Peggy Baker. Her own
      voice is noted for its "staggering range and control... less an instrument than a force of nature." Fides taught voice at Humber
      College for twenty years and facilitates a wide range of artists in Canada and the US. Her 2-year teacher training programme
      launched in the summer of 2021.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">AMY MACPHERSON</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold">Amy MacPherson</span> is an environmental biologist working in the Natural Systems & Rural Affairs unit at the
      City of Ottawa. In addition to working on subwatershed studies, environmental assessments and other planning initiatives, Amy
      organises the City's Wildlife Speaker Series events. She also developed and maintains lists of several types of wildlife found in
      the city, including a list of Species at Risk in Ottawa. Other recent projects include the development of Bird-Safe Design
      Guidelines and the City Hall Pollinator Garden. Prior to joining the City in January 2006, Amy worked for seven years as an
      environmental consultant. In her spare time, Amy enjoys nature photography and has lately been putting this hobby to good use by
      contributing observations to iNaturalist.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">KIKO PACE</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Kiko Pace's website. Link opens in a new tab" href="https://kikosounds.com/">Kiko Pace</a></span> creates portals for deeper listening
      through installation, sound making, meditation and restorative practices. They currently facilitate private and group sound bath
      experiences at their studio <a target="_blank" rel="noopener noreferrer" aria-label="Visit Kiko Space website. Link opens in a new tab" href="https://www.kikospace.ca/">Kiko Space</a> in Roncesvalles, Tkaronto, and offer
      retreats, workshops and trainings that further explore the art and science of sound. Kiko is deeply devoted to communicating,
      learning and honouring nature through personal ritual and study. All begins with acknowledging the privilege of getting to practice
      on this land, the necessity of care, and the responsibility we have to ourselves, the earth and each other.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">DEMETRIOS PETSALAKIS</span><span class="role"></span>
  </summary>
  <article>
    <p>
      Originally from Athens Greece,
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Demetri Petsalakis' SoundCloud profile. Link opens in a new tab" href="https://soundcloud.com/dpetsalakis">Demetri Petsalakis</a></span> is a Toronto based
      musician performing in a variety of styles with a focus on Greek and Middle Eastern lutes. Influenced by the rich cultural diversity
      of Canada, Demetri incorporates musical elements from different traditions in order to create a contemporary sound that represents
      both his heritage and the community that he is a part of. An active member of the Toronto world music scene Demetri has composed
      for, recorded, and performed with many groups including Kune, Niyaz, Tafelmusik, Ventanas, Near East Trio, Zephyr, Turkwaz, Moneka
      Arabic Jazz and Moskitto Bar. During his musical studies Demetri has been fortunate to learn from many great teachers including oud
      masters Bassam Bishara, and Christos Tsiamoulis as well as master of the Cretan Lyra Astrinos Zaharioudakis and renowned jazz
      guitarist Lorne Lofsky.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">NAMITHA RATHINAPPILLAI</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Namitha Rathinappillai's website. Link opens in a new tab" href="http://namitharathinappillai.com/">Namitha Rathinappillai</a></span> is a fat, disabled,
      queer, Tamil-Canadian spoken word poet, organizer, and workshop facilitator who entered the poetry community in 2017. She is
      currently based in Toronto, and was the first female and youngest director of Ottawa's Urban Legends Poetry Collective (ULPC). They
      are a two-time Canadian Festival of Spoken Word (CFSW) team member with ULPC, and they published their first chapbook titled
      <span class="italic">Dirty Laundry</span> with Battleaxe Press in November of 2018. In 2019, she won the RBC Youth Ottawa Spirit of
      the Capital Award for Arts and Culture. They enjoy crafting, writing letters to friends, and looking at the moon.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">PATRICIA REYNOLDS</span><span class="role"></span>
  </summary>
  <article>
    <p>
      A teacher by profession,
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Patricia Reynolds' artist directory page on Radical Connections website. Link opens in a new tab" href="https://www.radicalconnections.ca/artistdirectory/v/patricia-reynolds-vocals-guitar-folk-gospel-swing-pop-wwii-country-campfire-quebecois">Patricia Reynolds</a></span>
      has been involved in Indigenous Education for over 30 years. She drums with the No Borders Drum Circle and on occasion joins the
      Thunderbird Sisters Collective for drumming and other performances. Now retired, she sings with Just Voices: An Activist Choir, the
      No Borders Community Voices, and also performs with Carmel Whittle. She recently participated in Beverley and Melody McKiver's
      <span class="italic">Odaabaanag</span> as organizer, accompanist, and member of the No Borders Community Voices. Patricia is
      currently working with Unmasked Connections, a project that brings the arts to residents in long-term care.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">JESSE STEWART</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jesse Stewart's profile on Carleton University's website. Link opens in a new tab" href="https://carleton.ca/music/people/stewart-jesse/">Jesse Stewart</a></span> is a composer,
      percussionist, artist, and educator. His music has been documented on over twenty recordings including Stretch Orchestra's
      self-titled debut album, which was honoured with the 2012 Instrumental Album of the Year Juno award. He has been widely commissioned
      as a composer and artist. In 2012, he founded We Are All Musicians (WAAM), an organization dedicated to making music as broadly
      accessible as possible. Through the WAAM initiative, he has conducted hundreds of inclusive music workshops and performances
      throughout North America. He has received numerous awards and honours including the Ottawa Arts Council's Mid-Career Artist Award
      (2017) and the Ottawa Arts Council Community Arts Educator Award (2023). In 2014, he was named to the Order of Ottawa. In 2022, he
      was elected to the College of New Scholars of the Royal Society of Canada. He is a faculty member in Carleton University's School
      for Studies in Art and Culture.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">LOUELLA TOBIAS</span><span class="role"></span>
  </summary>
  <article>
    <p>
      <span class="bold">Louella Tobias</span> is Delaware Anishnabe Kwe from Moravian of the Thames First Nation. "My name is Phoenix
      Thunderbird, I am inevitable, the devoted one from the Golden Eagle clan. My English name is Louella." A mother of three,
      grandmother of seven and great grandmother of one, Louella has been following her traditions for more than half of her life. She
      belongs to the Midewin Lodge on Manitoulin Island and is 3rd. Degree Midewin. Louella holds a Bachelor of Social Work from
      Laurentian University and learned about traditional healing and medicines such as sweat lodges, cedar baths and pipe ceremonies from
      Grandmothers in Sudbury.
    </p>
  </article>
</details>

<div class="svg-contributors"></div>
<details>
  <summary tabindex="0"><span class="summary-content">ELLEN WATERMAN</span><span class="role"></span></summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Ellen Waterman's website. Link opens in a new tab" href="http://www.ellenwaterman.ca/">Ellen Waterman</a></span> is Professor in the School for Studies in Art and Culture and holds the Helmut Kallmann Chair for Music in Canada at Carleton University. She is both a music scholar and a flutist specializing in creative improvisation. Her work on acoustic ecology includes the books <span class="italic">Sonic Geography Imagined and Remembered</span>, and <span class="italic">The Art of Immersive Soundscapes</span>. With Gillian Siddall, she is co-editor of <span class="italic">Negotiated Moments: Improvisation, Sound, and Subjectivity</span>, and she was a founding co-editor of the journal <span class="italic"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Critical Studies in Improvisation journal. Link opens in a new tab" href="http://www.criticalimprov.com/">Critical Studies in Improvisation/Études critiques en improvisation</a></span>. In 2021 she founded the <a target="_blank" rel="noopener noreferrer" aria-label="Visit the Research Centre for Music, Sound, and Society in Canada. Link opens in a new tab" href="http://www.carleton.ca/mssc">Research Centre for Music, Sound, and Society in Canada</a>, dedicated to exploring the complex and diverse roles that music and sonic arts play in shaping Canadian society.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0"><span class="summary-content">WRAY WELSH</span><span class="role"></span></summary>
  <article>
    <p>
      <span class="bold">Wray Welsh</span> is a dedicated and experienced Zone Supervisor for West Parks in Ottawa. Going straight from the school yard to the city yard in 1983, Wray has spent the past 40 plus years maintaining facilities and the beautiful outdoor spaces of the City of Ottawa. Wray oversees all the park infrastructure ensuring their cleanliness, safety, and overall functionality. Whether it's managing day-to-day park operations, motivating a team of staff, implementing conservation initiatives, or fostering community engagement, Wray's dedication and expertise make him an exceptional Zone Supervisor. His tireless efforts contribute to the well-being of both the parks and the communities they serve, ensuring that everyone can enjoy nature's beauty and tranquillity. In his free time, Wray enjoys boating along serene waterways, embarking on thrilling motorcycle adventures, and exploring the wonders of the underwater world through scuba diving.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0"><span class="summary-content">JAYNE YACK</span><span class="role"></span></summary>
  <article>
    <p>
      Professor of biology <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jayne Yack's lab website. Link opens in a new tab" href="https://www.yacklab.org/">Jayne Yack</a></span> is fascinated with the unique sensory 'worlds' of animals, and in particular, how insects use sounds and vibrations beyond the sensory capabilities of humans to survive. Jayne completed her PhD at the University of Toronto and a postdoctoral fellow at Cornell University. She currently runs an active research lab at Carleton University in Ottawa, where she and her students use specialized instruments to make neat discoveries, such as how butterflies use ears on their wings to detect predators, and how caterpillars communicate using leaf vibrations to form social groups, or to perform 'rap battles' to win territories.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0"><span class="summary-content">SUTURES PARALLÈLES</span><span class="role">featuring</span></summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sutures parallèles podcast page. Link opens in a new tab" href="https://transistor.media/balados/les-sutures-paralleles">Sutures parallèles</a></span> is an uneasy chorus of earthly fabulations, gulch dirges and strained lullabies. Conceived by Marc A. Reinhardt, collectively composed and performed by Eugénie Jobin, Marc A. Reinhardt and Frédérique Roy.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">MARC A. REINHARDT</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Marc A. Reinhardt's website. Link opens in a new tab" href="https://marcareinhardt.com/">Marc A. Reinhardt</a></span> is a comparatist working at the intersection of sound, text, performance and installation. His practice develops compositional processes that investigate issues of transduction, historicity and collective agency. He is interested in how we inhabit the contradictions, in language and beyond, that emerge from these investigations. His work has been presented in Canada, Europe and South America.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">FRÉDÉRIQUE ROY</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      <span class="bold">Frédérique Roy</span> is a musician, composer and writer. The debut album of her ensemble Lune très belle was released by Wild Silence (France), and her first collection of poems was published by l'Oie de Cravan (Montréal). Her second album, <span class="italic">Ovale</span>, came out on Boiled Records (Toronto) in 2023. She works as a composer and performer for choreographers Catherine Lavoie-Marcus and Erin Hill. As a musician, she collaborates in different projects: with Philippe Lauzier; House of Gold; the Air Contains Honey Orchestra amongst others. She has presented work in México, Toronto, Montréal (OFFTA, Dazibao, Suoni per Il Popolo, Pop Montréal.) Frédérique is also involved in concert programming, zine publishing, feminist collective mobilization, and vocal and somatic workshopping. She works in psycho-social accompaniment for Club Ami, a day center offering alternative resources to psychiatrized people. She lives and works in Montréal.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">EUGÉNIE JOBIN</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      <span class="bold">Eugénie Jobin</span> is a musician, composer and director. She lives and works in Tio'tià:ke (Montréal). Her band Ambroise released its first album, <span class="italic">À la tonalité préférable du ciel</span>, in November 2018 under the French label Wild Silence. The album is inspired by the poems of Quebec author Paul-Marie Lapointe. Eugénie just launched her second album, <span class="italic">Bienvenue</span>, a collection of eight pieces based on the poems of Quebec author Geneviève Desrosiers. In addition to composing her own songs, Eugénie works on music for dance, theatre and film. She has presented her work in Montréal, Toronto and Mexico City.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0"><span class="summary-content">THE THUNDERBIRD SISTERS COLLECTIVE</span><span class="role">featuring</span></summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit The Thunderbird Sisters Collective website. Link opens in a new tab" href="https://thunderbirdsisterscollective.com/">The Thunderbird Sisters Collective</a></span> was founded in 2017 by Metis artist, Patsea Griffin, following workshops where she would see some of her friends create the most fabulous beadwork as well as other traditional and non-traditional artwork then tuck it away in a drawer, tin container, or ziplock bag as was the case with her beadwork. Sometimes never to be seen again. "I decided that I wanted to show my work that took hours to create and then I thought why not help others as well. There are so many talented people in the community that never get to show their work. And it's amazing work." In 2021 The Thunderbird Sisters Collective became a not-for-profit organization whose goal is to create youth-led safe spaces where it will be demonstrated that learning Indigenous knowledge is marketable and transferrable to life experience, the workplace and the community. We're going to dream out loud.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">PATSEA GRIFFIN</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      Born and raised on her ancestral land along the Kichi Sibi (Ottawa River), on unceded and unsurrendered Algonquin territory, <span class="bold">Patsea Griffin</span> is a mix-blood, a special blend of many bloodlines including Ontario Métis - a proud Citizen of the Métis Nation of Ontario. Patsea is an Artist. Dreamer. Beadworker. Published poet. Quilt maker. Drummer. Singer. Knowledge seeker. Community supporter. Roadkill adventurer (always looking to harvest porcupine quills). "My art is my way of staying connected to all my relations in the spirit world." Patsea also loves to perform, sing, write, laugh and lives life to the fullest!
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">THÉO PARADIS</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      <span class="bold">Théo Paradis</span> is Indigenous, she grew up in Cornwall and currently lives on the unceded territory of the Algonquin Anishnaabe Nation in Ottawa. Her family came from along the Ottawa and St. Lawrence Rivers in the territory of the Algonquin and Kanien'kehá:ka ("People of the Flint"). She is Agokwe nini (2 Spirit) and Oshakbaywis (traditional helper) with elders and knowledge keepers in the community. She is of the bear clan and parent to two amazing young men. In Théo's role as a traditional helper of ceremony, drumming and singing provides her with a deep rooted connection of traditional and indigenous way of life.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">CARMEL WHITTLE</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Carmel Whittle's website. Link opens in a new tab" href="https://carmelwhittle.com/">Carmel Whittle</a></span> identifies as a 2SL/ Mi'kmaw/Irish cultural community artist, activist, independent filmmaker, and musician/songwriter. In the practice of decolonized community arts she develops, directs and curates the No Borders Art Festival and is program coordinator for the Thunderbird Sisters Collective. Her documentary films include <span class="italic">There Is No Word</span>, for Greenpeace Canada; <span class="italic">Bringing The Land To The City</span>, a film residency with Digital Art Resource Centre; and <span class="italic">One Contrary 5 Agokwe Nini</span>, featuring members of the 2SLGBTQ community and collaborative co-creating of Podcast #83. Her visual art is currently exhibited with Artvocate, UK. Soloist for <span class="italic">Odaabaanag</span> project. Carmel's influences come from nature and culture with roots deeply connected to the ocean and to the community. She is also an independent art educator, mentor, workshop leader and consultant with diverse artistic communities.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0"><span class="summary-content">TURKWAZ</span><span class="role">featuring</span></summary>
  <article>
    <p>
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Turkwaz's website. Link opens in a new tab" href="https://turkwaz.ca/">Turkwaz</a></span> is Jayne Brown, Sophia Grigoriadis, Brenna MacCrimmon, and Maryem Tollar; four vocalists who individually have contributed widely to the Toronto world music scene and beyond. Their work together focuses on interpretations of songs primarily from Greek, Turkish, Arabic and Balkan traditions with forays into other genres when the inspiration moves them. Qanun, tambura, ukulele and various forms of hand percussion provide gentle accompaniment to their arrangements, allowing their voices to remain front and centre. They love singing in pure traditional styles but are also equally comfortable adding harmonies where no harmonies existed before. They are all highly adaptable musicians and enjoy collaborating across genres. Their debut album "Nazar" garnered both Juno and CFMA nominations on its release.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">JAYNE BROWN</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      Since making the switch from classical to folkloric singing, <span class="bold">Jayne Brown</span> has been learning, performing, travelling and recording with several ensembles, including Latin American ensembles, Nazka and Ilédé, Macedonian band Staro Selo, and Mediterranean mash-up bands Maza Mezé and the Maryem Tollar ensemble. For the past two decades, Jayne has been concentrating her efforts on Greek folkloric song, studying in both Greece and Toronto. Jayne balances her time between music and her psychotherapy practice.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">SOPHIA GRIGORIADIS</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sophia Grigoriadis's LinkedIn profile. Link opens in a new tab" href="https://www.linkedin.com/in/sophia-grigoriadis-52015911/?originalSubdomain=ca">Sophia Grigoriadis</a></span> is a musician and teacher. Over the past 30 years her study of Greek, Balkan and Middle Eastern singing and percussion has led her to compose, perform and tour with many Toronto world and fusion ensembles. Her love of teaching and sharing her musical passion extends to all ages: as Choir Director of All Saints Greek Orthodox Church and City Choir in Toronto, as Music teacher from Preschool to Grade 8 at Metamorphosis Greek Orthodox School, and to young children through her Clapping Land music studio, where her compilation world music CD <span class="italic">Sound Adventures --- Global Music for Children</span> garnered the Parent's Choice Foundation Silver Award.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">BRENNA MACCRIMMON</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      Based in Toronto, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Brenna MacCrimmon's website. Link opens in a new tab" href="http://greengoatmusic.ca/">Brenna MacCrimmon</a></span> has been studying and performing the music of Turkey and the Balkans since the early 1980's. She has performed in Turkey and abroad with Selim Sesler, Karsılama, Muammer Ketencoğlu, and experimental rock group Baba Zula. She has toured across Europe with Balkan beat DJ Shantel and the Bucovina Club Orkestra. She is a featured performer in <span class="italic">Crossing the Bridge</span>, Fatih Akın's 2005 documentary of the Istanbul music scene. In 2010, she found herself in Moscow as a member of the cast of <span class="italic">Bobble</span> with Bobby McFerrin. Theatre work includes musical direction of the award-winning Volcano production of <span class="italic">Goodness</span> and music for the Soulpepper production of Sina Gilani's <span class="italic">Wedding at Aulis</span>. In addition to singing with Turkwaz, she plays with Greco Turkish ensemble Meltemi, travels widely to teach and perform and has much to do with ukuleles. Recent collaborations include musical direction for MabelleArts <span class="italic">Walk with Amal</span> for Luminato 2023.
    </p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0"><span class="summary-content summary-indent">MARYEM HASSAN TOLLAR</span><span class="role"></span></summary>
  <article>
    <p class="summary-indent">
      <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Read more about Maryem Hassan Tollar on Wikipedia. Link opens in a new tab" href="https://en.wikipedia.org/wiki/Maryem_Tollar">Maryem Hassan Tollar</a></span> is a renowned Egyptian-Canadian vocalist, known for her world music performances. Her voice has been heard on the theme of CBC's <span class="italic">Little Mosque on the Prairie</span> and A.R. Rahman's Bollywood hit, <span class="italic">Mayya Mayya</span>. Tollar has been a featured vocalist with Tafelmusik, The Winnipeg Symphony Orchestra, The Gryphon Trio and Patricia O'Callaghan. She performs with several Toronto musical groups including Al Qahwa, Turkwaz, and with storyteller Dawne McFarlane. In the fall of 2022 she toured in <span class="italic">The Cave</span> (Libretto by Tomson Highway, Music by John Millard, Script by Martha Ross) and in 2023 with the stage adaptation of Ann-Marie MaDonald's book <span class="italic">Fall On Your Knees</span> (Directed by Alisa Palmer, Script by Hannah Moscovitch). Maryem was awarded the inaugural Johanna Metcalf Prize for Performing Arts in 2019.
    </p>
  </article>
</details>
<div class="svg-contributors"></div>

<p>+ all the non-human beings who contributed to our on-site recordings. To view all the species identified at the Monahan Wetlands by community members please visit <a target="_blank" rel="noopener noreferrer" aria-label="Visit the Monahan Wetlands page on iNaturalist. Link opens in a new tab" href="https://www.inaturalist.org/places/monaghan-drain-eagleson-ponds">iNaturalist</a>.</p>

`;

const contributorsPageFR = `

<div class="headerDiv">
  <h2 id="contributorsH2">CONTRIBUTORS</h2>
</div>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SARAH ABBOTT</span> 
  </summary>
  <article>
    <p>Dans ses recherches, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sarah Abbott's website. Link opens in a new tab" href="https://sarahabbott.ca/">Sarah Abbott</a></span> cherche à comprendre et à présenter les relations sentientes et sensorielles des arbres, des plantes et des non-humains dans leur ensemble, dans des cadres comprenant l'ethnographie publique ou multi-espèce, les systèmes de connaissance autochtones, la théorie de l'émergence d'un point de vue ontologique, la science des plantes, la communication interespèces et la cinématographie ethnographique. Sarah est professeure agrégée à la Faculté de cinéma de l'Université de Regina dans les domaines de la production cinématographique, l'écologie sensible, la pratique ethnographique et le changement climatique. Elle a récemment obtenu un doctorat interdisciplinaire en sciences sociales à la Royal Roads University. Elle est titulaire d'une maîtrise en arts visuels de l'Université de Syracuse et d'un baccalauréat en études cinématographiques et en art dramatique de l'Université Queen's. Sarah a décroché une bourse d'études supérieures du Canada Vanier (2014-2017), le Prix du lieutenant-gouverneur de la Saskatchewan pour les arts et l'apprentissage (2012) ainsi que le Prix des arts et des affaires du maire de Regina pour l'innovation dans les arts (2009).</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">DIANA BERESFORD-KROEGER</span>
  </summary>
  <article>
    <p>Botaniste, biochimiste médicale et auteure, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Diana Beresford-Kroeger's website. Link opens in a new tab" href="https://dianaberesford-kroeger.com/">Diana Beresford-Kroeger</a></span> conjugue de façon unique une formation scientifique occidentale à une connaissance des savoirs et des méthodes d'une grande variété de sources traditionnelles et non conventionnelles. Le concept de bioplanification de Beresford-Kroeger incite monsieur et madame tout le monde à tisser une nouvelle relation avec la nature, à considérer l'environnement comme un système biologique et à accomplir la tâche écologique de reboiser la forêt mondiale. Elle est l'auteure, entre autres, de <span class="italic">To Speak for the Trees</span>, <span class="italic">The Sweetness of a Simple Life</span>, <span class="italic">The Global Forest, Arboretum Borealis: A Lifeline of the Planet</span>, <span class="italic">Arboretum America: A Philosophy of the Forest</span> et <span class="italic">A Garden for Life</span>. Un long métrage documentaire sur son travail, <span class="italic">Call of the Forest: The Forgotten Wisdom of Trees</span>, est paru en 2017. Son dernier livre <span class="italic">Our Green Heart</span> sera publié en septembre 2024.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">PIERRE-LUC CLÉMENT</span>
  </summary>
  <article>
    <p><span class="bold">Pierre-Luc Clément</span> est un artiste multidisciplinaire autodidacte, concepteur sonore, compositeur et réalisateur très actif dans la communauté artistique d'Ottawa-Gatineau. Membre fondateur des groupes comme FET.NAT, KAY-fayb, Or et d'autres, il travaille également comme percussionniste et comme compositeur pour des artistes de renom et des compagnies de danse et de théâtre contemporains dans tout le Canada. Il s'est hissé dans la sélection prestigieuse du Polaris avec l'album Le mal en 2019 et a été nommé à l'ADISQ pour avoir produit <span class="italic">Message texte à Nelligan</span> en 2016. Pierre-Luc a également cofabriqué trois enfants. Parmi les prix qu'il a reçus, on peut citer le prix SAW pour les nouvelles œuvres en 2020 et deux prix RIDEAU pour la meilleure conception sonore de théâtre en 2014 puis en 2019. Le travail de Pierre-Luc se caractérise par la mise en œuvre toujours audacieuse d'idées, d'approches et de méthodes novatrices. Ses créations souvent intenses et polarisantes oscillent entre le beau et l'abject sans écarter la possibilité de l'échec.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">ALBERT DUMONT</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Albert Dumont's website. Link opens in a new tab" href="http://albertdumont.com/about/">Albert Dumont</a></span> est un conseiller spirituel algonquin, un poète et un conteur de Kitigan Zibi Anishinabeg. Ses talents artistiques s'étendent dans de nombreux domaines de la communauté artistique. Il a été le poète lauréat anglophone d'Ottawa d'avril 2021 à avril 2023. Albert est également artiste à la plume et à l'encre, acteur et dramaturge. Il a joué sa pièce <span class="italic">Bloodline</span> à plusieurs reprises et a figuré dans des vidéos sur la prévention des incendies, des publicités télévisées et des pièces de théâtre. Il a signé six recueils de poésie et de nouvelles, ainsi que deux livres pour enfants. Il est le fondateur de Turtle Moons Contemplations, où paraissent ses œuvres d'art et ses poèmes. En 2010, Albert a décroché le prix des droits de la personne de l'Alliance de la fonction publique du Canada et, en 2018, il a reçu la mention DreamKEEPERS pour un leadership exceptionnel. Il a consacré sa vie à la promotion de la spiritualité et des méthodes de guérison autochtones ainsi qu'à la défense des droits des peuples autochtones, surtout des jeunes. Il est le père de trois filles, le grand-père de cinq petits-enfants et l'arrière-grand-père d'un arrière-petit-enfant.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">LANG ELLIOTT</span>
  </summary>
  <article>
    <p><span class="bold">Lang Elliott</span> est un preneur de son de renom qui enregistre la nature. Actuellement, il se spécialise dans la capture d'univers sonores atmosphériques à effets 3D et biauriculaire des zones sauvages d'Amérique du Nord. Pour en savoir plus sur son travail, visitez le site <a target="_blank" rel="noopener noreferrer" aria-label="Visit Music of Nature website. Link opens in a new tab" href="https://musicofnature.com/">Music of Nature</a>. On retrouve un grand nombre des productions sonores de Lang sur son application mobile bien connue <a target="_blank" rel="noopener noreferrer" aria-label="Visit Pure Nature 3D Soundscapes app page. Link opens in a new tab" href="https://apps.apple.com/us/app/pure-nature-3d-soundscapes/id1357380255">Pure Nature 3D Soundscapes</a>, qui fait voyager l'audience dans la nature sans le moindre effort. Chaque enregistrement s'accompagne d'ailleurs d'un texte d'information décrivant l'habitat et ce qu'on entend. Lang a également co-développé <a target="_blank" rel="noopener noreferrer" aria-label="Visit Hear Birds Again app page. Link opens in a new tab" href="https://apps.apple.com/us/app/hear-birds-again/id6444369779?platform=iphone;">Hear Birds Again</a>, une nouvelle application unique destinée aux ornithologues amateurs souffrant d'une perte auditive dans les hautes fréquences. L'application permet d'abaisser la tonalité aiguë des chants d'oiseaux pour les ramener dans une gamme de fréquences audible.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SAM ESSER</span>
  </summary>
  <article>
    <p>En tant que technicien sur le terrain pour la Direction de la gestion des eaux pluviales de la Ville d'Ottawa, <span class="bold">Sam Esser</span> fait partie d'une équipe chargée de la revitalisation des milieux humides de Monahan. Ces travaux ont permis d'accroître considérablement l'habitat de ces zones grâce à la propagation et à la protection d'espèces végétales aquatiques clés. En plus de fournir un habitat essentiel aux oiseaux, aux reptiles et aux poissons, ces plantes nettoient l'eau en absorbant les polluants provenant du ruissellement des eaux pluviales en amont. Sam applique ses travaux à l'ensemble de la ville : il évalue la fonction des différentes installations de gestion des eaux pluviales par rapport aux objectifs de qualité et de quantité de l'eau. Avant le monde du travail, il a obtenu une maîtrise en sciences à l'Université McGill. Il a occupé diverses fonctions en environnement dans les secteurs privé et public, et il a même travaillé à bord de navires de pêche commerciale dans la mer de Béring. Lorsqu'il n'est pas au travail, vous le trouverez en train de faire de la planche à pagaie et de pêcher le long de la rivière Rideau.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">CHARLOTTE FRANK</span>
  </summary>
  <article>
    <p><span class="bold">Charlotte Frank</span> est une chanteuse et auteure-compositrice avec une formation en bel canto, musique chorale et création littéraire. Elle a collaboré avec de nombreux artistes; elle a écrit, enregistré et interprété ses chansons à Ottawa, Berlin et Montréal depuis 2015. Vivant actuellement à Montréal, elle y fait des enregistrements en tant que membre des groupes Misty Mood et Ezme, dont les premiers microalbums sont sortis en 2022 et 2023. Charlotte travaille à obtenir son doctorat en littérature anglaise à l'Université McGill. Elle a récemment publié un livre de colportage avec d'autres poètes intitulé <span class="italic">Terrifying Friends</span>, paru chez Collusion Books. Elle est diplômée en sciences humaines de l'Université Carleton et en création littéraire de l'Université Concordia.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">KIM KILPATRICK</span>
  </summary>
  <article>
    <p><span class="bold">Kim Kilpatrick</span> est une conteuse professionnelle, une musicothérapeute, une consultante en accessibilité et une férue de la nature. Elle a signé trois spectacles solos sur la vie d'une personne aveugle dans un monde peuplé de gens voyants : <span class="italic">Flying in the Dark</span> (2011), <span class="italic">Raising Stanley/Life with Tulia</span> (2018) et <span class="italic">Dangerous Touch</span> (living through COVID when blind 2022). Kim est une artiste en vedette d'<a target="_blank" rel="noopener noreferrer" aria-label="Visit Ottawa Storytellers website. Link opens in a new tab" href="http://www.ottawastorytellers.ca/">Ottawa Storytellers</a>, <a target="_blank" rel="noopener noreferrer" aria-label="Visit MASC website. Link opens in a new tab" href="http://www.masconline.ca/">MASC</a> et <a target="_blank" rel="noopener noreferrer" aria-label="Visit Radical Connections website. Link opens in a new tab" href="http://www.radicalconnections.ca/">Radical Connections</a>. Elle voyage avec son cinquième chien-guide Ginger, un labrador jaune qui a parcouru les sentiers avec elle pour ce projet.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">FIDES KRUCKER</span>
  </summary>
  <article>
    <p>Depuis quarante ans, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Fides Krucker's website. Link opens in a new tab" href="https://www.fideskrucker.com/">Fides Krucker</a></span> chante, produit et crée des opéras contemporains ainsi que des œuvres interdisciplinaires au Canada et à l'étranger. Son livre <span class="italic"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Reclaiming Calliope book page. Link opens in a new tab" href="https://www.penguinrandomhouse.ca/books/706315/reclaiming-calliope-by-fides-krucker/9781623177065">Reclaiming Calliope: Freeing the Female Voice through Undomesticated Singing</a></span> (North Atlantic Books) redonne vie à la voix humaine grâce à l'intégration émotionnelle ancrée sur le corps. En 1991, Fides a fondé l'ensemble interdisciplinaire URGE, dont la dernière œuvre a décroché deux Prix Dora et a été publiée par Playwrights Canada. En 2018, sa compagnie, Good Hair Day Productions, connue pour produire du théâtre lyrique révolutionnaire, a présenté <span class="italic">In This Body</span> au Canadian Stage avec les danseuses Heidi Strauss, Laurence Lemieux et Peggy Baker. La voix de Fides est reconnue pour « son registre vocal et son contrôle stupéfiants [...] plus une force de la nature qu'un instrument ». Fides a enseigné le chant au Collège Humber pendant vingt ans et accompagne une multitude d'artistes au Canada et aux États-Unis. Son programme de formation du corps enseignant sur deux ans a été lancé à l'été 2021.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">AMY MACPHERSON</span>
  </summary>
  <article>
    <p><span class="bold">Amy MacPherson</span> est une biologiste de l'environnement qui travaille au sein de l'Unité des systèmes naturels et des affaires rurales de la Ville d'Ottawa. En plus des études des bassins et sous-bassins hydrographiques, des évaluations environnementales et d'autres initiatives de planification, Amy organise la Série de conférences sur la faune de la Ville. Elle a également dressé et maintenu des listes de plusieurs types d'espèces sauvages présentes dans la ville, dont celles des espèces en péril à Ottawa. Parmi ses autres projets récents figurent l'élaboration des Lignes directrices de conception sécuritaire pour les oiseaux et celle du jardin pour pollinisateurs de l'hôtel de ville. Avant d'intégrer l'équipe de la Ville en janvier 2006, Amy a travaillé pendant sept ans comme experte-conseil en environnement. Dans ses temps libres, elle s'adonne à la photographie de la nature et a récemment mis ce loisir à profit en contribuant à iNaturalist.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">KIKO PACE</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Kiko Pace's website. Link opens in a new tab" href="https://kikosounds.com/">Kiko Pace</a></span> ouvre des portails vers une écoute immersive grâce à des installations, la création de sons, la méditation et les pratiques réparatrices. Iel organise actuellement des expériences de bains sonores privés et en groupe dans son studio <a target="_blank" rel="noopener noreferrer" aria-label="Visit Kiko Space website. Link opens in a new tab" href="https://www.kikospace.ca/">Kiko Space</a> à Roncesvalles, Tkaronto, et propose des retraites, des ateliers et des formations pour plonger en profondeur dans l'art et la science du son. Kiko a une passion profonde pour la communication, l'apprentissage et l'hommage rendu à la nature grâce aux études et aux rituels personnels. Tout commence par la reconnaissance du privilège de pouvoir travailler sur cette terre, de la nécessité d'en prendre soin et de notre responsabilité envers nous-mêmes, la terre et les autres.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">DEMETRIOS PETSALAKIS</span>
  </summary>
  <article>
    <p>Originaire d'Athènes, en Grèce, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Demetri Petsalakis's SoundCloud page. Link opens in a new tab" href="https://soundcloud.com/dpetsalakis">Demetri Petsalakis</a></span> est un musicien torontois jouant dans une multitude de styles et mettant en avant les luths grecs et du Moyen-Orient. Influencé par la riche diversité culturelle du Canada, Demetri incorpore des éléments musicaux de différentes traditions afin de créer un son contemporain : le reflet à la fois de son héritage et de sa communauté d'appartenance. Membre actif de la scène musicale mondiale de Toronto, Demetri a composé, enregistré et joué avec de nombreux groupes, dont Kune, Niyaz, Tafelmusik, Ventanas, Near East Trio, Zephyr, Turkwaz, Moneka Arabic Jazz et Moskitto Bar. Au cours de sa formation musicale, Demetri a eu la chance de se former auprès d'un grand nombre d'illustres personnalités, notamment les maîtres du oud Bassam Bishara et Christos Tsiamoulis; le maître de la lyra crétoise Astrinos Zaharioudakis; et le célèbre guitariste de jazz Lorne Lofsky.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">NAMITHA RATHINAPPILLAI</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Namitha Rathinappillai's website. Link opens in a new tab" href="http://namitharathinappillai.com/">Namitha Rathinappillai</a></span> est une poétesse de tradition orale, une organisatrice et une animatrice d'ateliers canadienne tamoule, grosse, handicapée et queer. Elle est entrée dans la communauté de la poésie en 2017. Actuellement basée à Toronto, elle a été la première femme et la plus jeune directrice du Urban Legends Poetry Collective (ULPC) d'Ottawa. Elle a été membre de l'équipe du Canadian Festival of Spoken Word (CFSW) à deux reprises avec le ULPC. Son premier livre de colportage intitulé <span class="italic">Dirty Laundry</span> est paru chez Battleaxe Press en novembre 2018. En 2019, elle a remporté le Prix inspiration jeunesse de la capitale de la RBC pour les arts et la culture. Elle aime les travaux manuels, écrire des lettres à ses amis et regarder la lune.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">PATRICIA REYNOLDS</span>
  </summary>
  <article>
    <p>Enseignante de métier, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Patricia Reynolds's profile on Radical Connections website. Link opens in a new tab" href="https://www.radicalconnections.ca/artistdirectory/v/patricia-reynolds-vocals-guitar-folk-gospel-swing-pop-wwii-country-campfire-quebecois">Patricia Reynolds</a></span> s'implique dans l'éducation autochtone depuis plus de 30 ans. Elle joue du tambour avec No Borders Drum Circle et parfois également avec le Thunderbird Sisters Collective -- avec qui elle fait d'autres spectacles. Aujourd'hui à la retraite, Patricia chante avec Just Voices: An Activist Choir et No Borders Community Voices, en plus de se produire avec Carmel Whittle. Patricia a récemment participé au projet <span class="italic">Odaabaanag</span> de Beverley et Melody McKiver en tant qu'organisatrice, accompagnatrice et membre de No Borders Community Voices. Elle travaille actuellement avec Unmasked Connections, un projet qui présente les arts aux pensionnaires des établissements de soins de longue durée.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">JESSE STEWART</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jesse Stewart's profile on Carleton University website. Link opens in a new tab" href="https://carleton.ca/music/people/stewart-jesse/">Jesse Stewart</a></span> est compositeur, percussionniste, artiste et éducateur. Il compte à son actif plus de vingt enregistrements, dont un premier album éponyme de Stretch Orchestra, couronné du prix Juno de l'Album instrumental de l'année 2012. Jesse a reçu de nombreuses commandes en tant que compositeur et artiste. En 2012, il a fondé We Are All Musicians (WAAM), une organisation visant à rendre la musique accessible au plus grand nombre possible. Dans le cadre de cette initiative, Jesse a dirigé des centaines d'ateliers et de spectacles de musique inclusive dans toute l'Amérique du Nord. Il a reçu de nombreux prix et distinctions, notamment le Prix du Conseil des arts d'Ottawa pour les artistes à mi-carrière (2017) et le Prix de l'éducateur ou de l'éducatrice artistique communautaire (2023). En 2014, il a été nommé à l'Ordre d'Ottawa. En 2022, il a été élu au Collège de nouveaux chercheurs et créateurs en art et en science de la Société royale du Canada. Il est membre du corps enseignant de la School for Studies in Art and Culture de l'Université Carleton.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">LOUELLA TOBIAS</span>
  </summary>
  <article>
    <p><span class="bold">Louella Tobias</span> est une Delaware Anishnabe Kwe de la Première Nation Moravian of the Thames. « Je m'appelle Phoenix Thunderbird, je suis inévitable, la dévouée du clan Golden Eagle. Mon nom anglais est Louella. » Mère de trois enfants, grand-mère de sept enfants et arrière-grand-mère d'un enfant, Louella a respecté ses traditions pendant plus de la moitié de sa vie. Elle appartient à la loge Midewiwin, sur l'île Manitoulin, dont elle est membre de 3e degré. Louella détient un baccalauréat en service social de l'Université Laurentienne, et elle a appris la guérison et la médecine traditionnelles -- la sudation, le bain de cèdre, la cérémonie du calumet, etc. -- auprès de Grands-mères de Sudbury.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">ELLEN WATERMAN</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Ellen Waterman's website. Link opens in a new tab" href="http://www.ellenwaterman.ca/">Ellen Waterman</a></span> est professeure à la School for Studies in Art and Culture et titulaire de la chaire Helmut Kallmann de recherche en musique canadienne à l'Université Carleton. Elle est à la fois chercheuse en musique et flûtiste spécialisée en improvisation créative. Ses travaux sur l'écologie acoustique comprennent les livres <span class="italic">Sonic Geography Imagined and Remembered</span> et <span class="italic">The Art of Immersive Soundscapes</span>. Avec Gillian Siddall, Ellen est co-éditrice de <span class="italic">Negotiated Moments: Improvisation, Sound, and Subjectivity</span>, et elle est coéditrice fondatrice de la revue <span class="italic"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Critical Studies in Improvisation website. Link opens in a new tab" href="http://www.criticalimprov.com/">Critical Studies in Improvisation/Études critiques en improvisation</a></span>. En 2021, elle a fondé le <a target="_blank" rel="noopener noreferrer" aria-label="Visit Research Centre for Music, Sound, and Society in Canada website. Link opens in a new tab" href="http://www.carleton.ca/mssc">Research Centre for Music, Sound, and Society in Canada</a> pour l'exploration des rôles divers et complexes que jouent la musique et les arts sonores dans l'édification de la société canadienne.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">WRAY WELSH</span>
  </summary>
  <article>
    <p><span class="bold">Wray Welsh</span> est un superviseur, Zone dévoué et expérimenté pour les parcs de l'Ouest à Ottawa. Ayant sauté directement de la cour d'école à celle de la ville en 1983, Wray a passé les 40 dernières années à entretenir les installations et les magnifiques espaces extérieurs de la ville d'Ottawa. Il supervise toutes les infrastructures des parcs en veillant à leur propreté, à leur sécurité et à leur efficacité générale. Qu'il s'agisse de gérer les activités quotidiennes des parcs, de motiver le personnel, de mettre en œuvre des initiatives de conservation ou de favoriser l'engagement communautaire, le dévouement et l'expertise de Wray font de lui un superviseur exceptionnel. Ses efforts inlassables contribuent au bien-être des parcs comme des communautés qu'ils desservent; il veille à ce que tout le monde puisse profiter de la beauté et de la tranquillité de la nature. Pendant ses temps libres, Wray aime naviguer sur des cours d'eau sereins, faire des aventures palpitantes à moto et explorer les merveilles du monde sous-marin en plongée.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">JAYNE YACK</span>
  </summary>
  <article>
    <p>La professeure de biologie <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Jayne Yack's website. Link opens in a new tab" href="https://www.yacklab.org/">Jayne Yack</a></span> est fascinée par les « mondes » sensoriels uniques des animaux et, surtout, par la manière dont les insectes utilisent des sons et des vibrations surhumaines pour survivre. Jayne a obtenu son doctorat à l'Université de Toronto et a suivi un stage postdoctoral à l'Université de Cornell. Elle dirige actuellement un laboratoire de recherche à l'Université Carleton d'Ottawa. Accompagnée de ses élèves, elle utilise des instruments spécialisés pour faire des découvertes étonnantes, comme la façon dont les papillons utilisent les oreilles sur leurs ailes pour détecter les prédateurs, et comment les chenilles communiquent en utilisant les vibrations des feuilles pour former des groupes sociaux ou pour faire des « batailles de rap » dans leurs guerres territoriales.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">SUTURES PARALLÈLES</span><span class="role">mettant en vedette</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sutures parallèles podcast page. Link opens in a new tab" href="https://transistor.media/balados/les-sutures-paralleles">Sutures parallèles</a></span> est un chœur troublé de fabulations terrestres, de lamentations caverneuses et de berceuses bouleversées, conçu par Marc A. Reinhardt, composé et interprété par Eugénie Jobin, Marc A. Reinhardt et Frédérique Roy.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">MARC A. REINHARDT</span>
  </summary>
  <article>
    <p class="summary-indent"><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Marc A. Reinhardt's website. Link opens in a new tab" href="https://marcareinhardt.com/">Marc A. Reinhardt</a></span> est un comparatiste qui travaille à l'intersection du son, du texte, du spectacle et des installations. Sa pratique s'ancre dans les processus de composition étudiant les enjeux de transduction, d'historicité et d'agence collective. Il s'intéresse à la manière dont nous vivons en contradiction, dans le langage et au-delà, ce qu'il transpose dans ces recherches. Son travail a été présenté au Canada, en Europe et en Amérique du Sud.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">FRÉDÉRIQUE ROY</span>
  </summary>
  <article>
    <p class="summary-indent"><span class="bold">Frédérique Roy</span> est musicienne, compositrice et écrivaine. Le premier album de son ensemble Lune très belle est sorti chez Wild Silence (France), et son premier recueil de poèmes a été publié par l'Oie de Cravan (Montréal). Son deuxième album, <span class="italic">Ovale</span>, est sorti chez Boiled Records (Toronto) en 2023. Frédérique travaille comme compositrice et interprète pour les chorégraphes Catherine Lavoie-Marcus et Erin Hill. En tant que musicienne, elle participe à différents projets : une initiative avec Philippe Lauzier, House of Gold, The Air Contains Honey Orchestra.... Elle a présenté son travail au Mexique, à Toronto et à Montréal (OFFTA, Dazibao, Suoni per Il Popolo, Pop Montréal). Frédérique prend part également à la programmation de concerts, l'édition de zines, la mobilisation de collectifs féministes et l'organisation d'ateliers vocaux et somatiques. Elle travaille en accompagnement psychosocial pour le Club Ami, un centre de jour offrant des ressources alternatives aux personnes en psychiatrie. Elle vit et travaille à Montréal.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">EUGÉNIE JOBIN</span>
  </summary>
  <article>
    <p class="summary-indent"><span class="bold">Eugénie Jobin</span> est musicienne, compositrice et réalisatrice. Elle vit et travaille à Tio'tià:ke (Montréal). Le premier album de son groupe Ambroise, <span class="italic">À la tonalité préférable du ciel</span>, est paru en novembre 2018 sur l'étiquette française Wild Silence. Il est dédié aux textes du poète québécois Paul-Marie Lapointe. Elle vient tout juste de lancer un second album de chansons, <span class="italic">Bienvenue</span>, qui regroupe huit pièces composées sur des textes de la poète québécoise Geneviève Desrosiers. Parallèlement à sa pratique de composition de chansons, Eugénie participe à la création de musique pour la danse, pour le théâtre et pour le cinéma. Elle a présenté son travail à Montréal, Toronto et Mexico.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">THE THUNDERBIRD SISTERS COLLECTIVE</span><span class="role">mettant en vedette</span>
  </summary>
  <article>
    <p><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Thunderbird Sisters Collective website. Link opens in a new tab" href="https://thunderbirdsisterscollective.com/">Le Thunderbird Sisters Collective</a></span> a été fondé en 2017 par l'artiste métisse Patsea Griffin, après avoir assisté à des ateliers où elle a vu certaines de ses amies créer les plus fabuleux ouvrages en perles ainsi que d'autres œuvres d'art traditionnelles et non traditionnelles, pour ensuite les ranger -- comme elle-même le faisait -- dans un tiroir, un contenant ou un sac à fermeture à glissière... dont les ouvrages ne ressortaient parfois jamais. « J'ai décidé de montrer mes créations, qui m'ont demandé des heures de travail. Alors je me suis dit que j'allais aider les autres à faire de même. Il y a tellement de talents dans la communauté qui n'ont jamais l'occasion de montrer leur travail. Et ce sont des ouvrages extraordinaires! » En 2021, le Thunderbird Sisters Collective est devenu une organisation sans but lucratif dont l'objectif est de créer des espaces bienveillants dirigés par des jeunes, où il sera démontré que l'apprentissage des connaissances autochtones a un intérêt commercial et se transpose dans l'expérience personnelle, professionnelle et communautaire. Nous allons rêver à voix haute.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">PATSEA GRIFFIN</span>
  </summary>
  <article>
    <p class="summary-indent">Née et élevée sur sa terre ancestrale le long de la Kichi Sibi (rivière des Outaouais), sur un territoire algonquin non cédé, <span class="bold">Patsea Griffin</span> est une métisse, descendante de plusieurs lignées, dont celle des Métis Nation of Ontario, à laquelle elle est fière d'appartenir. Patsea est une artiste. Rêveuse. Perleuse. Poète publiée. Créatrice de courtepointes. Batteuse. Chanteuse. Assoiffée de connaissances. Pilier communautaire. Aventurière de la route (toujours en quête de poils de porc-épic). « Mon art est ma façon de rester en contact avec toutes mes connaissances dans le monde des esprits. » Patsea aime aussi jouer, chanter, écrire, rire et vivre pleinement sa vie!</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">THÉO PARADIS</span>
  </summary>
  <article>
    <p class="summary-indent"><span class="bold">Théo Paradis</span> est autochtone. Elle a grandi à Cornwall et vit actuellement sur le territoire non cédé de la Nation Algonquine Anishnaabe à Ottawa. Sa famille vient de la rivière des Outaouais et du fleuve Saint-Laurent, sur le territoire des Algonquins et des Kanien'kehá:ka (« peuple des silex »). Elle est Agokwe nini (bispirituelle) et Oshakbaywis (assistante traditionnelle) auprès des aînés et des gardiens du savoir de la communauté. Elle appartient au clan de l'ours et a deux jeunes enfants extraordinaires. Le rôle de Théo en tant qu'assistante traditionnelle de la cérémonie, du tambour et du chant lui permet d'établir un lien profond avec le mode de vie traditionnel et indigène.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">CARMEL WHITTLE</span>
  </summary>
  <article>
    <p class="summary-indent"><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Carmel Whittle's website. Link opens in a new tab" href="https://carmelwhittle.com/">Carmel Whittle</a></span> s'identifie comme une artiste, activiste, cinéaste indépendante, musicienne et compositrice de la communauté culturelle bispirituelle, lesbienne, Mi'kmaq et irlandaise. Dans la pratique des arts communautaires décolonisés, Carmel élabore, dirige et organise le No Borders Art Festival. Elle est aussi coordonnatrice de programme pour le Thunderbird Sisters Collective. Parmi ses films documentaires, on peut citer <span class="italic">There Is No Word</span>, réalisé pour Greenpeace Canada; <span class="italic">Bringing The Land To The City,</span> produit d'une résidence cinématographique avec Digital Art Resource Centre; et <span class="italic">One Contrary 5 Agokwe Nini</span>, qui met en vedette des membres de la communauté 2SLGBTQ et de l'équipe de cocréation collaborative du Podcast #83. Ses œuvres sont actuellement exposées chez Artvocate, au Royaume-Uni. Soliste pour le projet Odaabaanag, Carmel tire son inspiration de la nature et de la culture et se sent profondément liée à l'océan et à la communauté. Elle est également éducatrice en art indépendante, mentore, animatrice d'ateliers et experte-conseil auprès de diverses communautés artistiques.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content">TURKWAZ</span><span class="role">mettant en vedette</span>
  </summary>
  <article>
    <p class="summary-indent"><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Turkwaz's website. Link opens in a new tab" href="https://turkwaz.ca/">Turkwaz</a></span>, c'est un groupe formé de Jayne Brown, Sophia Grigoriadis, Brenna MacCrimmon et Maryem Tollar, quatre chanteuses qui ont largement contribué à la scène de la musique du monde à Toronto et au-delà. Turkwaz se concentre sur l'interprétation de chansons issues principalement des répertoires traditionnels grecs, turques, arabes et balkaniques, avec des incursions dans d'autres genres quand l'inspiration s'en mêle. Le quanoûn, le tambûr, le ukulélé et divers instruments de percussion à main accompagnent en douceur les arrangements du groupe, ce qui permet aux voix des chanteuses de rester au premier plan. Elles adorent chanter dans des styles traditionnels purs, mais n'ont pas peur d'ajouter des harmonies là où il n'y en a jamais eu. Toutes des musiciennes agiles et aimant la collaboration entre les genres, Turkwaz a sorti un premier album, Nazar, qui a été mis en lice pour les prix Juno et les prix de musique folk canadienne dès sa parution.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">JAYNE BROWN</span>
  </summary>
  <article>
  <p class="summary-indent">Depuis qu'elle a troqué le chant classique contre le folklorique, <span class="bold">Jayne Brown</span> apprend, se produit, voyage et enregistre avec plusieurs ensembles, dont les ensembles latino-américains Nazka et Ilédé, le groupe macédonien Staro Selo et les groupes méditerranéens Maza Mezé et l'ensemble Maryem Tollar. Au cours des deux dernières décennies, Jayne s'est concentrée sur la chanson folklorique grecque, étudiant à la fois en Grèce et à Toronto. Jayne jongle entre la musique et sa pratique de la psychothérapie.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">SOPHIA GRIGORIADIS</span>
  </summary>
  <article>
  <p class="summary-indent"><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Sophia Grigoriadis's LinkedIn profile. Link opens in a new tab" href="https://www.linkedin.com/in/sophia-grigoriadis-52015911/?originalSubdomain=ca">Sophia Grigoriadis</a></span> est musicienne et enseignante. Au cours des 30 dernières années, son étude du chant et des percussions grecs, balkaniques et moyen-orientaux l'a amenée à composer, à se produire et à partir en tournée avec de nombreux ensembles de musique du monde et de fusion de Toronto. Son amour pour l'enseignement et sa passion musicale s'étendent à tous les âges : elle est cheffe de chorale pour All Saints Greek Orthodox Church et pour la City Choir à Toronto, et professeure de musique de la maternelle à la huitième année à la Metamorphosis Greek Orthodox School. Elle tient également un studio de musique appelé Clapping Land, où elle accueille de jeunes enfants et compile de la musique du monde. Son disque <span class="italic">Sound Adventures -- Global Music for Children</span> a remporté le prix d'argent de la fondation Parent's Choice.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">BRENNA MACCRIMMON</span>
  </summary>
  <article>
  <p class="summary-indent">Basée à Toronto, <span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Visit Brenna MacCrimmon's website. Link opens in a new tab" href="http://greengoatmusic.ca/">Brenna MacCrimmon</a></span> étudie et interprète des musiques turque et balkanique depuis le début des années 1980. Elle s'est produite en Turquie et à l'étranger avec Selim Sesler, Karsılama, Muammer Ketencoğlu et le groupe de rock expérimental Baba Zula. Elle a fait des tournées dans toute l'Europe avec le platiniste balkanique DJ Shantel et le Bucovina Club Orkestra. Brenna apparaît dans <span class="italic">Crossing the Bridge</span>, le documentaire de 2005 de Fatih Akın sur la scène musicale d'Istanbul. En 2010, Brenna a figuré dans la distribution de <span class="italic">Bobble</span> avec Bobby McFerri à Moscou. Au théâtre, elle a assuré la direction musicale de la production primée de Volcano, <span class="italic">Goodness</span>, et la musique d'une production de Soulpepper, <span class="italic">Wedding at Aulis</span>, de Sina Gilani. En plus de chanter avec Turkwaz, Brenna joue avec l'ensemble gréco-turc Meltemi, elle voyage beaucoup pour enseigner et se produire, et elle s'intéresse grandement aux ukulélés. Récemment, elle a été directrice de <span class="italic">Walk with Amal</span> de MabelleArts pour Luminato 2023.</p>
  </article>
</details>
<div class="svg-contributors svg-contributors-indent"></div>
<details>
  <summary tabindex="0">
    <span class="summary-content summary-indent">MARYEM HASSAN TOLLAR</span>
  </summary>
  <article>
  <p class="summary-indent"><span class="bold"><a target="_blank" rel="noopener noreferrer" aria-label="Read more about Maryem Hassan Tollar on Wikipedia. Link opens in a new tab" href="https://en.wikipedia.org/wiki/Maryem_Tollar">Maryem Hassan Tollar</a></span> est une chanteuse égypto-canadienne de renom, connue pour ses interprétations de musique du monde. Elle a prêté sa voix au générique de l'émission <span class="italic">La petite mosquée dans la prairie</span> sur CBC, et au tube bollywoodien d'A.R. Rahman intitulé <span class="italic">Mayya Mayya</span>. Mme Tollar s'est produite avec Tafelmusik, l'Orchestre symphonique de Winnipeg, le Gryphon Trio et Patricia O'Callaghan. Elle monte sur scène avec plusieurs groupes musicaux de Toronto, dont Al Qahwa et Turkwaz, ainsi qu'avec la conteuse Dawne McFarlane. À l'automne 2022, Mme Tollar est partie en tournée avec <span class="italic">The Cave</span> (livret de Tomson Highway, musique de John Millard, scénario de Martha Ross) et, en 2023, avec l'adaptation théâtrale du livre d'Ann-Marie MaDonald <span class="italic">Fall On Your Knees</span> (mise en scène d'Alisa Palmer, scénario d'Hannah Moscovitch). Mme Tollar a reçu le premier prix Johanna-Metcalf pour les arts de la scène en 2019.</p>
  </article>
</details>
<div class="svg-contributors"></div>
<p>+ tous les êtres non humains qui ont contribué à nos enregistrements sur le terrain. Pour voir toutes les espèces identifiées par les membres de la communauté dans le milieu humide de Monahan, veuillez consulter le site <a target="_blank" rel="noopener noreferrer" aria-label="Visit iNaturalist page for Monahan Wetlands. Link opens in a new tab" href="https://www.inaturalist.org/places/monaghan-drain-eagleson-ponds">iNaturalist</a>.</p>

`;

document.querySelector("#toggleLanguage").addEventListener("click", toggleLanguageAndStorePref);
