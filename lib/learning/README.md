# Learning Engine

The learning engine is the decision layer behind The Invisible Mentor.

## Current model

A topic receives a 0–100 mastery score based on:
- overall accuracy (40%)
- recent accuracy from the last five attempts (60%)

Levels:
- **0–39:** foundational
- **40–69:** developing
- **70–100:** proficient

Learning priorities combine the mastery gap with an optional exam-relevance weight.

This is an intentionally transparent first version. It is not presented as a scientifically validated measure of student ability. As real assessment data and curriculum research are added, the model can be calibrated and evaluated.

## Next extensions

1. Difficulty-aware questions.
2. Topic prerequisites.
3. Time-to-exam weighting.
4. Spaced-repetition scheduling.
5. Confidence and response-time signals.
6. Curriculum/objective mapping for WAEC, NECO and JAMB.
7. Offline evaluation against real student learning outcomes.
