/* ============================================================
   UTMESchools v2 — practice.js
   Study Mode + Practice Mode
   Question Navigation
   Show/Hide Answers
   Calculator
   Timer
   Result Storage
============================================================ */

const params = new URLSearchParams(window.location.search);

const mode = params.get("mode") || "practice";

const selectedSubjects =
  (params.get("subjects") || "english")
    .split(",")
    .filter(Boolean);

let allQuestions = [];
let currentIndex = 0;
let answers = {};
let showingAnswer = false;

/* ============================================================
   ELEMENTS
============================================================ */

const questionNumber =
  document.getElementById("questionNumber");

const questionSubject =
  document.getElementById("questionSubject");

const questionText =
  document.getElementById("questionText");

const optionsContainer =
  document.getElementById("optionsContainer");

const progressFill =
  document.getElementById("progressFill");

const timerEl =
  document.getElementById("timer");

const answerBox =
  document.getElementById("answerBox");

const answerTopic =
  document.getElementById("answerTopic");

const answerExplanation =
  document.getElementById("answerExplanation");

const scoreDisplay =
  document.getElementById("scoreDisplay");

const showBtn =
  document.getElementById("showBtn");

const submitBtn =
  document.getElementById("submitBtn");

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");

const navOverlay =
  document.getElementById("navOverlay");

const navGrid =
  document.getElementById("navGrid");

const openNavBtn =
  document.getElementById("openNavBtn");

const calcOverlay =
  document.getElementById("calcOverlay");

const openCalcBtn =
  document.getElementById("openCalcBtn");

const calcDisplay =
  document.getElementById("calcDisplay");

/* ============================================================
   LOAD QUESTIONS
============================================================ */

async function loadQuestions() {

  try {

    for (const subject of selectedSubjects) {

      const res =
        await fetch(`questions/${subject}.json`);

      if (!res.ok) continue;

      const data =
        await res.json();

      allQuestions.push(...data);
    }

    if (allQuestions.length === 0) {

      questionText.textContent =
        "No questions found.";

      return;
    }

    renderNavigation();

    renderQuestion();

  } catch (err) {

    console.error(err);

    questionText.textContent =
      "Failed to load questions.";
  }
}

/* ============================================================
   RENDER QUESTION
============================================================ */

function renderQuestion() {

  const q =
    allQuestions[currentIndex];

  questionNumber.textContent =
    `Question ${currentIndex + 1}/${allQuestions.length}`;

  questionSubject.textContent =
    q.subject || "English";

  questionText.innerHTML =
    q.question;

  optionsContainer.innerHTML = "";

  const letters =
    ["A","B","C","D"];

  q.options.forEach((option,index)=>{

    const div =
      document.createElement("div");

    div.className = "option";

    if (
      answers[currentIndex] === index
    ) {
      div.classList.add("active");
    }

    div.innerHTML = `
      <div class="option-letter">
        ${letters[index]}
      </div>
      <div>
        ${option}
      </div>
    `;

    div.addEventListener("click",()=>{

      answers[currentIndex] = index;

      updateScore();

      renderQuestion();

    });

    optionsContainer.appendChild(div);

  });

  answerBox.classList.remove("show");
  showingAnswer = false;

  if(showBtn){
    showBtn.textContent = "Show";
  }

  progressFill.style.width =
    (((currentIndex + 1) /
      allQuestions.length) * 100) + "%";

  prevBtn.disabled =
    currentIndex === 0;

  nextBtn.disabled =
    currentIndex ===
    allQuestions.length - 1;
}

/* ============================================================
   SCORE
============================================================ */

function updateScore() {

  let answered = 0;

  Object.keys(answers).forEach(()=>{
    answered++;
  });

  scoreDisplay.textContent =
    `${answered}/${allQuestions.length}`;
}

/* ============================================================
   SHOW ANSWER
============================================================ */

if(showBtn){

showBtn.addEventListener("click",()=>{

  const q =
    allQuestions[currentIndex];

  if(!showingAnswer){

    answerTopic.textContent =
      q.topic || "General";

    answerExplanation.textContent =
      q.explanation ||
      "No explanation available.";

    answerBox.classList.add("show");

    showBtn.textContent =
      "Hide";

    showingAnswer = true;

  }else{

    answerBox.classList.remove("show");

    showBtn.textContent =
      "Show";

    showingAnswer = false;
  }

});

}

/* ============================================================
   STUDY MODE
============================================================ */

if(mode === "study"){

  timerEl.textContent =
    "Study Mode";

  submitBtn.style.display =
    "none";

}else{

/* ============================================================
   TIMER
============================================================ */

let hours =
  parseInt(params.get("h")) || 2;

let minutes =
  parseInt(params.get("m")) || 0;

let totalSeconds =
  (hours * 3600) +
  (minutes * 60);

const timer =
setInterval(()=>{

  if(totalSeconds <= 0){

    clearInterval(timer);

    submitExam();

    return;
  }

  totalSeconds--;

  const h =
    Math.floor(totalSeconds / 3600);

  const m =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const s =
    totalSeconds % 60;

  timerEl.textContent =
    `${String(h).padStart(2,"0")}:`+
    `${String(m).padStart(2,"0")}:`+
    `${String(s).padStart(2,"0")}`;

},1000);

}

/* ============================================================
   NAVIGATION
============================================================ */

prevBtn.addEventListener("click",()=>{

  if(currentIndex > 0){

    currentIndex--;

    renderQuestion();

  }

});

nextBtn.addEventListener("click",()=>{

  if(
    currentIndex <
    allQuestions.length - 1
  ){

    currentIndex++;

    renderQuestion();

  }

});

/* ============================================================
   QUESTION GRID
============================================================ */

function renderNavigation(){

  navGrid.innerHTML = "";

  allQuestions.forEach((q,index)=>{

    const btn =
      document.createElement("button");

    btn.textContent =
      index + 1;

    btn.addEventListener("click",()=>{

      currentIndex = index;

      renderQuestion();

      navOverlay.classList.remove("open");

    });

    navGrid.appendChild(btn);

  });

}

openNavBtn.addEventListener("click",()=>{

  navOverlay.classList.add("open");

});

navOverlay.addEventListener("click",(e)=>{

  if(e.target === navOverlay){

    navOverlay.classList.remove("open");

  }

});

/* ============================================================
   CALCULATOR
============================================================ */

let calcValue = "";

openCalcBtn.addEventListener("click",()=>{

  calcOverlay.classList.add("open");

});

calcOverlay.addEventListener("click",(e)=>{

  if(e.target === calcOverlay){

    calcOverlay.classList.remove("open");

  }

});

document
.querySelectorAll(".calc-grid button")
.forEach(btn=>{

btn.addEventListener("click",()=>{

  const val =
    btn.textContent;

  if(val === "="){

    try{

      calcValue =
        eval(calcValue).toString();

    }catch{

      calcValue = "Error";

    }

  }else{

    calcValue += val;

  }

  calcDisplay.textContent =
    calcValue;

});

});

/* ============================================================
   SUBMIT
============================================================ */

submitBtn.addEventListener(
  "click",
  submitExam
);

function submitExam(){

  let score = 0;

  allQuestions.forEach((q,index)=>{

    if(
      answers[index] === q.answer
    ){
      score++;
    }

  });

  const result = {

    score,

    total:
      allQuestions.length,

    percentage:
      Math.round(
        (score /
        allQuestions.length) * 100
      ),

    answers,

    questions:
      allQuestions

  };

  localStorage.setItem(
    "utme_result",
    JSON.stringify(result)
  );

  window.location.href =
    "result.html";

}

/* ============================================================
   START
============================================================ */

loadQuestions();
