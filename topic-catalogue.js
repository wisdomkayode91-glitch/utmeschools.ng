/* ============================================================
   UTMESchools — topic-catalogue.js
   The APPROVED topic and subtopic list (draft v0.2).
   This is the single list used by:
     • the AI Explanation Generator (it classifies questions with it)
     • the app's topic / subtopic picker
   Both must always use the same version of this list.
   Each line below is  [Topic, [Subtopic, Subtopic, ...]].
   IDs are created automatically from the names, e.g.
   bio_nutrition_vitamins_and_mineral_salts. DO NOT rename an
   existing topic after questions are classified — add new ones.
   ============================================================ */
window.TopicCatalogue = (function () {
const CATALOGUE_VERSION = 'draft-0.2';
const CATALOGUE = {
  'english': { prefix: 'eng', topics: [
    ['Comprehension and Summary', ['Reading comprehension','Vocabulary in context','Inference and tone','Summary and main idea','Cloze test passages']],
    ['Lexis and Structure', ['Synonyms','Antonyms','Idioms and expressions','Phrasal verbs','Words in context','Collocations and register','Figures of speech','Homonyms and homophones']],
    ['Grammar', ['Nouns and pronouns','Verbs and tenses','Subject-verb agreement (concord)','Adjectives and adverbs','Prepositions and conjunctions','Articles and determiners','Reported speech','Sentence types and clauses','Question tags','Word classes and functions']],
    ['Mechanics of Writing', ['Punctuation and capitalisation','Spelling and word formation']],
    ['Oral English — Vowels', ['Monophthongs','Diphthongs']],
    ['Oral English — Consonants', ['Consonant sounds','Consonant clusters']],
    ['Rhymes, Stress and Intonation', ['Rhymes and homophones','Word stress','Emphatic stress','Intonation patterns']]
  ]},
  'lekki-headmaster': { prefix: 'lek', topics: [
    ['Plot and Setting', ['Plot summary','Setting and background','Key events']],
    ['Characters', ['Main characters','Supporting characters','Character relationships and development']],
    ['Themes and Messages', ['Major themes','Moral lessons','Social issues']],
    ['Style and Language', ['Narrative technique','Literary devices','Tone and mood']]
  ]},
  'english-literature': { prefix: 'lit', topics: [
    ['Drama — Types', ['Tragedy','Comedy','Tragicomedy','Melodrama','Farce','Opera']],
    ['Drama — Techniques and Interpretation', ['Characterisation','Dialogue','Soliloquy and aside','Plot and structure','Theme','Setting','Costume and décor','Music and dance']],
    ['Prose — Types', ['Fiction (novel, novella, short story)','Non-fiction (biography, autobiography)','Faction']],
    ['Prose — Narrative Techniques and Textual Analysis', ['Point of view','Characterisation (round, flat, foil)','Theme','Plot','Setting (temporal and spatial)','Socio-political context']],
    ['Poetry — Types', ['Sonnet','Ode','Lyric','Elegy','Ballad','Epic','Blank verse','Panegyric']],
    ['Poetry — Devices and Appreciation', ['Imagery','Sound devices (alliteration, assonance, rhyme)','Diction','Persona','Thematic preoccupation','Structure']],
    ['General Literary Principles', ['Literary terms (foreshadowing, symbolism, protagonist, antagonist)','Principles (imitation, versification, narration)','Figures of speech','Satire and stream of consciousness']],
    ['Literary Appreciation', ['Unseen drama extracts','Unseen prose extracts','Unseen poetry extracts']]
  ]},
'mathematics': { prefix: 'mat', topics: [
  ['Number Bases and Modular Arithmetic', ['Operations in bases 2–10','Conversion between bases (including fractional parts)','Modular arithmetic']],
  ['Fractions, Decimals, Approximations and Percentages', ['Fractions and decimals','Significant figures and decimal places','Percentage errors','Simple interest','Profit and loss percent','Ratio, proportion and rate','Shares and VAT']],
  ['Indices, Logarithms and Surds', ['Laws of indices','Equations involving indices','Standard form','Laws of logarithms','Change of base','Relationship between indices and logarithms','Surds']],
  ['Sets', ['Types of sets','Algebra of sets','Venn diagrams and applications']],
  ['Polynomials', ['Change of subject of formula','Addition, subtraction, multiplication and division','Factorisation (degree ≤ 3)','Roots of polynomials','Factor and remainder theorems','Simultaneous equations (one linear, one quadratic)','Graphs of polynomials']],
  ['Variation', ['Direct variation','Inverse variation','Joint variation','Partial variation','Percentage increase and decrease']],
  ['Inequalities', ['Analytical solutions of linear inequalities','Graphical solutions of linear inequalities','Quadratic inequalities with integral roots']],
  ['Progression', ['Nth term of a progression','Sum of arithmetic progression','Sum of geometric progression']],
  ['Binary Operations', ['Closure and commutativity','Associativity and distributivity','Identity and inverse elements']],
  ['Matrices and Determinants', ['Algebra of matrices (≤ 3×3)','Determinants (≤ 3×3)','Inverses of 2×2 matrices']],
  ['Euclidean Geometry', ['Angles and lines','Polygons (triangles, quadrilaterals, general)','Circles (angle properties, cyclic quadrilaterals, intersecting chords)','Constructions']],
  ['Mensuration', ['Lengths and areas of plane figures','Arcs and chords of a circle','Perimeters and areas of sectors and segments','Surface areas and volumes of solids','Earth as a sphere (longitudes and latitudes)']],
  ['Loci', ['Locus in 2 dimensions based on geometric principles']],
  ['Coordinate Geometry', ['Midpoint and gradient','Distance between two points','Parallel and perpendicular lines','Equations of straight lines']],
  ['Trigonometry', ['Trigonometrical ratios','Angles of elevation and depression','Bearings','Areas and solutions of triangles','Graphs of sine and cosine','Sine and cosine formulae']],
  ['Differentiation', ['Limit of a function','Differentiation of algebraic functions','Differentiation of simple trigonometrical functions']],
  ['Application of Differentiation', ['Rate of change','Maxima and minima']],
  ['Integration', ['Integration of algebraic functions','Integration of simple trigonometrical functions','Area under the curve']],
  ['Representation of Data', ['Frequency distribution','Histogram','Bar chart','Pie chart']],
  ['Measures of Location', ['Mean (grouped and ungrouped)','Mode (grouped and ungrouped)','Median (grouped and ungrouped)','Cumulative frequency']],
  ['Measures of Dispersion', ['Range','Mean deviation','Variance','Standard deviation']],
  ['Permutation and Combination', ['Permutation','Combination']],
  ['Probability', ['Probability of events','Addition and multiplication rules','Conditional probability']]
]},
'physics': { prefix: 'phy', topics: [
  ['Measurements and Units', ['Fundamental and derived quantities','Dimensions','Accuracy and errors','Significant figures','Measuring instruments (metre rule, vernier calipers, micrometer screw gauge, measuring cylinder)']],
  ['Scalars and Vectors', ['Definitions and examples','Relative velocity','Resolution of vectors','Addition of vectors']],
  ['Motion', ['Types of motion','Linear motion (speed, velocity, acceleration)','Equations of motion','Motion under gravity','Distance-time and velocity-time graphs','Projectiles','Newton\'s laws of motion','Momentum and impulse','Circular motion','Simple harmonic motion']],
  ['Gravitation', ['Gravitational field','Newton\'s law of universal gravitation','Variation of g']],
  ['Equilibrium of Forces', ['Moments','Centre of gravity','Stability']],
  ['Work, Energy and Power', ['Work-energy principle','Conservation of mechanical energy','Power']],
  ['Friction', ['Laws of friction','Applications of friction']],
  ['Simple Machines', ['Mechanical advantage','Velocity ratio','Efficiency','Types of machines (lever, pulley, inclined plane)']],
  ['Elasticity', ['Hooke\'s law','Young\'s modulus','Elastic potential energy']],
  ['Pressure in Fluids', ['Pressure in liquids','Pascal\'s principle','Archimedes\' principle','Flotation']],
  ['Liquids at Rest', ['Density','Relative density','Upthrust']],
  ['Temperature and Its Measurement', ['Thermometers','Temperature scales (Celsius, Kelvin, Fahrenheit)']],
  ['Thermal Expansion', ['Expansion of solids','Expansion of liquids','Anomalous expansion of water']],
  ['Gas Laws', ['Boyle\'s law','Charles\' law','Graham\'s law','Dalton\'s law','Combined gas law','Ideal gas equation']],
  ['Quantity of Heat', ['Specific heat capacity','Heat capacity','Calorimetry']],
  ['Change of State', ['Latent heat of fusion','Latent heat of vaporisation','Melting and boiling','Evaporation']],
  ['Vapours', ['Saturated vapour pressure','Humidity','Dew point']],
  ['Structure of Matter and Kinetic Theory', ['Molecular motion','Brownian movement','States of matter']],
  ['Heat Transfer', ['Conduction','Convection','Radiation','Applications of heat transfer']],
  ['Waves', ['Wave properties (amplitude, frequency, wavelength, period)','Transverse and longitudinal waves','Reflection, refraction, diffraction, interference','Stationary waves']],
  ['Sound', ['Propagation of sound','Pitch, loudness and quality','Resonance','Echoes','Applications of sound']],
  ['Light Energy', ['Rectilinear propagation','Shadows and eclipses']],
  ['Reflection of Light', ['Laws of reflection','Plane mirrors','Curved mirrors','Ray diagrams']],
  ['Curved Mirrors', ['Mirror formula','Magnification']],
  ['Refraction of Light', ['Laws of refraction','Refractive index','Total internal reflection','Prisms']],
  ['Optical Instruments', ['Lenses (converging and diverging)','Lens formula','Magnification','The eye','Cameras','Microscopes','Telescopes']],
  ['Dispersion and Colours', ['Prism and spectrum','Colour mixing','Electromagnetic spectrum']],
  ['Electrostatics', ['Electric charge','Coulomb\'s law','Electric field','Electric potential','Capacitance']],
  ['Capacitors', ['Capacitance','Series and parallel combinations','Energy stored in a capacitor']],
  ['Electric Cells', ['Electromotive force (e.m.f.)','Internal resistance','Cells in series and parallel']],
  ['Current Electricity', ['Ohm\'s law','Resistivity','Resistor combinations','Kirchhoff\'s laws','Measuring instruments (ammeter, voltmeter, galvanometer)']],
  ['Electrical Energy and Power', ['Electrical energy','Electrical power','Household electricity','Cost of energy']],
  ['Magnets and Magnetic Fields', ['Magnetic poles','Magnetic field patterns','Magnetic materials']],
  ['Force on Current-Carrying Conductors', ['Fleming\'s left-hand rule','Electric motors','Moving-coil galvanometer']],
  ['Electromagnetic Induction', ['Faraday\'s law','Lenz\'s law','Electric generators','Transformers']],
  ['Alternating Current Circuits', ['AC quantities (peak, r.m.s., average)','AC circuits with R, L, C']],
  ['Conduction through Liquids and Gases', ['Electrolysis','Ionisation of gases','Discharge tubes']],
  ['Elementary Modern Physics', ['Atomic structure','Radioactivity','Nuclear reactions (fission and fusion)','Photoelectric effect','Wave-particle duality']],
  ['Introductory Electronics', ['Semiconductors','Diodes','Transistors','Rectification']]
]},'chemistry': { prefix: 'chm', topics: [
  ['Separation of Mixtures and Purification', ['Pure and impure substances','Boiling and melting points','Elements, compounds and mixtures','Chemical and physical changes','Evaporation','Simple and fractional distillation','Sublimation','Filtration','Crystallisation','Paper and column chromatography','Magnetisation and decantation']],
  ['Chemical Combination', ['Stoichiometry','Law of definite proportions','Law of multiple proportions','Law of conservation of matter','Gay-Lussac\'s law','Avogadro\'s law','Chemical symbols, formulae and equations','Relative atomic mass (¹²C = 12)','Mole concept','Avogadro\'s number']],
  ['Kinetic Theory and Gas Laws', ['Kinetic theory of matter','Melting and vaporisation','Brownian movement','Boyle\'s law','Charles\' law','Graham\'s law','Dalton\'s law','Combined gas law','Molar volume of gases','Atomicity of gases','Ideal gas equation (PV = nRT)','Vapour density and relative molecular mass']],
  ['Atomic Structure and Bonding', ['Atoms, molecules and ions','Dalton, Millikan, Rutherford, Moseley, Thompson, Bohr models','Atomic structure and electron configuration','Atomic number and mass number','Isotopes (Z = 1–20)','Shapes of s and p orbitals','Periodic table and periodicity','Alkali metals, halogens, noble gases, transition metals','Ionisation energy, ionic radii, electron affinity, electronegativity','Electrovalency and covalency','Hydrogen bonding','Metallic bonding','Coordinate bonds','Van der Waals\' forces','Shapes of simple molecules (linear, non-linear, tetrahedral, pyramidal)','Nuclear chemistry (radioactivity, nuclear reactions)']],
  ['Air', ['Natural gaseous constituents (N₂, O₂, water vapour, CO₂, noble gases)','Proportion of oxygen in air','Air as a mixture','Uses of noble gases']],
  ['Water', ['Composition of water by volume','Water as a solvent','Atmospheric water','Hardness of water','Purification of water']],
  ['Solubility', ['Types of solutions (true, false, suspensions, colloids)','Factors affecting solubility','Solubility curves']],
  ['Environmental Pollution', ['Air pollution','Water pollution','Soil pollution','Causes, effects and control']],
  ['Acids, Bases and Salts', ['Definitions (Arrhenius, Bronsted-Lowry, Lewis)','pH and indicators','Titration','Salt preparation','Hydrolysis of salts']],
  ['Oxidation and Reduction', ['Definitions (electron transfer, oxidation number)','Oxidising and reducing agents','Redox reactions']],
  ['Electrolysis', ['Electrolytes and non-electrolytes','Preferential discharge','Faraday\'s laws of electrolysis','Applications (electroplating, purification of metals)']],
  ['Energy Changes', ['Enthalpy','Exothermic and endothermic reactions','Hess\'s law']],
  ['Rates of Reaction', ['Factors affecting reaction rates','Collision theory','Catalysts']],
  ['Chemical Equilibrium', ['Reversible reactions','Le Chatelier\'s principle','Equilibrium constant']],
  ['Hydrocarbons', ['Alkanes','Alkenes','Alkynes','Isomerism','IUPAC nomenclature','Reactions of hydrocarbons']],
  ['Alkanols, Alkanoic Acids and Esters', ['Preparation and properties of alkanols','Preparation and properties of alkanoic acids','Esters and esterification','Uses of alkanols and alkanoic acids']],
  ['Polymers', ['Natural polymers','Synthetic polymers','Addition polymerisation','Condensation polymerisation','Plastics and rubber']],
  ['Metals and Non-metals', ['Extraction of metals','Properties of metals','Alloys','Reactivity series','Properties of non-metals']]
]},
'biology': { prefix: 'bio', topics: [
  ['Living Organisms', ['Characteristics of living things','Cell structure and functions','Levels of organisation (cell, tissue, organ, system, organism)']],
  ['Evolution among Organisms', ['Monera (prokaryotes)','Protista','Fungi','Plantae (Thallophyta, Bryophyta, Pteridophyta, Spermatophyta)','Animalia (invertebrates and vertebrates)']],
  ['Structural, Functional and Behavioural Adaptations', ['Adaptive colouration','Social insects','Environmental adaptation']],
  ['Internal Structure of Flowering Plants', ['Root','Stem','Leaf','Internal structure of a mammal']],
  ['Nutrition', ['Autotrophic nutrition','Photosynthesis','Mineral requirements in plants','Heterotrophic nutrition','Classes of food','Food tests','Mammalian tooth','Alimentary canal and digestion','Absorption and assimilation']],
  ['Transport', ['Need for transport','Materials transported','Mammalian circulatory system','Plant vascular system','Media and mechanisms of transport']],
  ['Respiration', ['Respiratory organs and surfaces','Gaseous exchange in plants','Gaseous exchange in mammals','Aerobic respiration','Anaerobic respiration']],
  ['Excretion', ['Excretory organs and products','Mammalian kidney','Osmoregulation']],
  ['Support and Movement', ['Skeletal systems','Muscles','Movement in plants','Movement in animals']],
  ['Reproduction', ['Asexual reproduction','Sexual reproduction','Reproductive organs','Fertilisation','Development','Birth control']],
  ['Growth', ['Growth patterns','Measurement of growth','Growth curves']],
  ['Coordination and Control', ['Nervous system','Sense organs','Endocrine glands and hormones','Tropisms']],
  ['Distribution Factors', ['Abiotic factors','Biotic factors','Ecological distribution']],
  ['Symbiosis', ['Parasitism','Commensalism','Mutualism']],
  ['Natural Habitats', ['Aquatic habitats','Terrestrial habitats','Arboreal habitats','Adaptations to habitats']],
  ['Soil Ecology', ['Soil types','Soil organisms','Soil fertility']],
  ['Interdependence', ['Food chains','Food webs','Energy flow','Nutrient cycling']],
  ['Pollution', ['Causes of pollution','Effects of pollution','Control of pollution']],
  ['Conservation', ['Conservation of natural resources','Deforestation','Endangered species']],
  ['Variation in Populations', ['Continuous variation','Discontinuous variation','Causes of variation']],
  ['Inheritance and Genetics', ['Mendel\'s laws','Monohybrid crosses','Dihybrid crosses','Sex determination','Genetic disorders']],
  ['Organic Evolution', ['Darwin\'s theory','Lamarck\'s theory','Evidence for evolution']],
  ['Ecology of Populations', ['Population characteristics','Population growth','Population regulation']],
  ['Applied Ecology', ['Agriculture','Pest control','Environmental management']]
]},'economics': { prefix: 'eco', topics: [
  ['Economics as a Science', ['Basic concepts (wants, scarcity, choice, opportunity cost)','Scale of preference','Rationality','Production, distribution and consumption','Economic problems (what, how, for whom to produce)']],
  ['Economic Systems', ['Free enterprise economy','Centrally planned economy','Mixed economy','Solutions to economic problems','Contemporary issues (reforms, deregulation)']],
  ['Methods and Tools of Economic Analysis', ['Scientific approach (inductive, deductive, positive, normative)','Tables, charts and graphs','Measures of central tendency (mean, median, mode)','Measures of dispersion (variance, standard deviation, range)']],
  ['Theory of Demand', ['Meaning and determinants of demand','Demand schedules and curves','Change in quantity demanded vs. change in demand','Types of demand (composite, derived, competitive, joint)','Elasticity of demand','Determinants of elasticity','Measurement of elasticity','Applications of elasticity']],
  ['Theory of Consumer Behaviour', ['Utility (cardinal, ordinal, marginal)','Value in use vs. value in exchange','Indifference curves and budget lines','Diminishing marginal utility','Consumer equilibrium','Consumer surplus']],
  ['Theory of Supply', ['Meaning and determinants of supply','Supply schedules and curves','Change in quantity supplied vs. change in supply','Types of supply (joint, competitive, composite)','Elasticity of supply']],
  ['Theory of Price Determination', ['Market and price concepts','Functions of the price system','Price determination in a free market','Price legislation','Effects of supply and demand changes on equilibrium']],
  ['Theory of Production', ['Total, average and marginal product','Law of variable proportion','Scale of production (internal and external economies)','Production functions and returns to scale','Producers\' equilibrium (isoquant-isocost, marginal analysis)']],
  ['Theory of Costs', ['Fixed, variable, average and marginal costs','Accountants\' vs. economists\' notions of cost','Short-run and long-run costs','Marginal cost and the supply curve']],
  ['Market Structure', ['Perfect competition (assumptions, equilibrium)','Pure monopoly','Discriminatory monopoly','Monopolistic competition','Break-even and shutdown analysis']],
  ['National Income', ['Concepts (GNP, GDP, NI)','Measurement of national income','Circular flow of income','Uses and limitations of national income']],
  ['Money and Banking', ['Money (functions, types, demand and supply)','Commercial banks','Central bank','Credit creation','Monetary policy']],
  ['Public Finance', ['Government revenue','Government expenditure','Taxation (types, principles, incidence)','Budget','Public debt']],
  ['International Trade', ['Reasons for trade','Balance of trade','Balance of payments','Terms of trade','Tariffs and trade restrictions','Economic integration']],
  ['Development Economics', ['Concepts of development and underdevelopment','Indicators of development','Obstacles to development','Strategies for development']],
  ['Population', ['Census','Population growth','Population structure','Malthusian theory','Population policy']],
  ['Unemployment', ['Types of unemployment','Causes of unemployment','Effects of unemployment','Remedies for unemployment']],
  ['Inflation', ['Types of inflation','Causes of inflation','Effects of inflation','Control of inflation']],
  ['Agriculture', ['Role of agriculture','Problems of agriculture','Agricultural policies']],
  ['Industry', ['Types of industry','Location factors','Role of industry','Problems of industry']],
  ['Labour', ['Labour force','Labour efficiency','Labour mobility','Trade unions']],
  ['Economic Planning', ['Objectives of planning','Types of planning','Problems of planning']],
  ['International Economic Organisations', ['ECOWAS','African Union (AU)','OPEC','IMF','World Bank','WTO']]
]},
'government': { prefix: 'gov', topics: [
  ['Basic Concepts in Government', ['Power','Authority','Legitimacy','Sovereignty','Society, state, nation and nation-state','Political processes and political socialisation']],
  ['Forms of Government', ['Monarchy','Aristocracy','Oligarchy','Autocracy','Republicanism','Democracy (features, merits, demerits)']],
  ['Arms of Government', ['Legislature','Executive','Judiciary']],
  ['Structures of Governance', ['Unitary system','Federal system','Confederal system']],
  ['Systems of Governance', ['Presidential system','Parliamentary system','Monarchical system','Hybrid system']],
  ['Political Ideologies', ['Capitalism','Socialism','Communism','Fascism','Feudalism']],
  ['Constitution', ['Types (written/unwritten, rigid/flexible)','Functions of a constitution','Constitutionalism']],
  ['Principles of Democratic Government', ['Rule of law','Separation of powers','Checks and balances']],
  ['Citizenship', ['Acquisition of citizenship','Rights and duties of citizens','Denationalisation']],
  ['Electoral Process', ['Franchise','Electoral systems','Free and fair elections','Electoral malpractice','Electoral bodies']],
  ['Political Parties and Party Systems', ['Types of political parties','Functions of political parties','Party systems']],
  ['Pressure Groups', ['Types of pressure groups','Methods of pressure groups','Roles of pressure groups']],
  ['Public Opinion', ['Formation of public opinion','Measurement of public opinion','Role of public opinion']],
  ['Civil Service', ['Structure of the civil service','Functions of the civil service','Control of the civil service','Reforms in the civil service']],
  ['Pre-colonial Polities', ['Hausa/Fulani political system','Yoruba political system','Igbo political system']],
  ['Imperialist Penetration', ['Colonial rule','Direct and indirect rule','Impact of colonialism']],
  ['Decolonisation', ['Nationalist movements','Constitutional conferences']],
  ['Constitutional Development in Nigeria', ['1922 Constitution','1946 Constitution','1951 Constitution','1954 Constitution','1960 Constitution']],
  ['Post-independence Constitutions', ['1963 Constitution','1979 Constitution','1999 Constitution']],
  ['Institutions of Government after Independence', ['Executive','Legislature','Judiciary']],
  ['Public Commissions', ['Federal Character Commission','Civil Service Commission','Electoral Commission','Other public commissions']],
  ['Party Politics in Nigeria', ['First Republic','Second Republic','Third Republic','Fourth Republic']],
  ['Military Rule', ['Causes of military intervention','Features of military rule','Impact of military rule']],
  ['Federalism in Nigeria', ['Structure of Nigerian federalism','Problems of Nigerian federalism','Revenue allocation']],
  ['Local Government', ['Structure of local government','Functions of local government','Reforms in local government']],
  ['Foreign Policy', ['Objectives of foreign policy','Determinants of foreign policy','Instruments of foreign policy','Nigeria\'s relations with major powers']],
  ['International Relations', ['Concepts in international relations','Approaches to international relations']],
  ['International Organisations', ['United Nations (UN)','African Union (AU)','ECOWAS','OPEC','Commonwealth of Nations']],
  ['Public Administration', ['Meaning and principles of public administration','Accountability in public administration','Bureaucracy','Public corporations']],
  ['Nigerian Political History', ['Nationalism','Federalism','Military intervention']],
  ['Nigerian Government and Institutions', ['Presidency','National Assembly','Judiciary']],
  ['International Relations and Organisations', ['Nigeria\'s role in international organisations']],
  ['Public Administration (Advanced)', ['Civil service','Public corporations','Bureaucracy']]
]},'commerce': { prefix: 'com', topics: [
  ['Introduction to Commerce', ['Meaning, scope and functions of commerce','Characteristics of commerce','Relationship between commerce and production','E-commerce and e-business']],
  ['Occupation', ['Industrial occupation','Commercial occupation','Direct-service occupation','Factors affecting choice of occupation']],
  ['Production', ['Factors of production','Divisions of production','Types of production (primary, secondary, tertiary)','Stages of production','Specialisation and exchange','Productivity']],
  ['Trade', ['Home trade — retailing','Home trade — wholesaling','Foreign trade — importing','Foreign trade — exporting','Entrepot trade','Trade documents (enquiry, quotation, order, invoice, delivery note, statement of account, debit/credit note, receipt)','Foreign trade documents (indent, bill of lading, certificate of origin, consular invoice, letter of credit, customs documents)']],
  ['Purchase and Sale of Goods', ['Enquiry to payment procedures','Trade terms','Pricing','Discounts','Credit','Hire purchase and instalment payment']],
  ['Aids to Trade', ['Advertising','Banking','Communication','Insurance','Tourism','Transportation','Warehousing']],
  ['Business Units', ['Sole trader (formation, finance, control, merits, limitations)','Partnership (formation, finance, control, merits, limitations)','Companies (formation, finance, control, merits, limitations)','Cooperatives','Public enterprises']],
  ['Financing Business', ['Short-term finance','Medium-term finance','Long-term finance','Internal and external sources of finance','Factors affecting choice of finance']],
  ['Trade Associations', ['Chambers of commerce','Trade and professional associations','Consumer associations','Functions of trade associations']],
  ['Money', ['Evolution of money','Forms of money','Characteristics of money','Functions of money','Value of money']],
  ['Stock Exchange', ['Meaning and functions of the stock exchange','Securities traded','Participants in the stock exchange','Procedures and benefits','Stock exchange terminology']],
  ['Elements of Business Management', ['Planning','Organising','Staffing','Directing','Coordinating','Controlling','Communication']],
  ['Elements of Marketing', ['Meaning and functions of marketing','Marketing concept and marketing mix (4Ps)','Market segmentation','Market research','Product life cycle']],
  ['Legal Aspects of Business', ['Contract','Agency','Sale of goods','Hire purchase','Employment','Government regulation']],
  ['Commodity Exchange', ['Meaning and objectives','Functions and procedures','Commodities traded','Benefits and limitations']],
  ['Business Environment and Social Responsibility', ['Legal environment','Political environment','Economic environment','Social and cultural environment','Technological environment','Competitive forces','Duties to stakeholders (corporate social responsibility)']]
]},
'accounting': { prefix: 'acc', topics: [
  ['Nature and Significance of Accounting', ['Development of accounting (including branches of accounting)','Objectives of bookkeeping and accounting','Principles, concepts and conventions of accounting','Role of accounting records and information','Users of accounting information']],
  ['Principles of Double Entry', ['Functions of source documents','Books of original entry','Accounting equation','The ledger and its classifications','Trial balance','Types and treatment of errors and use of suspense account']],
  ['Ethics, Professional and Regulatory Bodies', ['Ethical principles in accounting','Professional misconduct','ICAN and ANAN','IFRS-related regulation','Responsibilities of professional bodies']],
  ['Cash Book', ['Petty cash book and the imprest system','Columnar cash books (single, double, three-column)','Discounts (trade and cash discounts)']],
  ['Bank Transactions and Reconciliation Statements', ['Instruments of bank transactions','e-banking system','Causes of discrepancies between cash book and bank statement','Bank reconciliation statement','Adjusted cash book']],
  ['Final Accounts of a Sole Trader', ['Trading and profit and loss account','Balance sheet (statement of financial position)','Adjustments: provision for bad and doubtful debts','Adjustments: provision for discounts','Adjustments: provision for depreciation (straight line and reducing balance methods)','Adjustments: accruals and prepayments','Adjustments: drawings']],
  ['Stock Valuation', ['Methods of cost determination (FIFO, LIFO, simple average)','Advantages and disadvantages of stock valuation methods','Importance of stock valuation','Effect of stock valuation on profit']],
  ['Control Accounts and Self-Balancing Ledgers', ['Uses of control accounts','Purchases ledger control account','Sales ledger control account']],
  ['Incomplete Records and Single Entry', ['Conversion of single entry to double entry','Determination of missing figures','Preparation of final accounts from incomplete records','Statement of affairs and capital comparison']],
  ['Manufacturing Accounts', ['Cost classification','Cost apportionment','Preparation of manufacturing account','Prime cost, factory overhead, work in progress and cost of production']],
  ['Accounts of Not-For-Profit-Making Organisations', ['Objectives of not-for-profit-making organisations','Receipts and payments account','Income and expenditure account','Balance sheet','Subscriptions and accumulated fund']],
  ['Departmental Accounts', ['Objectives of departmental accounts','Apportionment of expenses','Departmental trading and profit and loss account','Interdepartmental transfers']],
  ['Branch Accounts', ['Objectives of branch accounts','Branch accounts in the head office books','Head office account','Reconciliation of branch and head office books','Stock and debtors systems']],
  ['Partnership Accounts', ['Formation of partnership','Profit and loss account','Appropriation account','Partners\' current and capital accounts','Treatment of goodwill','Admission and retirement of a partner','Dissolution of partnership','Conversion of a partnership to a company']],
  ['Introduction to Company Accounts', ['Formation and classification of companies','Issue of shares and debentures','Forms of final accounts of companies','Interpretation of accounts using ratios','Distinction between capital and revenue reserves']],
  ['Public Sector Accounting', ['Comparison of cash and accrual basis of accounting','Sources of government revenue','Capital and recurrent expenditure','Consolidated revenue fund','Statement of assets and liabilities','Responsibilities and powers of the Accountant General, Auditor General, Minister of Finance and Treasurer of local government','Instruments of financial regulation']],
  ['Joint Venture Accounts', ['Meaning and features of joint venture','Entries in co-venturers\' books','Memorandum joint venture account']],
  ['Information Technology in Accounting', ['Accounting packages','Spreadsheets and databases in accounting','Controls, benefits and risks of IT in accounting']]
]},  'crk': { prefix: 'crk', topics: [
    ['The Sovereignty of God', ['God as Creator and Controller of the universe (Gen. 1–2; Amos 9:5–6; Isa. 45:5–12; Ps. 19:1–6)']],
    ['The Covenant', ['The flood and God\'s covenant with Noah (Gen. 6–9)','God\'s covenant with Abraham (Gen. 11:31–32; 12:1–9; 17; 21:1–13; 25:19–26)','God\'s covenant with Israel (Exod. 19–20; 24:1–11; Deut. 28:1–19)','The New Covenant (Jer. 31:31–34; Ezek. 36:25–28)']],
    ['Leadership Qualities', ['Joseph (Gen. 37; 41; 45)','Moses (Exod. 1–5; 12; Num. 13–14)','Joshua (Num. 13; 27:15–23; Josh. 1; 6–7; 24)','Deborah (Judg. 4)','Gideon (Judg. 6)','Samson (Judg. 13; 16)']],
    ['Divine Providence, Guidance and Protection', ['Guidance and protection (Gen. 24; 28; 46; Exod. 13–14)','Provision (Gen. 21; 22; Exod. 16–17; Num. 20; 1 Kgs. 17)']],
    ['Parental Responsibility', ['Eli and Samuel (1 Sam. 2–4; 8)','David (2 Sam. 13; 15; 18–19)','Asa (1 Kgs. 15; 22; Deut. 6:4–9; Prov. 22:6)']],
    ['Obedience and Disobedience', ['Obedience and rewards — Abraham (Gen. 22)','Obedience and rewards — Hebrew midwives (Exod. 1)','Obedience and rewards — David (1 Sam. 30)','Disobedience and consequences — Adam (Gen. 2–3)','Disobedience and consequences — Manna (Exod. 16)','Disobedience and consequences — Golden Calf (Exod. 32)','Disobedience and consequences — Moses (Num. 20; Deut. 34)','Disobedience and consequences — Saul (1 Sam. 10; 15; 31)']],
    ['A Man after God\'s Own Heart', ['Early life of David (1 Sam. 16–24; 2 Sam. 2–3)','Submission to God\'s will (1 Sam. 26; 2 Sam. 12)','Repentance and forgiveness (2 Sam. 11–12; Ps. 51)']],
    ['Decision-Making', ['Reliance on a medium (1 Sam. 28)','Wisdom of Solomon (1 Kgs. 3–5; 8)','Unwise policies of Solomon and Rehoboam (1 Kgs. 9; 11–12)']],
    ['Greed and Its Effects', ['Ahab (1 Kgs. 21–22; 2 Kgs. 9)','Gehazi (2 Kgs. 5; Josh. 7)']],
    ['Supremacy of God', ['Mount Carmel encounter (1 Kgs. 16–19)']],
    ['Religious Reforms in Judah', ['Cleansing of the Temple (2 Kgs. 22)','Renewal of the Covenant (2 Kgs. 23)']],
    ['Concern for Judah', ['Fall of Jerusalem (2 Kgs. 24–25)','Condition during exile (Neh. 1; Ezra 1)','Response to rebuilding (Neh. 2; 4; Ezra 3; 5–7)']],
    ['Faith, Courage and Protection', ['Daniel and the three Hebrews (Dan. 1; 3; 6)']],
    ['God\'s Message to Nineveh', ['Jonah\'s mission (Jonah 1–4)']],
    ['Social Justice, True Religion and Divine Love', ['Social justice (Amos 2–8; James 1:19–27)','Divine love (Hosea 1–6; 14)']],
    ['Holiness and Divine Call', ['Call of Isaiah (Isa. 6)','Call of Ezekiel (Ezek. 2–3)','Call of Jeremiah (Jer. 1)']],
    ['Punishment and Hope', ['Punishment and restoration (Jer. 3; 32; Ezek. 18; 37; Isa. 61)']],
    ['Birth and Early Life of Jesus', ['John the Baptist (Luke 1; 3; Mark 1; John 1)','Birth and boyhood of Jesus (Matt. 1–2; Luke 1–2)']],
    ['Baptism and Temptation of Jesus', ['Baptism (Matt. 3; Mark 1; Luke 3)','Temptation (Matt. 4; Luke 4)']],
    ['Teachings of Jesus', ['Sermon on the Mount (Matt. 5–7)','Parables (Luke 15; etc.)','Miracles']],
    ['Passion, Death and Resurrection', ['Passion (Matt. 26–27; Mark 14–15; Luke 22–23; John 18–19)','Death and resurrection (Matt. 27–28; Mark 15–16; Luke 23–24; John 19–21)']],
    ['The Early Church', ['Pentecost (Acts 2)','Fellowship (Acts 2:42–47; 4:32–37)']],
    ['Missionary Journeys', ['Paul\'s missionary journeys (Acts 13–28)']],
    ['Justification by Faith', ['Romans 3–5; Galatians 2–3']],
    ['Life in the Spirit', ['Romans 8; Galatians 5']],
    ['Christian Living', ['Romans 12–15; Ephesians 4–6; Colossians 3']],
    ['Church Order', ['1 Corinthians 11–14; 1 Timothy 3; Titus 1']],
    ['Love', ['1 Corinthians 13; 1 John 4']],
    ['Giving', ['2 Corinthians 8–9']],
    ['Resurrection', ['1 Corinthians 15']],
    ['Final Judgement', ['2 Thessalonians 1; Revelation 20']]
  ]},
  'computer-studies': { prefix: 'cmp', topics: [
    ['Evolution of Computing', ['History of computing (early aids, mechanical, electromechanical, electronic devices, generations)','Classification of computing devices (by size, purpose, data handling)']],
    ['Fundamentals of Computing', ['Overview of computing systems (hardware, software, peopleware, CPU, memory, peripherals)','Data and information (data representation, information quality)']],
    ['Computer Hardware', ['Input devices','Output devices','Storage devices','Processing devices']],
    ['Computer Software', ['System software (operating systems, utilities)','Application software','Programming languages and translators']],
    ['Basic Computer Operations', ['Booting and shutting down','File operations','Keyboard shortcuts']],
    ['Computer Application Packages', ['Word processing (features, file types, operations)','Spreadsheet (formulas, functions, charts)','Database (records, fields, queries)','Graphics (design tools, file formats)','Presentation (slides, animations)','Web design (web-page creation)']],
    ['Managing Computer Files', ['Concept of computer files (names, extensions, organisation, folders, storage)','Handling computer files (creation, copying, moving, searching, deletion, recovery, backup)']],
    ['Computer Maintenance and Safety', ['Booting and shutting down procedures','Computer maintenance (preventive and corrective)','Computer room management (environment, ergonomics, safety)']],
    ['Information and Communication Technology', ['Communication systems','Application areas of ICT','Internet services','Electronic mail','Networking (types, topologies, devices)','World Wide Web','Cables and connectors']],
    ['Developing Problem-Solving Skills', ['Programming languages (levels, paradigms)','High-level languages','Algorithms and flowcharts','Programming language structure','Program development (testing, debugging, documentation)','System Development Life Cycle (SDLC)']],
    ['Artificial Intelligence and Robotics', ['Definition of AI','Branches of AI (machine learning, expert systems, NLP, vision)','Applications of AI','Fundamentals of robotics (components, sensing, control, applications)']],
    ['Computer Ethics and Human Issues', ['Ethical issues (privacy, ownership, access, misuse)','Computer security (threats, controls, malware)','Cyber risks and protection','Potentials for higher studies in computer-related areas']]
  ]},
  'arabic-studies': { prefix: 'ara', topics: [
    ['Comprehension', ['Passage comprehension (70 words, 5 questions)','Vocabulary, synonyms and antonyms','Main ideas, details and inference']],
    ['Translation', ['English to Arabic','Arabic to English','Idiomatic expressions']],
    ['Grammar — Pronouns and Nouns', ['Demonstrative, relative, conditional and interrogative pronouns','Gender (masculine and feminine)','Characteristics of nouns','Dual forms','Plurals (sound masculine, sound feminine, broken)','Construct phrase (Idafa)','Separable and inseparable pronouns','Appendants (adjective, conjunction, permutative, emphasis)','Prepositions']],
    ['Grammar — Verbs', ['Transitive and intransitive verbs','Perfect verb','Imperfect verb and moods','Imperative verb','Trilateral and derived verbs','Active and passive voice']],
    ['Grammar — Sentence Structure', ['Nominal sentences (subject and predicate)','Verbal sentences','Conditional sentence','Exception','Modifiers and adverbs']],
    ['Grammar — Morphology and Numbers', ['Verb forms and conjugation','Derived nouns','Verbal noun','Numerals 1–1000','Nouns in the accusative']],
    ['Composition', ['Guided composition','Free composition','Letters, narration, description, argument']],
    ['Arabic Literature', ['Pre-Islamic literature','Islamic literature','Umayyad literature','Abbasid literature','Modern Arabic literature','West African Arabic literature']]
  ]},
  'fine-art': { prefix: 'art', topics: [
    ['Classification of Art', ['Visual arts (fine and applied)','Performing arts (music, dance, drama)','Literary arts (poetry, prose, recitals)']],
    ['Elements and Principles of Design', ['Elements (line, colour, shape, form, texture, tone/value, space)','Principles (balance, rhythm, proportion, harmony, contrast, repetition, dominance, variety)']],
    ['Art Terms', ['Pigment, motif, greenware, armature, silhouette','Chiaroscuro, cire-perdue, terracotta']],
    ['Historical Dimensions of Art', ['Prehistoric, Greek and Roman art','Medieval art','Renaissance artists (Giotto, Michelangelo, Leonardo, Raphael)','19th–20th century movements (Impressionism, Realism, Futurism, Cubism, Bauhaus, Pop Art, Abstract Expressionism, Fauvism)']],
    ['Traditional African Art', ['Egypt, Ashanti, Dogon, Mossi, Fon','Senufo, Bambara, Mende, Kissi, Bamileke, Bakumba']],
    ['Traditional Nigerian Art', ['Nok, Igbo-Ukwu, Ife, Benin','Esie, Igala, Jukun, Akwanshi, Mbari']],
    ['Nigerian Crafts', ['Pottery, woodwork, weaving, carving','Leather, metal, beads, body decoration, mats and cane']],
    ['Contemporary Nigerian Art', ['Art schools/groups (Zaria, Nsukka, Osogbo)','Artists, educators, museums, galleries, institutions, festivals']],
    ['Artistic Skills, Techniques and Processes', ['Drawing, painting, graphics','Textile design, perspective, sculpture, ceramics','Crafts and computer graphics']],
    ['Tools, Materials and Equipment', ['2D and 3D tools','Media and equipment','Operation, maintenance and improvisation']],
    ['Art Appreciation and Functions', ['Natural and man-made aesthetic phenomena','Religious, social, cultural, political, therapeutic, economic and media roles of art']],
    ['Art Entrepreneurship and Careers', ['Ceramics, curation, textiles, industrial design','Sculpture, photography, cartoons, illustration']]
  ]},
  'yoruba': { prefix: 'yor', topics: [
    ['Comprehension (Ìgbàye)', ['Prose passages','Verse passages','Central issues, assumptions and conclusions']],
    ['Essay Writing (Àpilèkọ)', ['Types of essay','Techniques for each essay type']],
    ['Sound System (Èdè — Ìró)', ['Consonants and vowels','Tones and tone change','Syllable structure','Sound processes (co-vowel occurrence, elision, deletion)']],
    ['Grammar (Gírámà)', ['Morphology and word formation','Loan-word integration','Word classes (nouns, verbs, adjectives, adverbs, pronouns, conjunctions, prepositions)','Phrases and clauses (types and functions)','Sentences (types, structures, functions)']],
    ['Current Orthography (Ìkọ̀wé)', ['Letters, diacritical marks and punctuation','Acceptable written form']],
    ['Translation (Ìtumọ̀)', ['Interpretation of sentences and ideas']],
    ['Oral Literature (Lítírésọ̀ Alohùn)', ['Folktales (alo, aro, imo)','Proverbs (owe) and idioms','Riddles','Praise poetry (oriki)','Incantations (ofo)','Simple Ifa poetry','Songs and traditional drama']],
    ['Written Literature (Lítírésọ̀ Àpilèkọ)', ['Prose (prescribed text: Aje ile etc.)','Poetry (prescribed text)','Drama (prescribed text)','Theme, plot, characters, narrative techniques, figurative expressions']],
    ['Traditional Practices (Àṣà Ìbílẹ̀)', ['Belief in Olódùmarè, àkùdàyà, emèrè, àjẹ́, àwọn irúnmọlẹ̀','Taboos and festivals']],
    ['Social Structure (Ètò Àwùjọ)', ['Kingship and chieftaincy','Age grades','Family and marriage','Birth, naming, death and burial']],
    ['Yoruba Numerals, Games, Health, Professions and Foods', ['Counting systems','Traditional games','Traditional medicine and hygiene','Occupations (farming, weaving, carving)','Traditional cuisine']]
  ]}
};

/* ---- build codes + IDs from the catalogue ---- */
function slug(s) { return String(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }
const CAT = (function () {
  const out = {};
  Object.keys(CATALOGUE).forEach(subject => {
    const c = CATALOGUE[subject];
    const used = {};
    out[subject] = { topics: c.topics.map((t, ti) => {
      let tid = c.prefix + '_' + slug(t[0]);
      if (used[tid]) tid += '_' + (ti + 1);
      used[tid] = 1;
      const usedSub = {};
      const subs = t[1].map((s, si) => {
        let sid = tid + '_' + slug(s);
        if (usedSub[sid]) sid += '_' + (si + 1);
        usedSub[sid] = 1;
        return { code: (ti + 1) + '.' + (si + 1), id: sid, name: s };
      });
      return { code: String(ti + 1), id: tid, name: t[0], subs: subs };
    })};
  });
  return out;
})();


  return { version: CATALOGUE_VERSION, subjects: CAT };
})();