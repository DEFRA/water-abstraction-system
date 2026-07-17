// Test framework
import { vi } from 'vitest'

/**
 * Creates a stubbed instance of the Yar session plugin for testing purposes.
 *
 * Yar is set on the Hapi request object as `request.yar` by the hapi-yar plugin when the server handles a request.
 * Tests that exercise code which calls `request.yar` need to set it up manually as no Hapi server is created in unit
 * tests.
 *
 * @returns {object} A stubbed Yar instance with flash, get, set, clear and touch methods
 */
export default function yarStub() {
  return {
    flash: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    touch: vi.fn()
  }
}
