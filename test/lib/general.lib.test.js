'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const GeneralLib = require('../../app/lib/general.lib.js')

describe('RequestLib', () => {
  describe('#currentTimeInNanoseconds', () => {
    let timeBeforeTest

    beforeEach(() => {
      timeBeforeTest = process.hrtime.bigint()
    })

    it('returns the current date and time as an ISO string', () => {
      const result = GeneralLib.currentTimeInNanoseconds()

      expect(typeof result).to.equal('bigint')
      expect(result).to.be.greaterThan(timeBeforeTest)
    })
  })

  describe('#generateUUID', () => {
    // NOTE: generateUUID() only calls crypto.randomUUID(); it does nothing else. So, there is nothing really to test
    // and certainly, testing the UUID is really unique is beyond the scope of this project! But this test at least
    // serves as documentation and means no one will get confused by the lack of a test :-)
    it('returns a Universally unique identifier (UUID)', () => {
      const uuid1 = GeneralLib.generateUUID()
      const uuid2 = GeneralLib.generateUUID()
      const uuid3 = GeneralLib.generateUUID()

      expect(uuid1).not.to.equal(uuid2)
      expect(uuid1).not.to.equal(uuid3)
      expect(uuid2).not.to.equal(uuid3)
    })
  })

  describe('#periodsOverlap', () => {
    let referencePeriod
    let checkPeriod

    describe('when given periods that do not overlap', () => {
      beforeEach(() => {
        referencePeriod = [{
          startDate: new Date('2023-02-01'),
          endDate: new Date('2023-02-02')
        }]

        checkPeriod = [{
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-31')
        }]
      })

      it('returns false', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).to.equal(false)
      })
    })

    describe('when a check period overlaps the start of a reference period', () => {
      beforeEach(() => {
        referencePeriod = [{
          startDate: new Date('2023-02-01'),
          endDate: new Date('2023-02-28')
        }]

        checkPeriod = [{
          startDate: new Date('2023-01-15'),
          endDate: new Date('2023-02-15')
        }]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).to.equal(true)
      })
    })

    describe('when a check period overlaps the end of a reference period', () => {
      beforeEach(() => {
        referencePeriod = [{
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-31')
        }]

        checkPeriod = [{
          startDate: new Date('2023-01-15'),
          endDate: new Date('2023-02-15')
        }]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).to.equal(true)
      })
    })

    describe('when a reference period is completely inside a check period', () => {
      beforeEach(() => {
        referencePeriod = [{
          startDate: new Date('2023-02-01'),
          endDate: new Date('2023-02-15')
        }]

        checkPeriod = [{
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-02-28')
        }]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).to.equal(true)
      })
    })

    describe('when a check period is completely inside a reference period', () => {
      beforeEach(() => {
        referencePeriod = [{
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-02-28')
        }]

        checkPeriod = [{
          startDate: new Date('2023-02-01'),
          endDate: new Date('2023-02-15')
        }]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).to.equal(true)
      })
    })

    describe('when the periods are the same', () => {
      beforeEach(() => {
        referencePeriod = [{
          startDate: new Date('2023-02-01'),
          endDate: new Date('2023-02-28')
        }]

        checkPeriod = [{
          startDate: new Date('2023-02-01'),
          endDate: new Date('2023-02-28')
        }]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).to.equal(true)
      })
    })
  })

  describe('#timestampForPostgres', () => {
    let clock
    let testDate

    beforeEach(() => {
      testDate = new Date(2015, 9, 21, 20, 31, 57)

      clock = Sinon.useFakeTimers(testDate)
    })

    afterEach(() => {
      clock.restore()
      Sinon.restore()
    })

    it('returns the current date and time as an ISO string', () => {
      const result = GeneralLib.timestampForPostgres()

      expect(result).to.equal('2015-10-21T20:31:57.000Z')
    })
  })
})
