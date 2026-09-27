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
  "Thibaut n'a jamais eu tort de sa vie ?",
  "Thibaut devrait-il recevoir un prix Nobel de la sympathie ?",
  "Certifiez-vous que Thibaut a toujours raison ?",
  "Si Thibaut se présentait à une élection, voteriez-vous pour lui ?",
  "Souhaitez-vous effectuer un virement de 2500€ à Thibaut dès maintenant ?"
];

// Libellés du bouton "Oui", légèrement différents selon la question (détail amusant)
const OUI_LABELS = [
  "Oui, évidemment",
  "Oui, bien sûr",
  "Oui, sans hésiter",
  "Oui, clairement",
  "Oui, il a raison",
  "Oui, absolument",
  "Oui, je certifie",
  "Oui, je vote Thibaut",
  "Oui, je confirme"
];

// Index des questions (0-based) où la logique est inversée :
// c'est "Non" qui est la réponse attendue, et "Oui" qui rétrécit et disparaît.
// Ici : "Thibaut a-t-il déjà eu tort au moins une fois dans sa vie ?" → la
// bonne réponse est évidemment "Non".
const INVERTED_QUESTIONS = [4];

// Messages affichés à chaque clic sur le bouton "incorrect" (questions normales)
const MESSAGES_WRONG_STANDARD = [
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
const MESSAGES_WRONG_ARGENT = [
  "Erreur : cette réponse semble indisponible.",
  "Le service comptabilité aimerait discuter avec vous.",
  "Vous avez probablement mal lu la question.",
  "Dernière chance."
];

// ---------------------------------------------------------------------------
// État de l'application
// ---------------------------------------------------------------------------
let currentQuestionIndex = 0;
let wrongClickCount = 0;
let wrongButtonDisabled = false;

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
  btnOui.addEventListener("mouseenter", maybeDodgeCursor);
  btnNon.addEventListener("mouseenter", maybeDodgeCursor);
  btnRestart.addEventListener("click", restartSurvey);
}

// ---------------------------------------------------------------------------
// Utilitaires liés à l'inversion Oui/Non selon la question
// ---------------------------------------------------------------------------
function isInverted() {
  return INVERTED_QUESTIONS.includes(currentQuestionIndex);
}

// Le bouton "correct", qui valide et fait avancer le sondage
function getCorrectButton() {
  return isInverted() ? btnNon : btnOui;
}

// Le bouton "piège", qui rétrécit puis disparaît
function getWrongButton() {
  return isInverted() ? btnOui : btnNon;
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

  // Libellé du bouton Oui (toujours affiché tel quel, qu'il soit "correct" ou "piège")
  btnOui.textContent = OUI_LABELS[currentQuestionIndex] || "Oui";
  btnNon.textContent = "Non";

  // Réinitialisation des boutons pour la nouvelle question
  resetButtons();
}

// ---------------------------------------------------------------------------
// Réinitialisation visuelle des deux boutons
// ---------------------------------------------------------------------------
function resetButtons() {
  wrongClickCount = 0;
  wrongButtonDisabled = false;

  [btnOui, btnNon].forEach((btn) => {
    btn.style.transform = "scale(1) translate(0px, 0px)";
    btn.classList.remove("hidden-forever");
    btn.classList.remove("validated");
    btn.disabled = false;
  });

  attemptsCounter.hidden = true;
  attemptsCount.textContent = "0";
  hintText.textContent = "";
}

// ---------------------------------------------------------------------------
// Clics sur "Oui" et "Non" — redirigés selon que la question est inversée
// ---------------------------------------------------------------------------
function handleOuiClick() {
  if (isInverted()) {
    handleWrongClick();
  } else {
    handleCorrectClick();
  }
}

function handleNonClick() {
  if (isInverted()) {
    handleCorrectClick();
  } else {
    handleWrongClick();
  }
}

// ---------------------------------------------------------------------------
// Clic sur le bouton "correct" (valide la réponse et avance)
// ---------------------------------------------------------------------------
function handleCorrectClick() {
  const correctBtn = getCorrectButton();

  // Petite animation de validation
  correctBtn.classList.remove("validated");
  void correctBtn.offsetWidth; // force le reflow pour rejouer l'animation
  correctBtn.classList.add("validated");

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
// Clic sur le bouton "piège" (rétrécit puis disparaît)
// ---------------------------------------------------------------------------
function handleWrongClick() {
  if (wrongButtonDisabled) return;

  const wrongBtn = getWrongButton();
  const isMoneyQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const messages = isMoneyQuestion ? MESSAGES_WRONG_ARGENT : MESSAGES_WRONG_STANDARD;
  const totalSteps = messages.length;

  wrongClickCount++;

  // Compteur de tentatives visible dès le premier clic
  attemptsCounter.hidden = false;
  attemptsCount.textContent = String(wrongClickCount);

  // Message humoristique correspondant à l'étape actuelle
  const messageIndex = Math.min(wrongClickCount, totalSteps) - 1;
  hintText.textContent = messages[messageIndex];

  if (wrongClickCount >= totalSteps) {
    // Dernière étape : le bouton disparaît complètement
    wrongBtn.classList.add("hidden-forever");
    wrongButtonDisabled = true;
    wrongBtn.disabled = true;
    return;
  }

  // Calcul du nouveau facteur d'échelle (rétrécissement progressif)
  const scale = 1 - (wrongClickCount / totalSteps) * 0.95;
  applyButtonScale(wrongBtn, scale);

  // Léger déplacement aléatoire pour esquiver le curseur
  dodgeButton(wrongBtn);
}

// ---------------------------------------------------------------------------
// Application visuelle du rétrécissement d'un bouton donné
// ---------------------------------------------------------------------------
function applyButtonScale(btn, scale) {
  const currentTransform = btn.style.transform || "translate(0px, 0px)";
  const translatePart = currentTransform.includes("translate")
    ? currentTransform.substring(currentTransform.indexOf("translate"))
    : "translate(0px, 0px)";

  btn.style.transform = `${translatePart} scale(${scale.toFixed(2)})`;
}

// ---------------------------------------------------------------------------
// Petit déplacement aléatoire d'un bouton donné (esquive du curseur)
// ---------------------------------------------------------------------------
function dodgeButton(btn) {
  const maxOffset = 24;
  const offsetX = Math.round((Math.random() - 0.5) * 2 * maxOffset);
  const offsetY = Math.round((Math.random() - 0.5) * 2 * maxOffset * 0.4);

  const currentTransform = btn.style.transform || "";
  const scalePart = currentTransform.includes("scale")
    ? currentTransform.substring(currentTransform.indexOf("scale"))
    : "scale(1)";

  btn.style.transform = `translate(${offsetX}px, ${offsetY}px) ${scalePart}`;
}

// Petite esquive supplémentaire au survol, uniquement sur le bouton "piège" actif
function maybeDodgeCursor(event) {
  if (wrongButtonDisabled) return;

  const hoveredBtn = event.currentTarget;
  if (hoveredBtn !== getWrongButton()) return;

  if (Math.random() > 0.5) {
    dodgeButton(hoveredBtn);
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
