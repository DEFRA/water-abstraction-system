// Things we need to stub
import BaseNotifierLib from '../../app/lib/base-notifier.lib.js'

// Thing under test
import GlobalNotifierLib from '../../app/lib/global-notifier.lib.js'

describe('GlobalNotifierLib class', () => {
  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    airbrakeFake = { notify: vi.fn().mockResolvedValue({ id: 1 }), flush: vi.fn() }
    vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)

    pinoFake = { info: vi.fn(), error: vi.fn() }
    vi.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('#constructor', () => {
    describe('when the "logger" argument is not provided', () => {
      it('throws an error', () => {
        expect(() => {
          return new GlobalNotifierLib(null, airbrakeFake)
        }).toThrow()
      })
    })

    describe('when the "notifier" argument is not provided', () => {
      it('throws an error', () => {
        expect(() => {
          return new GlobalNotifierLib(pinoFake)
        }).toThrow()
      })
    })
  })
})
