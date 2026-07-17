// Test framework
import { vi } from 'vitest'

/**
 * Builds a stubbed logger by mocking error and info methods
 *
 * In controller tests we instantiate an instance of the Hapi server, which means we also enable the hapi-pino plugin.
 *
 * Our tests involve scenarios that will trigger error and info messages in the log, which is valid, but just add noise
 * to the test output. This stub silences those messages by mocking the logger methods.
 *
 * @param {object} logger - The logger object to stub
 */
export default function loggerStub(logger) {
  vi.spyOn(logger, 'error').mockImplementation(() => {})
  vi.spyOn(logger, 'info').mockImplementation(() => {})
}
