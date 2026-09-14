/* ============================================================
   UTMESchools — practice.js
   ============================================================ */

/* ================================================================
   MODE RULES
   practice : no answers shown during session. Submit → result saved.
   mock     : no answers shown during session. Submit → analysis only.
   study    : click "Show Answer" to reveal. No submit button.
   All modes: selected answers can be changed at any time.
   ================================================================ */

const urlP = new URLSearchParams(window.location.search);

const subjectIds = (urlP.get('subjects') || 'english')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const mode = urlP.get('mode') || 'practice';

const timerH = parseInt(
  urlP.get('h') || '2',
  10
);

const timerM = parseInt(
  urlP.get('m') || '0',
  10
);

const shuffleQ = urlP.get('shuffleQ') !== '0';


/* ================================================================
   FETCH QUESTIONS
   ================================================================ */

async function fetchQuestionsFromJSON(
  subjectId,
  year,
  count,
  topicsParam
) {

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    8000
  );

  try {

    const safeCount = Math.min(
      Math.max(
        parseInt(count, 10) || 1,
        1
      ),
      50
    );

    const params = new URLSearchParams();

    params.set(
      'subject',
      subjectId
    );

    params.set(
      'limit',
      String(safeCount)
    );

    params.set(
      'shuffle',
      'true'
    );

    if (
      year &&
      year !== 'Random'
    ) {
      params.set(
        'year',
        year
      );
    }

    if (topicsParam) {

      const firstTopic =
        topicsParam
          .split('||')
          .map(t => t.trim())
          .filter(Boolean)[0];

      if (firstTopic) {
        params.set(
          'topic',
          firstTopic
        );
      }
    }

    const response = await fetch(
      `https://utmeschools-ng.onrender.com/api/questions?${params.toString()}`,
      {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store'
      }
    );

    if (!response.ok) {

      console.warn(
        `Question API returned ${response.status} for ${subjectId}`
      );

      return [];
    }

    const result =
      await response.json();

    /*
     * Our backend may return:
     *
     * { questions: [...] }
     *
     * or:
     *
     * { data: [...] }
     *
     * or directly:
     *
     * [...]
     *
     * Accept all three so Practice does not
     * break when the backend response wrapper changes.
     */

    let questions = [];

    if (Array.isArray(result)) {

      questions = result;

    } else if (
      result &&
      Array.isArray(result.questions)
    ) {

      questions = result.questions;

    } else if (
      result &&
      Array.isArray(result.data)
    ) {

      questions = result.data;

    }

    /*
     * Convert backend/Supabase question objects
     * into the exact structure used by Practice.
     */

    return questions

      .filter(q => {

        if (!q) return false;

        const text =
          q.question ||
          q.text ||
          '';

        if (!String(text).trim()) {
          return false;
        }

        return true;
      })

      .map(q => {

        let options = [];

        /*
         * Supabase normally gives us an array.
         *
         * Sdash itself uses:
         * {
         *   a: "...",
         *   b: "...",
         *   c: "...",
         *   d: "...",
         *   e: "..."
         * }
         *
         * Support both formats.
         */

        if (Array.isArray(q.options)) {

          options = q.options;

        } else if (
          q.options &&
          typeof q.options === 'object'
        ) {

          options = [
            q.options.a,
            q.options.b,
            q.options.c,
            q.options.d,
            q.options.e
          ].filter(
            option =>
              option !== null &&
              option !== undefined &&
              String(option).trim() !== ''
          );

        } else if (
          q.option &&
          typeof q.option === 'object'
        ) {

          options = [
            q.option.a,
            q.option.b,
            q.option.c,
            q.option.d,
            q.option.e
          ].filter(
            option =>
              option !== null &&
              option !== undefined &&
              String(option).trim() !== ''
          );

        }

        /*
         * Sdash answers are normally lower-case
         * such as "a", "b", "c".
         *
         * Practice uses A, B, C, D, E.
         */

        const rawCorrect =
          q.answer ||
          q.correct ||
          '';

        const correct =
          String(rawCorrect)
            .trim()
            .toUpperCase();

        return {

          id:
            String(
              q.id ??
              ''
            ),

          subjectId:
            q.subject_slug ||
            q.subject_id ||
            subjectId,

          year:
            q.exam_year ??
            q.year ??
            '',

          topic:
            q.topic ||
            '',

          subtopic:
            q.subtopic ||
            '',

          difficulty:
            q.difficulty ||
            'Intermediate',

          text:
            q.question ||
            q.text ||
            '',

          options,

          correct,

          /*
           * We are no longer generating explanations
           * ourselves.
           *
           * The explanation/solution comes from the
           * imported Sdash question data.
           */

          explanation:
            q.explanation ||
            q.solution ||
            q.ai_explanation ||
            '',

          svg_code:
            q.svg_code ||
            '',

          image_file:
            q.image_file ||
            '',

          image_url:
            q.image_url ||
            '',

          passage:
            q.passage ||
            q.section ||
            ''

        };

      })

      .filter(
        q =>
          q.options.length >= 2
      );

  } catch (error) {

    if (
      error &&
      error.name === 'AbortError'
    ) {

      console.warn(
        `Question request timed out for ${subjectId}`
      );

    } else {

      console.error(
        `Error loading questions for ${subjectId}:`,
        error
      );

    }

    return [];

  } finally {

    clearTimeout(timeout);

  }

}


/* ================================================================
   DEMO QUESTION
   ================================================================ */

function getDemoQuestions(subjectId) {

  return [

    {

      id: 'demo_1',

      subjectId,

      year: 2024,

      topic: 'DEMO',

      subtopic: '',

      difficulty: 'Basic',

      text:
        'This is a demo question. Real JAMB past questions will appear here once loaded.',

      options: [
        'Option A',
        'Option B',
        'Option C',
        'Option D'
      ],

      correct: 'A',

      explanation:
        'This is a demo question. Real Sdash questions will replace it when available.',

      svg_code: '',

      image_file: '',

      image_url: '',

      passage: ''

    }

  ];

}


/* ================================================================
   STATE
   ================================================================ */

let allQuestions = [];

let currentQIndex = 0;

let answers = {};

let bookmarks = {};

let showExplanation = false;

const FREE_LIMIT = 5;

try {

  bookmarks =
    JSON.parse(
      localStorage.getItem(
        'utme_bookmarks'
      ) || '{}'
    );

} catch (error) {

  bookmarks = {};

}


/* ================================================================
   TIMER
   ================================================================ */

let totalSeconds =
  (timerH * 3600) +
  (timerM * 60);

let timerInterval = null;


function formatTime(seconds) {

  const h =
    Math.floor(
      seconds / 3600
    );

  const m =
    Math.floor(
      (seconds % 3600) / 60
    );

  const sec =
    seconds % 60;

  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

}


function startTimer() {

  if (mode === 'study') {

    const timer =
      document.getElementById(
        'timerPill'
      );

    if (timer) {
      timer.style.display = 'none';
    }

    return;
  }

  const pill =
    document.getElementById(
      'timerPill'
    );

  if (!pill) return;

  pill.textContent =
    formatTime(
      totalSeconds
    );

  timerInterval =
    setInterval(() => {

      totalSeconds--;

      pill.textContent =
        formatTime(
          Math.max(
            totalSeconds,
            0
          )
        );

      if (
        totalSeconds <= 300
      ) {

        pill.className =
          'timer-pill danger';

      } else if (
        totalSeconds <= 600
      ) {

        pill.className =
          'timer-pill warn';

      }

      if (
        totalSeconds <= 0
      ) {

        clearInterval(
          timerInterval
        );

        showToast(
          'Time up! Submitting...'
        );

        setTimeout(
          submitExam,
          1500
        );

      }

    }, 1000);

}


/* ================================================================
   LOAD QUESTIONS
   ================================================================ */

async function loadAllQuestions() {

  /*
   * Demo questions are placed immediately.
   *
   * This guarantees that Practice can never remain
   * stuck on "Loading questions..." while waiting
   * for the backend.
   *
   * Real questions are requested in the background.
   * When they arrive, they replace the demo questions.
   */

  allQuestions = [];


  /* ---------------------------------------------------------------
     SHOW DEMO QUESTIONS IMMEDIATELY
     --------------------------------------------------------------- */

  subjectIds.forEach(
    sid => {

      let demoQuestions =
        getDemoQuestions(
          sid
        );

      demoQuestions =
        demoQuestions.slice(
          0,
          FREE_LIMIT
        );

      demoQuestions.forEach(
        (question, index) => {

          question.qNum =
            allQuestions.length +
            index +
            1;

          question.subjectId =
            sid;

        }
      );

      allQuestions.push(
        ...demoQuestions
      );

    }
  );


  /*
   * The loading screen is never left visible.
   */

  showLoadingState(
    false
  );


  if (
    mode === 'study'
  ) {

    const submitButton =
      document.getElementById(
        'submitBtn'
      );

    if (submitButton) {
      submitButton.style.display =
        'none';
    }

  }


  renderSubjectTabs();

  renderQuestion();

  startTimer();


  /* ---------------------------------------------------------------
     LOAD REAL QUESTIONS IN BACKGROUND
     --------------------------------------------------------------- */

  try {

    let user = null;

    try {

      user =
        JSON.parse(
          localStorage.getItem(
            'utme_user'
          ) || 'null'
        );

    } catch (error) {

      user = null;

    }

    const hasPaid =
      Boolean(
        user &&
        user.has_paid
      );


    const realResults =
      await Promise.all(

        subjectIds.map(
          async sid => {

            try {

              const year =
                urlP.get(
                  'year_' + sid
                ) || 'Random';

              const count =
                parseInt(
                  urlP.get(
                    'count_' + sid
                  ) || '40',
                  10
                );

              const topicParam =
                urlP.get(
                  'topics_' + sid
                ) || '';

              const requestedCount =
                hasPaid
                  ? count
                  : Math.min(
                      count,
                      FREE_LIMIT
                    );

              const questions =
                await fetchQuestionsFromJSON(
                  sid,
                  year,
                  requestedCount,
                  topicParam
                );

              return {

                subjectId: sid,

                questions:
                  Array.isArray(
                    questions
                  )
                    ? questions
                    : []

              };

            } catch (error) {

              console.warn(
                `Real questions unavailable for ${sid}:`,
                error
              );

              return {

                subjectId: sid,

                questions: []

              };

            }

          }
        )

      );


  /* ---------------------------------------------------------------
     REPLACE DEMO QUESTIONS WITH REAL QUESTIONS
     --------------------------------------------------------------- */

    let receivedRealQuestions =
      false;


    realResults.forEach(
      result => {

        if (
          !result ||
          !Array.isArray(
            result.questions
          ) ||
          result.questions.length === 0
        ) {

          return;

        }


        receivedRealQuestions =
          true;


        const sid =
          result.subjectId;


        let realQuestions =
          result.questions;


        if (!hasPaid) {

          realQuestions =
            realQuestions.slice(
              0,
              FREE_LIMIT
            );

        }


        if (shuffleQ) {

          realQuestions.sort(
            () =>
              Math.random() -
              0.5
          );

        }


        realQuestions.forEach(
          (question, index) => {

            question.subjectId =
              sid;

            question.qNum =
              index + 1;

          }
        );


        /*
         * Remove only demo questions
         * belonging to this subject.
         */

        allQuestions =
          allQuestions.filter(
            question =>
              !(
                question.subjectId === sid &&
                String(
                  question.id
                ).startsWith(
                  'demo_'
                )
              )
          );


        /*
         * Find the correct position
         * for this subject.
         */

        let insertIndex =
          allQuestions.findIndex(
            question =>
              question.subjectId === sid
          );


        if (
          insertIndex === -1
        ) {

          insertIndex =
            allQuestions.length;

        }


        allQuestions.splice(
          insertIndex,
          0,
          ...realQuestions
        );

      }
    );


  /* ---------------------------------------------------------------
     REBUILD QUESTION NUMBERS
     --------------------------------------------------------------- */

    allQuestions.forEach(
      (question, index) => {

        question.qNum =
          index + 1;

      }
    );


  /* ---------------------------------------------------------------
     REFRESH SCREEN
     --------------------------------------------------------------- */

    if (
      receivedRealQuestions
    ) {

      if (
        currentQIndex >=
        allQuestions.length
      ) {

        currentQIndex = 0;

      }

      renderSubjectTabs();

      renderQuestion();

      showToast(
        'Real questions loaded.'
      );

    }

  } catch (error) {

    /*
     * The demo questions are already visible.
     * Therefore an API failure does not break Practice.
     */

    console.warn(
      'Background real-question loading failed:',
      error
    );

  }

}


/* ================================================================
   LOADING STATE
   ================================================================ */

function showLoadingState(
  loading
) {

  const qCard =
    document.getElementById(
      'qCard'
    );

  const optionsList =
    document.getElementById(
      'optionsList'
    );

  if (!qCard) return;


  if (loading) {

    qCard.innerHTML = `

      <div style="text-align:center;padding:40px 20px;">

        <div style="font-size:32px;margin-bottom:12px;">
          ⏳
        </div>

        <div
          style="
            font-family:var(--font-display);
            font-size:16px;
            font-weight:700;
            color:var(--navy);
            margin-bottom:6px;
          "
        >
          Loading questions...
        </div>

        <div
          style="
            font-size:13px;
            color:var(--ink-soft);
          "
        >
          Please wait
        </div>

      </div>

    `;

    if (optionsList) {
      optionsList.innerHTML = '';
    }

  }

         }/* ================================================================
   SUBJECT TABS
   ================================================================ */

function renderSubjectTabs() {

  const container =
    document.getElementById(
      'subjTabs'
    );

  if (!container) return;


  /*
   * Clear previous tabs.
   *
   * This is important because real questions can
   * replace demo questions after the first render.
   */

  container.innerHTML = '';


  if (
    subjectIds.length <= 1
  ) {

    container.style.display =
      'none';

    return;

  }


  container.style.display =
    '';


  subjectIds.forEach(
    sid => {

      const subjQs =
        allQuestions.filter(
          question =>
            question.subjectId === sid
        );


      const tab =
        document.createElement(
          'div'
        );


      tab.className =
        'subj-tab';


      tab.dataset.subject =
        sid;


      const name =
        sid.charAt(0).toUpperCase() +
        sid.slice(1);


      tab.innerHTML =
        `${name} <span class="subj-tab-count">0/${subjQs.length}</span>`;


      tab.addEventListener(
        'click',
        () => {

          const first =
            allQuestions.findIndex(
              question =>
                question.subjectId === sid
            );

          if (
            first >= 0
          ) {

            goToQuestion(
              first
            );

          }

        }
      );


      container.appendChild(
        tab
      );

    }
  );


  updateSubjectTabs();

}


function updateSubjectTabs() {

  const current =
    allQuestions[
      currentQIndex
    ]?.subjectId;


  document
    .querySelectorAll(
      '.subj-tab'
    )
    .forEach(
      tab => {

        tab.classList.toggle(
          'active',
          tab.dataset.subject === current
        );


        const sid =
          tab.dataset.subject;


        const subjQs =
          allQuestions.filter(
            question =>
              question.subjectId === sid
          );


        const answered =
          subjQs.filter(
            question =>
              answers[
                question.id
              ]
          ).length;


        const countElement =
          tab.querySelector(
            '.subj-tab-count'
          );


        if (
          countElement
        ) {

          countElement.textContent =
            `${answered}/${subjQs.length}`;

        }

      }
    );

}


/* ================================================================
   RENDER QUESTION
   ================================================================ */

function renderQuestion() {

  const q =
    allQuestions[
      currentQIndex
    ];


  if (!q) return;


  const qCard =
    document.getElementById(
      'qCard'
    );


  if (!qCard) return;


  if (
    !qCard.querySelector(
      '#qMeta'
    )
  ) {

    qCard.innerHTML = `

      <div
        class="q-meta"
        id="qMeta"
      ></div>

      <div
        class="q-text"
        id="qText"
      ></div>

      <div
        class="q-svg"
        id="qSvg"
      ></div>

    `;

  }


  const qLabel =
    document.getElementById(
      'qLabel'
    );


  if (qLabel) {

    qLabel.textContent =
      `Q ${currentQIndex + 1} / ${allQuestions.length}`;

  }


  const metaEl =
    document.getElementById(
      'qMeta'
    );


  if (metaEl) {

    metaEl.innerHTML = '';


    if (q.topic) {

      const topicTag =
        document.createElement(
          'span'
        );

      topicTag.className =
        'q-meta-tag';

      topicTag.textContent =
        q.topic;

      metaEl.appendChild(
        topicTag
      );

    }


    if (q.subtopic) {

      const subtopicTag =
        document.createElement(
          'span'
        );

      subtopicTag.className =
        'q-meta-tag';

      subtopicTag.textContent =
        q.subtopic;

      metaEl.appendChild(
        subtopicTag
      );

    }


    if (q.year) {

      const yearTag =
        document.createElement(
          'span'
        );

      yearTag.className =
        'q-meta-tag';

      yearTag.textContent =
        `📅 ${q.year}`;

      metaEl.appendChild(
        yearTag
      );

    }


    if (q.difficulty) {

      const difficultyTag =
        document.createElement(
          'span'
        );

      difficultyTag.className =
        'q-meta-tag';

      difficultyTag.textContent =
        q.difficulty;

      metaEl.appendChild(
        difficultyTag
      );

    }

  }


  const questionText =
    document.getElementById(
      'qText'
    );


  if (questionText) {

    questionText.textContent =
      q.text;

  }


  const svgEl =
    document.getElementById(
      'qSvg'
    );


  if (svgEl) {

    svgEl.innerHTML = '';


    if (q.svg_code) {

      svgEl.innerHTML =
        q.svg_code;

    } else if (
      q.image_url
    ) {

      const image =
        document.createElement(
          'img'
        );

      image.src =
        q.image_url;

      image.alt =
        'Question diagram';

      image.style.maxWidth =
        '100%';

      image.style.borderRadius =
        '8px';

      image.style.marginTop =
        '8px';

      svgEl.appendChild(
        image
      );

    } else if (
      q.image_file
    ) {

      const image =
        document.createElement(
          'img'
        );

      image.src =
        `images/${q.image_file}`;

      image.alt =
        'Question diagram';

      image.style.maxWidth =
        '100%';

      image.style.borderRadius =
        '8px';

      image.style.marginTop =
        '8px';

      svgEl.appendChild(
        image
      );

    }

  }


  /* ---------------------------------------------------------------
     PASSAGE
     --------------------------------------------------------------- */

  const passCard =
    document.getElementById(
      'passageCard'
    );

  const passageText =
    document.getElementById(
      'passageText'
    );


  if (
    passCard &&
    passageText
  ) {

    if (q.passage) {

      passageText.textContent =
        q.passage;

      passCard.classList.add(
        'visible'
      );

    } else {

      passageText.textContent =
        '';

      passCard.classList.remove(
        'visible'
      );

    }

  }


  renderOptions(q);


  const prevBtn =
    document.getElementById(
      'prevBtn'
    );

  if (prevBtn) {

    prevBtn.disabled =
      currentQIndex === 0;

  }


  const nextBtn =
    document.getElementById(
      'nextBtn'
    );

  if (nextBtn) {

    nextBtn.disabled =
      currentQIndex ===
      allQuestions.length - 1;

  }


  const bookmarkBtn =
    document.getElementById(
      'bookmarkBtn'
    );


  if (bookmarkBtn) {

    bookmarkBtn.style.color =
      bookmarks[q.id]
        ? 'var(--gold)'
        : '';

  }


  const studyActions =
    document.getElementById(
      'studyActions'
    );

  const explanationBox =
    document.getElementById(
      'explanationBox'
    );


  if (
    mode === 'study'
  ) {

    if (studyActions) {

      studyActions.classList.add(
        'visible'
      );

    }


    const showAnswerBtn =
      document.getElementById(
        'showAnswerBtn'
      );


    if (showAnswerBtn) {

      showAnswerBtn.textContent =
        showExplanation
          ? '🙈 Hide Answer'
          : '👁 Show Answer';

    }


    if (
      showExplanation
    ) {

      if (explanationBox) {

        explanationBox.classList.add(
          'visible'
        );

      }


      const explanationText =
        document.getElementById(
          'explanationText'
        );


      if (explanationText) {

        explanationText.textContent =
          q.explanation ||
          'No solution is available for this question.';

      }

    } else {

      if (explanationBox) {

        explanationBox.classList.remove(
          'visible'
        );

      }

    }

  } else {

    if (studyActions) {

      studyActions.classList.remove(
        'visible'
      );

    }


    if (explanationBox) {

      explanationBox.classList.remove(
        'visible'
      );

    }

  }


  const answeredCount =
    document.getElementById(
      'answeredCount'
    );


  if (answeredCount) {

    answeredCount.textContent =
      Object.keys(
        answers
      ).length;

  }


  const totalCount =
    document.getElementById(
      'totalCount'
    );


  if (totalCount) {

    totalCount.textContent =
      allQuestions.length;

  }


  updateSubjectTabs();

}


/* ================================================================
   RENDER OPTIONS
   ================================================================ */

function renderOptions(q) {

  const list =
    document.getElementById(
      'optionsList'
    );


  if (!list) return;


  const letters =
    ['A', 'B', 'C', 'D', 'E'];


  const userAns =
    answers[q.id];


  list.innerHTML = '';


  (q.options || [])
    .forEach(
      (option, index) => {

        const letter =
          letters[index];


        if (!letter) return;


        const row =
          document.createElement(
            'div'
          );


        row.className =
          'option-row';


        /*
         * Study mode can reveal the answer.
         *
         * Practice and Mock never reveal
         * the correct answer during the test.
         */

        if (
          mode === 'study' &&
          showExplanation
        ) {

          if (
            letter === q.correct
          ) {

            row.classList.add(
              'correct'
            );

          } else if (
            letter === userAns
          ) {

            row.classList.add(
              'wrong'
            );

          } else {

            row.classList.add(
              'dimmed'
            );

          }

        } else {

          if (
            userAns === letter
          ) {

            row.classList.add(
              'selected'
            );

          }

        }


        const letterElement =
          document.createElement(
            'div'
          );

        letterElement.className =
          'option-letter';

        letterElement.textContent =
          letter;


        const textElement =
          document.createElement(
            'div'
          );

        textElement.className =
          'option-text';

        textElement.textContent =
          option;


        row.appendChild(
          letterElement
        );

        row.appendChild(
          textElement
        );


        row.addEventListener(
          'click',
          () =>
            selectAnswer(
              q,
              letter
            )
        );


        list.appendChild(
          row
        );

      }
    );

}


/* ================================================================
   SELECT ANSWER
   ================================================================ */

function selectAnswer(
  q,
  letter
) {

  answers[q.id] =
    letter;

  showExplanation =
    false;

  renderQuestion();

}


/* ================================================================
   NAVIGATION
   ================================================================ */

function goToQuestion(
  index
) {

  if (
    index < 0 ||
    index >= allQuestions.length
  ) {

    return;

  }


  showExplanation =
    false;

  currentQIndex =
    index;

  renderQuestion();


  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

}


/* ================================================================
   BOOKMARK
   ================================================================ */

function toggleBookmark() {

  const q =
    allQuestions[
      currentQIndex
    ];


  if (!q) return;


  if (
    bookmarks[q.id]
  ) {

    delete bookmarks[q.id];

    showToast(
      'Bookmark removed'
    );

  } else {

    bookmarks[q.id] = {

      id:
        q.id,

      subjectId:
        q.subjectId,

      year:
        q.year,

      text:
        q.text,

      options:
        q.options,

      correct:
        q.correct,

      explanation:
        q.explanation,

      topic:
        q.topic,

      subtopic:
        q.subtopic,

      savedAt:
        new Date().toISOString()

    };


    showToast(
      'Question bookmarked ⭐'
    );

  }


  try {

    localStorage.setItem(
      'utme_bookmarks',
      JSON.stringify(
        bookmarks
      )
    );

  } catch (error) {

    console.warn(
      'Unable to save bookmark:',
      error
    );

  }


  const bookmarkBtn =
    document.getElementById(
      'bookmarkBtn'
    );


  if (bookmarkBtn) {

    bookmarkBtn.style.color =
      bookmarks[q.id]
        ? 'var(--gold)'
        : '';

  }

}


/* ================================================================
   QUESTION GRID
   ================================================================ */

function openGrid() {

  const grid =
    document.getElementById(
      'gridNums'
    );


  if (!grid) return;


  grid.innerHTML = '';


  allQuestions.forEach(
    (q, index) => {

      const element =
        document.createElement(
          'div'
        );


      element.className =
        'grid-num' +
        (
          answers[q.id]
            ? ' answered'
            : ''
        ) +
        (
          index === currentQIndex
            ? ' current'
            : ''
        );


      element.textContent =
        index + 1;


      element.addEventListener(
        'click',
        () => {

          closeGrid();

          goToQuestion(
            index
          );

        }
      );


      grid.appendChild(
        element
      );

    }
  );


  const overlay =
    document.getElementById(
      'gridOverlay'
    );


  if (overlay) {

    overlay.classList.add(
      'open'
    );

  }

}


function closeGrid() {

  const overlay =
    document.getElementById(
      'gridOverlay'
    );


  if (overlay) {

    overlay.classList.remove(
      'open'
    );

  }

}


/* ================================================================
   SUBMIT
   ================================================================ */

function openSubmitDialog() {

  const answered =
    Object.keys(
      answers
    ).length;


  const total =
    allQuestions.length;


  const label =
    mode === 'practice'
      ? 'submit and save your result'
      : 'submit and see your analysis';


  const dialogBody =
    document.getElementById(
      'dialogBody'
    );


  if (dialogBody) {

    dialogBody.textContent =
      `You have answered ${answered} of ${total} questions. Ready to ${label}?`;

  }


  const overlay =
    document.getElementById(
      'dialogOverlay'
    );


  if (overlay) {

    overlay.classList.add(
      'open'
    );

  }

}


function closeSubmitDialog() {

  const overlay =
    document.getElementById(
      'dialogOverlay'
    );


  if (overlay) {

    overlay.classList.remove(
      'open'
    );

  }

}


function buildResult(
  saveToHistory
) {

  if (
    timerInterval
  ) {

    clearInterval(
      timerInterval
    );

  }


  const subjectResults =
    {};


  subjectIds.forEach(
    sid => {

      const subjQs =
        allQuestions.filter(
          question =>
            question.subjectId === sid
        );


      let correct = 0;

      let attempted = 0;


      const questionDetails =
        subjQs.map(
          q => {

            const userAns =
              answers[q.id] ||
              null;


            const isCorrect =
              userAns ===
              q.correct;


            if (userAns) {

              attempted++;

              if (isCorrect) {
                correct++;
              }

            }


            return {

              id:
                q.id,

              num:
                q.qNum,

              text:
                q.text,

              options:
                q.options,

              correct:
                q.correct,

              userAnswer:
                userAns,

              topic:
                q.topic,

              subtopic:
                q.subtopic,

              year:
                q.year,

              explanation:
                q.explanation,

              difficulty:
                q.difficulty

            };

          }
        );


      subjectResults[sid] = {

        total:
          subjQs.length,

        attempted,

        correct,

        questions:
          questionDetails

      };

    }
  );


  const result = {

    id:
      'r_' + Date.now(),

    mode,

    subjectIds,

    subjectResults,

    totalAnswered:
      Object.keys(
        answers
      ).length,

    totalQuestions:
      allQuestions.length,

    timeTaken:
      (
        timerH * 3600 +
        timerM * 60
      ) -
      totalSeconds,

    date:
      new Date().toISOString()

  };


  try {

    sessionStorage.setItem(
      'utme_result',
      JSON.stringify(
        result
      )
    );

  } catch (error) {

    console.warn(
      'Unable to save result:',
      error
    );

  }


  if (
    saveToHistory
  ) {

    try {

      const history =
        JSON.parse(
          localStorage.getItem(
            'utme_history'
          ) || '[]'
        );


      history.unshift(
        result
      );


      localStorage.setItem(
        'utme_history',
        JSON.stringify(
          history.slice(
            0,
            100
          )
        )
      );

    } catch (error) {

      console.warn(
        'Unable to save history:',
        error
      );

    }

  }


  window.location.href =
    'result.html';

}


function submitExam() {

  buildResult(
    mode === 'practice'
  );

}


function finishStudy() {

  buildResult(
    false
  );

  }/* ================================================================
   CALCULATOR
   ================================================================ */

let calcDisplay = '0';

let calcExpr = '';

let calcJustEvaled = false;


function openCalc() {

  const overlay =
    document.getElementById(
      'calcOverlay'
    );


  if (overlay) {

    overlay.classList.add(
      'open'
    );

  }

}


function closeCalc() {

  const overlay =
    document.getElementById(
      'calcOverlay'
    );


  if (overlay) {

    overlay.classList.remove(
      'open'
    );

  }

}


function updateCalcDisplay() {

  const display =
    document.getElementById(
      'calcDisplay'
    );


  if (display) {

    display.textContent =
      calcDisplay;

  }

}


function calcPress(
  value
) {

  if (
    value === 'C'
  ) {

    calcDisplay =
      '0';

    calcExpr =
      '';

    calcJustEvaled =
      false;

  } else if (
    value === 'DEL'
  ) {

    if (
      calcExpr.length <= 1
    ) {

      calcDisplay =
        '0';

      calcExpr =
        '';

    } else {

      calcExpr =
        calcExpr.slice(
          0,
          -1
        );

      calcDisplay =
        calcExpr;

    }

  } else if (
    value === '='
  ) {

    try {

      const safe =
        calcExpr
          .replace(
            /×/g,
            '*'
          )
          .replace(
            /÷/g,
            '/'
          )
          .replace(
            /[^0-9+\-*/.()%]/g,
            ''
          );


      if (!safe) {

        calcDisplay =
          '0';

        calcExpr =
          '';

        calcJustEvaled =
          false;

        updateCalcDisplay();

        return;

      }


      const result =
        Function(
          '"use strict"; return (' +
          safe +
          ')'
        )();


      calcDisplay =
        isFinite(result)
          ? String(
              parseFloat(
                result.toFixed(
                  8
                )
              )
            )
          : 'Error';


      calcExpr =
        calcDisplay;

      calcJustEvaled =
        true;

    } catch (error) {

      calcDisplay =
        'Error';

      calcExpr =
        '';

    }

  } else if (
    value === '√'
  ) {

    const number =
      parseFloat(
        calcExpr
      );


    if (
      !isNaN(number)
    ) {

      calcDisplay =
        String(
          parseFloat(
            Math.sqrt(
              number
            ).toFixed(
              8
            )
          )
        );

      calcExpr =
        calcDisplay;

      calcJustEvaled =
        true;

    }

  } else if (
    [
      '+',
      '-',
      '×',
      '÷',
      '%'
    ].includes(value)
  ) {

    const map = {

      '×':
        '*',

      '÷':
        '/'

    };


    calcExpr +=
      map[value] ||
      value;


    calcDisplay =
      calcExpr;

    calcJustEvaled =
      false;

  } else {

    if (
      calcJustEvaled
    ) {

      calcExpr =
        value;

      calcJustEvaled =
        false;

    } else {

      calcExpr =
        (
          calcExpr === '0' ||
          calcExpr === ''
        )
          ? value
          : calcExpr + value;

    }


    calcDisplay =
      calcExpr;

  }


  updateCalcDisplay();

}


/* ================================================================
   TOAST
   ================================================================ */

let toastTimer;


function showToast(
  message
) {

  const toast =
    document.getElementById(
      'toast'
    );


  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add(
    'show'
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () =>
        toast.classList.remove(
          'show'
        ),
      2200
    );

}


/* ================================================================
   TEXT TO SPEECH
   ================================================================ */

function speakQuestion() {

  const q =
    allQuestions[
      currentQIndex
    ];


  if (
    !q ||
    !window.speechSynthesis
  ) {

    showToast(
      'Text-to-speech not supported'
    );

    return;

  }


  speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(
      q.text
    );


  utterance.lang =
    'en-NG';


  speechSynthesis.speak(
    utterance
  );

}


/* ================================================================
   KEYBOARD SHORTCUTS
   ================================================================ */

document.addEventListener(
  'keydown',
  event => {

    const calculator =
      document.getElementById(
        'calcOverlay'
      );


    if (
      calculator &&
      calculator.classList.contains(
        'open'
      )
    ) {

      return;

    }


    if (
      event.key ===
      'ArrowRight'
    ) {

      goToQuestion(
        currentQIndex + 1
      );

    }


    if (
      event.key ===
      'ArrowLeft'
    ) {

      goToQuestion(
        currentQIndex - 1
      );

    }


    const q =
      allQuestions[
        currentQIndex
      ];


    if (!q) return;


    if (
      event.key === '1'
    ) {

      selectAnswer(
        q,
        'A'
      );

    }


    if (
      event.key === '2'
    ) {

      selectAnswer(
        q,
        'B'
      );

    }


    if (
      event.key === '3'
    ) {

      selectAnswer(
        q,
        'C'
      );

    }


    if (
      event.key === '4'
    ) {

      selectAnswer(
        q,
        'D'
      );

    }


    if (
      event.key === '5'
    ) {

      selectAnswer(
        q,
        'E'
      );

    }

  }
);


/* ================================================================
   DOM CONTENT LOADED
   ================================================================ */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const backBtn =
      document.getElementById(
        'backBtn'
      );


    if (backBtn) {

      backBtn.addEventListener(
        'click',
        () => {

          if (
            confirm(
              'Leave? Your progress will be lost.'
            )
          ) {

            if (
              timerInterval
            ) {

              clearInterval(
                timerInterval
              );

            }


            window.location.href =
              'select-subjects.html';

          }

        }
      );

    }


    const prevBtn =
      document.getElementById(
        'prevBtn'
      );


    if (prevBtn) {

      prevBtn.addEventListener(
        'click',
        () =>
          goToQuestion(
            currentQIndex - 1
          )
      );

    }


    const nextBtn =
      document.getElementById(
        'nextBtn'
      );


    if (nextBtn) {

      nextBtn.addEventListener(
        'click',
        () =>
          goToQuestion(
            currentQIndex + 1
          )
      );

    }


    const bookmarkBtn =
      document.getElementById(
        'bookmarkBtn'
      );


    if (bookmarkBtn) {

      bookmarkBtn.addEventListener(
        'click',
        toggleBookmark
      );

    }


    const flagBtn =
      document.getElementById(
        'flagBtn'
      );


    if (flagBtn) {

      flagBtn.addEventListener(
        'click',
        () =>
          showToast(
            'Question reported. Thank you!'
          )
      );

    }


    const calcBtn =
      document.getElementById(
        'calcBtn'
      );


    if (calcBtn) {

      calcBtn.addEventListener(
        'click',
        openCalc
      );

    }


    const calcCloseBtn =
      document.getElementById(
        'calcCloseBtn'
      );


    if (calcCloseBtn) {

      calcCloseBtn.addEventListener(
        'click',
        closeCalc
      );

    }


    const calcOverlay =
      document.getElementById(
        'calcOverlay'
      );


    if (calcOverlay) {

      calcOverlay.addEventListener(
        'click',
        event => {

          if (
            event.target ===
            calcOverlay
          ) {

            closeCalc();

          }

        }
      );

    }


    document
      .querySelectorAll(
        '.calc-btn'
      )
      .forEach(
        button => {

          button.addEventListener(
            'click',
            () =>
              calcPress(
                button.dataset.val
              )
          );

        }
      );


    const speakerBtn =
      document.getElementById(
        'speakerBtn'
      );


    if (speakerBtn) {

      speakerBtn.addEventListener(
        'click',
        speakQuestion
      );

    }


    const showAnswerBtn =
      document.getElementById(
        'showAnswerBtn'
      );


    if (showAnswerBtn) {

      showAnswerBtn.addEventListener(
        'click',
        () => {

          showExplanation =
            !showExplanation;

          renderQuestion();

        }
      );

    }


    const submitBtn =
      document.getElementById(
        'submitBtn'
      );


    if (submitBtn) {

      submitBtn.addEventListener(
        'click',
        () => {

          if (
            mode === 'study'
          ) {

            finishStudy();

          } else {

            openSubmitDialog();

          }

        }
      );

    }


    const dialogCancel =
      document.getElementById(
        'dialogCancel'
      );


    if (dialogCancel) {

      dialogCancel.addEventListener(
        'click',
        closeSubmitDialog
      );

    }


    const dialogOverlay =
      document.getElementById(
        'dialogOverlay'
      );


    if (dialogOverlay) {

      dialogOverlay.addEventListener(
        'click',
        event => {

          if (
            event.target ===
            dialogOverlay
          ) {

            closeSubmitDialog();

          }

        }
      );

    }


    const dialogSubmit =
      document.getElementById(
        'dialogSubmit'
      );


    if (dialogSubmit) {

      dialogSubmit.addEventListener(
        'click',
        () => {

          closeSubmitDialog();

          submitExam();

        }
      );

    }


    const answeredPill =
      document.getElementById(
        'answeredPill'
      );


    if (answeredPill) {

      answeredPill.addEventListener(
        'click',
        openGrid
      );

    }


    const gridCloseBtn =
      document.getElementById(
        'gridCloseBtn'
      );


    if (gridCloseBtn) {

      gridCloseBtn.addEventListener(
        'click',
        closeGrid
      );

    }


    const gridOverlay =
      document.getElementById(
        'gridOverlay'
      );


    if (gridOverlay) {

      gridOverlay.addEventListener(
        'click',
        event => {

          if (
            event.target ===
            gridOverlay
          ) {

            closeGrid();

          }

        }
      );

    }


    /*
     * Start Practice immediately.
     *
     * Demo questions appear first.
     * Real Supabase questions are fetched
     * in the background.
     */

    loadAllQuestions();

  }
);
