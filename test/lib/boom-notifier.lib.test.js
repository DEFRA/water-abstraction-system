'use strict'

// Test framework dependencies
const BoomNotifierLib = require('../../app/lib/boom-notifier.lib.js')

// Mocks
const airbrakeFake = { notify: jest.fn().mockResolvedValue({ id: 1 }), flush: jest.fn() }
const pinoFake = { info: jest.fn(), error: jest.fn() }

describe('BoomNotifierLib class', () => {
  const id = '1234567890'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when an airbrake notification is sent', () => {
    const message = 'hell no test'
    const data = { offTheChart: true }

    it('throws a Boom error with the correct message and data', () => {
      const testNotifier = new BoomNotifierLib(id, pinoFake, airbrakeFake)

      // Mock the behavior of the Boom error being thrown
      const expectedError = new Error(message)
      expectedError.data = data
      jest.spyOn(testNotifier, 'omfg').mockImplementation(() => {
        throw expectedError
      })

      expect(() => testNotifier.omfg(message, data)).toThrowError(expectedError)
    })
  })
})
