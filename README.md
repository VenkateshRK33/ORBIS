# Orbis

Orbis is a frontend-only 3D visualization prototype of the solar system and
Earth. It is intentionally a small academic prototype: it demonstrates an
interactive visual direction without implementing the future scientific
pipeline for satellite tracking, conjunction analysis, or risk prediction.

## What is included

- Animated solar-system view with the Sun, eight planets, orbit paths, stars,
  and Saturn's rings.
- Clickable Earth and Earth search navigation.
- Earth-focused view with:
  - textured Earth surface;
  - normal map detail;
  - atmosphere glow;
  - two orbital guide rings;
  - a Moon on a separated elliptical orbit;
  - a fixed, distant Sun light source;
  - natural day/night shading as the camera rotates around Earth.
- Drag rotation and scroll zoom through `OrbitControls`.
- Scene-attached labels for the Sun, planets, and Moon.
- Responsive cinematic UI with Orbis branding and navigation controls.

## Technology

- React 18
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei

React Three Fiber provides React components for the Three.js scene. Drei
provides reusable helpers including `OrbitControls`, `Stars`, `Html`, and
`useTexture`.

## Requirements

- Node.js with npm
- Internet access when the Earth view is opened for the first time, because
  the current Earth textures are loaded from the Three.js examples CDN.

## Running the project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The application normally opens at the local Vite URL shown in the terminal,
usually `http://localhost:5173`.

## Project structure

```text
ORBIS/
├── src/
│   ├── App.tsx          # React app and all 3D scene components
│   ├── styles.css       # Full-screen UI and scene-label styling
│   ├── main.tsx         # React application entry point
│   └── vite-env.d.ts    # Vite and React Three Fiber type declarations
├── index.html           # Vite HTML entry point
├── package.json         # Scripts and dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig*.json       # TypeScript configuration
└── CONTEXT_WE HAVE AFTER RESERCH.txt
                       # Original project research and prototype scope
```

## How the 3D scene is built

The main implementation is in `src/App.tsx`. The scene is rendered inside a
React Three Fiber `<Canvas>`. The application has two view states:

```ts
type View = 'system' | 'earth'
```

Changing the view changes the rendered scene and gives the Canvas a new key.
This resets the camera and controls cleanly when moving between the solar
system and Earth views.

### Solar-system scene

The `SpaceScene` component renders:

- a black background and depth fog;
- a `Stars` field;
- ambient lighting;
- the `Sun` component;
- one `Planet` component for each entry in the `planets` array.

Each planet definition contains:

```ts
{
  name: string
  radius: number
  orbit: number
  size: number
  color: string
  speed: number
}
```

The prototype uses intentionally compressed, presentation-friendly distances
and sizes rather than real astronomical scale. This keeps all planets visible
and makes the scene usable in a browser.

### Planet motion and orbit paths

Each `Planet` component owns an angle in a React ref. Every animation frame,
the angle advances using the configured speed:

```ts
angle.current += delta * planet.speed * 0.14
```

The planet position is calculated on a circular X/Z orbit:

```ts
x = Math.cos(angle) * orbit
z = Math.sin(angle) * orbit
```

The orbit path is a Three.js ring with a very small width. The moving planet,
its visual atmosphere where applicable, and its HTML name label are all inside
the same moving group. Therefore, the label follows the planet as it travels
around its orbit.

Planet selection stops the pointer event from propagating and opens the Earth
view when the Earth mesh is clicked. Saturn receives an additional ring mesh.

### Sun in the solar-system view

The solar-system Sun is a glowing mesh made from two spheres:

1. A bright inner sphere using `meshBasicMaterial`.
2. A larger transparent orange sphere for a soft glow.

A point light provides illumination for the planets. The Sun label is created
with Drei's `Html` helper and is a child of the Sun group, so it stays attached
to the Sun.

## How the Earth model was made

The Earth is not an exported custom 3D asset. It is generated at runtime from
standard Three.js geometry:

```tsx
<sphereGeometry args={[3, 64, 64]} />
```

The surface uses a standard material with two remote textures:

- `earth_atmos_2048.jpg` as the color map;
- `earth_normal_2048.jpg` as the normal map.

The textures are loaded with Drei's `useTexture` hook. The normal map adds
surface relief detail without requiring a high-resolution custom mesh.

The Earth rotates continuously around its own Y axis:

```ts
earthRef.current.rotation.y += delta * 0.035
```

The Earth also has a slightly tilted starting rotation:

```tsx
rotation={[0.08, 0.4, 0.1]}
```

An enlarged transparent back-side sphere creates the blue atmospheric rim.
Two thin transparent ring meshes provide visual orbital guides around Earth.

## Earth lighting and fixed Sun position

Earth view uses a fixed world-space Sun position:

```ts
const sunPosition = new THREE.Vector3(6, 3, 0)
```

That same position is used by:

- the directional light;
- the point light;
- the visible Sun mesh;
- the Sun label.

This is important because all visible and lighting elements remain aligned.
The Sun is not attached to the camera and does not move when the user rotates
the Earth view.

The dark side is intentional. Because the lights remain fixed in world space,
rotating the camera around Earth can reveal either the illuminated hemisphere or
the night hemisphere. Ambient and hemisphere lights are kept low enough to
preserve that contrast while retaining enough detail to read the dark side.

## Moon model and orbit

The Moon is also generated from standard Three.js geometry:

```tsx
<sphereGeometry args={[0.34, 32, 32]} />
```

It uses a simple gray standard material. Its position is updated every frame
using a separate orbital angle:

```ts
moonAngle.current += delta * 0.15
moonRef.current.position.set(
  Math.cos(moonAngle.current) * 8.5,
  Math.sin(moonAngle.current) * 1.8 + 0.4,
  3
)
```

This creates a wide, flattened orbit with a fixed depth offset. The larger
horizontal radius and smaller Moon size prevent it from visually colliding
with Earth in the prototype camera framing. The `MOON` label is a child of the
Moon mesh, so it follows the Moon during the orbit.

## Camera and interaction controls

The Canvas uses separate camera presets:

- Solar system: `[0, 38, 62]`, field of view `50`.
- Earth: `[0, 0.25, 9]`, field of view `42`.

`OrbitControls` provides:

- drag rotation;
- scroll zoom;
- disabled panning;
- bounded zoom distances;
- limited polar angles;
- controlled rotation and zoom speed;
- no automatic camera rotation.

Current zoom ranges:

- Solar system: `18` to `105`.
- Earth: `4.5` to `18`.

The camera controller that previously overwrote OrbitControls was removed. This
prevents camera interpolation from fighting user zoom and drag input.

## Labels and UI

Labels use Drei's `Html` component, which projects normal HTML into the 3D
scene. The `.scene-label` class in `src/styles.css` provides the dark panel,
border, typography, and colors.

Labels currently included:

- Solar-system view: `SUN / LIGHT SOURCE`, Mercury, Venus, Earth, Mars,
  Jupiter, Saturn, Uranus, Neptune.
- Earth view: `SUN / LIGHT SOURCE` and `MOON`.

Because each label is nested inside its corresponding Three.js object or
moving group, labels move with their associated celestial body rather than
remaining fixed to the browser screen.

The non-3D UI is rendered by `App` and includes:

- Orbis brand button, which returns to the solar-system view;
- Earth search form;
- live view status;
- Earth-view return button;
- responsive footer and interaction instructions.

## Navigation flow

### Open Earth by search

1. Type `Earth` in the search field.
2. Submit the form.
3. The application changes the view state to `earth`.
4. The Canvas remounts with the Earth camera preset.

The current prototype intentionally only handles the Earth search term.

### Open Earth by clicking

Clicking the Earth mesh in the solar-system scene calls the same selection
handler and changes to the Earth view.

### Return to the solar system

The Earth return button, Orbis brand button, or Earth mesh click in the Earth
scene returns to the solar-system view.

## Prototype scope and non-goals

This milestone is intentionally frontend-only. It does **not** implement:

- satellite or debris ingestion;
- TLE or GP data;
- SGP4 propagation;
- real orbital elements;
- conjunction detection;
- collision probability;
- XGBoost or other machine-learning models;
- Monte Carlo uncertainty analysis;
- backend APIs;
- database persistence;
- authentication;
- production scientific claims;
- real-time space-domain data.

The orbit radii, speeds, body sizes, and Moon path are visual design values
chosen for a short prototype demonstration. They should not be interpreted as
physical measurements.

## Validation performed

The current prototype has been checked through:

- TypeScript compilation and Vite production build:

  ```bash
  npm run build
  ```

- Git whitespace validation:

  ```bash
  git diff --check
  ```

- Browser smoke tests covering:
  - initial solar-system rendering;
  - Earth search navigation;
  - Earth click navigation;
  - Earth return navigation;
  - drag rotation;
  - scroll zoom;
  - fixed Sun lighting;
  - visible dark-side shading;
  - Moon separation;
  - moving scene labels.

Known non-blocking warnings:

- Vite reports a large Three.js bundle because the prototype currently ships
  the 3D dependencies in one main chunk.
- Drei/Three may report a deprecation warning related to `THREE.Clock`.

## Future extension direction

The visual prototype can later become the presentation layer for the wider
Orbis project. Possible future work includes:

1. Replace demo orbit values with real orbital data.
2. Add a backend for TLE/GP ingestion and satellite catalog management.
3. Add SGP4 propagation and time controls.
4. Add conjunction screening and uncertainty visualization.
5. Add authenticated APIs and persistent storage.
6. Replace remote Earth textures with versioned local assets for offline
   demonstrations.
7. Split the Three.js bundle with dynamic imports once the visual direction
   is stable.

