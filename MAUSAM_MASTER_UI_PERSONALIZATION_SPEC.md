# MAUSAM — MASTER UI + PERSONALIZATION IMPLEMENTATION SPEC

**Problem Statement:** 26076  
**Product:** Mausam — Personalized Weather Experience  
**Organization:** Ministry of Earth Sciences (MoES)  
**Department:** India Meteorological Department (IMD)

## 1. Product goal

Build a modern, personal, calm and glanceable weather application.

The home screen must answer:

1. Where am I?
2. What is the weather now?
3. What matters to me right now?
4. What should I know next?

The application must feel **simple on the surface and intelligent underneath**.

Do not build a weather dashboard that exposes every available data point.

Use:

```text
Weather data
    ↓
Normalized weather
    ↓
Atmosphere diagnosis
    ↓
Activity analysis
    ↓
Personalization
    ↓
Recommendation ranking
    ↓
Home composer
    ↓
Simple UI
```

---

# 2. Current scope

Implement first:

- splash/startup
- onboarding
- user preferences
- personalized home
- current weather
- hourly forecast
- daily forecast
- details
- atmosphere diagnosis
- deterministic recommendations
- day/night/sunset theme
- loading/skeleton states
- error states
- smooth transitions
- responsive layout
- real vector UI icons
- proper weather icons
- emoji only as temporary character placeholders

Do **not** implement yet:

- final animated character
- AI assistant
- ML personalization
- complicated tab navigation
- fake recommendations
- fake weather values

---

# 3. UI philosophy

The provided reference is the direction:

- friendly
- soft
- spacious
- playful
- personal
- modern
- easy to scan

Do not copy another product literally.

The important principle is:

> **Less information, stronger hierarchy, more breathing space.**

The home should feel closer to a premium mobile weather experience than an enterprise dashboard.

Do not put every piece of information inside a card.

Do not use a card for every metric.

Use whitespace, typography, alignment and subtle surface contrast.

---

# 4. Information hierarchy

Homepage order:

```text
HEADER
    location
    profile/menu

WEATHER HERO
    temperature
    condition
    feels-like
    minimal supporting metrics

BREATHING SPACE

PRIMARY PERSONALIZED INSIGHT
    one important thing

BREATHING SPACE

HOURLY FORECAST

BREATHING SPACE

SMALL SUPPORTING INFORMATION

BREATHING SPACE

DETAIL / MORE
```

Normally show only **one primary personalized insight**.

If nothing important is happening, show a short normal-state summary.

Do not manufacture advice just to fill space.

---

# 5. Global design tokens

All visual values must be centralized.

Use the existing **Ponytail** styling architecture.

Do not scatter colors/radii/shadows throughout components.

Centralize:

```text
colors
spacing
radii
typography
icon sizes
elevation
opacity
animation timing
day-cycle themes
```

Reuse existing tokens if the project already has them.

Do not create a second styling system.

---

# 6. Color system

## Day theme

```text
background.primary      #F4FAFD
background.secondary    #EAF6FB

surface.primary         #FFFFFF
surface.secondary       #F7FCFE
surface.blue            #E7F6FC

brand.primary           #159FE3
brand.pressed           #0C87C7

text.primary            #12324A
text.secondary          #587184
text.tertiary           #8499A8
text.disabled           #AEBFC9
```

Use pure white mainly for elevated surfaces, not as the permanent full-screen background.

## Night theme

Night is a real atmospheric theme, not an inverted day theme.

```text
background.primary      #071521
background.secondary    #0B1F2E

surface.primary         #102A3B
surface.elevated        #153449
surface.blue            #123A52

brand.primary           #35B7F2
brand.pressed           #1599D5

text.primary            #F3FAFF
text.secondary          #B9CEDA
text.tertiary           #8199A8
```

At night, do not render a white page and then switch to dark.

## Dawn

```text
background.top          #DCEFFF
background.bottom       #F9F7F1
accent                  #FFB45E
```

## Morning

```text
background.top          #BFEAFF
background.bottom       #F4FBFF
accent                  #159FE3
```

## Afternoon

```text
background.top          #B7E6FA
background.bottom       #F4FBFD
accent                  #159FE3
```

## Sunset

```text
background.top          #FFD9B0
background.bottom       #F7C8D5
accent                  #E9876C
```

## Evening

```text
background.top          #203A5A
background.bottom       #0E2338
accent                  #66B9E8
```

Gradients are for atmospheric backgrounds only. Do not put gradients on every card or button.

---

# 7. Semantic status colors

Use status colors only when they communicate actual state.

```text
good            #21B77A
goodSurface     #E7F8F0

warning         #F2A93B
warningSurface  #FFF5DF

danger          #E85C5C
dangerSurface   #FDECEC

info            #159FE3
infoSurface     #E6F6FC
```

Do not color random components simply for decoration.

---

# 8. Radius system

Use a consistent radius scale:

```text
radius.xs       8px
radius.sm       12px
radius.md       16px
radius.lg       20px
radius.xl       24px
radius.pill     999px
```

Recommended:

```text
small controls       8–12px
standard cards       16px
hero cards           20–24px
buttons              14–16px
chips                999px
```

Do not invent unique radii for every component.

---

# 9. Borders

Default:

```text
borderWidth = 0
```

Remove decorative borders from:

- cards
- forecast surfaces
- metric groups
- recommendation surfaces
- glass surfaces
- buttons
- headers
- nested containers

Keep borders only when genuinely necessary for:

- accessibility/focus
- selected state
- functional separation
- usability/contrast

Do not use bright outlines to create hierarchy.

Use spacing and tonal contrast instead.

---

# 10. Elevation and shadows

Mausam should feel soft, not heavily floating.

### Level 0

No shadow.

### Level 1

For normal cards:

```text
very low opacity
blur approximately 10–16px
offsetY approximately 2–4px
```

### Level 2

For sheets/major floating surfaces:

```text
blur approximately 18–24px
offsetY approximately 5–8px
```

Do not use thick dark shadows.

Do not put a shadow around every small component.

---

# 11. Glass surfaces

Use glass selectively.

Recommended:

```text
semi-transparent surface
moderate backdrop blur
no hard border
minimal shadow
```

Do not make the entire application glassmorphic.

Glass should be a supporting visual treatment.

---

# 12. Buttons

## Primary button

```text
background       #159FE3
text             #FFFFFF
radius           16px
height           48–52px
horizontal pad   20px
```

Pressed:

```text
background       #0C87C7
scale            ~0.98
duration         120–160ms
```

Do not use neon glow, bevels, glossy effects or thick outlines.

## Secondary button

```text
background       #E7F6FC
text             #12324A
radius           16px
height           48–52px
border           none
```

Pressed:

```text
background       #D6EEF8
scale            ~0.98
```

## Text button

```text
background       transparent
text             #159FE3
radius           12px
```

Do not turn every action into a pill.

## Icon button

```text
size             40–44px
radius           12–14px
background       transparent or soft surface
```

Pressed:

```text
background       rgba(21,159,227,0.10)
scale            0.97–0.98
```

Use circular icon buttons only where appropriate.

---

# 13. Icon system — critical

**Emoji are NOT UI icons.**

Never use emoji for:

- search
- menu
- location
- settings
- profile
- notification
- back
- humidity
- wind
- UV
- temperature
- forecast
- navigation
- controls

Use real vector icons.

Use the project's existing icon library if one exists.

If an icon library is needed, prefer a consistent vector system such as **Lucide / Lucide React Native**, subject to the project's existing dependencies.

Do not install duplicate icon libraries.

---

# 14. Weather icons

Use a dedicated weather icon set where appropriate.

Map normalized weather conditions to real vector/weather icons:

```text
clear_day
clear_night
partly_cloudy_day
partly_cloudy_night
cloudy
rain
heavy_rain
thunderstorm
fog
snow
```

Architecture:

```text
API code
    ↓
Normalized WeatherCondition
    ↓
WeatherIcon
    ↓
Real vector/weather asset
```

Do not hardcode random icons inside screens.

Do not use ☀️, 🌧️, 💨, 💧 as UI weather icons.

---

# 15. Temporary character

The final character is intentionally postponed.

For now:

```text
CharacterPlaceholder
```

may render an emoji.

Examples:

```text
🏃 fitness
🌱 agriculture
🌧️ rain
🥵 heat
😴 night
🌊 beach
```

Emoji are allowed **only for the future character/content placeholder**.

Do not scatter emoji across unrelated UI.

Keep the placeholder behind a component so it can later become:

```text
CharacterPlaceholder
        ↓
AnimatedCharacter
```

without changing the intelligence engine.

---

# 16. Day-cycle engine

Do not hardcode a universal:

```text
night = 8 PM
```

Use:

```text
current local time
timezone
sunrise
sunset
```

to determine:

```text
DAWN
MORNING
AFTERNOON
SUNSET
EVENING
NIGHT
```

Day-cycle affects:

- background
- surface colors
- weather image
- weather icon variant
- character placeholder state
- recommendation wording
- contrast
- atmospheric effects

---

# 17. Night behavior

At night the UI must become visually appropriate.

Do not show:

- white background
- daytime sun artwork
- daytime weather imagery
- "Good morning"
- sunscreen-now advice
- bright daytime atmosphere

Instead:

```text
dark navy atmosphere
night weather icon
night imagery
quiet surfaces
tomorrow-focused recommendations
```

Example:

```text
11:30 PM

Good night.

28°
Clear

Tomorrow
Warm afternoon expected.

Best outdoor window
6:00–7:30 AM
```

---

# 18. Weather imagery

Weather imagery depends on:

```text
weather condition
+
day cycle
```

Examples:

```text
clear_day
clear_sunset
clear_night

cloudy_day
cloudy_night

rain_day
rain_night

storm_day
storm_night
```

Images should support the UI, not overpower it.

Use a subtle overlay when required for text readability.

Do not use one static image regardless of time.

---

# 19. White-flash prevention

This is a hard requirement.

Never allow:

```text
white frame
    ↓
day UI
    ↓
night UI
```

or:

```text
white frame
    ↓
weather
```

Startup concept:

```text
APP START
    ↓
determine local day cycle immediately
    ↓
initialize correct theme
    ↓
render atmospheric background
    ↓
weather request
    ↓
skeleton
    ↓
weather data
    ↓
smooth crossfade
```

Do not mount the entire application twice just to change theme.

---

# 20. Animation

Animations must be subtle.

Allowed:

- fade
- opacity
- small translate
- small scale
- crossfade

Avoid:

- bouncing everything
- excessive parallax
- giant elastic motion
- spinning icons
- constant decorative motion

Recommended timings:

```text
fast       120–160ms
normal     180–240ms
medium     250–320ms
slow       350–450ms
```

Buttons should feel immediate.

Content crossfades should normally be around 180–260ms.

Respect reduced-motion settings.

---

# 21. Loading states

Never display fake weather values while loading.

Use skeleton/shimmer for:

- temperature
- condition
- metrics
- forecast
- insight

Skeletons must use the active day/night surface.

Do not use a bright white shimmer on a night screen.

Keep layout dimensions stable to prevent jumping.

---

# 22. Error states

If weather fails:

```text
Weather unavailable
Check your connection and try again.

[Retry]
```

Do not invent weather.

If cached data is shown, clearly identify it as cached/stale.

---

# 23. Weather data architecture

Never make UI components depend directly on one provider's response.

Use:

```text
Weather Provider
    ↓
Provider Adapter
    ↓
Normalized Weather Model
    ↓
Weather Service / Store
    ↓
Intelligence Engine
```

This makes changing providers possible later.

---

# 24. Normalized weather data

At minimum support:

```text
time
temperature
apparentTemperature
humidity
precipitation
precipitationProbability
windSpeed
windDirection
windGust
visibility
cloudCover
uvIndex
weatherCode
sunrise
sunset
timezone
```

AQI, pollen, soil, tides and other specialized datasets should have their own normalized models when necessary.

---

# 25. Atmosphere diagnosis

The application must not merely display raw API values.

Convert raw data into meaningful signals:

```text
heatLevel
humidityLevel
uvRisk
rainRisk
windCondition
airQualityCondition
visibilityCondition
stormRisk
outdoorComfort
```

The diagnosis must use the relevant forecast window, not only current conditions.

---

# 26. Personalization model

Separate preferences.

## Persona

```text
fitness
agriculture
traveler
commuter
family
health
event_planner
beachgoer
```

## Weather concerns

```text
rain
heat
cold
wind
humidity
air_quality
uv
snow
storm
```

## Active periods

```text
morning
afternoon
evening
night
```

Do not put all of these into one generic field.

---

# 27. Personalization pipeline

```text
User Profile
+
Current Time
+
Weather Timeline
+
Atmosphere Diagnosis
+
Persona
+
Weather Concerns
+
Active Periods
        ↓
Recommendation Scoring
        ↓
Ranking
        ↓
Deduplication
        ↓
Home Composer
```

---

# 28. Recommendation engine

Start deterministic and rule-based.

Do NOT start with ML.

Recommendations should consider:

```text
user relevance
weather severity
time relevance
actionability
confidence
recency
```

Each recommendation should have structured data:

```text
id
category
type
priority
title
summary
startTime
endTime
score
reasons
confidence
expiresAt
```

Every recommendation must be explainable.

---

# 29. Time-aware recommendations

Recommendations must describe NOW or NEXT.

Bad at 11:30 PM:

```text
Use sunscreen now.
```

Good:

```text
UV will be high tomorrow around noon.
```

At 1 PM:

```text
UV is high now.
```

At 7 PM:

```text
UV is falling.
```

Recommendations must expire when their useful window ends.

---

# 30. NOW / NEXT / LATER

Use:

```text
NOW
What matters immediately?

NEXT
What will matter in the next few hours?

LATER
What should I prepare for?
```

Example at 10 PM:

```text
NOW
Cool evening.

NEXT
Clear overnight.

LATER
High UV tomorrow afternoon.
```

---

# 31. Activity calculators

Create focused calculators such as:

```text
findBestRunningWindow()
findOutdoorComfortWindow()
findIrrigationWindow()
findCommuteRiskWindow()
findOutdoorEventWindow()
```

Inputs should include relevant weather values and the user's context.

Output should contain:

```text
start
end
score
reasons
confidence
```

The calculator does not own UI logic.

---

# 32. Example — fitness

Forecast:

```text
08:00  26°C
10:00  30°C
12:00  34°C
14:00  36°C
18:00  29°C
20:00  27°C
```

Engine:

```text
morning     good
afternoon   poor due to heat
evening     excellent
```

Home:

```text
🏃 Best time to exercise
6:00–7:30 PM

Cooler and lower rain risk.
```

Do not show eight separate tips.

---

# 33. Example — agriculture

Data:

```text
soil moisture: high
rain probability: 80%
rain window: evening
```

Home:

```text
🌱 Field conditions
Good today

Rain expected this evening.
Irrigation may not be needed.
```

Do not display five separate cards saying:

- no frost
- good sowing
- good growing
- adequate moisture
- low risk

when they all communicate normal conditions.

---

# 34. Home Composer

The engine may return 15 recommendations.

The home must NOT display all 15.

Use:

```text
15 candidates
    ↓
remove expired
    ↓
rank
    ↓
deduplicate
    ↓
select 1 primary
    ↓
select 1–2 secondary
    ↓
render
```

This is how the app stays personal without becoming crowded.

---

# 35. Normal state

No warning is a valid state.

Example:

```text
Field conditions
Good today
```

Do not create fake recommendations to fill empty space.

---

# 36. UI composition

Cards should contain meaningful groups.

Good:

```text
Best time to run
6:00–7:30 PM
```

Bad:

```text
One card for temperature
One card for humidity
One card for UV
One card for wind
One card for rain
```

Use compact information rows where appropriate:

```text
Humidity 62%    Wind 12 km/h    UV 3
```

---

# 37. Hero weather

The hero should have the strongest hierarchy.

Example:

```text
28°
Clear sky
Feels like 31°
```

Then a quiet metric row:

```text
Humidity 62%    Wind 12 km/h    UV 3
```

Temperature should be the largest element.

Do not add long marketing sentences above it.

---

# 38. Remove marketing copy

Avoid:

```text
Plan Today for a Better Harvest.

Weather insights for healthier crops and stronger tomorrows.
```

Prefer:

```text
Good evening.
```

or:

```text
Rain expected later.
```

The weather should be the message.

---

# 39. Breathing space

Whitespace is functional.

Use approximately 24–32px between major sections where appropriate.

Do not compress sections just to fit more information.

The user should visually understand:

```text
Weather

[space]

Insight

[space]

Forecast

[space]

Details
```

Do not produce:

```text
card
card
card
card
card
```

with no breathing room.

---

# 40. Typography

Use a clear hierarchy.

Recommended starting values:

```text
hero temperature       48–64px
hero condition         18–22px
section heading        16–18px
primary insight        18–20px
body                   14–16px
secondary              12–14px
```

Do not make every heading bold.

If everything is emphasized, nothing is emphasized.

---

# 41. Text style

Prefer:

```text
Rain likely after 5 PM.
```

instead of:

```text
Moderate precipitation is expected to occur during the later evening
hours and users may want to prepare accordingly.
```

Prefer:

```text
Best run: 6–7:30 PM
```

instead of long explanatory paragraphs.

Details can be shown after interaction.

---

# 42. Onboarding

Recommended flow:

```text
1. Welcome
2. Choose main use
3. Optional explanation
4. What affects you most?
5. When are you usually active?
6. Complete
```

Store the information as separate concepts:

```text
persona
weatherConcerns
activePeriods
```

Example:

```json
{
  "persona": "fitness",
  "weatherConcerns": ["heat", "rain"],
  "activePeriods": ["morning", "evening"]
}
```

---

# 43. Onboarding selection states

Unselected:

```text
background: #FFFFFF
radius: 16px
border: none
```

Selected:

```text
background: #E7F6FC
accent: #159FE3
radius: 16px
```

Selection should be communicated through:

- surface change
- icon state
- text weight
- optional check indicator

Do not rely on a thin border alone.

---

# 44. Progress indicator

Use small, quiet indicators.

```text
active: #159FE3
inactive: #C9DCE6
```

Avoid heavy progress bars.

---

# 45. Navigation

Do not add a tab for every feature.

Avoid:

```text
Home
Forecast
Agriculture
Health
Fitness
Travel
Insights
```

Use contextual navigation:

```text
Home
  ↓
Detail
  ↓
Back
```

Keep profile/settings accessible without turning the application into a navigation maze.

---

# 46. Profile/settings

Keep settings simple:

```text
Your interests
Active times
Units
Notifications
Appearance
Locations
```

Do not expose internal engine controls.

---

# 47. Accessibility

Interactive controls should have:

- approximately 44px+ touch targets where practical
- readable text
- sufficient contrast
- accessible labels
- non-color-only state communication

Focus indicators should remain available where needed.

---

# 48. Responsive behavior

Support:

- small phones
- normal phones
- large phones
- tablets
- landscape where appropriate

Do not solve layout problems with dozens of breakpoints.

Use flexible layouts and scalable spacing.

Do not turn tablet UI into a dense desktop dashboard.

---

# 49. Component architecture

Use meaningful components:

```text
AppShell
SplashScreen
Onboarding
LocationHeader
WeatherHero
MetricRow
PrimaryInsight
HourlyForecast
DailyForecast
WeatherDetails
RecommendationCard
LoadingSkeleton
ErrorState
CharacterPlaceholder
WeatherIcon
IconButton
PrimaryButton
SecondaryButton
```

Do not make a component for every wrapper.

Do not create one giant screen component.

---

# 50. Intelligence architecture

Recommended structure:

```text
features/
  weather/
    api/
    adapters/
    models/

  intelligence/
    signals/
    activities/
    windows/

  personalization/
    profile/
    context/
    scoring/
    ranking/

  recommendations/
    rules/
    recommendationEngine/

  home/
    homeComposer/

components/

theme/

services/
```

Build incrementally. Do not create empty folders just to look architectural.

---

# 51. Engine/UI separation

The engine decides:

```text
weather diagnosis
priority
recommendation
confidence
time window
```

The UI decides:

```text
layout
color
icon
animation
typography
```

Never put weather thresholds directly inside React Native presentation components.

Bad:

```text
if (temperature > 35) ...
```

inside a UI component.

Good:

```text
weatherEngine → heatSignal
```

then render the signal.

---

# 52. No fake intelligence

Never hardcode:

```text
Good conditions
Best time
Rain likely
Stay hydrated
Use sunscreen
```

unless actual weather calculations support the statement.

If required data is missing:

```text
Data unavailable
```

or lower the confidence.

Never invent:

- AQI
- pollen
- soil moisture
- tide
- wave height
- traffic
- alerts
- rain probability

---

# 53. Data freshness

Track:

```text
provider
timestamp
age
```

If data is too old for a feature, do not present it as current.

---

# 54. Performance

Keep calculations out of render where possible.

Avoid:

- unnecessary re-renders
- repeatedly recalculating the same forecast
- loading all imagery simultaneously
- unnecessary navigation stacks
- unnecessary animation trees

Memoize only where it actually helps.

Do not add complexity for theoretical optimization.

---

# 55. Ghost-code policy

Remove:

- unused imports
- unused components
- unused styles
- dead props
- commented-out implementations
- fake data
- duplicate utilities
- abandoned experiments
- unnecessary dependencies

Do not keep code "just in case."

---

# 56. No false abstractions

Do not create giant generic abstractions such as:

```text
UniversalWeatherMegaCard
GenericPersonalizedWidget
SmartUniversalContainer
```

unless there is a real shared responsibility.

Keep architecture understandable.

---

# 57. Testing

Test times:

```text
06:30
12:00
18:30
23:30
```

Test weather:

```text
clear
partly cloudy
cloudy
rain
heavy rain
storm
fog
heat
high UV
```

Test personas:

```text
fitness
agriculture
health
traveler
commuter
family
event planner
```

Verify:

- correct theme
- correct weather icon
- correct image
- correct day-cycle label
- correct diagnosis
- correct recommendation
- no stale advice
- no white flash
- no fake values

---

# 58. Critical night test

At 23:30:

Expected:

```text
dark theme
night background
night weather icon
night imagery
night-appropriate language
tomorrow-focused recommendation
```

Must NOT show:

```text
white background
sun icon
Good morning
daytime recommendations
```

---

# 59. Critical loading test

Before weather arrives:

```text
correct day/night theme
+
skeleton
```

Never:

```text
white screen
→ wrong theme
→ correct theme
```

Never show fake 28°C or "Sunny" before the API has returned valid data.

---

# 60. Future AI assistant

AI is a later layer.

Correct architecture:

```text
Weather APIs
    ↓
Weather Engine
    ↓
Atmosphere Diagnosis
    ↓
Personalization
    ↓
Recommendation Engine
    ↓
AI Assistant
```

The AI should call tools and consume calculated results.

It must never invent weather values.

Possible future tools:

```text
getCurrentWeather()
getHourlyForecast()
getDailyForecast()
getAirQuality()
getAlerts()
findBestActivityWindow()
findWeatherRiskWindow()
getWeatherSummary()
getUserProfile()
getSavedLocations()
```

---

# 61. Implementation order

Follow this order:

### Phase 1
Clean architecture and global tokens.

### Phase 2
Remove borders and reduce information density.

### Phase 3
Fix typography, spacing, radius, buttons and icons.

### Phase 4
Implement day-cycle theme.

### Phase 5
Implement real weather icons and weather imagery.

### Phase 6
Implement loading/error states and eliminate white flash.

### Phase 7
Normalize weather data.

### Phase 8
Build atmosphere diagnosis.

### Phase 9
Build activity/window calculators.

### Phase 10
Build personalization/scoring.

### Phase 11
Build Home Composer.

### Phase 12
Connect recommendations to UI.

### Phase 13
Test all time/weather/persona combinations.

### Phase 14
Only after everything above is stable, implement AI assistant.

---

# 62. Final engineering instruction

Act as a senior React Native / Expo software engineer and product UI engineer.

Before modifying code:

1. Inspect the existing project.
2. Understand current architecture.
3. Inspect Ponytail usage.
4. Reuse existing theme tokens.
5. Inspect existing icon dependencies.
6. Inspect weather models/API layer.
7. Inspect navigation.
8. Inspect animations.
9. Inspect loading/error states.
10. Find duplicate/ghost code.

Then make the smallest correct changes.

Do not rewrite working code without a reason.

Do not create fake data.

Do not invent API responses.

Do not hardcode recommendations.

Do not use emoji as UI icons.

Do not use random SVG icons.

Do not add unnecessary dependencies.

Do not add unnecessary tabs.

Do not create a dense dashboard.

Do not remove useful functionality simply to make the screen empty.

Use progressive disclosure.

Keep complex intelligence underneath the UI.

The final product should feel:

```text
PERSONAL
CALM
MODERN
SPACIOUS
WEATHER-AWARE
TIME-AWARE
DATA-BACKED
PLAYFUL
SIMPLE
```

The desired outcome is:

> **Mausam understands what matters to me without making me read a weather dashboard.**
