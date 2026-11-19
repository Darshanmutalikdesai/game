import { create } from 'zustand'
import { ZONES } from './data'

let bannerTimer
// step = how many chapters are unlocked (ZONES[step] is the current mission; step === ZONES.length means all done)
export const useGame = create((set, get) => ({
  zone: null, panel: null, mode: 'car', nearCar: false,
  step: 0, got: [], fast: false, banner: null, passed: false,
  setZone: (zone) => set({ zone }),
  setMode: (mode) => set({ mode }),
  setNear: (nearCar) => set({ nearCar }),
  // only chapters that are already unlocked can be opened
  open: () => set((s) => { if (s.passed) return {}; const i = ZONES.findIndex((z) => z.id === s.zone); return i >= 0 && i < s.step ? { panel: s.zone } : {} }),
  close: () => set({ panel: null }),
  collect: (i) => set((s) => (s.got.includes(i) ? {} : { got: [...s.got, i] })),
  setFast: (fast) => set({ fast }),
  say: (msg) => { set({ banner: msg }); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => set({ banner: null }), 3800) },
  unlock: (i) => {
    if (get().step !== i) return
    if (i === ZONES.length - 1) {
      // last chapter: full-screen "MISSION PASSED" first, then the final panel opens
      set({ step: i + 1, got: [], fast: false, panel: null, passed: true, banner: null })
      clearTimeout(bannerTimer)
      setTimeout(() => set({ passed: false, panel: ZONES[i].id }), 6000)
      return
    }
    set({ step: i + 1, got: [], fast: false, panel: ZONES[i].id })
    get().say('CHAPTER UNLOCKED · ' + ZONES[i].title)
  },
}))
