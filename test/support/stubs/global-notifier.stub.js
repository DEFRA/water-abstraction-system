// Test framework
import { vi } from 'vitest'

/**
 * Creates a stubbed instance of GlobalNotifier for testing purposes.
 *
 * GlobalNotifier is set on globalThis in app/plugins/global-notifier.plugin.js when the Hapi server starts. Tests that
 * exercise code which calls GlobalNotifier need to set it up manually as no Hapi server is created in unit tests.
 *
 * @returns {object} A stubbed GlobalNotifier with omg, omfg and redAlert methods
 */
export default function build() {
  return {
    omg: vi.fn(),
    omfg: vi.fn(),
    redAlert: vi.fn()
  }
}
