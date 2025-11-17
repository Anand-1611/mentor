-- Create test_questions table for mentor verification
CREATE TABLE public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

-- RLS policy: Anyone can read test questions (needed for taking tests)
CREATE POLICY "Test questions are viewable by authenticated users"
  ON test_questions FOR SELECT
  TO authenticated
  USING (true);

-- Add fields to mentors table for test tracking
ALTER TABLE public.mentors 
  ADD COLUMN IF NOT EXISTS grade_document_url TEXT,
  ADD COLUMN IF NOT EXISTS test_answers JSONB,
  ADD COLUMN IF NOT EXISTS test_taken_at TIMESTAMP WITH TIME ZONE;

-- Seed test questions for Math (40% easy, 40% medium, 20% hard)
INSERT INTO public.test_questions (subject, question, options, correct_answer, difficulty) VALUES
-- Math - Easy (10 questions)
('Math', 'What is the value of π (pi) approximately?', '["2.14", "3.14", "4.14", "5.14"]', '3.14', 'easy'),
('Math', 'What is 15% of 200?', '["20", "25", "30", "35"]', '30', 'easy'),
('Math', 'Solve: 2x + 5 = 15', '["x = 3", "x = 5", "x = 7", "x = 10"]', 'x = 5', 'easy'),
('Math', 'What is the area of a rectangle with length 8 and width 5?', '["13", "26", "40", "80"]', '40', 'easy'),
('Math', 'What is the square root of 144?', '["10", "11", "12", "13"]', '12', 'easy'),
('Math', 'If a triangle has angles 60° and 70°, what is the third angle?', '["40°", "50°", "60°", "70°"]', '50°', 'easy'),
('Math', 'What is 7 × 8?', '["54", "56", "58", "60"]', '56', 'easy'),
('Math', 'Simplify: 3/6', '["1/2", "1/3", "2/3", "3/4"]', '1/2', 'easy'),
('Math', 'What is the perimeter of a square with side 6?', '["12", "18", "24", "36"]', '24', 'easy'),
('Math', 'Convert 0.75 to a fraction', '["1/2", "2/3", "3/4", "4/5"]', '3/4', 'easy'),

-- Math - Medium (10 questions)
('Math', 'Solve the quadratic equation: x² - 5x + 6 = 0', '["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = 1, -6"]', 'x = 2, 3', 'medium'),
('Math', 'What is the derivative of x³?', '["x²", "2x²", "3x²", "3x³"]', '3x²', 'medium'),
('Math', 'Find the slope of the line passing through (2,3) and (4,7)', '["1", "2", "3", "4"]', '2', 'medium'),
('Math', 'What is sin(30°)?', '["0", "1/2", "√3/2", "1"]', '1/2', 'medium'),
('Math', 'Calculate the sum of the arithmetic series: 2 + 5 + 8 + ... (10 terms)', '["145", "155", "165", "175"]', '155', 'medium'),
('Math', 'What is the value of log₁₀(1000)?', '["2", "3", "4", "5"]', '3', 'medium'),
('Math', 'Find the area of a circle with radius 7 (use π ≈ 22/7)', '["44", "88", "154", "308"]', '154', 'medium'),
('Math', 'Solve: 2ˣ = 32', '["x = 4", "x = 5", "x = 6", "x = 7"]', 'x = 5', 'medium'),
('Math', 'What is the median of: 3, 7, 2, 9, 5, 1, 8?', '["4", "5", "6", "7"]', '5', 'medium'),
('Math', 'Calculate: ∫x² dx', '["x³/3 + C", "x³ + C", "2x + C", "x²/2 + C"]', 'x³/3 + C', 'medium'),

-- Math - Hard (5 questions)
('Math', 'Find the limit: lim(x→0) (sin x)/x', '["0", "1", "∞", "undefined"]', '1', 'hard'),
('Math', 'What is the determinant of [[2,3],[4,5]]?', '["-2", "-1", "1", "2"]', '-2', 'hard'),
('Math', 'Solve: ∫(1/(1+x²)) dx', '["ln|x| + C", "tan⁻¹(x) + C", "x² + C", "1/x + C"]', 'tan⁻¹(x) + C', 'hard'),
('Math', 'Find the eigenvalues of [[3,1],[0,2]]', '["1, 2", "2, 3", "3, 4", "1, 3"]', '2, 3', 'hard'),
('Math', 'What is the Taylor series expansion of eˣ at x=0 (first 3 terms)?', '["1 + x + x²", "1 + x + x²/2", "x + x²/2 + x³/6", "1 + x + x²/2!"]', '1 + x + x²/2!', 'hard');

-- Physics - Easy (10 questions)
INSERT INTO public.test_questions (subject, question, options, correct_answer, difficulty) VALUES
('Physics', 'What is the SI unit of force?', '["Joule", "Newton", "Watt", "Pascal"]', 'Newton', 'easy'),
('Physics', 'What is the speed of light in vacuum?', '["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10¹² m/s"]', '3 × 10⁸ m/s', 'easy'),
('Physics', 'What is the formula for kinetic energy?', '["mv", "mv²", "½mv²", "m²v"]', '½mv²', 'easy'),
('Physics', 'What is the acceleration due to gravity on Earth?', '["8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"]', '9.8 m/s²', 'easy'),
('Physics', 'Which law states "For every action, there is an equal and opposite reaction"?', '["First law", "Second law", "Third law", "Fourth law"]', 'Third law', 'easy'),
('Physics', 'What is the SI unit of electric current?', '["Volt", "Ampere", "Ohm", "Coulomb"]', 'Ampere', 'easy'),
('Physics', 'What type of energy does a stretched spring have?', '["Kinetic", "Potential", "Thermal", "Chemical"]', 'Potential', 'easy'),
('Physics', 'What is the formula for Ohm''s Law?', '["V = I/R", "V = IR", "V = I + R", "V = I - R"]', 'V = IR', 'easy'),
('Physics', 'What is the SI unit of power?', '["Joule", "Newton", "Watt", "Pascal"]', 'Watt', 'easy'),
('Physics', 'What happens to the resistance of a conductor when temperature increases?', '["Decreases", "Increases", "Remains same", "Becomes zero"]', 'Increases', 'easy'),

-- Physics - Medium (10 questions)
('Physics', 'A car accelerates from rest to 20 m/s in 5 seconds. What is its acceleration?', '["2 m/s²", "4 m/s²", "5 m/s²", "10 m/s²"]', '4 m/s²', 'medium'),
('Physics', 'What is the work done when a force of 10N moves an object 5m at 60° to the force?', '["25 J", "43.3 J", "50 J", "86.6 J"]', '25 J', 'medium'),
('Physics', 'What is the frequency of a wave with wavelength 2m traveling at 10 m/s?', '["2 Hz", "5 Hz", "10 Hz", "20 Hz"]', '5 Hz', 'medium'),
('Physics', 'Calculate the momentum of a 5kg object moving at 10 m/s', '["5 kg⋅m/s", "15 kg⋅m/s", "50 kg⋅m/s", "500 kg⋅m/s"]', '50 kg⋅m/s', 'medium'),
('Physics', 'What is the potential energy of a 2kg object at height 10m? (g=10 m/s²)', '["20 J", "100 J", "200 J", "400 J"]', '200 J', 'medium'),
('Physics', 'Two resistors 4Ω and 6Ω are in parallel. What is the equivalent resistance?', '["2.4 Ω", "5 Ω", "10 Ω", "24 Ω"]', '2.4 Ω', 'medium'),
('Physics', 'What is the time period of a pendulum with length 1m? (g=10 m/s²)', '["1 s", "2 s", "π s", "2π s"]', '2 s', 'medium'),
('Physics', 'A 100W bulb runs for 10 hours. How much energy is consumed?', '["1 kWh", "10 kWh", "100 kWh", "1000 kWh"]', '1 kWh', 'medium'),
('Physics', 'What is the refractive index of a medium where light travels at 2×10⁸ m/s?', '["1.0", "1.5", "2.0", "2.5"]', '1.5', 'medium'),
('Physics', 'Calculate the centripetal force on a 2kg object moving in a circle of radius 5m at 10 m/s', '["20 N", "40 N", "100 N", "200 N"]', '40 N', 'medium'),

-- Physics - Hard (5 questions)
('Physics', 'What is the de Broglie wavelength of an electron moving at 10⁶ m/s? (h=6.6×10⁻³⁴, m=9.1×10⁻³¹)', '["7.3×10⁻¹⁰ m", "7.3×10⁻¹¹ m", "7.3×10⁻¹² m", "7.3×10⁻¹³ m"]', '7.3×10⁻¹⁰ m', 'hard'),
('Physics', 'What is the binding energy per nucleon for Fe-56? (mass defect = 0.5 amu)', '["7.5 MeV", "8.0 MeV", "8.5 MeV", "9.0 MeV"]', '8.5 MeV', 'hard'),
('Physics', 'Calculate the magnetic field at the center of a circular coil with 10 turns, radius 0.1m, current 2A', '["1.26×10⁻⁴ T", "1.26×10⁻⁵ T", "1.26×10⁻³ T", "1.26×10⁻² T"]', '1.26×10⁻⁴ T', 'hard'),
('Physics', 'What is the escape velocity from Earth''s surface? (g=10 m/s², R=6400 km)', '["7.1 km/s", "9.8 km/s", "11.2 km/s", "15.0 km/s"]', '11.2 km/s', 'hard'),
('Physics', 'In a photoelectric effect experiment, if frequency is doubled, what happens to max KE?', '["Doubles", "Quadruples", "Increases by hf", "Increases by more than double"]', 'Increases by more than double', 'hard');

-- Chemistry - Easy (10 questions)
INSERT INTO public.test_questions (subject, question, options, correct_answer, difficulty) VALUES
('Chemistry', 'What is the chemical symbol for Gold?', '["Go", "Gd", "Au", "Ag"]', 'Au', 'easy'),
('Chemistry', 'What is the pH of pure water?', '["5", "6", "7", "8"]', '7', 'easy'),
('Chemistry', 'How many electrons does a neutral carbon atom have?', '["4", "6", "8", "12"]', '6', 'easy'),
('Chemistry', 'What is the molecular formula of water?', '["HO", "H₂O", "H₃O", "HO₂"]', 'H₂O', 'easy'),
('Chemistry', 'What is the atomic number of Oxygen?', '["6", "7", "8", "9"]', '8', 'easy'),
('Chemistry', 'Which gas is most abundant in Earth''s atmosphere?', '["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"]', 'Nitrogen', 'easy'),
('Chemistry', 'What is the charge of a proton?', '["-1", "0", "+1", "+2"]', '+1', 'easy'),
('Chemistry', 'What is the valency of Sodium?', '["1", "2", "3", "4"]', '1', 'easy'),
('Chemistry', 'Which element has the symbol Fe?', '["Fluorine", "Iron", "Francium", "Fermium"]', 'Iron', 'easy'),
('Chemistry', 'What is the molecular formula of methane?', '["CH₂", "CH₃", "CH₄", "C₂H₆"]', 'CH₄', 'easy'),

-- Chemistry - Medium (10 questions)
('Chemistry', 'What is the oxidation state of Mn in KMnO₄?', '["+4", "+5", "+6", "+7"]', '+7', 'medium'),
('Chemistry', 'Balance: C₃H₈ + O₂ → CO₂ + H₂O. Coefficient of O₂?', '["3", "4", "5", "6"]', '5', 'medium'),
('Chemistry', 'What is the hybridization of carbon in methane (CH₄)?', '["sp", "sp²", "sp³", "sp³d"]', 'sp³', 'medium'),
('Chemistry', 'Calculate the molarity of 4g NaOH in 500mL solution (MW=40)', '["0.1 M", "0.2 M", "0.3 M", "0.4 M"]', '0.2 M', 'medium'),
('Chemistry', 'What is the IUPAC name of CH₃-CH₂-CH₂-OH?', '["Propanol", "1-Propanol", "2-Propanol", "Propanone"]', '1-Propanol', 'medium'),
('Chemistry', 'Which has the highest electronegativity?', '["Oxygen", "Fluorine", "Nitrogen", "Chlorine"]', 'Fluorine', 'medium'),
('Chemistry', 'What is the shape of NH₃ molecule?', '["Linear", "Trigonal planar", "Tetrahedral", "Trigonal pyramidal"]', 'Trigonal pyramidal', 'medium'),
('Chemistry', 'Calculate pH of 0.01 M HCl solution', '["1", "2", "3", "4"]', '2', 'medium'),
('Chemistry', 'What is the electron configuration of Fe²⁺? (Fe = 26)', '["[Ar]3d⁶", "[Ar]3d⁵4s¹", "[Ar]3d⁴4s²", "[Ar]3d⁷"]', '[Ar]3d⁶', 'medium'),
('Chemistry', 'Which reaction is endothermic?', '["Combustion", "Neutralization", "Photosynthesis", "Respiration"]', 'Photosynthesis', 'medium'),

-- Chemistry - Hard (5 questions)
('Chemistry', 'Calculate ΔG° for a reaction with K = 100 at 298K (R = 8.314 J/mol⋅K)', '["-11.4 kJ/mol", "-5.7 kJ/mol", "5.7 kJ/mol", "11.4 kJ/mol"]', '-11.4 kJ/mol', 'hard'),
('Chemistry', 'What is the crystal field splitting energy (Δ₀) order for ligands?', '["I⁻ < Br⁻ < Cl⁻ < F⁻", "F⁻ < Cl⁻ < Br⁻ < I⁻", "I⁻ < Br⁻ < F⁻ < Cl⁻", "Cl⁻ < F⁻ < Br⁻ < I⁻"]', 'I⁻ < Br⁻ < Cl⁻ < F⁻', 'hard'),
('Chemistry', 'Calculate the half-life of a first-order reaction with k = 0.0693 min⁻¹', '["5 min", "10 min", "15 min", "20 min"]', '10 min', 'hard'),
('Chemistry', 'What is the magnetic moment of [Fe(CN)₆]⁴⁻? (Fe²⁺, low spin)', '["0 BM", "2.83 BM", "4.90 BM", "5.92 BM"]', '0 BM', 'hard'),
('Chemistry', 'Which compound shows optical isomerism?', '["CH₃CHClCH₃", "CH₃CH₂CHClCH₃", "CHCl₃", "CH₃CHBrCH₂CH₃"]', 'CH₃CH₂CHClCH₃', 'hard');

-- Computer Science - Easy (10 questions)
INSERT INTO public.test_questions (subject, question, options, correct_answer, difficulty) VALUES
('Computer Science', 'What does CPU stand for?', '["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Unit"]', 'Central Processing Unit', 'easy'),
('Computer Science', 'Which of these is a programming language?', '["HTML", "CSS", "Python", "HTTP"]', 'Python', 'easy'),
('Computer Science', 'What is 1010 in binary equal to in decimal?', '["8", "10", "12", "14"]', '10', 'easy'),
('Computer Science', 'What does RAM stand for?', '["Random Access Memory", "Read Access Memory", "Rapid Access Memory", "Run Access Memory"]', 'Random Access Memory', 'easy'),
('Computer Science', 'Which data structure uses LIFO?', '["Queue", "Stack", "Array", "Tree"]', 'Stack', 'easy'),
('Computer Science', 'What is the time complexity of accessing an array element by index?', '["O(1)", "O(n)", "O(log n)", "O(n²)"]', 'O(1)', 'easy'),
('Computer Science', 'What does SQL stand for?', '["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"]', 'Structured Query Language', 'easy'),
('Computer Science', 'Which is NOT a valid variable name in most programming languages?', '["myVar", "_var", "2var", "var2"]', '2var', 'easy'),
('Computer Science', 'What is the output of: 5 // 2 in Python?', '["2", "2.5", "3", "Error"]', '2', 'easy'),
('Computer Science', 'Which protocol is used for web browsing?', '["FTP", "SMTP", "HTTP", "SSH"]', 'HTTP', 'easy'),

-- Computer Science - Medium (10 questions)
('Computer Science', 'What is the time complexity of binary search?', '["O(1)", "O(n)", "O(log n)", "O(n log n)"]', 'O(log n)', 'medium'),
('Computer Science', 'Which sorting algorithm has best average case O(n log n)?', '["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"]', 'Merge Sort', 'medium'),
('Computer Science', 'What is the output of: print(type([]) == list) in Python?', '["True", "False", "Error", "None"]', 'True', 'medium'),
('Computer Science', 'In OOP, what is encapsulation?', '["Inheritance", "Data hiding", "Polymorphism", "Abstraction"]', 'Data hiding', 'medium'),
('Computer Science', 'What is a deadlock in operating systems?', '["Process termination", "Circular wait for resources", "Memory overflow", "CPU overload"]', 'Circular wait for resources', 'medium'),
('Computer Science', 'Which data structure is best for implementing LRU cache?', '["Array", "Stack", "HashMap + Doubly Linked List", "Binary Tree"]', 'HashMap + Doubly Linked List', 'medium'),
('Computer Science', 'What is the space complexity of recursive Fibonacci?', '["O(1)", "O(n)", "O(log n)", "O(2ⁿ)"]', 'O(n)', 'medium'),
('Computer Science', 'Which SQL command is used to remove duplicates?', '["UNIQUE", "DISTINCT", "REMOVE", "DELETE"]', 'DISTINCT', 'medium'),
('Computer Science', 'What is the purpose of a foreign key in databases?', '["Primary identification", "Referential integrity", "Indexing", "Sorting"]', 'Referential integrity', 'medium'),
('Computer Science', 'In a binary tree with n nodes, what is the maximum height?', '["n", "n-1", "log n", "n/2"]', 'n-1', 'medium'),

-- Computer Science - Hard (5 questions)
('Computer Science', 'What is the time complexity of building a heap from an array?', '["O(n)", "O(n log n)", "O(n²)", "O(log n)"]', 'O(n)', 'hard'),
('Computer Science', 'Which algorithm is used in Git for version control?', '["Merkle Tree", "B-Tree", "AVL Tree", "Red-Black Tree"]', 'Merkle Tree', 'hard'),
('Computer Science', 'What is the maximum number of edges in a complete graph with n vertices?', '["n", "n²", "n(n-1)/2", "2n"]', 'n(n-1)/2', 'hard'),
('Computer Science', 'Which consistency model does MongoDB use by default?', '["Strong consistency", "Eventual consistency", "Causal consistency", "Sequential consistency"]', 'Eventual consistency', 'hard'),
('Computer Science', 'What is the space complexity of Dijkstra''s algorithm using adjacency list?', '["O(V)", "O(E)", "O(V + E)", "O(V²)"]', 'O(V + E)', 'hard');

-- English - Easy (10 questions)
INSERT INTO public.test_questions (subject, question, options, correct_answer, difficulty) VALUES
('English', 'Which is the correct spelling?', '["Recieve", "Receive", "Recive", "Receeve"]', 'Receive', 'easy'),
('English', 'What is the plural of "child"?', '["Childs", "Children", "Childes", "Childrens"]', 'Children', 'easy'),
('English', 'Identify the noun: "The quick brown fox jumps"', '["Quick", "Brown", "Fox", "Jumps"]', 'Fox', 'easy'),
('English', 'What is the past tense of "go"?', '["Goed", "Gone", "Went", "Going"]', 'Went', 'easy'),
('English', 'Which is a pronoun?', '["Run", "Happy", "She", "Quickly"]', 'She', 'easy'),
('English', 'What is the opposite of "hot"?', '["Warm", "Cool", "Cold", "Freezing"]', 'Cold', 'easy'),
('English', 'Identify the verb: "She sings beautifully"', '["She", "Sings", "Beautifully", "None"]', 'Sings', 'easy'),
('English', 'Which sentence is correct?', '["He don''t like it", "He doesn''t like it", "He not like it", "He doesn''t likes it"]', 'He doesn''t like it', 'easy'),
('English', 'What is the comparative form of "good"?', '["Gooder", "More good", "Better", "Best"]', 'Better', 'easy'),
('English', 'Which is an adjective?', '["Run", "Beautiful", "Quickly", "And"]', 'Beautiful', 'easy'),

-- English - Medium (10 questions)
('English', 'Identify the figure of speech: "The stars danced in the sky"', '["Simile", "Metaphor", "Personification", "Hyperbole"]', 'Personification', 'medium'),
('English', 'What is the passive voice of "She writes a letter"?', '["A letter is written by her", "A letter was written by her", "A letter is being written by her", "A letter has been written by her"]', 'A letter is written by her', 'medium'),
('English', 'Which is the correct use of semicolon?', '["I like tea; but not coffee", "I like tea; I don''t like coffee", "I like; tea and coffee", "I like tea; and coffee"]', 'I like tea; I don''t like coffee', 'medium'),
('English', 'What type of clause is: "because it was raining"?', '["Independent", "Dependent", "Noun", "Relative"]', 'Dependent', 'medium'),
('English', 'Identify the error: "Neither of the boys were present"', '["Neither", "boys", "were", "present"]', 'were', 'medium'),
('English', 'What is the meaning of "break the ice"?', '["To destroy something", "To start a conversation", "To be very cold", "To make a mistake"]', 'To start a conversation', 'medium'),
('English', 'Which sentence uses correct parallel structure?', '["She likes reading, writing, and to paint", "She likes reading, writing, and painting", "She likes to read, writing, and painting", "She likes reading, to write, and painting"]', 'She likes reading, writing, and painting', 'medium'),
('English', 'What is the subjunctive mood used for?', '["Facts", "Commands", "Wishes/hypotheticals", "Questions"]', 'Wishes/hypotheticals', 'medium'),
('English', 'Identify the gerund: "Swimming is good exercise"', '["Swimming", "Is", "Good", "Exercise"]', 'Swimming', 'medium'),
('English', 'What is an oxymoron?', '["Exaggeration", "Contradictory terms together", "Comparison using like/as", "Sound repetition"]', 'Contradictory terms together', 'medium'),

-- English - Hard (5 questions)
('English', 'Which literary device is used in "The pen is mightier than the sword"?', '["Synecdoche", "Metonymy", "Metaphor", "Personification"]', 'Metonymy', 'hard'),
('English', 'Identify the mood: "If I were rich, I would travel"', '["Indicative", "Imperative", "Subjunctive", "Conditional"]', 'Subjunctive', 'hard'),
('English', 'What is the correct form: "The data ___ conclusive"', '["is", "are", "was", "were"]', 'are', 'hard'),
('English', 'Which is an example of zeugma?', '["He lost his coat and his temper", "The wind whispered secrets", "Time flies like an arrow", "She sells seashells"]', 'He lost his coat and his temper', 'hard'),
('English', 'What is the function of "whom" in: "The person whom I met"?', '["Subject", "Object", "Possessive", "Predicate"]', 'Object', 'hard');

-- Create index for faster queries
CREATE INDEX idx_test_questions_subject ON public.test_questions(subject);
CREATE INDEX idx_test_questions_difficulty ON public.test_questions(difficulty);
