// Test framework dependencies

// Test helpers
import * as TransactionHelper from '../support/helpers/transaction.helper.js'
import YarStub from '../support/stubs/yar.stub.js'

// Things we need to stub
import GlobalNotifierStub from '../support/stubs/global-notifier.stub.js'

// Thing under test
import * as GeneralLib from '../../app/lib/general.lib.js'

describe('GeneralLib', () => {
  let clock
  let testDate

  afterEach(() => {
    vi.restoreAllMocks()

    if (clock) {
      vi.useRealTimers()
    }
  })

  describe('#calculateAndLogTimeTaken', () => {
    let notifierStub
    let startTime

    beforeEach(() => {
      startTime = GeneralLib.currentTimeInNanoseconds()

      // BaseRequest depends on the GlobalNotifier to have been set. This happens in
      // app/plugins/global-notifier.plugin.js when the app starts up and the plugin is registered. As we're not
      // creating an instance of Hapi server in this test we recreate the condition by setting it directly with our own
      // stub
      notifierStub = GlobalNotifierStub()
      globalThis.GlobalNotifier = notifierStub
    })

    afterEach(() => {
      delete globalThis.GlobalNotifier
    })

    describe('when no additional data is provided', () => {
      it('logs the message and time taken in milliseconds and seconds', () => {
        GeneralLib.calculateAndLogTimeTaken(startTime, 'I am the test with no data')

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(notifierStub.omg).toHaveBeenCalledWith('I am the test with no data', expect.any(Object))
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.timeTakenSs).toBeDefined()
        expect(logDataArg.name).toBeUndefined()
      })
    })

    describe('when additional data is provided', () => {
      it('logs the message and time taken in milliseconds and seconds as well as the additional data', () => {
        GeneralLib.calculateAndLogTimeTaken(startTime, 'I am the test with data', { name: 'Foo Bar' })

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(notifierStub.omg).toHaveBeenCalledWith('I am the test with data', expect.any(Object))
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.name).toBeDefined()
      })
    })
  })

  describe('#convertFromCubicMetres()', () => {
    let quantity
    let units

    describe('when the quantity is null', () => {
      beforeEach(() => {
        quantity = null
        units = 'm³'
      })

      it('returns null', () => {
        const result = GeneralLib.convertFromCubicMetres(quantity, units)

        expect(result).toBeNull()
      })
    })

    describe('when the quantity in cubic metres (1000) is converted to cubic metres', () => {
      beforeEach(() => {
        quantity = 1000
        units = 'm³'
      })

      it('returns the same quantity (1000)', () => {
        const result = GeneralLib.convertFromCubicMetres(quantity, units)

        expect(result).toEqual(1000)
      })
    })

    describe('when the quantity in cubic metres (1000) is converted to litres', () => {
      beforeEach(() => {
        quantity = 1000
        units = 'l'
      })

      it('returns the quantity converted to litres (1000000)', () => {
        const result = GeneralLib.convertFromCubicMetres(quantity, units)

        expect(result).toEqual(1000000)
      })
    })

    describe('when the quantity in cubic metres (1000) is converted to megalitres', () => {
      beforeEach(() => {
        quantity = 1000
        units = 'Ml'
      })

      it('returns the quantity converted to megalitres (1)', () => {
        const result = GeneralLib.convertFromCubicMetres(quantity, units)

        expect(result).toEqual(1)
      })
    })

    describe('when the quantity in cubic metres (100) is converted to in gallons', () => {
      beforeEach(() => {
        quantity = 100
        units = 'gal'
      })

      it('returns the quantity converted to gallons (21996.9248299) rounded to 6 decimal places', () => {
        const result = GeneralLib.convertFromCubicMetres(quantity, units)

        expect(result).toEqual(21996.92483)
      })
    })

    describe('when the quantity will result in a "known" floating point precision error (1.235 * 0.001 = 0.0012350000000000002)', () => {
      beforeEach(() => {
        quantity = 1.235
        units = 'Ml'
      })

      it('returns the quantity converted to megalitres (0.001235)', () => {
        const result = GeneralLib.convertFromCubicMetres(quantity, units)

        expect(result).toEqual(0.001235)
      })
    })
  })

  describe('#convertToCubicMetres()', () => {
    let quantity
    let units

    describe('when the quantity is null', () => {
      beforeEach(() => {
        quantity = null
        units = 'm³'
      })

      it('returns null', () => {
        const result = GeneralLib.convertToCubicMetres(quantity, units)

        expect(result).toBeNull()
      })
    })

    describe('when the quantity is in cubic metres (1000)', () => {
      beforeEach(() => {
        quantity = 1000
        units = 'm³'
      })

      it('returns the same quantity (1000)', () => {
        const result = GeneralLib.convertToCubicMetres(quantity, units)

        expect(result).toEqual(1000)
      })
    })

    describe('when the quantity is in litres (1000)', () => {
      beforeEach(() => {
        quantity = 1000
        units = 'l'
      })

      it('returns the quantity converted to cubic metres (1)', () => {
        const result = GeneralLib.convertToCubicMetres(quantity, units)

        expect(result).toEqual(1)
      })
    })

    describe('when the quantity is in megalitres (1000)', () => {
      beforeEach(() => {
        quantity = 1000
        units = 'Ml'
      })

      it('returns the quantity converted to cubic metres (1000000)', () => {
        const result = GeneralLib.convertToCubicMetres(quantity, units)

        expect(result).toEqual(1000000)
      })
    })

    describe('when the quantity is in gallons (1000)', () => {
      beforeEach(() => {
        quantity = 1000
        units = 'gal'
      })

      it('returns the quantity converted to cubic metres (4.546090000001814) rounded to 6 decimal places', () => {
        const result = GeneralLib.convertToCubicMetres(quantity, units)

        expect(result).toEqual(4.54609)
      })
    })

    describe('when the quantity will result in a "known" floating point precision error (2.018 / 0.001 = 2017.9999999999998)', () => {
      beforeEach(() => {
        quantity = 2.018
        units = 'Ml'
      })

      it('returns the quantity converted to cubic metres (2018)', () => {
        const result = GeneralLib.convertToCubicMetres(quantity, units)

        expect(result).toEqual(2018)
      })
    })
  })

  describe('#currentTimeInNanoseconds', () => {
    let timeBeforeTest

    beforeEach(() => {
      timeBeforeTest = process.hrtime.bigint()
    })

    it('returns the current date and time as an ISO string', () => {
      const result = GeneralLib.currentTimeInNanoseconds()

      expect(typeof result).toEqual('bigint')
      expect(result).toBeGreaterThan(timeBeforeTest)
    })
  })

  describe('#determineCurrentFinancialYear', () => {
    describe('when the current financial year is 2023 to 2024', () => {
      describe('and the current date is between April and December', () => {
        beforeEach(() => {
          testDate = new Date(2023, 7, 21, 20, 31, 57)

          clock = vi.useFakeTimers({ now: testDate })
        })

        it('returns the correct start and end dates for the financial year', () => {
          const result = GeneralLib.determineCurrentFinancialYear()

          expect(result.startDate).toEqual(new Date('2023-04-01'))
          expect(result.endDate).toEqual(new Date('2024-03-31'))
        })
      })

      describe('and the current date is between January and March', () => {
        beforeEach(() => {
          testDate = new Date(2024, 2, 21, 20, 31, 57)

          clock = vi.useFakeTimers({ now: testDate })
        })

        it('returns the correct start and end dates for the financial year', () => {
          const result = GeneralLib.determineCurrentFinancialYear()

          expect(result.startDate).toEqual(new Date('2023-04-01'))
          expect(result.endDate).toEqual(new Date('2024-03-31'))
        })
      })
    })
  })

  describe('#flashNotification', () => {
    let yarStub

    beforeEach(() => {
      yarStub = YarStub()
    })

    it('returns the standard notification { titleText: "Updated", text: "Changes made" }', () => {
      GeneralLib.flashNotification(yarStub)

      const [flashType, notification] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({ titleText: 'Updated', text: 'Changes made' })
    })

    it('returns the overridden notification { titleText: "Fancy new title", text: "better text" }', () => {
      GeneralLib.flashNotification(yarStub, 'Fancy new title', 'better text')

      const [flashType, notification] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({ titleText: 'Fancy new title', text: 'better text' })
    })
  })

  describe('#readFlashNotification', () => {
    let yarStub

    beforeEach(() => {
      yarStub = YarStub()
      yarStub.flash.mockReturnValue([{ title: 'Updated', text: 'Changes made' }])
    })

    it('returns the flash notification', () => {
      const result = GeneralLib.readFlashNotification(yarStub)

      expect(result).toEqual({ text: 'Changes made', title: 'Updated' })
    })
  })

  describe('#generateNoticeReferenceCode', () => {
    it('generates a 6 character reference code with the given prefix', () => {
      const result = GeneralLib.generateNoticeReferenceCode('TEST-')

      expect(result.startsWith('TEST-')).toBe(true)
      expect(result.length).toEqual(11)
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

      expect(uuid1).not.toEqual(uuid2)
      expect(uuid1).not.toEqual(uuid3)
      expect(uuid2).not.toEqual(uuid3)
    })
  })

  describe('#pause', () => {
    it('pauses execution for at least the provided number of milliseconds', async () => {
      const before = new Date().getTime()

      await GeneralLib.pause(250)

      const after = new Date().getTime()
      const difference = after - before

      expect(difference).toBeGreaterThanOrEqual(245)
      // We give some wiggle room of 50 milliseconds to allow for environment
      // differences
      expect(difference).not.toBeGreaterThan(300)
    })
  })

  describe('#periodsOverlap', () => {
    let referencePeriod
    let checkPeriod

    describe('when given periods that do not overlap', () => {
      beforeEach(() => {
        referencePeriod = [
          {
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-02-02')
          }
        ]

        checkPeriod = [
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-01-31')
          }
        ]
      })

      it('returns false', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).toEqual(false)
      })
    })

    describe('when a check period overlaps the start of a reference period', () => {
      beforeEach(() => {
        referencePeriod = [
          {
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-02-28')
          }
        ]

        checkPeriod = [
          {
            startDate: new Date('2023-01-15'),
            endDate: new Date('2023-02-15')
          }
        ]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).toEqual(true)
      })
    })

    describe('when a check period overlaps the end of a reference period', () => {
      beforeEach(() => {
        referencePeriod = [
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-01-31')
          }
        ]

        checkPeriod = [
          {
            startDate: new Date('2023-01-15'),
            endDate: new Date('2023-02-15')
          }
        ]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).toEqual(true)
      })
    })

    describe('when a reference period is completely inside a check period', () => {
      beforeEach(() => {
        referencePeriod = [
          {
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-02-15')
          }
        ]

        checkPeriod = [
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        ]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).toEqual(true)
      })
    })

    describe('when a check period is completely inside a reference period', () => {
      beforeEach(() => {
        referencePeriod = [
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        ]

        checkPeriod = [
          {
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-02-15')
          }
        ]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).toEqual(true)
      })
    })

    describe('when the periods are the same', () => {
      beforeEach(() => {
        referencePeriod = [
          {
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-02-28')
          }
        ]

        checkPeriod = [
          {
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-02-28')
          }
        ]
      })

      it('returns true', () => {
        const result = GeneralLib.periodsOverlap(referencePeriod, checkPeriod)

        expect(result).toEqual(true)
      })
    })
  })

  describe('#splitArrayIntoGroups', () => {
    let testArray
    let testGroupSize

    beforeEach(() => {
      testArray = [1, 2, 3, 4, 5, 6, 7]
      testGroupSize = 2
    })

    describe('when the provided array contains simple values', () => {
      it('returns the provided array grouped by the given group size', () => {
        const result = GeneralLib.splitArrayIntoGroups(testArray, testGroupSize)

        expect(result.length).toEqual(4)

        expect(result).toEqual([
          [1, 2], // Group One
          [3, 4], // Group two
          [5, 6], // Group three
          [7] // Group four
        ])
      })
    })

    describe('when the provided array contains objects', () => {
      beforeEach(() => {
        testArray = [
          { number: 1 },
          { number: 2 },
          { number: 3 },
          { number: 4 },
          { number: 5 },
          { number: 6 },
          { number: 7 }
        ]
        testGroupSize = 3
      })

      it('returns the provided array grouped by the given group size', () => {
        const result = GeneralLib.splitArrayIntoGroups(testArray, testGroupSize)

        expect(result.length).toEqual(3)

        expect(result).toEqual([
          [{ number: 1 }, { number: 2 }, { number: 3 }], // Group One
          [{ number: 4 }, { number: 5 }, { number: 6 }], // Group two
          [{ number: 7 }] // Group three
        ])
      })
    })

    describe('when the provided array is empty', () => {
      beforeEach(() => {
        testArray = []
        testGroupSize = 2
      })

      it('returns an empty array', () => {
        const result = GeneralLib.splitArrayIntoGroups(testArray, testGroupSize)

        expect(result.length).toEqual(0)

        expect(result).toEqual([])
      })
    })

    describe('when the group size is 0', () => {
      beforeEach(() => {
        testArray = [1, 2, 3, 4, 5, 6, 7]
        testGroupSize = 0
      })

      it('returns the provided array (not grouped)', () => {
        const result = GeneralLib.splitArrayIntoGroups(testArray, testGroupSize)

        expect(result.length).toEqual(7)

        expect(result).toEqual([1, 2, 3, 4, 5, 6, 7])
      })
    })

    describe('when the group size is > than the array', () => {
      beforeEach(() => {
        testArray = [1, 2]
        testGroupSize = 5
      })

      it('returns the provided array grouped by the given group size', () => {
        const result = GeneralLib.splitArrayIntoGroups(testArray, testGroupSize)

        expect(result.length).toEqual(1)

        expect(result).toEqual([[1, 2]])
      })
    })
  })

  describe('#timestampForPostgres', () => {
    beforeEach(() => {
      testDate = new Date(2015, 9, 21, 20, 31, 57)

      clock = vi.useFakeTimers({ now: testDate })
    })

    it('returns the current date and time as an ISO string', () => {
      const result = GeneralLib.timestampForPostgres()

      expect(result).toEqual('2015-10-21T20:31:57.000Z')
    })
  })

  describe('#today', () => {
    beforeEach(() => {
      testDate = new Date(2025, 9, 19, 20, 31, 57, 234)

      clock = vi.useFakeTimers({ now: testDate })
    })

    it('returns the current date and time as date-only (time set to midnight)', () => {
      const result = GeneralLib.today()

      // We compare ISO strings as its a clearer way of ensuring the result is as expected
      expect(result.toISOString()).toEqual('2025-10-19T00:00:00.000Z')
    })
  })

  describe('#transactionsMatch', () => {
    let leftTransaction
    let rightTransaction

    beforeEach(() => {
      // NOTE: The properties the function is comparing are; chargeType, chargeCategoryCode, billableDays, volume,
      // section126Factor, section127Agreement, section130Agreement, aggregateFactor, adjustmentFactor, winterOnly,
      // supportedSource, supportedSourceName, waterCompanyCharge.
      //
      // We add IDs just so we can tell them apart!
      leftTransaction = {
        ...TransactionHelper.defaults(),
        id: 'cba29373-d9a2-423e-8f36-83c13b07d925',
        adjustmentFactor: 1,
        aggregateFactor: 1,
        chargeCategoryCode: '4.3.2',
        section126Factor: 1,
        section127Agreement: false,
        supportedSource: false,
        supportedSourceName: 'Severn',
        waterCompanyCharge: false,
        winterOnly: false
      }
      rightTransaction = { ...leftTransaction, id: '164eb779-4d2d-4578-bfbb-f07347e68171' }
    })

    describe('when the transactions match', () => {
      it('returns true', () => {
        const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

        expect(result).toBe(true)
      })
    })

    describe('when the transactions do not match', () => {
      describe('because the abatement agreement (section 126) is different', () => {
        beforeEach(() => {
          rightTransaction.section126Factor = 0.5
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the aggregate is different', () => {
        beforeEach(() => {
          rightTransaction.aggregateFactor = 0.5
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the billable days are different', () => {
        beforeEach(() => {
          rightTransaction.billableDays = 10
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the volume is different', () => {
        beforeEach(() => {
          rightTransaction.volume = 10
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the canal and river trust agreement (section 130) is different', () => {
        beforeEach(() => {
          rightTransaction.section130Agreement = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the charge adjustment is different', () => {
        beforeEach(() => {
          rightTransaction.adjustmentFactor = 0.5
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the charge category code is different', () => {
        beforeEach(() => {
          rightTransaction.chargeCategoryCode = '4.3.3'
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the charge type is different', () => {
        beforeEach(() => {
          rightTransaction.chargeType = 'compensation'
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the supported source differs (additional charge) is different', () => {
        beforeEach(() => {
          rightTransaction.supportedSource = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the supported source name differs (additional charge) is different', () => {
        beforeEach(() => {
          rightTransaction.supportedSourceName = 'source name'
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the two-part tariff agreement (section 127) is different', () => {
        beforeEach(() => {
          rightTransaction.section127Agreement = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the water company flag differs (additional charge) is different', () => {
        beforeEach(() => {
          rightTransaction.waterCompanyCharge = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })

      describe('because the winter discount is different', () => {
        beforeEach(() => {
          rightTransaction.adjustmentFactor = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).toBe(false)
        })
      })
    })
  })

  describe('#transformStringOfLicencesToArray', () => {
    let licences

    describe('when there is a single licence', () => {
      beforeEach(() => {
        licences = '123'
      })

      it('returns an array with the single licence', () => {
        const result = GeneralLib.transformStringOfLicencesToArray(licences)

        expect(result).toEqual(['123'])
      })
    })

    describe('when there are multiple licences', () => {
      describe('and they are separated by a ","', () => {
        beforeEach(() => {
          licences = '123, 456, 789'
        })

        it('returns an array with multiple licences', () => {
          const result = GeneralLib.transformStringOfLicencesToArray(licences)

          expect(result).toEqual(['123', '456', '789'])
        })

        describe('and there are extra spaces', () => {
          beforeEach(() => {
            licences = '123 ,   456,  789  '
          })

          it('returns an array with multiple licences', () => {
            const result = GeneralLib.transformStringOfLicencesToArray(licences)

            expect(result).toEqual(['123', '456', '789'])
          })
        })
      })

      describe('and they are separated by a "\\n"', () => {
        beforeEach(() => {
          licences = '123\n 456\n 789'
        })

        it('returns an array with multiple licences', () => {
          const result = GeneralLib.transformStringOfLicencesToArray(licences)

          expect(result).toEqual(['123', '456', '789'])
        })
      })

      describe('and they are separated by a " " (space)', () => {
        beforeEach(() => {
          licences = '123 456 789'
        })

        it('returns an array with only one item', () => {
          const result = GeneralLib.transformStringOfLicencesToArray(licences)

          expect(result).toEqual(['123 456 789'])
        })
      })
    })
  })

  describe('#compareStrings', () => {
    describe('when "referenceStr" comes before "compareString"', () => {
      it('returns a negative number', () => {
        const result = GeneralLib.compareStrings('010', '100')

        expect(result).toBeLessThan(0)
      })
    })

    describe('when "referenceStr" comes after "compareString"', () => {
      it('returns a postive number', () => {
        const result = GeneralLib.compareStrings('100', '010')

        expect(result).toBeGreaterThan(0)
      })
    })

    describe('when "referenceStr" is the same as "compareString"', () => {
      it('returns zero', () => {
        const result = GeneralLib.compareStrings('100', '100')

        expect(result).toEqual(0)
      })
    })
  })
})
