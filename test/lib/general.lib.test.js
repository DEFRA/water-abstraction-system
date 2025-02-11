'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const TransactionHelper = require('../support/helpers/transaction.helper.js')

// Thing under test
const GeneralLib = require('../../app/lib/general.lib.js')

describe('GeneralLib', () => {
  afterEach(() => {
    Sinon.restore()
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
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    describe('when no additional data is provided', () => {
      it('logs the message and time taken in milliseconds and seconds', () => {
        GeneralLib.calculateAndLogTimeTaken(startTime, 'I am the test with no data')

        const logDataArg = notifierStub.omg.args[0][1]

        expect(notifierStub.omg.calledWith('I am the test with no data')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.name).not.to.exist()
      })
    })

    describe('when additional data is provided', () => {
      it('logs the message and time taken in milliseconds and seconds as well as the additional data', () => {
        GeneralLib.calculateAndLogTimeTaken(startTime, 'I am the test with data', { name: 'Foo Bar' })

        const logDataArg = notifierStub.omg.args[0][1]

        expect(notifierStub.omg.calledWith('I am the test with data')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.name).to.exist()
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

      expect(typeof result).to.equal('bigint')
      expect(result).to.be.greaterThan(timeBeforeTest)
    })
  })

  describe('#determineCurrentFinancialYear', () => {
    let clock
    let testDate

    afterEach(() => {
      clock.restore()
    })

    describe('when the current financial year is 2023 to 2024', () => {
      describe('and the current date is between April and December', () => {
        beforeEach(() => {
          testDate = new Date(2023, 7, 21, 20, 31, 57)

          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the correct start and end dates for the financial year', () => {
          const result = GeneralLib.determineCurrentFinancialYear()

          expect(result.startDate).to.equal(new Date('2023-04-01'))
          expect(result.endDate).to.equal(new Date('2024-03-31'))
        })
      })

      describe('and the current date is between January and March', () => {
        beforeEach(() => {
          testDate = new Date(2024, 2, 21, 20, 31, 57)

          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the correct start and end dates for the financial year', () => {
          const result = GeneralLib.determineCurrentFinancialYear()

          expect(result.startDate).to.equal(new Date('2023-04-01'))
          expect(result.endDate).to.equal(new Date('2024-03-31'))
        })
      })
    })
  })

  describe('#flashNotification', () => {
    let yarStub

    beforeEach(() => {
      yarStub = { flash: Sinon.stub() }
    })

    it('returns the standard notification { title: "Updated", text: "Changes made" }', () => {
      GeneralLib.flashNotification(yarStub)

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
    })

    it('returns the overridden notification { title: "Fancy new title", text: "better text" }', () => {
      GeneralLib.flashNotification(yarStub, 'Fancy new title', 'better text')

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notification).to.equal({ title: 'Fancy new title', text: 'better text' })
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

        expect(result).to.equal(false)
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

        expect(result).to.equal(true)
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

        expect(result).to.equal(true)
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

        expect(result).to.equal(true)
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

        expect(result).to.equal(true)
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
    })

    it('returns the current date and time as an ISO string', () => {
      const result = GeneralLib.timestampForPostgres()

      expect(result).to.equal('2015-10-21T20:31:57.000Z')
    })
  })

  describe('#transactionsMatch', () => {
    let leftTransaction
    let rightTransaction

    beforeEach(() => {
      // NOTE: The properties the function is comparing are; chargeType, chargeCategoryCode, billableDays,
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

        expect(result).to.be.true()
      })
    })

    describe('when the transactions do not match', () => {
      describe('because the abatement agreement (section 126) is different', () => {
        beforeEach(() => {
          rightTransaction.section126Factor = 0.5
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the aggregate is different', () => {
        beforeEach(() => {
          rightTransaction.aggregateFactor = 0.5
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the billable days are different', () => {
        beforeEach(() => {
          rightTransaction.billableDays = 10
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the canal and river trust agreement (section 130) is different', () => {
        beforeEach(() => {
          rightTransaction.section130Agreement = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the charge adjustment is different', () => {
        beforeEach(() => {
          rightTransaction.adjustmentFactor = 0.5
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the charge category code is different', () => {
        beforeEach(() => {
          rightTransaction.chargeCategoryCode = '4.3.3'
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the charge type is different', () => {
        beforeEach(() => {
          rightTransaction.chargeType = 'compensation'
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the supported source differs (additional charge) is different', () => {
        beforeEach(() => {
          rightTransaction.supportedSource = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the supported source name differs (additional charge) is different', () => {
        beforeEach(() => {
          rightTransaction.supportedSourceName = 'source name'
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the two-part tariff agreement (section 127) is different', () => {
        beforeEach(() => {
          rightTransaction.section127Agreement = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the water company flag differs (additional charge) is different', () => {
        beforeEach(() => {
          rightTransaction.waterCompanyCharge = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
        })
      })

      describe('because the winter discount is different', () => {
        beforeEach(() => {
          rightTransaction.adjustmentFactor = true
        })

        it('returns false', () => {
          const result = GeneralLib.transactionsMatch(leftTransaction, rightTransaction)

          expect(result).to.be.false()
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

        expect(result).to.equal(['123'])
      })
    })

    describe('when there are multiple licences', () => {
      describe('and they are separated by a ","', () => {
        beforeEach(() => {
          licences = '123, 456, 789'
        })

        it('returns an array with multiple licences', () => {
          const result = GeneralLib.transformStringOfLicencesToArray(licences)

          expect(result).to.equal(['123', '456', '789'])
        })

        describe('and there are extra spaces', () => {
          beforeEach(() => {
            licences = '123 ,   456,  789  '
          })

          it('returns an array with multiple licences', () => {
            const result = GeneralLib.transformStringOfLicencesToArray(licences)

            expect(result).to.equal(['123', '456', '789'])
          })
        })
      })

      describe('and they are separated by a "\\n"', () => {
        beforeEach(() => {
          licences = '123\n 456\n 789'
        })

        it('returns an array with multiple licences', () => {
          const result = GeneralLib.transformStringOfLicencesToArray(licences)

          expect(result).to.equal(['123', '456', '789'])
        })
      })

      describe('and they are separated by a " " (space)', () => {
        beforeEach(() => {
          licences = '123 456 789'
        })

        it('returns an array with only one item', () => {
          const result = GeneralLib.transformStringOfLicencesToArray(licences)

          expect(result).to.equal(['123 456 789'])
        })
      })
    })
  })
})
