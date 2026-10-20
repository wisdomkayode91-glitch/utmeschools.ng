/* ============================================================
   UTMESchools — topic-catalogue.js — PART 1 of 4
   Subjects: English, Literature, Lekki Headmaster, Mathematics, Physics
   Load order: 1 → 2 → 3 → 4
   ============================================================ */
(function () {
  function deepMerge(target, source) {
    Object.keys(source).forEach(function (k) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        target[k] = target[k] || {};
        deepMerge(target[k], source[k]);
      } else { target[k] = source[k]; }
    });
    return target;
  }

  var PART = {
    'english': { prefix: 'eng', topics: [
      ['Comprehension and Summary', ['Descriptive passage comprehension','Narrative passage comprehension','Expository passage comprehension','Argumentative/persuasive passage comprehension','Cloze test','Vocabulary in context','Inference and logical deduction','Summary of main ideas','Synthesis of ideas across passages']],
      ['Lexis and Structure', ['Synonyms','Antonyms','Homonyms and homophones','Idioms and idiomatic expressions','Phrasal verbs','Collocations and register','Words in context','Ordinary, figurative and idiomatic usage','General vocabulary by domain (building, agriculture, health, law, government, sports, religion, science, transport)','Figures of speech']],
      ['Grammar', ['Nouns (types, number, case)','Pronouns (types, agreement, reference)','Verbs and tenses','Subject-verb agreement (concord)','Adjectives and adverbs (comparison, placement)','Prepositions and conjunctions','Articles and determiners','Reported speech','Sentence types (simple, compound, complex)','Clauses (noun, adjectival, adverbial)','Question tags and short answers','Degrees of comparison','Mood, tense, aspect, number']],
      ['Mechanics of Writing', ['Punctuation (comma, semicolon, colon, apostrophe, quotation marks)','Capitalisation rules','Spelling rules and common misspellings','Word formation (prefixes, suffixes, compounding)']],
      ['Oral Forms', ['Vowels (monophthongs and diphthongs)','Consonant sounds (including clusters)','Rhymes and homophones','Word stress (monosyllabic and polysyllabic words)','Emphatic stress','Intonation']],
      ['Essay Writing', ['Narrative essay','Descriptive essay','Argumentative/debate essay','Expository essay','Letter writing (formal and informal)','Article and speech writing','Report writing']]
    ]},
    'lekki-headmaster': { prefix: 'lek', topics: [
      ['Plot and Setting', ['Chapter-by-chapter plot summary (12 chapters)','Setting: Lekki, Lagos, and Stardom Schools',"Key events: Bepo's teaching career",'Key events: societal pressure to leave teaching','Key events: eventual recognition as a transformative educator']],
      ['Characters', ['Bepo (Mr. Adebepo): passion, dedication, integrity','Supporting characters (family, friends, colleagues, students)','Character relationships and development']],
      ['Themes', ['Passion vs. social pressure','Value of education and teachers as nation-builders','Integrity and dedication vs. moral compromise','Nigerian society and class (Lagos backdrop)','Mentorship and legacy','JAPA syndrome (emigration) vs. patriotism']],
      ['Style and Language', ['Narrative technique and point of view','Literary devices and symbolism','Tone, mood and satire','Social commentary on the Nigerian education system']]
    ]},
    'english-literature': { prefix: 'lit', topics: [
      ['Drama', ['Types of drama (tragedy, comedy, tragicomedy, melodrama, farce, opera)','Characterisation','Dialogue','Flashback','Mime','Costume','Music and dance','Décor and scenery','Acts and scenes','Soliloquy and aside','Figures of speech in drama','Theme','Plot','Socio-political context','Setting (temporal and spatial)']],
      ['Prose', ['Fiction (novel, novella, short story)','Non-fiction (biography, autobiography, memoir)','Faction','Point of view (omniscient/third person)','Point of view (first person)','Characterisation (round, flat, foil, hero, antihero)','Language','Theme','Plot','Setting (temporal and spatial)','Socio-political context']],
      ['Poetry', ['Sonnet','Ode','Lyrics','Elegy','Ballad','Panegyric','Epic','Blank verse','Structure','Imagery','Rhyme and rhythm','Repetition','Pun','Onomatopoeia','Diction','Persona','Thematic preoccupation','Socio-political relevance','Style']],
      ['General Literary Principles', ['Foreshadowing','Suspense','Theatre','Monologue','Dialogue','Soliloquy','Symbolism','Protagonist','Antagonist','Figures of speech','Satire','Stream of consciousness','Direct imitation in play','Versification in drama and poetry','Narration of experiences','Achievement of aesthetic effect']],
      ['Literary Appreciation', ['Unseen drama extracts','Unseen prose extracts','Unseen poetry extracts']]
    ]},
    'mathematics': { prefix: 'mat', topics: [
      ['Number and Numeration', ['Number bases','Operations from base 2 to 10','Conversion including fractional parts','Fractions, decimals and approximations','Significant figures and decimal places','Percentage errors','Simple interest','Profit and loss','Ratio, proportion and rate','Shares','VAT','Indices','Standard form','Logarithms','Change of base','Surds','Rationalisation of surds','Sets and types of sets','Algebra of sets','Venn diagrams (up to 3 sets)']],
      ['Algebra', ['Change of subject of formula','Factor and remainder theorems','Factorisation of polynomials up to degree 3','Multiplication and division of polynomials','Roots of polynomials','Simultaneous equations (one linear one quadratic)','Graphs of polynomials up to degree 3','Variation (direct, inverse, joint, partial)','Percentage increase and decrease','Linear inequalities (analytical and graphical)','Quadratic inequalities with integral roots','Progression (nth term of AP)','Sum of AP and GP','Sum to infinity of a GP','Binary operations (closure, commutativity, associativity, distributivity, identity, inverse)','Matrices and determinants','Functions and relations']],
      ['Geometry and Trigonometry', ['Angles','Triangles','Polygons','Circles (circle theorems)','Perimeter','Area','Volume','Surface area','Similar figures and scales','Coordinate geometry of straight line','Distance and midpoint','Gradient','Vectors in a plane (components, magnitude, direction)','Addition and subtraction of vectors','Scalar multiplication','Reflection','Rotation','Translation','Enlargement','Trigonometric ratios','Trigonometric identities','Graphs of trigonometric functions','Bearings and distances','Angles of elevation and depression','Sine and cosine rules']],
      ['Calculus', ['Limits','Differentiation rules','Gradient','Rate of change','Integration (indefinite and definite)','Application of differentiation (maximum/minimum values)','Area under a curve']],
      ['Statistics and Probability', ['Frequency tables','Bar charts','Pie charts','Histograms','Mean, median, mode','Range','Interquartile range','Variance','Standard deviation','Cumulative frequency curves','Experimental probability','Theoretical probability','Addition and multiplication rules of probability','Permutation and combination']]
    ]},
    'physics': { prefix: 'phy', topics: [
      ['Measurements and Units', ['Length, area and volume (metre rule, vernier calipers, micrometer screw gauge, measuring cylinder)','Mass (simple beam balance)','Time (time-measuring devices)','Fundamental physical quantities and their units','Derived physical quantities and their units','Dimensions and dimensional analysis','Limitations of experimental measurements (accuracy, errors, significant figures, standard form)']],
      ['Scalars and Vectors', ['Definition and examples of scalars and vectors','Relative velocity','Resolution of vectors into perpendicular directions','Graphical methods of vector addition']],
      ['Motion', ['Types of motion (translational, oscillatory, rotational, spin, random)','Relative motion','Causes of motion (force)','Types of force (contact and force field)','Linear motion (speed, velocity, acceleration)','Equations of uniformly accelerated motion','Motion under gravity','Distance-time and velocity-time graphs','Instantaneous velocity and acceleration','Projectiles (range, maximum height, time of flight)','Applications of projectiles',"Newton's laws of motion",'Inertia, mass, force','Relationship between mass and acceleration','Impulse and momentum','Force-time graph','Conservation of linear momentum','Motion in a circle (angular velocity, angular acceleration)','Centripetal and centrifugal forces','Simple Harmonic Motion (definition, examples, period, frequency, amplitude)','Simple Harmonic Motion (velocity, acceleration, energy changes)','Forced vibration and resonance']],
      ['Gravitational Field', ["Newton's law of universal gravitation",'Gravitational potential','Conservative and non-conservative fields','Acceleration due to gravity',"Variation of g on the earth's surface",'Distinction between mass and weight','Escape velocity','Parking orbit and weightlessness']],
      ['Equilibrium of Forces', ['Equilibrium of coplanar forces','Triangle and polygon of forces',"Lami's theorem",'Moment of a force','Moment of a couple','Applications of moments','Conditions for equilibrium of rigid bodies','Resolution and composition of forces','Resultant and equilibrant','Centre of gravity and stability','Stable, unstable and neutral equilibrium']],
      ['Work, Energy and Power', ['Definitions of work, energy and power','Forms of energy','Conservation of energy','Transformation between different forms of energy','Interpretation of area under force-distance curve','Energy and society (sources renewable/non-renewable)','Uses and energy diversification','Environmental impact and energy crises','Conversion devices','Dams and energy production','Nuclear energy','Solar energy (solar collector, solar panel)']],
      ['Friction', ['Static and dynamic friction','Coefficient of limiting friction and its determination','Advantages and disadvantages of friction','Reduction of friction','Viscosity and terminal velocity (qualitative treatment)',"Stoke's law"]],
      ['Simple Machines', ['Definition and types of simple machines','Mechanical advantage','Velocity ratio','Efficiency']],
      ['Elasticity', ['Elastic limit, yield point, breaking point',"Hooke's law","Young's modulus",'Spring balance as a force-measuring device','Work done per unit volume in springs and elastic strings']],
      ['Pressure', ['Atmospheric pressure (definition, SI units, measurement)','Mercury barometer','Aneroid barometer','Manometer','Variation of atmospheric pressure with height','Use as altimeter','Pressure in liquids (relationship between pressure, depth and density)',"Pascal's principle and applications"]],
      ['Liquids at Rest', ['Determination of density and relative density',"Archimedes' principle",'Law of flotation']],
      ['Temperature and Thermometers', ['Thermometric properties','Temperature scales','Types of thermometers']],
      ['Thermal Expansion', ['Expansion of solids','Expansion of liquids','Expansion of gases','Anomalous expansion of water','Applications']],
      ['Quantity of Heat', ['Heat capacity','Specific heat capacity','Latent heat of fusion','Latent heat of vaporisation','Calorimetry']],
      ['Gas Laws', ["Boyle's law","Charles' law",'Pressure law','Ideal gas equation']],
      ['Change of State', ['Melting','Boiling','Evaporation','Sublimation','Vapours and humidity']],
      ['Structure of Matter and Kinetic Theory', ['Molecular nature of matter','Brownian motion','Diffusion','Assumptions of kinetic theory']],
      ['Heat Transfer', ['Conduction','Convection','Radiation','Thermal conductivity','Greenhouse effect']],
      ['Waves', ['Production and propagation of waves','Transverse waves','Longitudinal waves','Mechanical waves','Electromagnetic waves','Wave equation','Reflection','Refraction','Diffraction','Interference','Superposition']],
      ['Propagation of Sound Waves', ['Necessity of a medium','Speed of sound','Echoes','Reverberation','Applications']],
      ['Characteristics of Sound Waves', ['Noise and musical notes','Quality','Pitch','Intensity','Loudness','Resonance in pipes and strings']],
      ['Light Energy', ['Sources of light','Propagation of light','Shadows and eclipses']],
      ['Reflection at Plane and Curved Surfaces', ['Laws of reflection','Images formed by plane mirrors','Images formed by curved mirrors','Applications']],
      ['Refraction', ['Laws of refraction','Refractive index','Total internal reflection','Converging lens','Diverging lens','Optical instruments (microscope, telescope, camera, eye)']],
      ['Dispersion and Colours', ['Prism','Dispersion of white light','Colours and colour mixing']],
      ['Electromagnetic Spectrum', ['Types of radiation','Properties and uses']],
      ['Electrostatics', ['Electric charges',"Coulomb's law",'Electric field','Capacitors and capacitance']],
      ['Electric Cells', ['Primary cells','Secondary cells','E.M.F. and internal resistance']],
      ['Current Electricity', ["Ohm's law",'Resistance and resistivity','Series circuits','Parallel circuits']],
      ['Electrical Energy and Power', ['Electrical energy','Power','Heating effects of current']],
      ['Magnets and Magnetic Fields', ['Magnetic poles and fields','Magnetic materials','Magnetic circuits']],
      ['Force on Current-Carrying Conductors', ['Magnetic force on a wire','Applications (electric motor)']],
      ['Electromagnetic Induction', ["Faraday's law","Lenz's law",'Induced E.M.F.','Applications (generator)']],
      ['Simple A.C. Circuits', ['A.C. through resistors','A.C. through capacitors','A.C. through inductors','Reactance and impedance']],
      ['Transformers', ['Principles of operation','Step-up transformer','Step-down transformer','Efficiency']],
      ['Atomic and Nuclear Physics', ['Models of the atom','Radioactivity (types, decay, half-life)','Nuclear fission','Nuclear fusion']],
      ['Photoelectric Effect', ['Photoelectric emission',"Einstein's equation",'Applications']],
      ['Semiconductors and Electronics', ['Intrinsic semiconductors','Extrinsic semiconductors','Diodes','Transistors']],
      ['Practical Physics', ["Experiments on mechanics (Hooke's law, moments)",'Experiments on optics (refraction, focal length)',"Experiments on electricity (Ohm's law, resistivity)",'Experiments on heat (specific heat capacity)','Data handling and graph plotting']]
    ]}
  };

  window.TopicCatalogue = window.TopicCatalogue || {};
  window.TopicCatalogue.version = 'draft-0.2';
  window.TopicCatalogue._raw = window.TopicCatalogue._raw || {};
  deepMerge(window.TopicCatalogue._raw, PART);
})();
/* ============================================================
   UTMESchools — topic-catalogue.js — PART 2 of 4
   Subjects: Chemistry, Biology, Economics
   Load order: 1 → 2 → 3 → 4
   ============================================================ */
(function () {
  function deepMerge(target, source) {
    Object.keys(source).forEach(function (k) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        target[k] = target[k] || {};
        deepMerge(target[k], source[k]);
      } else { target[k] = source[k]; }
    });
    return target;
  }

  var PART = {
    'chemistry': { prefix: 'chm', topics: [
      ['Separation of Mixtures and Purification', ['Pure and impure substances','Boiling/melting points as criteria for purity','Elements, compounds and mixtures','Chemical and physical changes','Evaporation','Simple and fractional distillation','Sublimation','Filtration','Crystallisation','Paper and column chromatography','Simple and fractional crystallisation','Magnetisation','Decantation']],
      ['Chemical Combination', ['Laws of definite proportions','Laws of multiple proportions','Laws of reciprocal proportions','Law of conservation of matter',"Gay-Lussac's law of combining volumes","Avogadro's law",'Chemical symbols, formulae and equations','Relative atomic mass based on 12C = 12',"Mole concept and Avogadro's number",'Stoichiometry of chemical reactions']],
      ['Kinetic Theory of Matter and Gas Laws', ['Kinetic theory and states of matter','Melting','Vaporisation','Boiling','Freezing','Condensation','Brownian movement',"Boyle's law","Charles' law","Graham's law","Dalton's law of partial pressures",'Combined gas law','Molar volume and atomicity of gases','Ideal gas equation (PV = nRT)','Relationship between vapour density and relative molecular mass']],
      ['Atomic Structure and Bonding', ['Concept of atoms, molecules and ions','Works of Dalton, Millikan, Rutherford, Moseley, Thomson, Bohr','Atomic structure and electron configuration','Atomic number','Mass number','Isotopes (elements 1-20)','Shapes of s and p orbitals','Periodic table and periodicity','Families (alkali metals, halogens, noble gases, transition metals)','Variation of ionisation energy','Ionic radii','Electron affinity','Electronegativity','Electrovalency','Covalency','Hydrogen bonding','Metallic bonding','Coordinate bond',"Van der Waals' forces",'Shapes of simple molecules (linear, non-linear, tetrahedral, pyramidal)','Radioactivity (types and properties of radiations)','Nuclear reactions','Uses of natural and artificial radioactivity']],
      ['Air', ['Natural gaseous constituents and proportions','Air as a mixture','Uses of noble gases','Separation of air components','Variation in air composition']],
      ['Water', ['Water as product of hydrogen combustion','Composition by volume','Water as solvent','Dissolved atmospheric gases and biological significance','Temporary hardness','Permanent hardness','Methods of softening hard water','Treatment of water for town supply','Water of crystallisation','Efflorescence','Deliquescence','Hygroscopy']],
      ['Solubility', ['Unsaturated solutions','Saturated solutions','Supersaturated solutions','Solubility curves and deductions','Solubility in mol/dm3','Solvents for fats, oils and paints','Stain removal','Suspensions and colloids','Properties of suspensions and colloids','Examples (harmattan haze, fog, milk, aerosol spray, emulsion paints)']],
      ['Environmental Pollution', ['Sources and effects of pollutants','Air pollution (H2S, CO, SO2, oxides of nitrogen, chlorofluorocarbons, dust)','Water pollution (sewage and oil)','Soil pollution (oil spillage, biodegradable and non-biodegradable pollutants)','Control measures']],
      ['Acids, Bases and Salts', ['General characteristics and properties','Acid-base indicators','Basicity of acids','Normal salts','Acidic salts','Basic salts','Double salts','Acid as proton donor (H3O+)','Naturally occurring organic acids (ethanoic, citric, tartaric)','Alums as double salts','Preparation by neutralisation','Preparation by precipitation','Preparation by action of acids on metals','Oxides and trioxocarbonate(IV) salts','Conductance of strong vs weak acids/bases','Relationship between conductance and ion concentration','pH and pOH scale','Simple pH calculations','Acid-base titrations','Titration curves','Hydrolysis of NH4Cl','Hydrolysis of AlCl3','Hydrolysis of Na2CO3','Hydrolysis of CH3COONa']],
      ['Oxidation and Reduction', ['Oxidation as addition of oxygen','Oxidation as removal of hydrogen','Reduction as removal of oxygen','Reduction as addition of hydrogen','Oxidation and reduction in terms of electron transfer','Oxidation numbers','Balancing redox equations using oxidation numbers','IUPAC nomenclature using oxidation number','Tests for oxidising agents','Tests for reducing agents']],
      ['Electrolysis and Electrochemical Cells', ['Electrolytes and non-electrolytes','Electrolysis of selected electrolytes',"Faraday's laws of electrolysis",'Electroplating','Purification of metals','Galvanic cells','Electrolytic cells','Standard electrode potentials','Corrosion']],
      ['Energy Changes and Rates of Reaction', ['Exothermic reactions','Endothermic reactions','Enthalpy change',"Hess's law",'Energy cycles','Factors affecting reaction rates','Collision theory','Catalysis']],
      ['Chemical Equilibrium', ['Reversible reactions','Dynamic equilibrium',"Le Chatelier's principle",'Factors affecting equilibrium position']],
      ['Non-Metals and Their Compounds', ['Hydrogen and water','Oxygen and air','Nitrogen and its compounds (ammonia, nitric acid)','Sulphur and its compounds (SO2, H2SO4)','Carbon and its compounds (CO, CO2, carbonates)','Halogens (chlorine, bromine, iodine)','Noble gases']],
      ['Metals and Their Compounds', ['Properties and reactivity series','Extraction of metals (aluminium, iron)','Alloys and their uses','Sodium and its compounds','Calcium and its compounds','Magnesium and its compounds','Iron and its compounds','Copper and its compounds','Zinc and its compounds']],
      ['Organic Chemistry', ['Classification and functional groups','Alkanes (nomenclature, properties, reactions)','Alkenes and alkynes (addition reactions)','Alkanols (ethanol, properties, uses)','Alkanoic acids (ethanoic acid, esters)','Esters, fats and soaps (saponification)','Aromatic hydrocarbons (benzene)','Addition polymerisation','Condensation polymerisation','Petroleum and natural gas (fractional distillation, cracking)','Carbohydrates','Proteins']],
      ['Chemistry and Industry', ['Chemical industry (Haber process, contact process)','Pollution and waste management','Hard and soft water']]
    ]},
    'biology': { prefix: 'bio', topics: [
      ['Variety of Organisms', ['Characteristics of living organisms','Cell structure and functions','Levels of organisation (cell, tissue, organ, system, organism)','Monera (bacteria, blue-green algae)','Protista (Amoeba, Euglena, Paramecium)','Fungi (mushroom, Rhizopus)','Plantae (Thallophyta, Bryophyta, Pteridophyta, Spermatophyta)','Gymnosperms','Angiosperms','Invertebrates (coelenterates, Platyhelminthes, Nematoda, Annelida, Arthropoda, Mollusca)','Vertebrates (Pisces, Amphibia, Reptilia, Aves, Mammalia)','Adaptive colouration','Behavioural adaptations in social animals','Structural adaptations (obtaining food, protection, securing mates, regulating body temperature, conserving water)']],
      ['Nutrition', ['Internal structure of a flowering plant (root, stem, leaf)','Internal structure of a mammal','Autotrophic nutrition (photosynthesis)','Mineral requirements (macro and micro)','Heterotrophic nutrition (holozoic, parasitic, saprophytic, carnivorous)','Classes of food','Food tests','Mammalian tooth','Alimentary canal','Digestion','Absorption','Assimilation']],
      ['Transport', ['Need for transport','Materials transported','Mammalian circulatory system','Plant vascular system','Diffusion','Osmosis','Plasmolysis','Turgidity','Transpiration pull','Root pressure','Active transport']],
      ['Respiration and Gaseous Exchange', ['Respiratory organs and surfaces (body surface, gills, trachea, lungs, stomata, lenticels)','Mechanism of gaseous exchange in plants','Mechanism of gaseous exchange in mammals','Aerobic respiration','Anaerobic respiration','Glycolysis','Krebs cycle','ATP','Fermentation']],
      ['Excretion and Homeostasis', ['Excretory structures (contractile vacuole, flame cell, nephridium, Malpighian tubule, kidney, stoma, lenticel)','Excretory mechanisms (kidneys, lungs, skin)','Excretory products of plants','Osmoregulation','Temperature regulation']],
      ['Support and Movement', ['Tropic movements in plants','Tactic movements','Nastic movements','Sleep movements','Supporting tissues in animals','Exoskeleton','Endoskeleton','Functions of skeleton']],
      ['Coordination and Control', ['Nervous system','Sense organs','Hormones','Endocrine system']],
      ['Reproduction and Growth', ['Asexual reproduction (binary fission, budding, vegetative propagation)','Sexual reproduction in plants (pollination, fertilisation, seed dispersal)','Sexual reproduction in mammals (human reproductive system, menstrual cycle)','Reproduction in insects','Stages of growth','Growth curves']],
      ['Ecology', ['Basic ecological concepts (ecosystem, habitat, population, community)','Ecological components and factors','Food chains and food webs','Trophic levels and energy flow','Carbon cycle','Nitrogen cycle','Water cycle','Decomposition','Symbiosis','Parasitism','Commensalism','Ecological succession','Population studies (factors affecting population)','Pollution and conservation','Local biomes','Natural habitats','Soil','Game reserves and natural parks']],
      ['Heredity and Variations', ['Genetic terminology (genes, alleles, chromosomes)',"Mendel's experiments and laws",'Monohybrid crosses','Dihybrid crosses','Sex determination','Sex-linked characters','Morphological variation','Physiological variation','Mutation']],
      ['Evolution', ['Theories of evolution (Darwin, Lamarck)','Evidence of evolution','Adaptive changes','Natural selection']],
      ['Classification of Living Things', ['Taxonomy and binomial nomenclature','Bacteria and viruses','Algae, bryophytes and ferns','Seed plants (gymnosperms, angiosperms)','Invertebrates (arthropods, molluscs, annelids)','Vertebrates (fish, amphibians, reptiles, birds, mammals)']]
    ]},
    'economics': { prefix: 'eco', topics: [
      ['Economics as a Science', ['Wants','Scarcity','Choice','Scale of preference','Opportunity cost','Rationality','Production, distribution and consumption','Economic problems (what, how, for whom to produce)','Efficiency of resource use','Production possibility frontier (PPF)']],
      ['Economic Systems', ['Free enterprise economy','Centrally planned economy','Mixed economy','Solutions to economic problems under different systems','Deregulation','Banking sector consolidation','Cash policy reform']],
      ['Methods and Tools of Economic Analysis', ['Inductive method','Deductive method','Positive reasoning','Normative reasoning','Tables, charts and graphs','Mean, median, mode','Variance','Standard deviation','Range']],
      ['Theory of Demand', ['Meaning and determinants of demand','Demand schedules and curves','Change in quantity demanded vs change in demand','Composite demand','Derived demand','Competitive demand','Joint demand','Price elasticity of demand','Income elasticity of demand','Cross elasticity of demand','Determinants of elasticity','Measurement of elasticity','Importance of elasticity']],
      ['Theory of Consumer Behaviour', ['Cardinal utility','Ordinal utility','Total utility','Average utility','Marginal utility','Indifference curve','Budget line','Diminishing marginal utility','Consumer equilibrium (indifference curve)','Consumer equilibrium (marginal analysis)','Effects of shifts in budget line','Effects of shifts in indifference curve','Consumer surplus']],
      ['Theory of Supply', ['Meaning and determinants of supply','Supply schedules and curves','Change in quantity supplied vs change in supply','Joint/complementary supply','Competitive supply','Composite supply','Elasticity of supply','Determinants of elasticity of supply','Measurement of elasticity of supply','Applications of elasticity of supply']],
      ['Theory of Price Determination', ['Concept of market','Concept of price','Functions of the price system','Equilibrium price and quantity in product markets','Equilibrium price and quantity in factor markets','Price legislation and effects','Effects of changes in supply and demand on equilibrium']],
      ['Theory of Production', ['Meaning and types of production','Total product (TP)','Average product (AP)','Marginal product (MP)','Law of variable proportions','Division of labour','Specialisation','Internal economies','External economies','Internal diseconomies','External diseconomies','Production functions','Returns to scale','Producer equilibrium (isoquant-isocost)','Producer equilibrium (marginal analysis)','Factors affecting productivity']],
      ['Theory of Costs and Revenue', ['Fixed costs','Variable costs','Total cost','Average cost','Marginal cost','Total revenue','Average revenue','Marginal revenue',"Accountants' notion of cost","Economists' notion of cost",'Short-run costs','Long-run costs','Marginal cost and the supply curve of a firm']],
      ['Market Structures', ['Perfect competition (assumptions, characteristics)','Perfect competition short-run equilibrium','Perfect competition long-run equilibrium','Pure monopoly','Discriminatory monopoly','Monopolistic competition','Monopolistic competition short-run equilibrium','Monopolistic competition long-run equilibrium','Break-even analysis','Shut-down analysis']],
      ['National Income', ['GNP','GDP','NI','NNP','Measurement of national income','Problems of measuring national income','Uses of national income estimates','Limitations of national income estimates','Circular flow of income (two-sector)','Circular flow of income (three-sector)','Consumption','Investment','Savings','Multiplier','Elementary theory of income determination','Equilibrium national income']],
      ['Money and Inflation', ['Types of money','Characteristics of money','Functions of money','Demand for money','Supply of money','Quantity theory of money (Fisher equation)','Value of money','Price level','Inflation types','Inflation measurement','Inflation effects','Inflation control','Deflation measurement','Deflation effects','Deflation control']],
      ['Financial Institutions', ['Traditional financial institutions','Central bank','Mortgage banks','Merchant banks','Insurance companies','Building societies','Role of financial institutions in economic development','Money market','Capital market','Deposit money banks and money creation','Monetary policy','Instruments of monetary policy','Challenges facing financial institutions in Nigeria']],
      ['Public Finance', ['Meaning and objectives of public finance','Fiscal policy','Instruments of fiscal policy','Sources of government revenue (taxes, royalties, rents, grants, aids)','Principles of taxation','Tax incidence','Effects of taxation','Effects of public expenditure','Government budget','Public debts','Revenue allocation in Nigeria','Resource control in Nigeria']],
      ['International Trade', ['Reasons for international trade','Terms of trade','Balance of trade','Balance of payments','Foreign exchange rates','Tariffs','Quotas','Embargoes','ECOWAS','African Union','OPEC']],
      ['Economic Development and Planning', ['Economic growth','Economic development','Development planning (objectives)','Development planning (problems)','Poverty','Income inequality','Human Development Index (HDI)']]
    ]}
  };

  window.TopicCatalogue = window.TopicCatalogue || {};
  window.TopicCatalogue._raw = window.TopicCatalogue._raw || {};
  deepMerge(window.TopicCatalogue._raw, PART);
})();/* ============================================================
   UTMESchools — topic-catalogue.js — PART 3 of 4
   Subjects: Government, Commerce, Accounting
   Load order: 1 → 2 → 3 → 4
   ============================================================ */
(function () {
  function deepMerge(target, source) {
    Object.keys(source).forEach(function (k) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        target[k] = target[k] || {};
        deepMerge(target[k], source[k]);
      } else { target[k] = source[k]; }
    });
    return target;
  }

  var PART = {
    'government': { prefix: 'gov', topics: [
      ['Basic Concepts of Government', ['Power','Authority','Legitimacy','Sovereignty','Society','State','Nation','Nation-state','Political processes','Political socialisation','Political participation','Political culture','Monarchy','Aristocracy','Oligarchy','Autocracy','Republicanism','Democracy (definitions, features, merits, demerits)']],
      ['Arms and Structures of Government', ['Legislature (types, structure, functions, powers)','Executive (types, functions, powers)','Judiciary (functions, powers, components)','Relationship among arms of government','Unitary system','Federal system','Confederal system','Presidential system','Parliamentary system','Monarchical system']],
      ['Political Ideologies', ['Communalism','Feudalism','Capitalism','Socialism','Communism','Totalitarianism','Fascism','Nazism']],
      ['Constitutions', ['Meaning and sources of a constitution','Functions of a constitution','Written constitution','Unwritten constitution','Rigid constitution','Flexible constitution']],
      ['Principles of Democratic Government', ['Ethics and accountability','Separation of powers','Checks and balances','Individual and collective responsibility','Constitutionalism','Rule of law','Representative government','Acts','Edicts','Bye-laws','Delegated legislation','Decrees']],
      ['Citizenship and Electoral Process', ['Meaning and types of citizenship','Rights of citizens','Dual citizenship','Renunciation','Deprivation','Duties and obligations of citizens','Duties and obligations of the state','Suffrage (evolution, types)','Election (types)','Ingredients of free and fair election','Electoral system types','Advantages and disadvantages of electoral systems','Electoral commission (functions, problems)']],
      ['Political Parties and Pressure Groups', ['Definition of political party','Organisation of political parties','Functions of political parties','Party systems','Pressure groups (definition, types)','Functions of pressure groups','Modes of operation of pressure groups','Differences between pressure groups and political parties']],
      ['Public Opinion and Civil Service', ['Meaning of public opinion','Formation of public opinion','Measurement of public opinion','Functions of public opinion','Limitations of public opinion','Civil service (definition, characteristics)','Functions of the civil service','Structure of the civil service','Control of the civil service','Problems of the civil service']],
      ['Pre-Colonial Politics in Nigeria', ['Pre-jihad Hausa political system','Emirate political system','Tiv political system','Igbo political system','Yoruba political system','Structural organisation of pre-colonial polities','Functions of pre-colonial political institutions']],
      ['Imperialist Penetration and Colonial Administration', ['British acquisition process (trade, missionary activities, company rule, crown colony, protectorate)','British indirect rule','British direct rule','French assimilation policy','French association policy','Impact of British colonial rule (economic, political, socio-cultural)','Comparison of British and French colonial administration']],
      ['Nationalism and Decolonisation', ['Meaning of nationalism','Types of nationalism','Emergence of nationalist movements','Goals of nationalist movements','Strategies of nationalist movements','Herbert Macaulay','Nnamdi Azikiwe','Obafemi Awolowo','Ahmadu Bello','Ladipo Solanke','Aminu Kano','J. S. Tarka','Tafawa Balewa','Emergence of nationalist parties','Influence of Pan-Africanism','Influence of Back-to-Africa movement','Influence of Second World War']],
      ['Constitutional Development in Nigeria', ['Hugh Clifford Constitution (1922)','Arthur Richards Constitution (1946)','John Macpherson Constitution (1951)','Oliver Lyttleton Constitution (1954)','Independence Constitution (1960)','1963 Constitution','1979 Constitution','1989 Constitution','1999 Constitution']],
      ['Institutions of Government in Post-Independence Nigeria', ['Legislative structure','Legislative functions','Legislative working','Executive structure','Executive functions','Judiciary structure','Judiciary functions','Civil Service Commission','Public Complaints Commission','Electoral Commissions','National Boundary Commission']],
      ['Political Parties in Post-Independence Nigeria', ['First Republic parties','Second Republic parties','Third Republic parties','Fourth Republic parties','Evolution of parties','Membership spread','Structure of parties']],
      ['Nigerian Federalism', ['Rationale for federalism','Tiers of government','Relationships among tiers','Creation of states (1963, 1967, 1976, 1987, 1991, 1996)','Problems of Nigerian federalism (census, revenue allocation, conflicts)','Solutions to problems (federal character)']],
      ['Public Corporations and Parastatals', ['Definition and types','Purpose and functions','Finance of public corporations','Control of public corporations','Problems of public corporations','Deregulation','Privatisation','Commercialisation']],
      ['Local Government', ['Administration prior to 1976','1976 reforms','1989 reforms','Structure of local government','Functions of local government','Finance of local government','Inter-governmental relations','Traditional rulers and local governments','Problems of local government']],
      ['Military in Nigerian Politics', ['Factors leading to military intervention','Structure of military regimes','Impact of military rule (political)','Impact of military rule (economic)','Processes of disengagement']],
      ['Foreign Policy and International Relations', ['Definition of foreign policy','Purpose of foreign policy','Determining factors of foreign policy','Formulation of foreign policy','Implementation of foreign policy',"Nigeria's relations with major powers","Nigeria's relations with developing countries (Technical Aid Corps)","Nigeria's non-alignment policy","Africa as centrepiece of Nigeria's foreign policy",'NEPAD (origin, objectives, implications)','United Nations','Commonwealth','OAU','African Union','ECOWAS','OPEC']]
    ]},
    'commerce': { prefix: 'com', topics: [
      ['Introduction to Commerce', ['Meaning of commerce','Scope of commerce','Functions of commerce','Characteristics of commerce','Relationship between commerce and production']],
      ['Occupation', ['Industrial occupations','Commercial occupations','Direct-service occupations','Factors affecting choice of occupation']],
      ['Production', ['Factors of production','Divisions of production','Types of production','Stages of production','Specialisation and exchange','Productivity']],
      ['Trade', ['Retailing','Wholesaling','Importing','Exporting','Entrepôt trade','Trade documents']],
      ['Purchase and Sale of Goods', ['Enquiry to payment','Trade terms','Pricing','Discounts','Credit','Hire purchase','Instalment payment']],
      ['Aids to Trade', ['Advertising','Banking','Communication','Insurance','Tourism','Transportation','Warehousing']],
      ['Business Units', ['Sole trader','Partnership','Private limited liability company','Public limited liability company','Cooperatives','Public enterprises','Formation of business units','Finance of business units','Control of business units','Merits of business units','Limitations of business units']],
      ['Financing Business', ['Short-term finance','Medium-term finance','Long-term finance','Internal sources of finance','External sources of finance','Factors affecting choice of finance']],
      ['Trade Associations', ['Chambers of commerce','Trade associations','Professional associations','Consumer associations','Functions of trade associations']],
      ['Money', ['Evolution of money','Forms of money','Characteristics of money','Functions of money','Value of money']],
      ['Stock Exchange', ['Meaning of stock exchange','Functions of stock exchange','Securities','Participants in stock exchange','Procedures of stock exchange','Benefits of stock exchange']],
      ['Elements of Business Management', ['Planning','Organising','Staffing','Directing','Coordinating','Controlling','Communication']],
      ['Elements of Marketing', ['Meaning of marketing','Functions of marketing','Marketing concept','Marketing mix','Market segmentation','Market research','Product life cycle']],
      ['Legal Aspects of Business', ['Contract','Agency','Sale of goods','Hire purchase','Employment','Government regulation','Consumer protection']],
      ['Commodity Exchange', ['Meaning of commodity exchange','Objectives of commodity exchange','Functions of commodity exchange','Procedures of commodity exchange','Commodities traded','Benefits of commodity exchange','Limitations of commodity exchange']],
      ['Business Environment and Social Responsibility', ['Legal environment','Political environment','Economic environment','Social environment','Cultural environment','Technological environment','Competitive forces','Duties to stakeholders']]
    ]},
    'accounting': { prefix: 'acc', topics: [
      ['Nature and Significance of Accounting', ['Development of accounting','Branches of accounting','Objectives of bookkeeping and accounting','Accounting principles','Accounting concepts','Accounting conventions','Role of accounting records','Role of accounting information']],
      ['Principles of Double Entry', ['Functions of source documents','Books of original entry','Accounting equation','Ledger and its classifications','Trial balance','Types of errors','Treatment of errors','Suspense account']],
      ['Cash Book', ['Petty cash book','Imprest system','Columnar cash books','Discounts']],
      ['Bank Transactions and Reconciliation', ['Instruments of bank transactions','E-banking system','Causes of discrepancies between cash book and bank statement','Bank reconciliation statement']],
      ['Final Accounts of a Sole Trader', ['Trading account','Profit and loss account','Balance sheet','Provision for bad and doubtful debts','Provision for discounts','Provision for depreciation (straight line)','Provision for depreciation (reducing balance)','Accruals','Prepayments','Drawings']],
      ['Stock Valuation', ['FIFO method','LIFO method','Simple average method','Advantages and disadvantages of stock valuation methods','Importance of stock valuation']],
      ['Control Accounts and Self-Balancing Ledgers', ['Uses of control accounts','Purchases ledger control account','Sales ledger control account']],
      ['Incomplete Records and Single Entry', ['Conversion of single entry to double entry','Determination of missing figures','Preparation of final accounts from incomplete records']],
      ['Manufacturing Accounts', ['Cost classification','Cost apportionment','Preparation of manufacturing account']],
      ['Accounts of Not-for-Profit-Making Organizations', ['Objectives of not-for-profit organisations','Receipts and payments account','Income and expenditure account','Balance sheet']],
      ['Departmental Accounts', ['Objectives of departmental accounts','Apportionment of expenses','Departmental trading and profit and loss account']],
      ['Branch Accounts', ['Objectives of branch accounts','Branch accounts in head office books','Head office account','Reconciliation of branch and head office books']],
      ['Partnership Accounts', ['Formation of partnership','Profit and loss account','Appropriation account',"Partners' current accounts","Partners' capital accounts",'Treatment of goodwill','Admission of a partner','Retirement of a partner','Dissolution of partnership','Conversion to a company']],
      ['Introduction to Company Accounts', ['Formation and classification of companies','Issue of shares','Issue of debentures','Forms of final accounts','Interpretation using ratios','Distinction between capital and revenue reserves']],
      ['Public Sector Accounting', ['Cash basis of accounting','Accrual basis of accounting','Sources of government revenue','Capital expenditure','Recurrent expenditure','Consolidated revenue fund','Statement of assets and liabilities','Responsibilities of Accountant General','Responsibilities of Auditor General','Responsibilities of Minister of Finance','Responsibilities of Treasurer of local government','Instruments of financial regulation']]
    ]}
  };

  window.TopicCatalogue = window.TopicCatalogue || {};
  window.TopicCatalogue._raw = window.TopicCatalogue._raw || {};
  deepMerge(window.TopicCatalogue._raw, PART);
})();/* ============================================================
   UTMESchools — topic-catalogue.js — PART 4 of 4
   Subjects: CRS, Computer Studies, Arabic, Fine Art, Yoruba
   Load order: 1 → 2 → 3 → 4
   This file also builds the final TopicCatalogue.subjects structure.
   ============================================================ */
(function () {
  function deepMerge(target, source) {
    Object.keys(source).forEach(function (k) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        target[k] = target[k] || {};
        deepMerge(target[k], source[k]);
      } else { target[k] = source[k]; }
    });
    return target;
  }

  var PART = {
    'crk': { prefix: 'crk', topics: [
      ['Themes from Creation to the Division of the Kingdom', ['The Sovereignty of God','The Covenant','Leadership Qualities','Divine Providence, Guidance and Protection','Parental Responsibility','Obedience and Disobedience',"A Man after God's Own Heart",'Decision-Making']],
      ['Themes from the Division of the Kingdom to the Return from Exile and the Prophets', ['Greed and Its Effects','The Supremacy of God','Religious Reforms in Judah','Concern for Judah','Faith, Courage and Protection',"God's Message to Nineveh",'Social Justice, True Religion and Divine Love','Holiness and Divine Call','Punishment and Hope']],
      ['Themes from the Four Gospels and Acts of the Apostles', ['Birth and Early Life of Jesus','Baptism and Temptation of Jesus','Discipleship','Miracles of Jesus','Parables of Jesus','Sermon on the Mount','Mission of the Disciples','The Great Confession','Transfiguration','Triumphal Entry and Cleansing of the Temple','The Last Supper','Trials and Death of Jesus','Resurrection, Appearances and Ascension',"Jesus' Teachings about Himself",'Love','Fellowship in the Early Church','The Holy Spirit and the Mission of the Church','Opposition to the Gospel','Mission to the Gentiles']],
      ['Themes from Selected Epistles', ['Justification by Faith','The Law and Grace','New Life in Christ','Christians as Joint Heirs with Christ','Humility','Forgiveness','Spiritual Gifts','Christian Giving','Civic Responsibility','Dignity of Labour','The Second Coming of Christ']]
    ]},
    'computer-studies': { prefix: 'cmp', topics: [
      ['Evolution of Computing', ['History of computing (early aids, mechanical/electromechanical/electronic devices)','Classification by generation','Classification by size','Classification by purpose','Classification by data handling']],
      ['Fundamentals of Computing', ['Overview of computing systems','Hardware','Software','Peopleware','Data and information','Input-process-output-storage cycle','CPU','Memory','Peripherals','Data representation','Information quality']],
      ['Computer Application Packages', ['Word processing (features, interfaces, file types, operations)','Spreadsheet (formulas, functions, charts)','Database (records, fields, queries, reports)','Graphics (design tools)','Presentation (slides)','Web design (web-page creation)']],
      ['Managing Computer Files', ['Concept of computer files','File names and extensions','File organisation','Folder handling','Storage','Creation','Copying','Moving','Searching','Deletion','Recovery','Backup']],
      ['Maintenance and Safety', ['Booting types','Booting procedures','Shutting down procedures','Preventive maintenance','Corrective maintenance','Computer room environment','Ergonomics','Safety']],
      ['Information and Communication Technology (ICT)', ['Communication systems','Communication models','Application areas of ICT','Internet services','Browsers','Search','Electronic mail','Network types','Network topologies','Network devices','World Wide Web','Cables and connectors']],
      ['Developing Problem-Solving Skills', ['Programming languages (levels, translators, paradigms)','High-level languages','Algorithms','Flowcharts (symbols, control structures)','Programming language structure','Program testing','Program debugging','Program documentation','System Development Life Cycle (SDLC)']],
      ['Artificial Intelligence and Robotics', ['Definition of AI','Machine learning','Expert systems','Natural language processing','Computer vision','Applications of AI','Robot components','Robot sensing','Robot control','Robot applications']],
      ['Computer Ethics and Human Issues', ['Privacy','Ownership','Access','Misuse','Computer security threats','Computer security controls','Malware','Social engineering','Cyber risks','Safe cyber behaviour','Careers in computing']]
    ]},
    'arabic-studies': { prefix: 'ara', topics: [
      ['Comprehension', ['Unseen passage 1','Unseen passage 2','Vocabulary','Main ideas','Details','Inference','Contextual meaning']],
      ['Translation', ['English-to-Arabic translation','Arabic-to-English translation','Clear and idiomatic language','Grammatical accuracy']],
      ['Grammar and Structure', ['Demonstrative pronouns','Relative pronouns','Conditional pronouns','Interrogative pronouns','Gender','Characteristics of nouns','Dual','Sound masculine plural','Sound feminine plural','Broken plural','Construct phrase','Separable pronouns','Inseparable pronouns','Adjective (appendant)','Conjunction (appendant)','Permutative (appendant)','Emphasis (appendant)','Prepositions','Transitive verbs','Intransitive verbs','Perfect verb','Imperfect verb','Imperfect verb moods','Imperative verb','Adverb of time','Adverb of place','Adverb of condition','Adverb of reason','Adverb of degree','Adverb of manner','Trilateral verbs','Derived verbs','Verbal noun','Exception','Conditional sentence','Numerals 1-1000','Active voice','Passive voice','Subject','Predicate','Nouns in the accusative']],
      ['Composition', ['Guided composition','Free composition (letters)','Free composition (narration)','Free composition (description)','Free composition (argument)','Organisation','Vocabulary','Grammatical accuracy']],
      ['Arabic Literature', ['Pre-Islamic period','Islamic period','Umayyad period','Abbasid period','Modern period','Selected prose','Selected poetry','Themes','Styles','Authors','Context','Appreciation']]
    ]},
    'fine-art': { prefix: 'art', topics: [
      ['Classification of Art', ['Visual Arts (Fine and Applied)','Performing Arts (Music, Dance, Drama)','Literary Arts (Poetry, Prose, Recitals)']],
      ['Elements and Principles of Design', ['Line','Colour','Shape','Form','Texture','Tone','Value','Space','Balance','Rhythm','Proportion','Harmony','Contrast','Repetition','Dominance','Variety']],
      ['Art Terms', ['Pigments','Motif','Greenware','Armature','Silhouette','Chiaroscuro','Cire perdue','Terracotta']],
      ['Historical Dimensions of Art', ['Prehistoric art','Greek art','Roman art','Medieval art (architecture, surface decorations, calligraphy)','Renaissance art','Giotto','Michelangelo','Leonardo da Vinci','Raphael','Impressionism','Realism','Futurism','Cubism','Bauhaus','Pop Art','Abstract Expressionism','Fauvism']],
      ['Traditional African Art', ['Egypt','Ashanti','Dogon','Mossi','Fon','Senufo','Bambara','Mende','Kissi','Bamileke','Bakumba']],
      ['Traditional Nigerian Art', ['Nok','Igbo-Ukwu','Ife','Benin','Esie','Igala','Jukun','Akwashi','Mbari']],
      ['Nigerian Crafts', ['Pottery','Woodworks','Cloth-weaving','Carving','Leather works','Metal works','Beadworks','Body decoration','Mat and cane weaving']],
      ['Development in Contemporary Nigerian Arts', ['Zaria Art School','Nsukka Art School','Osogbo group','Aina Onabolu','Ben Enwonwu','S. I. Wangboje','Jimoh Akolo','Dele Jegede','Museums','Galleries','Art centres']],
      ['Artistic Skills, Techniques and Processes', ['Drawing','Painting','Graphic design','Textile design','Sculpture','Ceramics','Crafts','Materials','Tools','Maintenance']],
      ['Art Appreciation', ['Analysing works of art','Interpreting works of art','Description in art criticism','Analysis in art criticism','Interpretation in art criticism','Judgement in art criticism','Roles of art in society']]
    ]},
    'yoruba': { prefix: 'yor', topics: [
      ['Language (Èdè)', ['Orthography and spelling','Comprehension of prose passages','Comprehension of verse passages','Narrative composition','Descriptive composition','Argumentative composition','Letter writing','Yoruba-to-English translation','English-to-Yoruba translation','Sounds and tones','Sound patterns','Word formation','Parts of speech','Sentence structure','Grammar','Vocabulary','Idioms','Proverbs']],
      ['Literature (Lítírésọ̀)', ['Folktales','Proverbs','Riddles','Praise poetry','Songs','Traditional drama','Written prose','Written poetry','Written drama','Theme','Plot','Characters','Setting','Style','Language','Social messages']],
      ['Culture (Àṣà)', ['Yoruba origin and history','Family institutions','Social institutions','Traditional authority','Marriage','Birth and naming','Death and burial','Occupations','Economy','Festivals','Religion','Beliefs','Taboos','Material culture','Arts','Music','Food','Dress','Contemporary change']]
    ]}
  };

  window.TopicCatalogue = window.TopicCatalogue || {};
  window.TopicCatalogue._raw = window.TopicCatalogue._raw || {};
  deepMerge(window.TopicCatalogue._raw, PART);

  /* ---- build final codes + IDs from the merged raw catalogue ---- */
  function slug(s) {
    return String(s).toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  var raw = window.TopicCatalogue._raw;
  var CAT = {};
  Object.keys(raw).forEach(function (subject) {
    var c = raw[subject];
    var used = {};
    CAT[subject] = { topics: c.topics.map(function (t, ti) {
      var tid = c.prefix + '_' + slug(t[0]);
      if (used[tid]) tid += '_' + (ti + 1);
      used[tid] = 1;
      var usedSub = {};
      var subs = t[1].map(function (s, si) {
        var sid = tid + '_' + slug(s);
        if (usedSub[sid]) sid += '_' + (si + 1);
        usedSub[sid] = 1;
        return { code: (ti + 1) + '.' + (si + 1), id: sid, name: s };
      });
      return { code: String(ti + 1), id: tid, name: t[0], subs: subs };
    })};
  });

  window.TopicCatalogue.subjects = CAT;
  delete window.TopicCatalogue._raw;
})();