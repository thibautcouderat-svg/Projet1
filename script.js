/* ==========================================================================
   SONDAGE HUMORISTIQUE — SCRIPT PRINCIPAL
   ========================================================================== */

// ---------------------------------------------------------------------------
// Données du sondage
// ---------------------------------------------------------------------------
const QUESTIONS = [
  "Thibaut est-il la personne la plus intelligente que vous ayez connue ?",
  "Thibaut est-il la personne la plus gentille que vous ayez connue ?",
  "Thibaut est-il la personne la plus drôle que vous ayez connue ?",
  "Thibaut est-il la meilleure personne que vous ayez rencontrée ?",
  "Thibaut a-t-il déjà eu tort au moins une fois dans sa vie ?",
  "Thibaut devrait-il recevoir un prix Nobel de la sympathie ?",
  "Certifiez-vous que Thibaut a toujours raison en réunion ?",
  "Si Thibaut se présentait à une élection, voteriez-vous pour lui ?",
  "Souhaitez-vous effectuer un virement de 2 500 € à Thibaut dès maintenant ?"
];

// Libellés du bouton "Oui", légèrement différents selon la question (détail amusant)
const OUI_LABELS = [
  "Oui, évidemment",
  "Oui, bien sûr",
  "Oui, sans hésiter",
  "Oui, clairement",
  "Oui, jamais",
  "Oui, absolument",
  "Oui, je certifie",
  "Oui, je vote Thibaut",
  "Oui, je confirme"
];

// Messages affichés à chaque clic sur "Non" pour toutes les questions sauf la dernière
const MESSAGES_NON_STANDARD = [
  "Euh... tu as dû te tromper.",
  "Tu es sûr de ton choix ?",
  "Réfléchis encore un peu...",
  "Cette réponse semble incorrecte.",
  "Dernière chance.",
  "Le bouton commence à perdre confiance en lui.",
  "Bon... tu refuses vraiment ?",
  "Très bien."
];

// Messages spécifiques à la dernière question (les 2 500 €)
const MESSAGES_NON_ARGENT = [
  "Erreur : cette réponse semble indisponible.",
  "Le service comptabilité aimerait discuter avec vous.",
  "Vous avez probablement mal lu la question.",
  "Dernière chance."
];

// ---------------------------------------------------------------------------
// État de l'application
// ---------------------------------------------------------------------------
let currentQuestionIndex = 0;
let nonClickCount = 0;
let nonButtonDisabled = false;

// ---------------------------------------------------------------------------
// Références DOM
// ---------------------------------------------------------------------------
const surveyScreen = document.getElementById("survey-screen");
const resultScreen = document.getElementById("result-screen");

const questionText = document.getElementById("question-text");
const questionCounter = document.getElementById("question-counter");
const progressFill = document.getElementById("progress-fill");
const progressTrack = document.getElementById("progress-track");

const btnOui = document.getElementById("btn-oui");
const btnNon = document.getElementById("btn-non");
const attemptsCounter = document.getElementById("attempts-counter");
const attemptsCount = document.getElementById("attempts-count");
const hintText = document.getElementById("hint-text");

const btnRestart = document.getElementById("btn-restart");

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------
function init() {
  currentQuestionIndex = 0;
  renderQuestion();

  btnOui.addEventListener("click", handleOuiClick);
  btnNon.addEventListener("click", handleNonClick);
  btnNon.addEventListener("mouseenter", maybeDodgeCursor);
  btnRestart.addEventListener("click", restartSurvey);
}

// ---------------------------------------------------------------------------
// Affichage d'une question
// ---------------------------------------------------------------------------
function renderQuestion() {
  const total = QUESTIONS.length;

  // Texte de la question avec une petite animation d'entrée/sortie
  questionText.classList.add("leaving");
  setTimeout(() => {
    questionText.textContent = QUESTIONS[currentQuestionIndex];
    questionText.classList.remove("leaving");
  }, 200);

  // Compteur "Question X / N"
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} / ${total}`;

  // Barre de progression
  const progressPercent = (currentQuestionIndex / total) * 100;
  progressFill.style.width = `${progressPercent}%`;
  progressTrack.setAttribute("aria-valuenow", Math.round(progressPercent));

  // Libellé du bouton Oui
  btnOui.textContent = OUI_LABELS[currentQuestionIndex] || "Oui";

  // Réinitialisation du bouton Non pour la nouvelle question
  resetNonButton();
}

// ---------------------------------------------------------------------------
// Réinitialisation du bouton "Non"
// ---------------------------------------------------------------------------
function resetNonButton() {
  nonClickCount = 0;
  nonButtonDisabled = false;

  btnNon.textContent = "Non";
  btnNon.style.transform = "scale(1) translate(0, 0)";
  btnNon.classList.remove("hidden-forever");
  btnNon.disabled = false;

  attemptsCounter.hidden = true;
  attemptsCount.textContent = "0";

  hintText.textContent = "";
}

// ---------------------------------------------------------------------------
// Clic sur "Oui"
// ---------------------------------------------------------------------------
function handleOuiClick() {
  // Petite animation de validation
  btnOui.classList.remove("validated");
  // Force le reflow pour pouvoir rejouer l'animation
  void btnOui.offsetWidth;
  btnOui.classList.add("validated");

  hintText.textContent = "Réponse enregistrée ✔";

  // Passage à la question suivante (ou à l'écran final) après un court délai
  setTimeout(() => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      showResultScreen();
    }
  }, 550);
}

// ---------------------------------------------------------------------------
// Clic sur "Non"
// ---------------------------------------------------------------------------
function handleNonClick() {
  if (nonButtonDisabled) return;

  const isMoneyQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const messages = isMoneyQuestion ? MESSAGES_NON_ARGENT : MESSAGES_NON_STANDARD;
  const totalSteps = messages.length;

  nonClickCount++;

  // Compteur de tentatives visible dès le premier clic
  attemptsCounter.hidden = false;
  attemptsCount.textContent = String(nonClickCount);

  // Message humoristique correspondant à l'étape actuelle
  const messageIndex = Math.min(nonClickCount, totalSteps) - 1;
  hintText.textContent = messages[messageIndex];

  if (nonClickCount >= totalSteps) {
    // Dernière étape : le bouton disparaît complètement
    btnNon.classList.add("hidden-forever");
    nonButtonDisabled = true;
    btnNon.disabled = true;
    return;
  }

  // Calcul du nouveau facteur d'échelle (rétrécissement progressif)
  const scale = 1 - (nonClickCount / totalSteps) * 0.95;
  applyNonButtonScale(scale);

  // Léger déplacement aléatoire pour esquiver le curseur
  dodgeButton();
}

// ---------------------------------------------------------------------------
// Application visuelle du rétrécissement du bouton "Non"
// ---------------------------------------------------------------------------
function applyNonButtonScale(scale) {
  const currentTransform = btnNon.style.transform || "translate(0px, 0px)";
  const translatePart = currentTransform.includes("translate")
    ? currentTransform.substring(currentTransform.indexOf("translate"))
    : "translate(0px, 0px)";

  btnNon.style.transform = `${translatePart} scale(${scale.toFixed(2)})`;
}

// ---------------------------------------------------------------------------
// Petit déplacement aléatoire du bouton "Non" (esquive du curseur)
// ---------------------------------------------------------------------------
function dodgeButton() {
  const maxOffset = 24;
  const offsetX = Math.round((Math.random() - 0.5) * 2 * maxOffset);
  const offsetY = Math.round((Math.random() - 0.5) * 2 * maxOffset * 0.4);

  const currentTransform = btnNon.style.transform || "";
  const scalePart = currentTransform.includes("scale")
    ? currentTransform.substring(currentTransform.indexOf("scale"))
    : "scale(1)";

  btnNon.style.transform = `translate(${offsetX}px, ${offsetY}px) ${scalePart}`;
}

// Petite esquive supplémentaire au survol, tant que le bouton est actif
function maybeDodgeCursor() {
  if (nonButtonDisabled) return;
  if (Math.random() > 0.5) {
    dodgeButton();
  }
}

// ---------------------------------------------------------------------------
// Écran de résultat final
// ---------------------------------------------------------------------------
function showResultScreen() {
  surveyScreen.hidden = true;
  resultScreen.hidden = false;

  // Barre de progression à 100% (visuel, même si l'écran change)
  progressFill.style.width = "100%";
}

// ---------------------------------------------------------------------------
// Redémarrage complet du sondage
// ---------------------------------------------------------------------------
function restartSurvey() {
  currentQuestionIndex = 0;

  resultScreen.hidden = true;
  surveyScreen.hidden = false;

  renderQuestion();
}

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", init);
