# Personalized Mausam Weather App --- Master Architecture Specification

## 1. Purpose

Build a **mobile-first personalized weather companion** for the India
Meteorological Department / Mausam problem statement.

This is NOT a generic weather dashboard.

The product principle is:

> **Do not show everyone the same weather. Show each person the weather
> they need.**

The application combines:

-   personalized onboarding
-   user-need identification
-   persona learning
-   contextual weather decisions
-   playful character-led presentation
-   progressive disclosure
-   feedback learning
-   Google-only authentication
-   audio feedback
-   centralized global styling
-   responsive mobile layouts for different phone sizes

The reference visual direction is the uploaded 17-screen flow: soft
sky-blue surfaces, rounded cards, friendly typography, large breathing
space, a cute blue character, short conversational copy, simple
iconography, progress indicators, playful feedback, and weather scenes
that change with context.

------------------------------------------------------------------------

# 2. Non-Negotiable Product Rules

## MUST

-   Build a **React Native + Expo mobile application**.
-   Do NOT build a web application.
-   Use TypeScript.
-   Use Expo Router for navigation.
-   Use Google authentication directly.
-   Do NOT create a password field.
-   Do NOT create email/password registration.
-   Do NOT make a generic weather dashboard.
-   Keep the UI character-led and playful.
-   Keep screens focused on one primary idea.
-   Use large touch targets.
-   Use progressive disclosure.
-   Use a global design/token system.
-   Keep weather logic separate from presentation.
-   Keep personalization engines separate from UI.
-   Make every engine testable independently.
-   Track recommendation/decision IDs so feedback can be tied to a
    specific prediction.
-   Support explicit user preferences AND optional natural-language
    explanations.
-   Use audio feedback for meaningful actions, not continuously.
-   Animate progress bars and selection states smoothly.
-   Make the app feel alive without depending on animation for
    comprehension.

## MUST NOT

-   Do not create a desktop/web dashboard.
-   Do not fill the home screen with metric cards.
-   Do not show every weather metric by default.
-   Do not make the LLM directly control navigation or UI.
-   Do not allow AI to invent unsupported weather features.
-   Do not hard-code colors throughout components.
-   Do not hard-code typography sizes throughout screens.
-   Do not duplicate styles screen-by-screen.
-   Do not store passwords.
-   Do not create a password reset flow.
-   Do not make the character a chatbot.
-   Do not use long paragraphs on primary screens.
-   Do not use dense tables as the default weather presentation.
-   Do not create fake personalization before enough data exists.
-   Do not claim forecast certainty when the source is probabilistic.

------------------------------------------------------------------------

# 3. High-Level System

``` text
                         GOOGLE AUTH
                              |
                              v
                           USER
                              |
              +---------------+---------------+
              |                               |
        Explicit choices              Optional text
              |                               |
              |                              AI
              |                               |
              +---------------+---------------+
                              |
                              v
                       NEED ENGINE
                              |
                              v
                    USER NEED PROFILE
                              |
                              v
                      PERSONA ENGINE
                              |
                              v
                    PERSONAL USER MODEL
                              |
                    +---------+---------+
                    |                   |
                    v                   v
               WEATHER DATA          CONTEXT
                    |                   |
                    +---------+---------+
                              |
                              v
                     DECISION ENGINE
                              |
                              v
                 EXPERIENCE CONFIGURATION
                              |
                              v
                       MOBILE UI
                              |
                              v
                         USER ACTION
                              |
                              v
                     FEEDBACK ENGINE
                              |
                              v
                     LEARNING ENGINE
                              |
                              +------> Persona update
                              +------> Decision calibration
```

------------------------------------------------------------------------

# 4. Recommended Technology Stack

## Mobile

-   React Native
-   Expo
-   TypeScript
-   Expo Router
-   React Native Reanimated
-   React Native Gesture Handler where required
-   expo-av / current Expo audio APIs appropriate to the installed Expo
    SDK
-   expo-auth-session or the current recommended Google OAuth approach
    for Expo
-   expo-secure-store
-   expo-notifications

## State

Use a predictable state architecture.

Recommended:

-   Zustand for local/client application state
-   TanStack Query for remote server/weather data caching

Do not put every piece of state into one global store.

## Backend

Recommended:

-   Node.js
-   TypeScript
-   REST or typed RPC API
-   PostgreSQL

## AI

Use an LLM only where natural-language interpretation adds value.

The AI should convert:

``` text
"I cycle to college every morning and hate riding in rain."
```

into validated structured needs.

The AI should NOT decide the final UI.

## Storage

Separate:

-   authentication identity
-   user preferences
-   user need profile
-   persona profile
-   weather observations
-   recommendations
-   feedback events

------------------------------------------------------------------------

# 5. Application Layers

``` text
app/
  navigation and route screens

components/
  reusable UI components

features/
  feature-specific presentation and hooks

engine/
  pure personalization/business engines

services/
  API/auth/weather/audio services

state/
  client state

design/
  global tokens/theme/style system

types/
  shared TypeScript contracts

utils/
  generic utilities

assets/
  character assets, icons, audio
```

The engine layer must never import React components.

The design layer must not contain business logic.

The weather service must not know how the homepage looks.

------------------------------------------------------------------------

# 6. Engine Boundaries

## Need Engine

Answers:

> What does the user say they need?

Input:

-   onboarding selections
-   optional natural-language explanation

Output:

-   user types
-   weather priorities
-   confidence
-   source

## Persona Engine

Answers:

> What kind of weather user is this based on explicit preferences and
> observed behavior?

Output:

-   probabilistic persona traits
-   stable interests
-   time/activity patterns

## Decision Engine

Answers:

> What matters to this user right now?

Input:

-   persona
-   current weather
-   forecast
-   location
-   time
-   activity
-   risk conditions

Output:

-   ranked recommendations
-   primary insight
-   secondary information
-   urgency
-   reason codes

## Learning Engine

Answers:

> Was our recommendation useful and accurate?

Input:

-   decision ID
-   predicted condition
-   actual condition
-   user action
-   explicit feedback

Output:

-   calibration updates
-   preference updates
-   recommendation usefulness signals

------------------------------------------------------------------------

# 7. UI Architecture

The UI must consume an **experience configuration**, not raw
personalization internals.

Example:

``` ts
type ExperienceConfig = {
  primaryInsight: {
    type: "commute_window";
    title: string;
    shortMessage: string;
    priority: number;
  };

  visibleFeatures: string[];

  characterState: string;

  cards: {
    type: string;
    priority: number;
  }[];

  action: {
    label: string;
    destination?: string;
  };
};
```

The UI renderer decides how to display this.

The Decision Engine never returns React elements.

------------------------------------------------------------------------

# 8. Mobile Navigation

Primary navigation should remain simple:

-   Home
-   Forecast
-   Tips
-   Profile

Use a bottom navigation bar similar in simplicity to the reference flow.

Do not add 8--10 navigation destinations.

Secondary pages should open through contextual actions.

------------------------------------------------------------------------

# 9. Core User Journey

``` text
Launch
  |
  v
Welcome
  |
  v
Google Sign-In
  |
  v
What brings you here?
  |
  v
Anything else?
  |
  v
What affects you most?
  |
  v
When are you usually active?
  |
  v
All set
  |
  v
Personalized Home
```

After onboarding:

``` text
Home
  |
  +--> Hourly
  +--> Daily
  +--> Insight details
  +--> Character interaction
  +--> Feedback
  +--> Profile
```

------------------------------------------------------------------------

# 10. Definition of Done

The architecture is considered implemented only when:

-   The app launches in Expo.
-   It is clearly a mobile application.
-   Google authentication works.
-   Password authentication does not exist.
-   Onboarding produces a real structured NeedProfile.
-   The Need Engine can run without AI.
-   Natural-language parsing is optional and validated.
-   Persona scores update from real events.
-   Decision Engine produces deterministic structured decisions.
-   Every recommendation has a decision ID.
-   Feedback is linked to the exact decision.
-   UI reads global design tokens.
-   Changing the global primary color updates the application.
-   Changing global spacing/typography updates the relevant components.
-   Selection/progress bars animate.
-   Audio feedback works with mute controls.
-   Loading/error/empty states exist.
-   No dead/unused screens or placeholder dashboard components remain.
