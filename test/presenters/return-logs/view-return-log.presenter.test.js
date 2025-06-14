'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewReturnLogPresenter = require('../../../app/presenters/return-logs/view-return-log.presenter.js')

// Test helpers
const { formatNumber } = require('../../../app/presenters/base.presenter.js')
const ReturnLogsFixture = require('../../fixtures/return-logs.fixture.js')

const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')

const { unitNames } = require('../../../app/lib/static-lookups.lib.js')

describe.only('Return Logs - View Return Log presenter', () => {
  let auth
  let returnLog

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['returns']
      }
    }

    returnLog = ReturnLogsFixture.returnLog('month', true)
    returnLog.returnSubmissions = [ReturnLogsFixture.returnSubmission(returnLog, 'estimated')]

    // Warning! Copy the array rather than assign it. Else changes you make to returnLog.returnSubmissions will
    // automatically apply to returnLog.version. We learnt the hard way!
    returnLog.versions = [...returnLog.returnSubmissions]

    ReturnLogsFixture.applyFetchReturnLogFields(returnLog)
  })

  it('correctly presents the data', () => {
    const result = ViewReturnLogPresenter.go(returnLog, auth)

    const lines = returnLog.returnSubmissions[0].returnSubmissionLines
    const totalQuantity = lines.reduce((acc, line) => {
      return acc + line.quantity
    }, 0)

    expect(result).to.equal({
      abstractionPeriod: '1 April to 28 April',
      actionButton: {
        value: returnLog.id,
        text: 'Edit return'
      },
      backLink: {
        href: `/system/licences/${returnLog.licence.id}/returns`,
        text: 'Go back to summary'
      },
      displayReadings: false,
      displayTable: true,
      displayTotal: true,
      displayUnits: false,
      downloadCSVLink: `/system/return-logs/download?id=${returnLog.id}&version=1`,
      latest: true,
      licenceRef: returnLog.licenceRef,
      meterDetails: null,
      method: 'abstractionVolumes',
      nilReturn: false,
      pageTitle: 'Abstraction return',
      purpose: 'Mineral Washing',
      receivedDate: '12 April 2023',
      returnReference: returnLog.returnReference,
      returnPeriod: '1 April 2022 to 31 March 2023',
      showUnderQuery: true,
      siteDescription: 'BOREHOLE AT AVALON',
      startReading: undefined,
      status: 'complete',
      summaryTableData: {
        headers: [{ text: 'Month' }, { text: 'Cubic metres', format: 'numeric' }],
        rows: [
          { month: 'April 2022', monthlyTotal: formatNumber(lines[0].quantity) },
          { month: 'May 2022', monthlyTotal: formatNumber(lines[1].quantity) },
          { month: 'June 2022', monthlyTotal: formatNumber(lines[2].quantity) },
          { month: 'July 2022', monthlyTotal: formatNumber(lines[3].quantity) },
          { month: 'August 2022', monthlyTotal: formatNumber(lines[4].quantity) },
          { month: 'September 2022', monthlyTotal: formatNumber(lines[5].quantity) },
          { month: 'October 2022', monthlyTotal: formatNumber(lines[6].quantity) },
          { month: 'November 2022', monthlyTotal: formatNumber(lines[7].quantity) },
          { month: 'December 2022', monthlyTotal: formatNumber(lines[8].quantity) },
          { month: 'January 2023', monthlyTotal: formatNumber(lines[9].quantity) },
          { month: 'February 2023', monthlyTotal: formatNumber(lines[10].quantity) },
          { month: 'March 2023', monthlyTotal: formatNumber(lines[11].quantity) }
        ]
      },
      tableTitle: 'Summary of monthly abstraction volumes',
      tariff: 'Standard',
      total: formatNumber(totalQuantity),
      underQuery: false,
      versions: [
        {
          createdAt: '16 December 2023',
          link: `/system/return-logs?id=${returnLog.id}&version=1`,
          notes: null,
          selected: true,
          version: 1,
          user: 'admin-internal@wrls.gov.uk'
        }
      ]
    })
  })

  describe('the "abstractionPeriod" property', () => {
    describe('when the return log has an abstraction period set', () => {
      it('returns the correctly-formatted date', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.abstractionPeriod).to.equal('1 April to 28 April')
      })
    })

    describe('when the return log has its abstraction period set to "null"', () => {
      beforeEach(() => {
        returnLog.periodStartDay = 'null'
        returnLog.periodStartMonth = 'null'
        returnLog.periodEndDay = 'null'
        returnLog.periodEndMonth = 'null'
      })

      it('returns an empty string', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.abstractionPeriod).to.equal('')
      })
    })

    describe('when the return log has a NULL abstraction period', () => {
      beforeEach(() => {
        returnLog.periodStartDay = null
        returnLog.periodStartMonth = null
        returnLog.periodEndDay = null
        returnLog.periodEndMonth = null
      })

      it('returns an empty string', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.abstractionPeriod).to.equal('')
      })
    })
  })

  describe('the "actionButton" property', () => {
    describe('when this is a "void" return', () => {
      beforeEach(() => {
        returnLog.status = 'void'
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.actionButton).to.be.null()
      })
    })

    describe('when the return is "not due yet"', () => {
      beforeEach(() => {
        const notDueUntilDate = new Date()
        returnLog.dueDate = new Date(notDueUntilDate.setDate(notDueUntilDate.getDate() + 27))
        returnLog.status = 'due'
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.actionButton).to.be.null()
      })
    })

    describe('when the return is "due"', () => {
      beforeEach(() => {
        // Not strictly needed as 'due' is the default status but we include it here for clarity
        returnLog.status = 'due'
      })

      it('returns the expected "Submit return" result', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.actionButton).to.equal({
          value: returnLog.id,
          text: 'Submit return'
        })
      })
    })

    describe('when auth credentials do not include the "returns" scope', () => {
      beforeEach(() => {
        auth.credentials.scope = ['NOT_RETURNS']
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.actionButton).to.be.null()
      })
    })

    describe('when the return is "completed"', () => {
      describe('and the latest return submission version is selected (or none was selected)', () => {
        beforeEach(() => {
          // Create a new return submission. The fixture will use the details from the existing return log, as well as
          // marking previous versions as no longer current, and using them to determine the next version number
          const latestSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'estimated')

          // We add the new submission to the top of versions as it is the latest
          returnLog.versions.unshift(latestSubmission)

          // Though an array, return submissions only ever holds one return submission: either the latest or whichever was
          // selected. Versions always hold all return submissions so we can display them at the bottom of the page
          returnLog.returnSubmissions = [latestSubmission]
        })

        it('returns the expected "Edit return" result', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.actionButton).to.equal({
            value: returnLog.id,
            text: 'Edit return'
          })
        })
      })

      describe('and an earlier return submission is selected', () => {
        beforeEach(() => {
          const latestSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'estimated')

          returnLog.versions.unshift(latestSubmission)

          // Note we don't update returnLog.returnSubmissions. This is the equivalent of saying an earlier version was
          // selected.
        })

        it('returns null', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.actionButton).to.be.null()
        })
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('and the latest return submission version is selected (or none was selected)', () => {
      beforeEach(() => {
        // Create a new return submission. The fixture will use the details from the existing return log, as well as
        // marking previous versions as no longer current, and using them to determine the next version number
        const latestSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'estimated')

        // We add the new submission to the top of versions as it is the latest
        returnLog.versions.unshift(latestSubmission)

        // Though an array, return submissions only ever holds one return submission: either the latest or whichever was
        // selected. Versions always hold all return submissions so we can display them at the bottom of the page
        returnLog.returnSubmissions = [latestSubmission]
      })

      it('returns the expected "Go back to summary" result', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.backLink).to.equal({
          href: `/system/licences/${returnLog.licence.id}/returns`,
          text: 'Go back to summary'
        })
      })
    })

    describe('and an earlier return submission is selected', () => {
      beforeEach(() => {
        const latestSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'estimated')

        returnLog.versions.unshift(latestSubmission)

        // Note we don't update returnLog.returnSubmissions. This is the equivalent of saying an earlier version was
        // selected.
      })

      it('returns the expected "Go back to the latest version" result', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.backLink).to.equal({
          href: `/system/return-logs?id=${returnLog.id}`,
          text: 'Go back to the latest version'
        })
      })
    })
  })

  describe('the "displayReadings" property', () => {
    describe('when the return submission method is "abstractionVolumes"', () => {
      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.displayReadings).to.equal(false)
      })
    })

    describe("when the return submission method isn't 'abstractionVolumes'", () => {
      beforeEach(() => {
        returnLog.returnSubmissions[0].metadata.method = 'oneMeter'
      })

      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.displayReadings).to.equal(true)
      })
    })
  })

  describe('the "displayTable" property', () => {
    describe('when there are no return submissions', () => {
      beforeEach(() => {
        returnLog.returnSubmissions = []
        returnLog.versions = []
        returnLog.status = 'due'
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.displayTable).to.equal(false)
      })
    })

    describe('when there is a return submission', () => {
      describe('which is a "nil return"', () => {
        beforeEach(() => {
          returnLog.returnSubmissions[0].nilReturn = true
          returnLog.versions[0].nilReturn = true
        })

        it('returns false', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.displayTable).to.equal(false)
        })
      })

      describe('which is not a nil return', () => {
        it('returns true', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.displayTable).to.equal(true)
        })
      })
    })
  })

  // describe('the "displayUnits" property', () => {
  //   beforeEach(() => {
  //     setupSubmission(returnLog)
  //   })

  //   describe('when the unit is not cubic metres', () => {
  //     beforeEach(() => {
  //       Sinon.stub(returnLog.returnSubmissions[0], '$units').returns(unitNames.GALLONS)
  //     })

  //     it('returns true', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.displayUnits).to.equal(true)
  //     })
  //   })

  //   describe('when the unit is cubic metres', () => {
  //     beforeEach(() => {
  //       Sinon.stub(returnLog.returnSubmissions[0], '$units').returns(unitNames.CUBIC_METRES)
  //     })

  //     it('returns false', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.displayUnits).to.equal(false)
  //     })
  //   })
  // })

  // describe('the "latest" property', () => {
  //   describe('when this is the latest return log', () => {
  //     it('returns true', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.latest).to.equal(true)
  //     })
  //   })

  //   describe('when this is not the latest return log', () => {
  //     beforeEach(() => {
  //       returnLog.versions = [
  //         createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: returnLog.licence.id }),
  //         createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: returnLog.licence.id, version: 102 })
  //       ]

  //       returnLog.returnSubmissions = [
  //         createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, { returnLogId: returnLog.id }),
  //         createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, { returnLogId: returnLog.id, version: 2 })
  //       ]

  //       for (const returnSubmission of returnLog.returnSubmissions) {
  //         returnSubmission.returnSubmissionLines = [
  //           createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
  //             returnSubmissionId: returnSubmission.id
  //           })
  //         ]
  //       }
  //     })

  //     it('returns false', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.latest).to.equal(false)
  //     })
  //   })
  // })

  // describe('the "licenceRef" property', () => {
  //   it('returns the licence reference', () => {
  //     const result = ViewReturnLogPresenter.go(returnLog, auth)

  //     expect(result.licenceRef).to.equal(returnLog.licence.licenceRef)
  //   })
  // })

  // describe('the "meterDetails" property', () => {
  //   beforeEach(() => {
  //     setupSubmission(returnLog)

  //     Sinon.stub(returnLog.returnSubmissions[0], '$meter').returns({
  //       manufacturer: 'MANUFACTURER',
  //       multipler: 10,
  //       serialNumber: 'SERIAL_NUMBER'
  //     })
  //   })

  //   it('returns the formatted meter details', () => {
  //     const result = ViewReturnLogPresenter.go(returnLog, auth)

  //     expect(result.meterDetails).to.equal({
  //       make: 'MANUFACTURER',
  //       serialNumber: 'SERIAL_NUMBER',
  //       xDisplay: 'Yes'
  //     })
  //   })
  // })

  // describe('the "method" property', () => {
  //   beforeEach(() => {
  //     setupSubmission(returnLog)

  //     Sinon.stub(returnLog.returnSubmissions[0], '$method').returns('METHOD')
  //   })

  //   it('returns the submission method', () => {
  //     const result = ViewReturnLogPresenter.go(returnLog, auth)

  //     expect(result.method).to.equal('METHOD')
  //   })
  // })

  // describe('the "nilReturn" property', () => {
  //   describe('when there is a submission', () => {
  //     describe('which is a nil return', () => {
  //       beforeEach(() => {
  //         setupSubmission(returnLog, true)
  //       })

  //       it('returns true', () => {
  //         const result = ViewReturnLogPresenter.go(returnLog, auth)

  //         expect(result.nilReturn).to.equal(true)
  //       })
  //     })

  //     describe('which is not a nil return', () => {
  //       beforeEach(() => {
  //         setupSubmission(returnLog)
  //       })

  //       it('returns false', () => {
  //         const result = ViewReturnLogPresenter.go(returnLog, auth)

  //         expect(result.nilReturn).to.equal(false)
  //       })
  //     })
  //   })

  //   describe('when there is no submission', () => {
  //     it('returns false', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.nilReturn).to.equal(false)
  //     })
  //   })
  // })

  // describe('the "purpose" property', () => {
  //   describe('when the first purpose has an alias', () => {
  //     it('returns the alias', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.purpose).to.equal('PURPOSE_ALIAS')
  //     })
  //   })

  //   describe('when the first purpose has no alias', () => {
  //     beforeEach(() => {
  //       returnLog.purposes.unshift({ tertiary: { description: 'TERTIARY_DESCRIPTION' } })
  //     })

  //     it('returns the tertiary description', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.purpose).to.equal('TERTIARY_DESCRIPTION')
  //     })
  //   })
  // })

  // describe('the "receivedDate" property', () => {
  //   describe('when no received date is present', () => {
  //     it('returns null ', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.receivedDate).to.be.null()
  //     })
  //   })

  //   describe('when a received date is present', () => {
  //     beforeEach(() => {
  //       returnLog.receivedDate = new Date(`2022-01-01`)
  //     })

  //     it('returns the formatted date', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.receivedDate).to.equal('1 January 2022')
  //     })
  //   })
  // })

  // describe('the "returnPeriod" property', () => {
  //   it('returns the formatted return period', () => {
  //     const result = ViewReturnLogPresenter.go(returnLog, auth)

  //     expect(result.returnPeriod).to.equal('1 April 2022 to 31 March 2023')
  //   })
  // })

  // describe('the "showUnderQuery" property', () => {
  //   describe('when the return has a status of "not due yet"', () => {
  //     beforeEach(() => {
  //       const notDueUntilDate = new Date()
  //       returnLog.dueDate = new Date(notDueUntilDate.setDate(notDueUntilDate.getDate() + 27))
  //       returnLog.status = 'due'
  //     })

  //     it('returns false', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.showUnderQuery).to.be.false()
  //     })
  //   })

  //   describe('when the returns status is not "not due yet"', () => {
  //     beforeEach(() => {
  //       returnLog.status = 'completed'
  //     })

  //     it('returns true', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.showUnderQuery).to.be.true()
  //     })
  //   })
  // })

  // describe('the "startReading" property', () => {
  //   describe('when there is a submission', () => {
  //     beforeEach(() => {
  //       setupSubmission(returnLog)

  //       Sinon.stub(returnLog.returnSubmissions[0], '$meter').returns({
  //         manufacturer: 'MANUFACTURER',
  //         multipler: 10,
  //         serialNumber: 'SERIAL_NUMBER',
  //         startReading: 1234
  //       })
  //     })

  //     it('returns the start reading', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.startReading).to.equal(1234)
  //     })
  //   })

  //   describe('when there is no submission', () => {
  //     it('returns null', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.startReading).to.be.null()
  //     })
  //   })
  // })

  // describe('the "summaryTableData" property', () => {
  //   describe('when there is no submission', () => {
  //     it('returns null', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.summaryTableData).to.be.null()
  //     })
  //   })

  //   describe('when there is a submission', () => {
  //     let StubbedViewReturnLogPresenter

  //     beforeEach(() => {
  //       // We have to use Proxyquire to stub BaseReturnLogsPresenter as Sinon cannot stub dependencies that are imported
  //       // via destructuring
  //       StubbedViewReturnLogPresenter = Proxyquire('../../../app/presenters/return-logs/view-return-log.presenter.js', {
  //         './base-return-logs.presenter.js': {
  //           generateSummaryTableHeaders: Sinon.stub().returns('GENERATED_HEADERS'),
  //           generateSummaryTableRows: Sinon.stub().returns('GENERATED_ROWS')
  //         }
  //       })

  //       setupSubmission(returnLog)
  //     })

  //     it('returns generated headers and rows', () => {
  //       const result = StubbedViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.summaryTableData.headers).to.equal('GENERATED_HEADERS')
  //       expect(result.summaryTableData.rows).to.equal('GENERATED_ROWS')
  //     })
  //   })
  // })

  // describe('the "tableTitle" property', () => {
  //   beforeEach(() => {
  //     setupSubmission(returnLog)
  //   })

  //   it('returns the frequency in the title', () => {
  //     const result = ViewReturnLogPresenter.go(returnLog, auth)

  //     expect(result.tableTitle).to.contain('monthly')
  //   })

  //   describe('when the method is abstractionVolumes', () => {
  //     beforeEach(() => {
  //       Sinon.stub(returnLog.returnSubmissions[0], '$method').returns('abstractionVolumes')
  //     })

  //     it("returns 'abstraction volumes' in the title", () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.tableTitle).to.contain('abstraction volumes')
  //     })
  //   })

  //   describe('when the method is not abstractionVolumes', () => {
  //     beforeEach(() => {
  //       Sinon.stub(returnLog.returnSubmissions[0], '$method').returns('NOT_ABSTRACTION_VOLUMES')
  //     })

  //     it("returns 'meter readings' in the title", () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.tableTitle).to.contain('meter readings')
  //     })
  //   })
  // })

  // describe('the "total" property', () => {
  //   describe('when there is no submission', () => {
  //     it('returns 0 as a string', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.total).to.equal('0')
  //     })
  //   })

  //   describe('when there is a submission', () => {
  //     describe('which is a nil return', () => {
  //       beforeEach(() => {
  //         setupSubmission(returnLog, true)
  //       })

  //       it('returns 0 as a string', () => {
  //         const result = ViewReturnLogPresenter.go(returnLog, auth)

  //         expect(result.total).to.equal('0')
  //       })
  //     })

  //     describe('which is not a nil return', () => {
  //       beforeEach(() => {
  //         returnLog.versions = [
  //           createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: returnLog.licence.id })
  //         ]

  //         returnLog.returnSubmissions = [
  //           createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, {
  //             returnLogId: returnLog.id
  //           })
  //         ]

  //         returnLog.returnSubmissions[0].returnSubmissionLines = [
  //           createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
  //             returnSubmissionId: returnLog.returnSubmissions[0].id
  //           }),
  //           createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
  //             returnSubmissionId: returnLog.returnSubmissions[0].id,
  //             startDate: new Date(`2022-01-02`),
  //             endDate: new Date(`2022-02-08`)
  //           })
  //         ]
  //       })

  //       it('returns the formatted total quantity', () => {
  //         const result = ViewReturnLogPresenter.go(returnLog, auth)

  //         expect(result.total).to.equal('8,760')
  //       })
  //     })
  //   })
  // })

  // describe('the "underQuery" property', () => {
  //   beforeEach(() => {
  //     setupSubmission(returnLog)
  //   })

  //   describe('when the return log is under query', () => {
  //     beforeEach(() => {
  //       returnLog.underQuery = true
  //     })

  //     it('returns true', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.underQuery).to.equal(true)
  //     })
  //   })

  //   describe('when the return log is not under query', () => {
  //     beforeEach(() => {
  //       returnLog.underQuery = false
  //     })

  //     it('returns false', () => {
  //       const result = ViewReturnLogPresenter.go(returnLog, auth)

  //       expect(result.underQuery).to.equal(false)
  //     })
  //   })
  // })

  // describe('the "versions" property', () => {
  //   beforeEach(() => {
  //     returnLog.returnSubmissions = [
  //       createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, {
  //         id: 'b57bc755-5f94-4760-bc5c-aba690827467',
  //         returnLogId: returnLog.id
  //       })
  //     ]

  //     returnLog.versions = [
  //       createInstance(ReturnVersionModel, ReturnVersionHelper, {
  //         id: returnLog.returnSubmissions[0].id,
  //         licenceId: returnLog.licence.id,
  //         notes: 'NOTES_V3',
  //         userId: '4f6ab2c7-1361-4360-b83c-dec8cfc02585',
  //         version: 3
  //       }),
  //       createInstance(ReturnVersionModel, ReturnVersionHelper, {
  //         licenceId: returnLog.licence.id,
  //         notes: 'NOTES_V2',
  //         userId: '0c807806-500a-448d-83ff-bf12d3138988',
  //         version: 2
  //       }),
  //       createInstance(ReturnVersionModel, ReturnVersionHelper, {
  //         licenceId: returnLog.licence.id,
  //         notes: 'NOTES_V1',
  //         userId: '7b08a1a0-10c8-4981-82f5-5157d09205bb',
  //         version: 1
  //       })
  //     ]

  //     returnLog.returnSubmissions[0].returnSubmissionLines = [
  //       createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
  //         returnSubmissionId: returnLog.returnSubmissions[0].id
  //       }),
  //       createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
  //         returnSubmissionId: returnLog.returnSubmissions[0].id,
  //         startDate: new Date(`2022-01-02`),
  //         endDate: new Date(`2022-02-08`)
  //       })
  //     ]
  //   })

  //   it('returns the versions', () => {
  //     const result = ViewReturnLogPresenter.go(returnLog, auth)

  //     expect(result.versions).to.equal(
  //       [
  //         {
  //           link: `/system/return-logs?id=${returnLog.id}&version=3`,
  //           notes: 'NOTES_V3',
  //           selected: true,
  //           version: 3,
  //           user: '4f6ab2c7-1361-4360-b83c-dec8cfc02585'
  //         },
  //         {
  //           link: `/system/return-logs?id=${returnLog.id}&version=2`,
  //           notes: 'NOTES_V2',
  //           selected: false,
  //           version: 2,
  //           user: '0c807806-500a-448d-83ff-bf12d3138988'
  //         },
  //         {
  //           link: `/system/return-logs?id=${returnLog.id}&version=1`,
  //           notes: 'NOTES_V1',
  //           selected: false,
  //           version: 1,
  //           user: '7b08a1a0-10c8-4981-82f5-5157d09205bb'
  //         }
  //       ],
  //       { skip: ['createdAt'] }
  //     )
  //   })
  // })
})

function setupSubmission(testReturnLog, nilReturn = false) {
  testReturnLog.versions = [
    createInstance(ReturnVersionModel, ReturnVersionHelper, { licenceId: testReturnLog.licence.id })
  ]

  testReturnLog.returnSubmissions = [
    createInstance(ReturnSubmissionModel, ReturnSubmissionHelper, {
      returnLogId: testReturnLog.id,
      nilReturn
    })
  ]

  testReturnLog.returnSubmissions[0].returnSubmissionLines = [
    createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
      returnSubmissionId: testReturnLog.returnSubmissions[0].id
    })
  ]
}

// Create an instance of a given model using the defaults of the given helper, without creating it in the db. This
// allows us to pass in the expected models without having to touch the db at all.
function createInstance(model, helper, data = {}) {
  return model.fromJson({
    createdAt: new Date(),
    updatedAt: new Date(),
    ...helper.defaults(),
    ...data
  })
}
