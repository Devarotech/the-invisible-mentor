# Database layer

The Invisible Mentor uses PostgreSQL with Neon and Drizzle.

## Why this layer exists

The product needs durable data for:

- student profiles and exam preparation
- subject selections
- curriculum topics and prerequisites
- verified content sources
- questions and assessment attempts
- topic mastery
- generated study plans
- learning sessions

The database replaces the current browser-only prototype storage as the product moves toward multi-device student accounts.

## Important

The current curriculum in `lib/curriculum/model.ts` is prototype data. Do not present its exam relevance values as official WAEC, NECO, or JAMB weighting. Production curriculum data must be mapped from verified sources and versioned.

Do not store unnecessary sensitive information about students. The final authentication and guardian/privacy workflow must be designed before production use by minors.
