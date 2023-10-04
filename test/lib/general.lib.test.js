'use strict'

// Thing under test
const GeneralLib = require('../../app/lib/general.lib.js')

describe('RequestLib', () => {
  describe('#generateUUID', () => {
    // NOTE: generateUUID() only calls crypto.randomUUID(); it does nothing else. So, there is nothing really to test
    // and certainly, testing the UUID is really unique is beyond the scope of this project! But this test at least
    // serves as documentation and means no one will get confused by the lack of a test :-)
    it('returns a Universally unique identifier (UUID)', () => {
      const uuid1 = GeneralLib.generateUUID()
      const uuid2 = GeneralLib.generateUUID()
      const uuid3 = GeneralLib.generateUUID()

      expect(uuid1).not.toEqual(uuid2)
      expect(uuid1).not.toEqual(uuid3)
      expect(uuid2).not.toEqual(uuid3)
    })
  })

  describe('#timestampForPostgres', () => {
    // Store the original Date constructor
    const originalDate = global.Date

    // Mock the Date constructor to always return a fixed date
    global.Date = class extends Date {
      constructor () {
        super('2015-10-21T20:31:57.000Z')
      }
    }

    it('returns the current date and time as an ISO string', () => {
      const result = GeneralLib.timestampForPostgres()

      expect(result).toEqual('2015-10-21T20:31:57.000Z')
    })

    // Restore the original Date constructor after the tests
    afterAll(() => {
      global.Date = originalDate
    })
  })
})
