# Implementation Plan, Acceptance Criteria and Anti-Generic Guardrails

## 1. Build Order

Do not build all screens first.

Build the system in this order.

### Phase 1 --- Foundation

Create:

``` text
Expo app
TypeScript
Expo Router
theme system
navigation
state
API client
auth service
```

Acceptance:

-   launches on Android/iOS through Expo-compatible workflow
-   no web-only components
-   theme tokens are centralized

------------------------------------------------------------------------

# 2. Phase 2 --- Design System

Build reusable components:

``` text
AppScreen
PrimaryButton
SecondaryButton
SelectionCard
ProgressIndicator
WeatherHero
InsightCard
MetricTile
Character
SpeechBubble
BottomNavigation
AnimatedBar
FeedbackButton
LoadingState
ErrorState
```

Every component consumes theme tokens.

No screen-specific duplicated design primitives.

------------------------------------------------------------------------

# 3. Phase 3 --- Google Authentication

Build:

``` text
Welcome
Google OAuth
Session persistence
Logout
Auth guard
```

Acceptance:

-   user taps Google
-   Google authentication opens
-   authenticated user returns to app
-   session persists
-   no password UI exists

------------------------------------------------------------------------

# 4. Phase 4 --- Need Engine

Implement:

``` text
types
user types
weather factors
feature registry
knowledge matrix
selection parser
normalizer
validator
scorer
needEngine
tests
```

Start with no AI dependency.

Test:

``` text
commuter
fitness
commuter + fitness
health + family
unknown selection
duplicate selection
empty selection
```

------------------------------------------------------------------------

# 5. Phase 5 --- AI Explanation

Add:

``` text
optional explanation
      |
      v
AI parser
      |
      v
strict schema
      |
      v
feature registry
      |
      v
Need Engine
```

If AI fails, onboarding must still work.

AI is an enhancement, not a single point of failure.

------------------------------------------------------------------------

# 6. Phase 6 --- Persona Engine

Implement:

-   weighted traits
-   behavior events
-   confidence
-   time decay
-   bounded updates
-   cold-start handling

Acceptance:

A user who repeatedly interacts with rain insights should gradually
become more rain-relevant.

A single accidental tap should not dramatically change the profile.

------------------------------------------------------------------------

# 7. Phase 7 --- Decision Engine

Implement:

``` text
need relevance
weather severity
context relevance
time relevance
confidence
priority ranking
```

Acceptance:

Different profiles viewing the same weather can receive different
primary insights.

Example:

``` text
Cyclist:
"Rain likely after 7 PM."

Runner:
"Best running window: 5:30–6:30 PM."

Health-focused:
"AQI is the main concern today."
```

------------------------------------------------------------------------

# 8. Phase 8 --- Personalized Home

Do not create a static dashboard.

Home should consume:

``` text
ExperienceConfig
```

generated from:

``` text
Persona
+
Weather
+
Decision
```

The UI should change its content hierarchy based on the profile.

------------------------------------------------------------------------

# 9. Phase 9 --- Forecasts

Build:

-   hourly
-   daily
-   detailed weather

But keep the same visual language.

Hourly and daily screens should still feel like part of the
character-led product.

------------------------------------------------------------------------

# 10. Phase 10 --- Learning and Feedback

Implement:

``` text
decision ID
feedback
feedback reason
outcome
learning update
```

Acceptance:

The system can answer:

> Which recommendation did the user say was unhelpful?

and:

> Why was it unhelpful?

------------------------------------------------------------------------

# 11. Phase 11 --- Audio

Create:

``` text
AudioManager
AudioSettings
AudioEvent
```

Audio events:

``` text
selection
progress
success
error
feedback_positive
feedback_negative
notification
```

Every audio event must be suppressible through the user's sound setting.

------------------------------------------------------------------------

# 12. Phase 12 --- Motion

Use Reanimated.

Required:

## Progress

``` text
0% -> 25% -> 50% -> 75% -> 100%
```

Animate the fill width.

## Selection

``` text
normal
  ->
selected
```

Animate scale/border/checkmark.

## Weather bars

``` text
0
  ->
target
```

Example:

``` text
Rain probability

0%        █
25%       ███
50%       █████
75%       ███████
100%      █████████
```

The animation must reflect actual values.

Do not fake data for visual effect.

------------------------------------------------------------------------

# 13. UI Acceptance Test

The app fails the design review if it looks like:

``` text
temperature card
humidity card
wind card
UV card
AQI card
pressure card
visibility card
sunrise card
sunset card
```

all visible at once.

It should instead look like:

``` text
Greeting

28°

Character

Your main insight

Supporting forecast

One or two relevant details

Bottom navigation
```

The user should immediately understand:

> "Why is the app showing me this?"

------------------------------------------------------------------------

# 14. Anti-Generic Weather Rules

## Rule 1

No generic dashboard template.

## Rule 2

No universal fixed card order.

## Rule 3

No fixed "top 6 weather metrics" for every user.

## Rule 4

No long weather explanations on the home screen.

## Rule 5

No AI chatbot as the main interface.

## Rule 6

No character pasted into a normal weather dashboard.

## Rule 7

No hard-coded personalized copy that ignores the Decision Engine.

## Rule 8

No fake recommendations.

Every recommendation must have:

``` text
decision ID
reason
weather evidence
user relevance
```

------------------------------------------------------------------------

# 15. Global Style Acceptance Test

Change:

``` ts
theme.colors.primary
```

and verify:

-   buttons change
-   progress indicators change
-   selected states change
-   relevant highlights change

Change:

``` ts
theme.spacing.md
```

and verify:

-   cards
-   buttons
-   screen padding
-   component spacing

respond consistently.

Change typography tokens and verify the hierarchy remains coherent.

If a component needs a special hard-coded value, document why.

------------------------------------------------------------------------

# 16. Character Placeholder Rule

Until final character assets are available, use emoji.

Examples:

``` text
☀️ happy
🌧️ worried
🥵 hot
🥶 cold
💨 windy
😴 sleeping
🤔 thinking
🥰 successful
👍 helpful
👎 not helpful
```

The character component should abstract the asset:

``` ts
<Character state="happy" />
```

Later:

``` text
emoji implementation
      ↓
final character asset
```

without changing the entire UI.

Do not scatter emoji strings throughout the application.

------------------------------------------------------------------------

# 17. Content Rules

Primary copy should be:

-   short
-   human
-   conversational
-   specific
-   useful

Good:

> "Your morning looks good."

Good:

> "Rain likely after 7 PM."

Good:

> "Cooler between 6--7 AM."

Bad:

> "The meteorological conditions indicate a precipitation probability of
> 72%."

Detailed scientific information belongs in the detailed screen.

------------------------------------------------------------------------

# 18. Error States

Never leave blank screens.

Examples:

``` text
Weather unavailable

☁️

We couldn't get the latest weather.
Try again in a moment.

[ Try again ]
```

The character can communicate errors visually.

------------------------------------------------------------------------

# 19. Loading States

Avoid generic spinners everywhere.

Use:

-   skeletons
-   subtle progress
-   character loading state
-   animated bars where actual data is available

Do not animate fake weather values as if they are real.

------------------------------------------------------------------------

# 20. Engineering Quality Rules

Before considering the project complete:

-   run TypeScript checks
-   run lint
-   run tests
-   remove unused imports
-   remove dead components
-   remove duplicate styles
-   remove placeholder routes
-   verify navigation
-   verify auth
-   verify error states
-   verify empty states
-   verify audio toggle
-   verify reduced motion
-   verify small-screen layout
-   verify Android
-   verify iOS-compatible Expo workflow

------------------------------------------------------------------------

# 21. Definition of Product Success

The product should pass this question:

> If we hide the logo and show the home screen to someone, does it
> immediately look like a personalized weather companion rather than
> another weather app?

If the answer is no, continue simplifying and personalizing.

The central product loop is:

``` text
Tell us about yourself
        ↓
We understand your needs
        ↓
We personalize your weather
        ↓
You interact with useful insight
        ↓
You tell us whether it helped
        ↓
We learn
        ↓
Tomorrow feels more personal
```

That loop is more important than adding more weather metrics.
