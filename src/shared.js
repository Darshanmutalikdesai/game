export const carPos = { x: 0, z: 0 }          // active entity (for shadows)
export const SUN = [90, 24, 70]               // low sun = golden hour
export const LINES = [-200, -100, 0, 100, 200] // road lines (grid, every 100 units)
export const traffic = []                     // NPC car positions (for collisions)
export const mission = { step: -1, timeLeft: 0 }   // runtime mission state (countdown) kept out of React
