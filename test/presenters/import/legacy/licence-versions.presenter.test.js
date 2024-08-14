'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureLegacyLicenceVersion = require('../../../services/import/_fixtures/legacy-licence-version.fixture.js')
const FixtureLegacyLicenceVersionPurpose = require('../../../services/import/_fixtures/legacy-licence-version-purpose.fixture.js')

// Thing under test
const LicenceVersionsPresenter =
  require('../../../../app/presenters/import/legacy/licence-versions.presenter.js')

describe('Import legacy licence versions presenter', () => {
  const testDate = new Date('2023-08-21')

  let clock
  let licenceVersions
  let purpose
  let version

  beforeEach(() => {
    purpose = FixtureLegacyLicenceVersionPurpose.create()
    version = FixtureLegacyLicenceVersion.create()

    licenceVersions = [{ ...version, purposes: [{ ...purpose }] }]

    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  it('returns the licence version', () => {
    const results = LicenceVersionsPresenter.go(licenceVersions)

    expect(results).to.equal([{
      endDate: '2007-06-04',
      externalId: '3:10000003:100:0',
      increment: 0,
      issue: 100,
      purposes: [
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          annualQuantity: 545520,
          dailyQuantity: 1500.2,
          externalId: '3:10000004',
          hourlyQuantity: 140.929,
          instantQuantity: null,
          notes: null,
          primaryPurposeId: 'I',
          purposeId: '160',
          secondaryPurposeId: 'OTI',
          timeLimitedEndDate: null,
          timeLimitedStartDate: null
        }
      ],
      startDate: '2005-06-05',
      status: 'superseded',
      createdAt: testDate,
      updatedAt: testDate
    }])
  })

  describe('licence versions', () => {
    describe('the "endDate" property', () => {
      describe('when the licence version has EFF_END_DATE', () => {
        it('returns EFF_END_DATE as the start date in the correct format', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.endDate).to.equal('2007-06-04')
        })
      })
    })

    describe('the "externalId" property', () => {
      describe('when the licence version has FGAC_REGION_CODE, AABL_ID, ISSUE_NO, INCR_NO', () => {
        it('returns externalId in the format {FGAC_REGION_CODE}:{AABL_ID}:{ISSUE_NO}:{INCR_NO}', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.externalId).to.equal('3:10000003:100:0')
        })
      })
    })

    describe('the "increment" property', () => {
      describe('when the licence version has INCR_NO', () => {
        it('returns INCR_NO as a number', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.increment).to.be.number()
          expect(result.increment).to.equal(0)
        })
      })
    })

    describe('the "increment" property', () => {
      describe('when the licence version has INCR_NO', () => {
        it('returns INCR_NO as a number', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.increment).to.be.number()
          expect(result.increment).to.equal(0)
        })
      })
    })

    describe('the "issue" property', () => {
      describe('when the licence version has ISSUE_NO', () => {
        it('returns ISSUE_NO as a number', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.issue).to.be.number()
          expect(result.issue).to.equal(100)
        })
      })
    })

    describe('the "status" property', () => {
      describe('when the licence version has STATUS and is CURR', () => {
        beforeEach(() => {
          licenceVersions[0].STATUS = 'CURR'
        })

        it('returns the status as "curren"t', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.status).to.equal('current')
        })
      })

      describe('when the licence version has STATUS and is SUPER', () => {
        it('returns the status as "superseded"', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.status).to.equal('superseded')
        })
      })
    })

    describe('the "startDate" property', () => {
      describe('when the licence version has EFF_ST_DATE', () => {
        it('returns EFF_ST_DATE as the start date in the correct format', () => {
          const [result] = LicenceVersionsPresenter.go(licenceVersions)

          expect(result.startDate).to.equal('2005-06-05')
        })
      })
    })

    describe('licence versions "purposes" ', () => {
      describe('the "abstractionPeriodEndDay" property', () => {
        describe('when purpose has PERIOD_END_DAY', () => {
          it('returns PERIOD_END_DAY as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.abstractionPeriodEndDay).to.be.number()
            expect(result.abstractionPeriodEndDay).to.equal(31)
          })
        })
      })

      describe('the "abstractionPeriodEndMonth" property', () => {
        describe('when purpose has PERIOD_END_MONTH', () => {
          it('returns PERIOD_END_MONTH as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.abstractionPeriodEndMonth).to.be.number()
            expect(result.abstractionPeriodEndMonth).to.equal(3)
          })
        })
      })

      describe('the "abstractionPeriodStartDay" property', () => {
        describe('when purpose has PERIOD_ST_DAY', () => {
          it('returns PERIOD_ST_DAY as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.abstractionPeriodStartDay).to.be.number()
            expect(result.abstractionPeriodStartDay).to.equal(1)
          })
        })
      })

      describe('the "abstractionPeriodStartMonth" property', () => {
        describe('when purpose has PERIOD_ST_MONTH', () => {
          it('returns PERIOD_ST_MONTH as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.abstractionPeriodStartMonth).to.be.number()
            expect(result.abstractionPeriodStartMonth).to.equal(4)
          })
        })
      })

      describe('the "abstractionPeriodStartMonth" property', () => {
        describe('when purpose has PERIOD_ST_MONTH', () => {
          it('returns PERIOD_ST_MONTH as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.abstractionPeriodStartMonth).to.be.number()
            expect(result.abstractionPeriodStartMonth).to.equal(4)
          })
        })
      })

      describe('the "annualQuantity" property', () => {
        describe('when purpose has ANNUAL_QTY is "null"', () => {
          beforeEach(() => {
            licenceVersions[0].purposes = [
              { ...purpose, ANNUAL_QTY: 'null' }
            ]
          })

          it('returns null', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.annualQuantity).to.be.null()
          })
        })

        describe('when purpose has ANNUAL_QTY', () => {
          it('returns ANNUAL_QTY as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.annualQuantity).to.be.number()
            expect(result.annualQuantity).to.equal(545520)
          })
        })
      })

      describe('the "dailyQuantity" property', () => {
        describe('when purpose has DAILY_QTY is "null"', () => {
          beforeEach(() => {
            licenceVersions[0].purposes = [
              { ...purpose, DAILY_QTY: 'null' }
            ]
          })

          it('returns null', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.dailyQuantity).to.be.null()
          })
        })

        describe('when purpose has DAILY_QTY', () => {
          it('returns DAILY_QTY as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.dailyQuantity).to.be.number()
            expect(result.dailyQuantity).to.equal(1500.2)
          })
        })
      })

      describe('the "hourlyQuantity" property', () => {
        describe('when purpose has HOURLY_QTY is "null"', () => {
          beforeEach(() => {
            licenceVersions[0].purposes = [
              { ...purpose, HOURLY_QTY: 'null' }
            ]
          })

          it('returns null', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.hourlyQuantity).to.be.null()
          })
        })

        describe('when purpose has HOURLY_QTY', () => {
          it('returns HOURLY_QTY as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.hourlyQuantity).to.be.number()
            expect(result.hourlyQuantity).to.equal(140.929)
          })
        })
      })

      describe('the "instantQuantity" property', () => {
        describe('when purpose has INST_QTY is "null"', () => {
          it('returns null', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.instantQuantity).to.be.null()
          })
        })

        describe('when purpose has INST_QTY', () => {
          beforeEach(() => {
            licenceVersions[0].purposes = [
              { ...purpose, INST_QTY: '123' }
            ]
          })

          it('returns INST_QTY as a number', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.instantQuantity).to.be.number()
            expect(result.instantQuantity).to.equal(123)
          })
        })
      })

      describe('the "externalId" property', () => {
        describe('when the purpose has FGAC_REGION_CODE, ID', () => {
          it('returns externalId in the format {FGAC_REGION_CODE}:{ID}', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.externalId).to.equal('3:10000004')
          })
        })
      })

      describe('the "notes" property', () => {
        describe('when purpose has NOTES is "null"', () => {
          it('returns null', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.notes).to.be.null()
          })
        })

        describe('when purpose has NOTES', () => {
          beforeEach(() => {
            licenceVersions[0].purposes = [
              { ...purpose, NOTES: 'a b c' }
            ]
          })

          it('returns notes', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.notes).to.equal('a b c')
          })
        })
      })

      describe('the "primaryPurposeId" property', () => {
        describe('when purpose has APUR_APPR_CODE', () => {
          it('returns the legacy primaryPurposeId', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.primaryPurposeId).to.equal('I')
          })
        })
      })

      describe('the "purposeId" property', () => {
        describe('when purpose has APUR_APUS_CODE', () => {
          it('returns the legacy purposeId', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.purposeId).to.equal('160')
          })
        })
      })

      describe('the "secondaryPurposeId" property', () => {
        describe('when purpose has APUR_APSE_CODE', () => {
          it('returns the legacy secondaryPurposeId', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.secondaryPurposeId).to.equal('OTI')
          })
        })
      })

      describe('the "timeLimitedEndDate" property', () => {
        describe('when purpose has TIMELTD_END_DATE', () => {
          beforeEach(() => {
            licenceVersions[0].purposes = [
              { ...purpose, TIMELTD_END_DATE: '31/03/2015' }
            ]
          })

          it('returns the time Limited End Date in the ISO format', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.timeLimitedEndDate).to.equal('2015-03-31')
          })
        })

        describe('when purpose has TIMELTD_END_DATE', () => {
          it('returns null', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.timeLimitedEndDate).to.be.null()
          })
        })
      })

      describe('the "timeLimitedStartDate" property', () => {
        describe('when purpose has TIMELTD_ST_DATE', () => {
          beforeEach(() => {
            licenceVersions[0].purposes = [
              { ...purpose, TIMELTD_ST_DATE: '31/03/2015' }
            ]
          })

          it('returns the time Limited End Date in the ISO format', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.timeLimitedStartDate).to.equal('2015-03-31')
          })
        })

        describe('when purpose has TIMELTD_ST_DATE', () => {
          it('returns null', () => {
            const [{ purposes: [result] }] = LicenceVersionsPresenter.go(licenceVersions)

            expect(result.timeLimitedStartDate).to.be.null()
          })
        })
      })
    })
  })
})
