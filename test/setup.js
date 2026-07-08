/**
 * Vitest per-file setup — runs once per worker before each test file
 * @module Setup
 */

import { vi } from 'vitest'

// Polyfill vi.replaceProperty, which was removed in Vitest 4.x.
// Stores the original property descriptors and restores them when vi.restoreAllMocks() is called.
const _replacements = []

vi.replaceProperty = (obj, prop, value) => {
  const descriptor = Object.getOwnPropertyDescriptor(obj, prop)
  _replacements.push({ obj, prop, descriptor })
  obj[prop] = value
}

const _originalRestoreAllMocks = vi.restoreAllMocks.bind(vi)
vi.restoreAllMocks = () => {
  _originalRestoreAllMocks()
  while (_replacements.length > 0) {
    const { obj, prop, descriptor } = _replacements.pop()
    if (descriptor) {
      Object.defineProperty(obj, prop, descriptor)
    }
  }
}
