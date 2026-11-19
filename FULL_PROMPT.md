# FULL PROMPT: 3D Open-World Portfolio (GTA-inspired, original assets)

Build a browser-based 3D portfolio that plays like a small open-world driving game. The visitor drives a sports car or walks around a coastal city at golden hour. Each portfolio section (About, Projects, Skills, Contact) is a glowing building/marker; parking or standing in the ring and pressing E opens a panel with that content.

## Stack
React 18 + Vite, three.js, @react-three/fiber v8, @react-three/drei v9, @react-three/postprocessing, postprocessing, zustand. No physics engine: arcade car physics and box colliders written by hand. Everything procedural (no external model files) so it runs offline; leave clear places to swap in .glb models, PBR textures and an HDRI later.

## World (original, GTA/Vice-City-inspired layout, NOT a copy of any Rockstar map)
- Playable area about 600 x 600 units. Road grid every 100 units on both axes (5 roads each way, 14 wide, asphalt texture with lane lines). Sidewalks beside roads, street lamps with emissive bloom heads.
- 6x6 city blocks with 2x2 lots of buildings (random size/colour, taller toward downtown). Window-grid textures with randomly lit windows (emissiveMap). About 20% of lots left as parks. Four portfolio buildings near spawn with coloured emissive glow, floating text labels and glowing ground rings.
- Outside the city: terrain from fractal noise rising into mountains, ~1800 instanced forest trees (round low, pines high), sand beach and animated-looking sea on the +Z side. Terrain flat inside the city; player y follows terrain height.
- Road-lined palm trees (instanced) and park trees, all with collision boxes.

## Look
Golden-hour sun low in the sky (drei Sky + directional light with 2048 shadow map that follows the player), warm exponential fog, Lightformer-based Environment for reflections, ACES tone mapping, Bloom + Vignette post-processing, procedural grass/road/window canvas textures.

## Vehicles
- Hero car: white wedge sports car (Testarossa-inspired, original geometry built from an extruded side profile): red lower band and hood stripes, dark glass, side strakes, silver rims, pop-up-style headlight strips, yellow indicators, red tail bar. Clearcoat paint.
- ~46 AI traffic cars (instanced, random colours) driving right-hand traffic along the road grid, wrapping at map edges. The player collides with them (push-out + speed loss).

## People
- Playable hero: original stylized character (long wavy hair, moustache + goatee, white open blazer over dark shirt, cream trousers, loafers) with walk/run animation. If public/models/hero.glb exists (realistic rigged model with idle/walk/run clips) it is loaded automatically instead (useGLTF + useAnimations, crossfaded by speed).
- ~170 instanced pedestrians with random clothes/skin tones walking the sidewalks with leg-swing animation.

## Controls
W/S accelerate or walk, A/D steer or turn, SHIFT run, SPACE handbrake, F exit/enter car (must be within 5 units to enter), E open/close portfolio panel, ESC close. Third-person follow camera (distance 10 in car, 5 on foot).

## HUD
Mission box, speedometer (km/h), rotating minimap (buildings, traffic, car, coloured zone markers clamped to the rim), contextual prompts ("Press E to view PROJECTS", "Press F to enter car"), modal content panel with links and skill bars, "Skip to normal portfolio" link, key hints.

## Files
data.js (all portfolio content), shared.js, store.js (zustand), terrain.js (noise + heightAt), World.jsx (terrain, sea, city, trees, sun), Vehicles.jsx (SportsCar, Traffic), People.jsx (Character, Crowd), App.jsx (controller, HUD, scene), style.css.

## Performance
Instancing for trees, traffic, pedestrians, lamps, sidewalks; shared window textures; dpr capped at 1.5; shadow frustum 140 units around the player.

## Legal
Do not use Rockstar/GTA names, logos, maps, characters or models. Keep everything original or properly licensed (CC0/CC-BY, credit where required).

## Next steps
Swap in .glb car/character/building models, Poly Haven HDRI + PBR textures, engine audio (Howler), mobile joystick (nipplejs), day/night cycle, Rapier physics.

## Missions (added in v6)
Six chapters unlock one by one, in order, defined in data.js (ZONES order = mission order). Locked buildings/rings are grey; the current
mission's ring has a tall beam; unlocked chapters glow in colour. Reaching the ring with the mission done unlocks the chapter and opens its panel.
Mission types: drive, walk (on foot), speed (reach X km/h), orbs (collect glowing orbs), time (countdown), any. Progress lives in store.js (step).
