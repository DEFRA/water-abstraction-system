'use strict'

const GlobalNotifierLib = require('../../app/lib/global-notifier.lib.js')
const BaseNotifierLib = require('../../app/lib/base-notifier.lib.js')

jest.mock('../../app/lib/base-notifier.lib.js')

describe('GlobalNotifierLib class', () => {
  let airbrakeFake
  let pinoFake

  beforeEach(() => {
    airbrakeFake = { notify: jest.fn().mockResolvedValue({ id: 1 }), flush: jest.fn() }
    BaseNotifierLib.prototype._setNotifier.mockReturnValue(airbrakeFake)

    pinoFake = { info: jest.fn(), error: jest.fn() }
    BaseNotifierLib.prototype._setLogger.mockReturnValue(pinoFake)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('#constructor', () => {
    describe("when the 'logger' argument is not provided", () => {
      it('throws an error', () => {
        expect(() => new GlobalNotifierLib(null, airbrakeFake)).toThrow()
      })
    })

    describe("when the 'notifier' argument is not provided", () => {
      it('throws an error', () => {
        expect(() => new GlobalNotifierLib(pinoFake)).toThrow()
      })
    })
  })
})
