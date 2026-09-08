# Personalization Engine Specification

## 1. Goal

The personalization system is the product's core differentiator.

Do not implement it as one giant AI agent.

Use four independent engines:

``` text
Need Engine
    |
    v
Persona Engine
    |
    v
Decision Engine
    |
    v
Learning Engine
```

Each engine has one responsibility, a strict input contract, and a
strict output contract.

------------------------------------------------------------------------

# 2. Engine 1 --- Need Engine

## Responsibility

Extract the user's stated weather needs.

The official target groups are:

-   Health-conscious
-   Outdoor fitness
-   Beachgoer / surfer
-   Traveler
-   Parent / family
-   Agriculture / gardener
-   Commuter
-   Event planner

Do not force a user into exactly one category.

A user can have multiple weighted types.

Example:

``` json
{
  "userTypes": [
    { "type": "commuter", "score": 0.91 },
    { "type": "fitness", "score": 0.73 }
  ]
}
```

## Input

``` ts
type NeedInput = {
  selections: string[];
  explanation?: string;
};
```

## Output

``` ts
type UserNeedProfile = {
  userTypes: {
    type: UserType;
    score: number;
  }[];

  needs: {
    factor: WeatherFactor;
    priority: number;
    confidence: number;
    source: "selection" | "ai" | "behavior";
  }[];

  activePeriods?: string[];

  version: number;
};
```

## Initial factor vocabulary

-   temperature
-   feels_like
-   rain
-   precipitation_probability
-   wind
-   humidity
-   uv
-   aqi
-   pollen
-   visibility
-   sunrise
-   sunset
-   tide
-   wave_height
-   water_temperature
-   soil_moisture
-   frost
-   comfort_index
-   storm

The feature registry is authoritative. AI cannot invent unsupported
feature IDs.

------------------------------------------------------------------------

# 3. Need Knowledge Matrix

Use a configurable matrix.

Example:

``` ts
const NEED_MATRIX = {
  health: {
    aqi: 1.0,
    pollen: 1.0,
    uv: 0.9,
    humidity: 0.8
  },

  fitness: {
    temperature: 0.9,
    feels_like: 0.95,
    wind: 0.8,
    sunrise: 0.9,
    sunset: 0.9,
    uv: 0.7
  },

  beach: {
    tide: 1.0,
    wave_height: 1.0,
    water_temperature: 0.9,
    wind: 0.8
  },

  traveler: {
    rain: 0.8,
    temperature: 0.6,
    storm: 1.0
  },

  family: {
    rain: 0.9,
    storm: 1.0,
    visibility: 0.8
  },

  agriculture: {
    soil_moisture: 1.0,
    rain: 1.0,
    frost: 1.0,
    temperature: 0.7
  },

  commuter: {
    rain: 0.8,
    visibility: 1.0,
    wind: 0.7,
    storm: 1.0
  },

  event_planner: {
    rain: 1.0,
    precipitation_probability: 1.0,
    comfort_index: 1.0,
    wind: 0.7
  }
};
```

These are starting weights, not final scientific probabilities.

They must remain configurable.

------------------------------------------------------------------------

# 4. Explicit Selection Must Be Stronger Than AI Inference

Evidence hierarchy:

``` text
Direct selection
      >
Explicit explanation
      >
AI inference
      >
Weak behavioral inference
```

Every need stores its source and confidence.

Never silently turn an uncertain AI inference into a fact.

------------------------------------------------------------------------

# 5. Natural Language AI Parser

Use AI only for the optional explanation.

Example:

``` text
"I cycle to college every morning. Rain and heat are the biggest problem for me."
```

Expected structured result:

``` json
{
  "userTypes": [
    {
      "type": "commuter",
      "score": 0.85
    },
    {
      "type": "fitness",
      "score": 0.58
    }
  ],
  "needs": [
    {
      "factor": "rain",
      "priority": 0.95
    },
    {
      "factor": "feels_like",
      "priority": 0.84
    }
  ],
  "activePeriods": ["morning"]
}
```

The AI output must pass:

``` text
schema validation
      |
feature registry validation
      |
normalization
      |
confidence rules
```

If validation fails, ignore the invalid field instead of allowing
arbitrary behavior.

------------------------------------------------------------------------

# 6. Engine 2 --- Persona Engine

## Responsibility

Build a continuously changing probabilistic profile.

Example:

``` json
{
  "traits": {
    "rain_sensitive": 0.93,
    "heat_sensitive": 0.77,
    "wind_sensitive": 0.52
  },

  "activities": {
    "cycling": 0.89,
    "running": 0.44
  },

  "activePeriods": {
    "morning": 0.81,
    "evening": 0.22
  }
}
```

## Evidence

Use:

-   onboarding selections
-   explicit explanations
-   repeated feature views
-   recommendation interactions
-   saved locations
-   notification interactions
-   explicit feedback
-   activity/context choices

Do not infer sensitive personal characteristics.

------------------------------------------------------------------------

# 7. Time Decay

Behavior should not remain equally important forever.

Use a configurable decay function.

Conceptually:

``` text
recent behavior = high weight
old behavior = lower weight
```

Example starting policy:

``` text
today       1.00
7 days      0.85
30 days     0.50
90 days     0.20
```

Make this configurable rather than hard-coding it into UI code.

------------------------------------------------------------------------

# 8. Engine 3 --- Decision Engine

## Responsibility

Select what matters now.

Input:

``` text
User Persona
+
Weather
+
Forecast
+
Time
+
Location
+
Current activity/context
```

Output:

``` ts
type WeatherDecision = {
  decisionId: string;
  primary: {
    type: string;
    priority: number;
    reasonCodes: string[];
  };
  secondary: [];
  confidence: number;
  expiresAt?: string;
};
```

Example:

``` json
{
  "decisionId": "dec_92831",
  "primary": {
    "type": "rain_window",
    "priority": 0.91,
    "reasonCodes": [
      "HIGH_RAIN_SENSITIVITY",
      "OUTDOOR_COMMUTE",
      "RAIN_INCOMING"
    ]
  },
  "confidence": 0.87
}
```

------------------------------------------------------------------------

# 9. Recommendation Scoring

Use deterministic scoring first.

Example:

``` text
need priority
× weather severity
× context relevance
× temporal relevance
× confidence
```

Do not begin with a black-box ML model.

This makes the system explainable and testable.

------------------------------------------------------------------------

# 10. Engine 4 --- Learning Engine

Every recommendation gets a unique decision ID.

Store:

``` text
decision
prediction
weather data snapshot
user context
user interaction
actual outcome
feedback
```

Example:

``` json
{
  "decisionId": "dec_92831",
  "prediction": {
    "type": "rain_window",
    "expectedStart": "19:30"
  },
  "actual": {
    "rainStarted": "19:42"
  },
  "userResponse": {
    "opened": true,
    "changedPlan": true,
    "feedback": "positive"
  }
}
```

This makes feedback specific.

------------------------------------------------------------------------

# 11. Feedback Types

Do not rely only on a thumbs up/down.

Capture:

## Explicit

``` text
Helpful
Not helpful
```

## Contextual

``` text
Opened insight
Expanded insight
Dismissed insight
Checked hourly
Saved location
Changed planned time
Muted notification
```

## Outcome

Compare predicted condition against observed condition.

The system can distinguish:

``` text
Forecast was wrong
Recommendation was irrelevant
Forecast was correct but recommendation was not useful
Forecast and recommendation were both useful
```

This is far more valuable than a generic rating.

------------------------------------------------------------------------

# 12. Learning Safety Rules

The Learning Engine must not immediately rewrite the user's persona
after one action.

Use:

-   repeated evidence
-   confidence
-   decay
-   minimum sample counts
-   bounded updates

Never allow one accidental tap to transform a persona.

------------------------------------------------------------------------

# 13. Testing Requirements

Each engine must have unit tests.

Minimum tests:

-   selection parsing
-   multiple personas
-   conflicting preferences
-   unknown feature
-   invalid AI output
-   confidence handling
-   time decay
-   ranking
-   decision expiration
-   feedback association
-   repeated feedback
-   cold-start user

No engine is considered complete without tests.
