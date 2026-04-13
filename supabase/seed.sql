-- Seed 20 placeholder questions across 4 stages (3/5/8/4)

-- Stage 1: 3 questions (Space basics)
insert into questions (stage, order_in_stage, prompt, options, correct_idx, explanation) values
(1, 1, 'How many planets are in our solar system?', '["7", "8", "9"]', 1, 'There are 8 planets in our solar system. Pluto was reclassified as a dwarf planet in 2006 by the International Astronomical Union.'),
(1, 2, 'What is the closest star to Earth?', '["Alpha Centauri", "The Sun", "Sirius"]', 1, 'The Sun is the closest star to Earth, at about 93 million miles away. Alpha Centauri is the closest star system beyond our Sun.'),
(1, 3, 'Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter"]', 1, 'Mars is called the Red Planet because iron oxide (rust) on its surface gives it a reddish appearance when seen from Earth.');

-- Stage 2: 5 questions (History)
insert into questions (stage, order_in_stage, prompt, options, correct_idx, explanation) values
(2, 1, 'In which year did World War II end?', '["1943", "1945", "1947"]', 1, 'World War II ended in 1945 with the surrender of Germany in May and Japan in September.'),
(2, 2, 'Who was the first person to walk on the Moon?', '["Buzz Aldrin", "Neil Armstrong"]', 1, 'Neil Armstrong became the first person to walk on the Moon on July 20, 1969, during the Apollo 11 mission.'),
(2, 3, 'Which ancient civilization built the pyramids of Giza?', '["Romans", "Greeks", "Egyptians"]', 2, 'The ancient Egyptians built the pyramids of Giza around 2560 BC as tombs for their pharaohs.'),
(2, 4, 'What year did the Berlin Wall fall?', '["1987", "1989", "1991"]', 1, 'The Berlin Wall fell on November 9, 1989, marking a pivotal moment in the end of the Cold War and the reunification of Germany.'),
(2, 5, 'Who painted the Mona Lisa?', '["Michelangelo", "Leonardo da Vinci", "Raphael"]', 1, 'Leonardo da Vinci painted the Mona Lisa, believed to have been completed around 1517. It now hangs in the Louvre Museum in Paris.');

-- Stage 3: 8 questions (Science & Nature)
insert into questions (stage, order_in_stage, prompt, options, correct_idx, explanation) values
(3, 1, 'What is the chemical symbol for gold?', '["Go", "Au", "Gd"]', 1, 'The chemical symbol for gold is Au, derived from the Latin word "aurum" meaning gold.'),
(3, 2, 'How many bones does an adult human body have?', '["186", "206", "226"]', 1, 'An adult human body has 206 bones. Babies are born with about 270 bones, but many fuse together as they grow.'),
(3, 3, 'What is the largest organ in the human body?', '["Liver", "Brain", "Skin"]', 2, 'The skin is the largest organ in the human body, covering about 20 square feet in adults and accounting for about 16% of body weight.'),
(3, 4, 'What gas do plants absorb from the atmosphere?', '["Oxygen", "Carbon Dioxide", "Nitrogen"]', 1, 'Plants absorb carbon dioxide (CO2) from the atmosphere during photosynthesis and release oxygen as a byproduct.'),
(3, 5, 'What is the speed of light in a vacuum?', '["186,000 miles per second", "300,000 miles per second", "250,000 miles per second"]', 0, 'The speed of light in a vacuum is approximately 186,000 miles per second (about 300,000 kilometers per second).'),
(3, 6, 'Which element has the atomic number 1?', '["Helium", "Hydrogen", "Lithium"]', 1, 'Hydrogen has the atomic number 1. It is the lightest and most abundant element in the universe.'),
(3, 7, 'What is the hardest natural substance on Earth?', '["Titanium", "Diamond", "Quartz"]', 1, 'Diamond is the hardest natural substance on Earth, scoring 10 on the Mohs hardness scale.'),
(3, 8, 'How long does it take light from the Sun to reach Earth?', '["About 4 minutes", "About 8 minutes", "About 12 minutes"]', 1, 'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth, traveling at the speed of light across 93 million miles.');

-- Stage 4: 4 questions (Geography)
insert into questions (stage, order_in_stage, prompt, options, correct_idx, explanation) values
(4, 1, 'What is the longest river in the world?', '["Amazon", "Nile", "Mississippi"]', 1, 'The Nile River is generally considered the longest river in the world at about 4,130 miles, though some measurements put the Amazon slightly longer.'),
(4, 2, 'Which country has the most time zones?', '["Russia", "United States", "France"]', 2, 'France has the most time zones (12) when including its overseas territories. Russia has 11 contiguous time zones.'),
(4, 3, 'What is the smallest country in the world by area?', '["Monaco", "Vatican City", "San Marino"]', 1, 'Vatican City is the smallest country in the world by area, covering just about 0.17 square miles (0.44 km2).'),
(4, 4, 'On which continent is the Sahara Desert located?', '["Asia", "Africa", "South America"]', 1, 'The Sahara Desert is located in Africa. It is the largest hot desert in the world, covering about 3.6 million square miles.');
