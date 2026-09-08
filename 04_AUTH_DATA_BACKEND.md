# Authentication, Data and Backend Specification

## 1. Authentication Rule

The application uses **Google authentication only**.

There must be:

-   Google sign-in
-   Google account selection
-   authenticated session
-   logout
-   account deletion flow where supported

There must NOT be:

-   password field
-   password creation
-   password confirmation
-   password reset
-   "forgot password"
-   manual email/password registration

The first authentication screen should be extremely simple.

``` text
       ☁️
    Welcome

A weather experience
made for you.

[ Continue with Google ]
```

Do not make users fill out forms before Google authentication.

------------------------------------------------------------------------

# 2. Authentication Flow

``` text
App launch
   |
   v
Check session
   |
   +---- valid ----> Home
   |
   +---- invalid ---> Welcome
                          |
                          v
                    Google OAuth
                          |
                          v
                    Callback/session
                          |
                          v
                    Create/find user
                          |
                          v
                    Onboarding status
                     /           \
                 incomplete     complete
                    |               |
                    v               v
                Onboarding         Home
```

------------------------------------------------------------------------

# 3. User Table

Recommended conceptual model:

``` text
users
- id
- google_subject_id
- display_name
- avatar_url
- created_at
- updated_at
- onboarding_completed
```

Do not store a password.

The Google subject identifier is the authentication identity.

------------------------------------------------------------------------

# 4. Need Profile

``` text
user_need_profiles
- id
- user_id
- version
- profile_json
- created_at
- updated_at
```

Store a version so future engine changes do not silently corrupt old
profiles.

------------------------------------------------------------------------

# 5. Persona Profile

``` text
persona_profiles
- id
- user_id
- version
- traits_json
- activity_json
- confidence_json
- updated_at
```

Keep persona data separate from authentication identity.

------------------------------------------------------------------------

# 6. Events

Create an event stream for personalization.

Examples:

``` text
onboarding_selection
onboarding_explanation
weather_viewed
hour_selected
insight_opened
insight_dismissed
notification_opened
location_saved
feedback_positive
feedback_negative
feedback_reason_selected
planned_time_changed
```

Each event should include:

``` json
{
  "eventId": "evt_123",
  "userId": "user_123",
  "type": "insight_opened",
  "timestamp": "ISO_TIMESTAMP",
  "decisionId": "dec_92831",
  "metadata": {}
}
```

Do not collect unnecessary personal information.

------------------------------------------------------------------------

# 7. Decision Record

``` text
weather_decisions
- decision_id
- user_id
- created_at
- expires_at
- decision_type
- priority
- reason_codes
- weather_snapshot
- forecast_snapshot
```

This is essential for specific feedback.

------------------------------------------------------------------------

# 8. Feedback Record

``` text
feedback
- id
- user_id
- decision_id
- type
- reason
- created_at
```

Example:

``` text
type = negative
reason = too_late
decision_id = dec_92831
```

This tells the Learning Engine exactly what failed.

------------------------------------------------------------------------

# 9. Weather Data Separation

Do not put raw weather API responses directly into UI components.

Use:

``` text
Weather Provider
      |
      v
Weather Normalizer
      |
      v
Canonical Weather Model
      |
      v
Decision Engine / UI
```

This makes it possible to change weather providers later.

------------------------------------------------------------------------

# 10. Canonical Weather Model

Example:

``` ts
type WeatherSnapshot = {
  timestamp: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  uvIndex?: number;
  aqi?: number;
  visibility?: number;
  precipitation?: number;
  sunrise?: string;
  sunset?: string;
};
```

Optional features remain optional.

Never fabricate missing values.

------------------------------------------------------------------------

# 11. API Boundary

The mobile application should communicate with the backend through clear
APIs.

Example:

``` text
POST /auth/session
GET  /me
GET  /weather/current
GET  /weather/hourly
GET  /weather/daily

POST /onboarding/needs
GET  /profile
PATCH /profile

GET  /insights
POST /feedback
POST /events
```

Do not expose internal engine implementation unnecessarily.

------------------------------------------------------------------------

# 12. Security Rules

-   Keep secrets on the backend.
-   Do not put private API keys in the Expo client.
-   Validate authentication tokens.
-   Validate all AI outputs.
-   Validate all client events.
-   Rate-limit expensive AI calls.
-   Do not trust client-provided personalization scores.
-   Store only required data.
-   Provide account deletion/data deletion where required.

------------------------------------------------------------------------

# 13. AI API Boundary

Never:

``` text
React Native
   |
   v
LLM directly controlling app
```

Use:

``` text
React Native
   |
   v
Backend
   |
   v
AI parser
   |
   v
Schema validation
   |
   v
Need Engine
```

The backend should control the AI contract.

------------------------------------------------------------------------

# 14. Cold Start

For a new user:

``` text
Google account
   |
   v
Onboarding selections
   |
   v
Need Profile
   |
   v
Initial Persona
```

Do not pretend to know the user before they provide information.

The first profile should clearly originate from explicit choices.

------------------------------------------------------------------------

# 15. Offline / Poor Network Behavior

The app should cache:

-   last known weather
-   last personalized insight
-   profile
-   recent forecast

If network fails:

``` text
Last updated X minutes ago
```

Do not display stale information as live.

Critical severe-weather information should require current data where
possible.
