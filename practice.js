/* ============================================================
   UTMESchools v2 — practice.js
   Question-answering screen.
   Reads settings from URL query string set by select-subjects.js.
   Uses hardcoded sample questions until Supabase is connected.
   ============================================================ */

/* ================================================================
   SAMPLE QUESTIONS (replace with real DB calls later)
   Each question object:
   {
     id, subjectId, year, passageId (optional, groups comprehension),
     passage (optional text for comprehension blocks),
     text, optA, optB, optC, optD, correct ('A'|'B'|'C'|'D'),
     topic, subtopic, difficulty ('Basic'|'Intermediate'|'Advanced'),
     explanation, hasSvg (bool), svgCode (string|null)
   }
   ================================================================ */

const SAMPLE_QUESTIONS = {

  english: [
    /* Comprehension passage — 3 questions share one passage */
    {
      id: 'en001', subjectId: 'english', year: 2019,
      passageId: 'passage_en_2019_1',
      passage: 'Read the following passage carefully and answer the questions that follow.\n\nThe role of education in national development cannot be overemphasised. It is through education that individuals acquire the knowledge, skills and attitudes necessary for meaningful participation in society. In Nigeria, the Federal Government has continued to invest heavily in education at all levels, recognising that an educated populace is the foundation of sustainable development. However, challenges such as inadequate funding, poor infrastructure and shortage of qualified teachers continue to undermine the quality of education delivered.',
      text: 'According to the passage, what does the Federal Government of Nigeria recognise as the foundation of sustainable development?',
      optA: 'Adequate funding of schools',
      optB: 'An educated populace',
      optC: 'Improved infrastructure',
      optD: 'Qualified teachers',
      correct: 'B',
      topic: 'COMPREHENSION PASSAGE',
      subtopic: 'MAIN IDEA',
      difficulty: 'Basic',
      explanation: 'The passage states that the Federal Government recognises "an educated populace is the foundation of sustainable development." This directly answers the question. Option A, C and D are challenges listed in the passage, not what the government recognises as the foundation.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'en002', subjectId: 'english', year: 2019,
      passageId: 'passage_en_2019_1',
      passage: null, /* passage already shown above — don't repeat */
      text: 'Which of the following is NOT listed as a challenge undermining education quality in the passage?',
      optA: 'Inadequate funding',
      optB: 'Poor infrastructure',
      optC: 'Government neglect',
      optD: 'Shortage of qualified teachers',
      correct: 'C',
      topic: 'COMPREHENSION PASSAGE',
      subtopic: 'DETAIL RETRIEVAL',
      difficulty: 'Basic',
      explanation: '"Government neglect" is not mentioned anywhere in the passage. The three challenges explicitly listed are: inadequate funding, poor infrastructure, and shortage of qualified teachers.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'en003', subjectId: 'english', year: 2019,
      passageId: 'passage_en_2019_1',
      passage: null,
      text: 'The word "overemphasised" as used in the passage means that the role of education is —',
      optA: 'frequently doubted',
      optB: 'greatly undervalued',
      optC: 'too important to stress enough',
      optD: 'difficult to measure',
      correct: 'C',
      topic: 'COMPREHENSION PASSAGE',
      subtopic: 'VOCABULARY IN CONTEXT',
      difficulty: 'Intermediate',
      explanation: '"Cannot be overemphasised" is a fixed English expression meaning the thing is so important that no amount of emphasis is too much — i.e. it is too important to stress enough. The sentence structure "cannot be overemphasised" signals this meaning.',
      hasSvg: false, svgCode: null
    },
    /* Lexis and structure */
    {
      id: 'en004', subjectId: 'english', year: 2021,
      passageId: null, passage: null,
      text: 'Choose the option that is nearest in meaning to the underlined word.\nThe students were <u>perturbed</u> by the sudden change in examination timetable.',
      optA: 'delighted',
      optB: 'confused',
      optC: 'disturbed',
      optD: 'encouraged',
      correct: 'C',
      topic: 'LEXIS AND STRUCTURE',
      subtopic: 'SYNONYMS',
      difficulty: 'Basic',
      explanation: '"Perturbed" means made anxious or unsettled — the closest synonym is "disturbed." "Confused" (B) is close but focuses on mental clarity rather than emotional upset. "Delighted" and "encouraged" are antonyms.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'en005', subjectId: 'english', year: 2023,
      passageId: null, passage: null,
      text: 'From the options lettered A to D, choose the one that has the same stress pattern as the given word.\n\nPHOTOGRAPHY',
      optA: 'geo-GRA-phy',
      optB: 'PHO-to-graph',
      optC: 'pho-TO-gra-phy',
      optD: 'PHO-to-gra-phy',
      correct: 'C',
      topic: 'ORAL FORMS',
      subtopic: 'STRESS PATTERN',
      difficulty: 'Intermediate',
      explanation: 'PHO-TO-GRA-PHY: the stress falls on the second syllable — pho-TO-gra-phy. This matches option C. Option D places stress on the first syllable (PHO), which is wrong. Option A (geo-GRA-phy) has stress on the second syllable but is a different word used for comparison — PHO-TO-GRA-PHY and geo-GRA-phy do NOT share the same stress pattern because photography has 4 syllables stressed on the 2nd (pho-TO-gra-phy).',
      hasSvg: false, svgCode: null
    },
  ],

  mathematics: [
    {
      id: 'ma001', subjectId: 'mathematics', year: 2022,
      passageId: null, passage: null,
      text: 'Simplify: (2x<sup>3</sup>y<sup>2</sup>) × (3x<sup>2</sup>y<sup>4</sup>)',
      optA: '5x<sup>5</sup>y<sup>6</sup>',
      optB: '6x<sup>5</sup>y<sup>6</sup>',
      optC: '6x<sup>6</sup>y<sup>8</sup>',
      optD: '5x<sup>6</sup>y<sup>8</sup>',
      correct: 'B',
      topic: 'ALGEBRA',
      subtopic: 'LAWS OF INDICES',
      difficulty: 'Basic',
      explanation: 'Multiply the coefficients: 2 × 3 = 6. Add the powers of x: 3 + 2 = 5. Add the powers of y: 2 + 4 = 6. Result: 6x⁵y⁶. This applies the law aᵐ × aⁿ = aᵐ⁺ⁿ.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ma002', subjectId: 'mathematics', year: 2020,
      passageId: null, passage: null,
      text: 'The mean of 5, 8, x, 11 and 14 is 10. Find the value of x.',
      optA: '10',
      optB: '12',
      optC: '14',
      optD: '8',
      correct: 'B',
      topic: 'STATISTICS AND PROBABILITY',
      subtopic: 'MEAN',
      difficulty: 'Basic',
      explanation: 'Sum of all values = mean × number of values = 10 × 5 = 50.\nKnown values: 5 + 8 + 11 + 14 = 38.\nTherefore x = 50 − 38 = 12.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ma003', subjectId: 'mathematics', year: 2018,
      passageId: null, passage: null,
      text: 'A triangle has vertices at P(2, 3), Q(−1, 1) and R(4, −2). What is the length of PQ?',
      optA: '√13',
      optB: '√10',
      optC: '√17',
      optD: '√5',
      correct: 'A',
      topic: 'GEOMETRY AND MENSURATION',
      subtopic: 'COORDINATE GEOMETRY',
      difficulty: 'Intermediate',
      explanation: 'Using the distance formula: PQ = √[(x₂−x₁)² + (y₂−y₁)²]\n= √[(−1−2)² + (1−3)²]\n= √[(−3)² + (−2)²]\n= √[9 + 4]\n= √13',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ma004', subjectId: 'mathematics', year: 2021,
      passageId: null, passage: null,
      text: 'Find the equation of a straight line passing through (3, 2) with gradient −2.',
      optA: 'y = −2x + 5',
      optB: 'y = −2x + 8',
      optC: 'y = 2x − 4',
      optD: 'y = −2x − 4',
      correct: 'B',
      topic: 'ALGEBRA',
      subtopic: 'STRAIGHT LINE GRAPHS',
      difficulty: 'Intermediate',
      explanation: 'Using y − y₁ = m(x − x₁) with m = −2, (x₁,y₁) = (3,2):\ny − 2 = −2(x − 3)\ny − 2 = −2x + 6\ny = −2x + 8',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ma005', subjectId: 'mathematics', year: 2023,
      passageId: null, passage: null,
      text: 'Evaluate: ∫(3x² + 2x − 5) dx',
      optA: 'x³ + x² − 5x + c',
      optB: '6x + 2 + c',
      optC: 'x³ + x² + c',
      optD: '3x³ + 2x² − 5x + c',
      correct: 'A',
      topic: 'CALCULUS',
      subtopic: 'INTEGRATION',
      difficulty: 'Advanced',
      explanation: 'Integrate term by term:\n∫3x² dx = x³\n∫2x dx = x²\n∫−5 dx = −5x\nAdd the constant of integration c.\nResult: x³ + x² − 5x + c',
      hasSvg: false, svgCode: null
    },
  ],

  biology: [
    {
      id: 'bi001', subjectId: 'biology', year: 2022,
      passageId: null, passage: null,
      text: 'The diagram below shows a simplified diagram of a plant cell. What structure is labelled X?',
      optA: 'Cell membrane',
      optB: 'Cell wall',
      optC: 'Chloroplast',
      optD: 'Vacuole',
      correct: 'B',
      topic: 'CELL BIOLOGY',
      subtopic: 'PLANT CELL STRUCTURE',
      difficulty: 'Basic',
      explanation: 'In a typical plant cell diagram, the outermost rigid layer is the cell wall (made of cellulose). It provides structural support and is found only in plant cells, not animal cells. The cell membrane lies just inside it.',
      hasSvg: true,
      svgCode: `<svg viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;font-family:Inter,sans-serif">
  <!-- Cell wall (outer rectangle) -->
  <rect x="10" y="10" width="200" height="140" rx="8" fill="none" stroke="#5C6B82" stroke-width="6"/>
  <!-- Cell membrane -->
  <rect x="18" y="18" width="184" height="124" rx="6" fill="none" stroke="#0FA968" stroke-width="1.5" stroke-dasharray="4 2"/>
  <!-- Nucleus -->
  <ellipse cx="110" cy="80" rx="30" ry="24" fill="#E8F1FF" stroke="#1F5FBF" stroke-width="1.5"/>
  <text x="110" y="84" text-anchor="middle" font-size="9" fill="#1F5FBF">Nucleus</text>
  <!-- Chloroplasts -->
  <ellipse cx="50" cy="55" rx="16" ry="9" fill="#C8EDCC" stroke="#0FA968" stroke-width="1"/>
  <ellipse cx="170" cy="110" rx="16" ry="9" fill="#C8EDCC" stroke="#0FA968" stroke-width="1"/>
  <!-- Vacuole -->
  <ellipse cx="60" cy="108" rx="20" ry="15" fill="#EFF7FF" stroke="#1F5FBF" stroke-width="1" stroke-dasharray="3 2"/>
  <!-- Label X pointing to cell wall -->
  <line x1="10" y1="50" x2="-5" y2="38" stroke="#C0392B" stroke-width="1.5"/>
  <circle cx="10" cy="50" r="3" fill="#C0392B"/>
  <text x="0" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#C0392B">X</text>
</svg>`
    },
    {
      id: 'bi002', subjectId: 'biology', year: 2020,
      passageId: null, passage: null,
      text: 'During aerobic respiration, glucose is completely oxidised to produce —',
      optA: 'Carbon dioxide, water and energy',
      optB: 'Lactic acid and energy',
      optC: 'Ethanol, carbon dioxide and energy',
      optD: 'Pyruvate and ATP only',
      correct: 'A',
      topic: 'PLANT AND ANIMAL NUTRITION',
      subtopic: 'RESPIRATION',
      difficulty: 'Basic',
      explanation: 'Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP).\nThe end products are carbon dioxide, water and energy. Lactic acid is produced in anaerobic respiration in animals; ethanol + CO₂ is produced in anaerobic fermentation by yeast.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'bi003', subjectId: 'biology', year: 2021,
      passageId: null, passage: null,
      text: 'In genetics, if a tall plant (TT) is crossed with a dwarf plant (tt), what will be the phenotypic ratio in the F₁ generation?',
      optA: '3 tall : 1 dwarf',
      optB: 'All tall',
      optC: '1 tall : 1 dwarf',
      optD: 'All dwarf',
      correct: 'B',
      topic: 'GENETICS AND EVOLUTION',
      subtopic: 'MENDELIAN GENETICS',
      difficulty: 'Intermediate',
      explanation: 'Cross: TT × tt\nAll F₁ offspring receive one T from the tall parent and one t from the dwarf parent → all are Tt (heterozygous tall).\nSince T (tall) is dominant over t (dwarf), all F₁ plants will be phenotypically TALL.\nThe 3:1 ratio appears in the F₂ generation, not F₁.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'bi004', subjectId: 'biology', year: 2019,
      passageId: null, passage: null,
      text: 'The part of the human brain responsible for coordination of muscular movement and body balance is the —',
      optA: 'Cerebrum',
      optB: 'Medulla oblongata',
      optC: 'Cerebellum',
      optD: 'Hypothalamus',
      correct: 'C',
      topic: 'COORDINATION AND CONTROL',
      subtopic: 'THE BRAIN',
      difficulty: 'Basic',
      explanation: 'The cerebellum controls coordination of voluntary muscular movement and body balance/posture. The cerebrum handles higher functions (thinking, speech). The medulla oblongata controls automatic functions (breathing, heartbeat). The hypothalamus regulates body temperature and hormones.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'bi005', subjectId: 'biology', year: 2023,
      passageId: null, passage: null,
      text: 'Which of the following organisms is an example of a primary consumer in a food chain?',
      optA: 'Hawk',
      optB: 'Snake',
      optC: 'Grasshopper',
      optD: 'Grass',
      correct: 'C',
      topic: 'ECOLOGY',
      subtopic: 'FOOD CHAINS AND WEBS',
      difficulty: 'Basic',
      explanation: 'A primary consumer (herbivore) eats producers directly.\nFood chain: Grass → Grasshopper → Frog → Snake → Hawk\nGrass is the producer. Grasshopper is the primary consumer. Snake and Hawk are secondary/tertiary consumers.',
      hasSvg: false, svgCode: null
    },
  ],

  chemistry: [
    {
      id: 'ch001', subjectId: 'chemistry', year: 2022,
      passageId: null, passage: null,
      text: 'Balance the following equation and identify the coefficient of H₂O:\nFe + H₂O → Fe₃O₄ + H₂',
      optA: '2',
      optB: '4',
      optC: '3',
      optD: '8',
      correct: 'B',
      topic: 'ATOMIC STRUCTURE',
      subtopic: 'BALANCING EQUATIONS',
      difficulty: 'Intermediate',
      explanation: 'Balanced equation: 3Fe + 4H₂O → Fe₃O₄ + 4H₂\nCheck: Fe: 3=3 ✓, H: 8=8 ✓, O: 4=4 ✓\nThe coefficient of H₂O is 4.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ch002', subjectId: 'chemistry', year: 2021,
      passageId: null, passage: null,
      text: 'Calculate the molar mass of CaCO₃. (Ca=40, C=12, O=16)',
      optA: '80 g/mol',
      optB: '100 g/mol',
      optC: '116 g/mol',
      optD: '68 g/mol',
      correct: 'B',
      topic: 'MOLE CONCEPT',
      subtopic: 'MOLAR MASS',
      difficulty: 'Basic',
      explanation: 'Molar mass of CaCO₃ = Ca + C + 3O\n= 40 + 12 + (3 × 16)\n= 40 + 12 + 48\n= 100 g/mol',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ch003', subjectId: 'chemistry', year: 2020,
      passageId: null, passage: null,
      text: 'Which of the following is an example of a homologous series?',
      optA: 'CH₄, C₂H₄, C₃H₄',
      optB: 'CH₄, C₂H₆, C₃H₈',
      optC: 'C₂H₂, C₂H₄, C₂H₆',
      optD: 'CH₄, C₂H₂, C₃H₄',
      correct: 'B',
      topic: 'ORGANIC CHEMISTRY',
      subtopic: 'HYDROCARBONS — ALKANES',
      difficulty: 'Intermediate',
      explanation: 'A homologous series is a group of compounds with the same general formula, differing by CH₂ each time.\nCH₄, C₂H₆, C₃H₈ = alkanes (general formula CₙH₂ₙ₊₂). Each member differs by CH₂.\nOption A is not a valid homologous series (the differences are not consistent CH₂ units).',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ch004', subjectId: 'chemistry', year: 2023,
      passageId: null, passage: null,
      text: 'In electrolysis of dilute H₂SO₄, the gas produced at the cathode is —',
      optA: 'Oxygen',
      optB: 'Sulphur dioxide',
      optC: 'Hydrogen',
      optD: 'Sulphur trioxide',
      correct: 'C',
      topic: 'ELECTROLYSIS',
      subtopic: 'PRODUCTS OF ELECTROLYSIS',
      difficulty: 'Basic',
      explanation: 'In electrolysis:\n• Cathode (negative electrode): H⁺ ions are attracted and gain electrons → H₂ gas\n• Anode (positive electrode): OH⁻ ions lose electrons → O₂ gas\nSo hydrogen is produced at the cathode.',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ch005', subjectId: 'chemistry', year: 2019,
      passageId: null, passage: null,
      text: 'According to Le Chatelier\'s principle, increasing pressure on the equilibrium:\nN₂(g) + 3H₂(g) ⇌ 2NH₃(g)\nwill —',
      optA: 'shift equilibrium to the left',
      optB: 'have no effect',
      optC: 'shift equilibrium to the right',
      optD: 'decompose the ammonia completely',
      correct: 'C',
      topic: 'EQUILIBRIUM',
      subtopic: 'LE CHATELIER\'S PRINCIPLE',
      difficulty: 'Advanced',
      explanation: 'Left side: 1 + 3 = 4 moles of gas. Right side: 2 moles of gas.\nIncreasing pressure favours the side with fewer moles of gas — the right side (2 moles). So equilibrium shifts to the right, producing MORE ammonia. This is the basis of the industrial Haber process.',
      hasSvg: false, svgCode: null
    },
  ],

  physics: [
    {
      id: 'ph001', subjectId: 'physics', year: 2022,
      passageId: null, passage: null,
      text: 'A body of mass 5 kg moves with velocity 10 m/s. Calculate its kinetic energy.',
      optA: '50 J',
      optB: '250 J',
      optC: '500 J',
      optD: '125 J',
      correct: 'B',
      topic: 'MECHANICS',
      subtopic: 'WORK, ENERGY AND POWER',
      difficulty: 'Basic',
      explanation: 'KE = ½mv²\n= ½ × 5 × (10)²\n= ½ × 5 × 100\n= 250 J',
      hasSvg: false, svgCode: null
    },
    {
      id: 'ph002', subjectId: 'physics', year: 2021,
      passageId: null, passage: null,
      text: 'The diagram shows a simple electrical circuit. If the resistors R₁ = 6Ω and R₂ = 3Ω are connected in parallel across a 12V battery, what is the total current drawn from the battery?',
      optA: '2 A',
      optB: '4 A',
      optC: '6 A',
      optD: '3 A',
      correct: 'C',
      topic: 'CURRENT ELECTRICITY',
      subtopic: 'PARALLEL CIRCUITS',
      difficulty: 'Intermediate',
      explanation: 'For parallel resistors: 1/R_total = 1/R₁ + 1/R₂ = 1/6 + 1/3 = 1/6 + 2/6 = 3/6\nR_total = 2Ω\nTotal current I = V/R = 12/2 = 6 A',
      hasSvg: true,
      svgCode: `<svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" style="max-width:240px;font-family:Inter,sans-serif">
  <!-- Battery -->
  <rect x="10" y="55" width="16" height="30" rx="2" fill="#FFF4DC" stroke="#A6760A" stroke-width="1.5"/>
  <text x="18" y="50" text-anchor="middle" font-size="9" fill="#A6760A">12V</text>
  <!-- Top wire -->
  <line x1="26" y1="58" x2="80" y2="58" stroke="#0B2545" stroke-width="2"/>
  <line x1="80" y1="58" x2="80" y2="30" stroke="#0B2545" stroke-width="2"/>
  <line x1="80" y1="30" x2="180" y2="30" stroke="#0B2545" stroke-width="2"/>
  <line x1="180" y1="30" x2="180" y2="58" stroke="#0B2545" stroke-width="2"/>
  <!-- Bottom wire -->
  <line x1="26" y1="82" x2="80" y2="82" stroke="#0B2545" stroke-width="2"/>
  <line x1="80" y1="82" x2="80" y2="110" stroke="#0B2545" stroke-width="2"/>
  <line x1="80" y1="110" x2="180" y2="110" stroke="#0B2545" stroke-width="2"/>
  <line x1="180" y1="110" x2="180" y2="82" stroke="#0B2545" stroke-width="2"/>
  <!-- R1 branch (left) -->
  <line x1="80" y1="30" x2="80" y2="82" stroke="none"/>
  <rect x="68" y="50" width="24" height="30" rx="4" fill="#E8F1FF" stroke="#1F5FBF" stroke-width="1.5"/>
  <text x="80" y="69" text-anchor="middle" font-size="9" font-weight="700" fill="#1F5FBF">R₁=6Ω</text>
  <!-- R2 branch (right) -->
  <line x1="180" y1="30" x2="180" y2="82" stroke="none"/>
  <rect x="168" y="50" width="24" height="30" rx="4" fill="#E8F1FF" stroke="#1F5FBF" stroke-width="1.5"/>
  <text x="180" y="69" text-anchor="middle" font-size="9" font-weight="700" fill="#1F5F
