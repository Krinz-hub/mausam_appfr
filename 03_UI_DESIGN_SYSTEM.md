# Mobile UI / UX Specification --- Playful Personalized Weather

## 1. Visual Goal

The application should feel like a **friendly interactive weather
companion**, not a traditional weather utility.

The uploaded reference flow establishes the desired direction:

-   light sky atmosphere
-   soft blue surfaces
-   large rounded rectangles
-   generous breathing space
-   cute blue character
-   short conversational messages
-   simple icons
-   rounded buttons
-   visible progress
-   friendly feedback
-   contextual scenes
-   playful but controlled interactions

Use the character from the design as the eventual visual anchor.

For implementation, use an **emoji or temporary placeholder character**
until the final character assets are available.

Do not build a generic weather dashboard and attempt to add a character
later.

The character, hierarchy and personalization should be considered from
the beginning.

------------------------------------------------------------------------

# 2. Important Clarification

The design can be inspired by the emotional qualities of playful
learning applications, but do not copy proprietary assets, exact
artwork, exact branding, or copyrighted UI screens.

Build an original visual system with:

-   rounded geometry
-   cheerful feedback
-   progression
-   character reactions
-   short copy
-   tactile controls
-   friendly audio
-   playful micro-interactions

------------------------------------------------------------------------

# 3. Global Visual Language

## Background

Use a soft, airy background rather than pure white.

The visual atmosphere should feel like:

``` text
sky
cloud
morning light
soft glass
clean paper
```

The background can vary subtly with weather/time, but must remain
readable.

## Surfaces

Use:

-   large rounded corners
-   subtle elevation
-   soft borders
-   low visual noise

Avoid dozens of nested cards.

## Typography

Typography hierarchy:

``` text
Display temperature
     ↓
Primary message
     ↓
Supporting detail
     ↓
Tiny metadata
```

Example:

``` text
28°

Feels warm today

Your morning commute looks good.
Clear skies until 10 AM.
```

Do not write:

``` text
Current Temperature: 28°C
Feels Like Temperature: 31°C
Humidity: 62%
Wind Speed: 12 km/h
Visibility: 10 km
```

on the primary screen.

Those belong in the detailed view.

------------------------------------------------------------------------

# 4. One Screen = One Main Idea

Every primary screen should answer one question.

Examples:

``` text
Onboarding:
"What brings you here?"

Preferences:
"What affects you most?"

Time:
"When are you usually active?"

Home:
"What matters to me right now?"

Hourly:
"When should I go?"

Daily:
"What should I expect this week?"

Insight:
"What should I do?"

Detail:
"What is happening underneath?"
```

If a screen has three competing messages, simplify it.

------------------------------------------------------------------------

# 5. Onboarding Screen Structure

## Screen 1 --- Welcome

Composition:

``` text
top
small status/navigation area

center
large character / emoji

small
short friendly line

bottom
large primary button
```

Example:

``` text
       ☀️

   A brighter day
     is with you

         ♡

[     Let's begin →     ]
```

The screen should feel spacious.

Do not place weather metrics here.

------------------------------------------------------------------------

# 6. Screen 2 --- What Brings You Here?

Show a clean 2-column grid of selectable options.

Example:

``` text
┌────────────┐ ┌────────────┐
│ 🏠         │ │ 🚗         │
│ Daily life │ │ Commute    │
└────────────┘ └────────────┘

┌────────────┐ ┌────────────┐
│ 🏃         │ │ ✈️         │
│ Exercise   │ │ Travel     │
└────────────┘ └────────────┘
```

Selection behavior:

-   card slightly enlarges
-   border becomes more prominent
-   check indicator appears
-   soft sound plays
-   progress indicator updates

Allow multiple selections where relevant.

------------------------------------------------------------------------

# 7. Screen 3 --- Anything Else?

This screen is intentionally conversational.

Use:

``` text
character
    ↓
speech bubble
    ↓
text input
```

Example:

``` text
       🥺
   "Anything else?"

┌──────────────────────────┐
│ I cycle to college every│
│ morning. I mainly care  │
│ about rain and heat.    │
└──────────────────────────┘

[          Next →          ]
```

The AI parser operates behind the scenes.

The UI should never expose technical AI processing.

------------------------------------------------------------------------

# 8. Screen 4 --- What Affects You Most?

Use a grid of weather-factor choices.

Example:

``` text
🌧 Rain     ☀️ Heat      ❄️ Cold

💨 Wind     💧 Humidity  🌫 Air quality

☀️ UV       ❄️ Snow      ⛈ Storm
```

Selected items should have a clear state.

Do not make selected cards look disabled.

Use a strong selected border/background and check indicator.

------------------------------------------------------------------------

# 9. Screen 5 --- Active Time

Use large pill-like time options:

``` text
☀️ Morning
5 AM – 12 PM

☀️ Afternoon
12 PM – 5 PM

🌙 Evening
5 PM – 10 PM

🌙 Night
10 PM – 5 AM
```

Allow multiple periods.

Show the selected state prominently.

------------------------------------------------------------------------

# 10. Screen 6 --- All Set

This is a reward screen.

Character is the focus.

Example:

``` text
        🥰

       All set!

I'll personalize your
weather experience just for you.

✓ Preferences saved
✓ Personalized experience ready
✓ Let's make brighter days together

[    Start exploring →    ]
```

The checkmarks should appear sequentially with small motion/audio
feedback.

------------------------------------------------------------------------

# 11. Home Screen

The home screen is NOT a weather dashboard.

Its hierarchy should be:

``` text
Greeting
Location
Large current condition
Character/environment
One primary personalized insight
Small supporting information
Bottom navigation
```

Example:

``` text
Good morning, Dev
Bengaluru

28°
Feels like 31°                 ☀️

         🥰

┌──────────────────────────────┐
│ Your morning looks good!     │
│                              │
│ Clear skies until 10 AM.    │
│ Perfect for your commute.   │
└──────────────────────────────┘
```

Only after the primary insight should supporting metrics appear.

------------------------------------------------------------------------

# 12. Weather Character

The character is not a chatbot.

It is a visual status system.

Temporary implementation:

``` text
☀️ happy
🌧 concerned
💨 energetic
🥵 tired
🥶 bundled
😴 sleeping
🤔 thinking
😍 excited
```

Later replace emoji states with the final character assets.

Character states should correspond to:

-   weather condition
-   user context
-   recommendation state
-   feedback state
-   onboarding state

Do not make random facial expressions that have no relationship to the
current context.

------------------------------------------------------------------------

# 13. Hourly Forecast

Avoid a dense spreadsheet.

Use a horizontal timeline.

Example:

``` text
8 AM   9 AM   10 AM  11 AM  12 PM

☀️     ☀️      ☀️      ☁️      🌧

28°    29°     31°     32°     33°
```

Allow horizontal scrolling.

A selected hour gets:

-   stronger border
-   slightly larger scale
-   expanded information below

Use animated bars for quantities.

Example:

``` text
Rain

8 AM   ███
9 AM   ████
10 AM  █████
11 AM  ███████
```

The bars should animate from zero to their target value when the view
enters or the selected factor changes.

------------------------------------------------------------------------

# 14. Daily Forecast

Use vertical days.

Each day should contain:

``` text
day
weather symbol
low/high
one personalized signal
```

Example:

``` text
Today     ☀️     24° / 33°
Tomorrow  ☁️     24° / 32°
Wed       🌧     23° / 29°
```

The character can appear at the bottom with a contextual message.

------------------------------------------------------------------------

# 15. Insights / Tips

This screen is where personalization becomes obvious.

Do not title it "Weather Information."

Use conversational cards.

Example:

``` text
🕐 Best time to go out

5:30 PM – 6:30 PM
Lower chance of rain

☂️ Carry an umbrella

Rain likely after 7 PM

☀️ It'll feel warmer today

Feels like 34° around noon
```

Cards should be ranked by the Decision Engine.

The order must not be hard-coded for every user.

------------------------------------------------------------------------

# 16. Detailed Weather View

This is the only place where a denser metric grid is appropriate.

Example:

``` text
28°

Feels like 31°

Humidity       62%
Wind           12 km/h
UV             6
Visibility     10 km
Pressure       1012 hPa
Air quality    Good
```

Still use generous spacing.

Do not turn this into a desktop-style dashboard.

------------------------------------------------------------------------

# 17. Character Interaction

Character interaction should be contextual.

Example:

``` text
Rain incoming

       ☔
       🥺

"Looks like rain soon!
Don't forget your umbrella!"
```

Button:

``` text
[ Got it! ]
```

After the user acknowledges:

``` text
🙂
```

Do not make the character conduct long conversations.

------------------------------------------------------------------------

# 18. Notification

Use a compact notification card.

Example:

``` text
🌧️ Weather Buddy

Rain likely in 30 minutes.
Good time to head out now!
```

The notification should link directly to the relevant insight.

Do not send generic notifications such as:

> "The weather has changed."

------------------------------------------------------------------------

# 19. Feedback Screen

Ask:

``` text
Was this helpful?
```

Use two large controls:

``` text
👍              👎
Helpful       Not helpful
```

The action should have clear audio and visual confirmation.

After selection, optionally ask a short reason:

``` text
What was off?

Too early
Too late
Not relevant
Forecast changed
Other
```

This makes feedback useful for the Learning Engine.

------------------------------------------------------------------------

# 20. Profile / Settings

Show the user's interests visually.

Example:

``` text
Your interests

🚗 Commute
🚲 Cycling
🌧 Rain
☀️ Heat
```

Then:

``` text
Active time
☀️ Morning
🌙 Evening
```

Settings:

-   Notifications
-   Units
-   Appearance
-   Personalization
-   Sound
-   Account

Do not expose technical engine terminology to the user.

------------------------------------------------------------------------

# 21. Engagement

Do not copy a language-learning streak mechanic exactly.

If engagement is used, it should relate to weather usefulness.

Possible:

``` text
7 days of personalized weather
```

or:

``` text
7 useful mornings
```

Avoid turning weather into a meaningless game.

The reward should reinforce useful behavior, not addictive behavior.

------------------------------------------------------------------------

# 22. Responsive Mobile Behavior

This is a mobile application.

Design for:

-   small phones
-   standard phones
-   large phones
-   portrait
-   landscape where supported

Do not create a desktop breakpoint that turns the app into a web
dashboard.

For narrow screens:

-   reduce horizontal padding
-   keep primary content readable
-   allow horizontal forecast scrolling
-   stack secondary content
-   never shrink text below accessibility limits

------------------------------------------------------------------------

# 23. Global Design System

Create one source of truth.

``` text
design/
  tokens.ts
  colors.ts
  typography.ts
  spacing.ts
  radius.ts
  shadows.ts
  motion.ts
  audio.ts
  theme.ts
```

Components must use tokens.

Example:

``` ts
theme.colors.primary
theme.spacing.md
theme.radius.lg
theme.typography.display
```

Never:

``` ts
backgroundColor: "#42A5F5"
```

inside random components.

The user must be able to change the brand palette from the theme layer.

------------------------------------------------------------------------

# 24. Motion System

Motion must communicate state.

Required animated behaviors:

-   onboarding progress
-   selection state
-   progress bars
-   weather factor bars
-   card entrance
-   button press
-   checkmark completion
-   character entrance
-   expandable detail
-   loading state

Use React Native Reanimated.

Avoid continuous decorative motion that wastes battery.

------------------------------------------------------------------------

# 25. Progress Bar

On onboarding:

``` text
● ● ● ○ ○ ○
```

or a smooth progress bar.

When moving from step 2 to step 3:

``` text
████████░░░░
```

should animate rather than instantly jump.

Progress must reflect the actual onboarding state.

------------------------------------------------------------------------

# 26. Audio System

Audio should reinforce interaction.

Examples:

-   option selected → short soft click
-   progress completed → light positive tone
-   onboarding completed → short reward sound
-   helpful feedback → positive sound
-   error → subtle negative sound
-   notification → recognizable weather sound

Rules:

-   sound can be disabled
-   never use loud audio by default
-   do not play sound for every tiny render
-   preload short frequently used sounds
-   keep audio event-driven

Audio is feedback, not background entertainment.

------------------------------------------------------------------------

# 27. Accessibility

The playful design must remain accessible.

Include:

-   sufficient contrast
-   readable text
-   screen-reader labels
-   large touch targets
-   reduced-motion support
-   sound toggle
-   clear selected states that do not depend only on color
-   meaningful accessibility labels for character/status indicators
