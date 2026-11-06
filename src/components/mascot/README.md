# Pip the beaver

Shared mascot for Kitbit. Import from `@/components/mascot` so every page uses the same beaver.

```tsx
import { Pip, SpeechBubble, Dam } from "@/components/mascot";
```

Styles live in `mascot.css`, which `src/styles.css` imports globally. Motion is CSS keyframes only (transform and opacity), and `prefers-reduced-motion` shows still poses with no loops or confetti.

**House rule:** at most one Pip per screen. Keep Pip out of charts, review lists, tab content, findings detail cards and the top nav.

## `<Pip />`

| Prop        | Type                                                                                   | Default          | Notes                                                                                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pose`      | `"idle" \| "working" \| "celebrating" \| "thinking" \| "oops" \| "proud" \| "waiting"` | `"idle"`         | idle breathes, blinks and wags; working wears a hard hat and carries a log; celebrating bounces with a one-time confetti burst; thinking tilts its head with a magnifying glass; oops scratches its head with a sweat drop; proud puts hands on hips; waiting sits by a stream |
| `size`      | `"sm" \| "md" \| "lg" \| number`                                                       | `"md"`           | sm = 48px (inline), md = 120px, lg = 200px (hero), or any pixel size                                                                                                                                                                                                           |
| `accessory` | `"clipboard"`                                                                          | none             | Only used by the idle pose                                                                                                                                                                                                                                                     |
| `hardHat`   | `boolean`                                                                              | on for `working` | For example `pose="oops" hardHat` while patching a leak                                                                                                                                                                                                                        |
| `label`     | `string`                                                                               | none             | Pip is decorative (`aria-hidden`) unless you pass a label                                                                                                                                                                                                                      |
| `className` | `string`                                                                               | none             |                                                                                                                                                                                                                                                                                |

Changing `pose` on the same element switches instantly. To replay a pose's entrance, give Pip a `key` tied to the pose.

## `<SpeechBubble />`

One short line from Pip, 6 words or fewer.

| Prop        | Type                            | Default   | Notes                                                   |
| ----------- | ------------------------------- | --------- | ------------------------------------------------------- |
| `children`  | `ReactNode`                     |           | The line                                                |
| `pointer`   | `"left" \| "right" \| "bottom"` | `"right"` | The side the bubble's tail points to, i.e. where Pip is |
| `className` | `string`                        | none      |                                                         |

## `<Dam />`

| Prop    | Type                               | Default        | Notes                                                                                                                                |
| ------- | ---------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `logs`  | `("slot" \| "placed" \| "leak")[]` | 6 × `"placed"` | Up to 6, filled bottom row first. A log that changes from `slot` to `placed` slides in and settles (400ms); `leak` adds a small drip |
| `level` | `{ from: number; to: number }`     | none           | Turns the dam into a water gauge (0-100) that rises from `from` to `to` once, when it first scrolls into view                        |
| `width` | `number`                           | `160`          | Height follows the 150:120 aspect ratio                                                                                              |
| `label` | `string`                           | none           | Decorative unless labeled                                                                                                            |

## One-time "first game is live" toast

`first-live-toast.tsx` exports `queueFirstLiveCelebration()`, called when a check finishes live, and `useFirstLiveCelebration()`, used on My games. They need the `<Toaster />` that `AppShell` already renders.
