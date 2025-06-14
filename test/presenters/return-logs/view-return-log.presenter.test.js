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
const { unitNames } = require('../../../app/lib/static-lookups.lib.js')

describe('Return Logs - View Return Log presenter', () => {
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
      purpose: 'Mineral Washing alias',
      receivedDate: '12 April 2023',
      returnReference: returnLog.returnReference,
      returnPeriod: '1 April 2022 to 31 March 2023',
      showUnderQuery: true,
      siteDescription: 'BOREHOLE AT AVALON',
      startReading: null,
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

      it('returns "Submit return"', () => {
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

        it('returns "Edit return"', () => {
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
    describe('when the latest return submission version is selected (or none was selected)', () => {
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

      it('returns "Go back to summary"', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.backLink).to.equal({
          href: `/system/licences/${returnLog.licence.id}/returns`,
          text: 'Go back to summary'
        })
      })
    })

    describe('when an earlier return submission is selected', () => {
      beforeEach(() => {
        const latestSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'estimated')

        returnLog.versions.unshift(latestSubmission)

        // Note we don't update returnLog.returnSubmissions. This is the equivalent of saying an earlier version was
        // selected.
      })

      it('returns "Go back to the latest version"', () => {
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
        delete returnLog.returnSubmissions
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

  describe('the "displayUnits" property', () => {
    describe('when the unit is not cubic metres', () => {
      beforeEach(() => {
        returnLog.returnSubmissions[0].metadata.units = unitNames.GALLONS
      })

      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.displayUnits).to.equal(true)
      })
    })

    describe('when the unit is cubic metres', () => {
      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.displayUnits).to.equal(false)
      })
    })
  })

  describe('the "downloadCSVLink" property', () => {
    describe('when there are no return submissions', () => {
      beforeEach(() => {
        delete returnLog.returnSubmissions
        returnLog.versions = []
        returnLog.status = 'due'
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.downloadCSVLink).to.be.null()
      })
    })

    describe('when there is a return submission', () => {
      describe('which is a "nil return"', () => {
        beforeEach(() => {
          returnLog.returnSubmissions[0].nilReturn = true
          returnLog.versions[0].nilReturn = true
        })

        it('returns null', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.downloadCSVLink).to.be.null()
        })
      })

      describe('which is not a nil return', () => {
        it('returns a link to download the selected version', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          const expectedLink = `/system/return-logs/download?id=${returnLog.id}&version=${returnLog.returnSubmissions[0].version}`

          expect(result.downloadCSVLink).to.equal(expectedLink)
        })
      })
    })
  })

  describe('the "latest" property', () => {
    describe('when the latest return submission version is selected (or none was selected)', () => {
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

      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.latest).to.equal(true)
      })
    })

    describe('when an earlier return submission is selected', () => {
      beforeEach(() => {
        const latestSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'estimated')

        returnLog.versions.unshift(latestSubmission)

        // Note we don't update returnLog.returnSubmissions. This is the equivalent of saying an earlier version was
        // selected.
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.latest).to.equal(false)
      })
    })
  })

  describe('the "nilReturn" property', () => {
    describe('when there are no return submissions', () => {
      beforeEach(() => {
        delete returnLog.returnSubmissions
        returnLog.versions = []
        returnLog.status = 'due'
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.nilReturn).to.equal(false)
      })
    })

    describe('when there is a return submission', () => {
      describe('which is a "nil return"', () => {
        beforeEach(() => {
          returnLog.returnSubmissions[0].nilReturn = true
          returnLog.versions[0].nilReturn = true
        })

        it('returns true', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.nilReturn).to.equal(true)
        })
      })

      describe('which is not a nil return', () => {
        it('returns true', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.nilReturn).to.equal(false)
        })
      })
    })
  })

  describe('the "purpose" property', () => {
    describe('when the first purpose has an alias', () => {
      it('returns the alias', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.purpose).to.equal('Mineral Washing alias')
      })
    })

    describe('when the first purpose has no alias', () => {
      beforeEach(() => {
        returnLog.purposes[0].alias = null
      })

      it('returns the tertiary description', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.purpose).to.equal('Mineral Washing')
      })
    })
  })

  describe('the "receivedDate" property', () => {
    describe('when no received date is present', () => {
      beforeEach(() => {
        returnLog.receivedDate = null
        returnLog.status = 'due'
        delete returnLog.returnSubmissions
        returnLog.versions = []
      })

      it('returns null ', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.receivedDate).to.be.null()
      })
    })

    describe('when a received date is present', () => {
      it('returns the formatted date', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.receivedDate).to.equal('12 April 2023')
      })
    })
  })

  describe('the "showUnderQuery" property', () => {
    describe('when the return is "not due yet"', () => {
      beforeEach(() => {
        const notDueUntilDate = new Date()
        returnLog.dueDate = new Date(notDueUntilDate.setDate(notDueUntilDate.getDate() + 27))
        returnLog.status = 'due'
      })

      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.showUnderQuery).to.be.false()
      })
    })

    describe('when the return is past due, regardless of its status', () => {
      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.showUnderQuery).to.be.true()
      })
    })
  })

  describe('the "startReading" property', () => {
    describe('when there is no submission', () => {
      beforeEach(() => {
        returnLog.receivedDate = null
        returnLog.status = 'due'
        delete returnLog.returnSubmissions
        returnLog.versions = []
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.startReading).to.be.null()
      })
    })

    describe('when there is a submission', () => {
      describe('but abstraction volumes were recorded', () => {
        it('returns null', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.startReading).to.be.null()
        })
      })

      describe('and and readings were recorded', () => {
        let meteredSubmission

        beforeEach(() => {
          meteredSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'measured')

          returnLog.returnSubmissions = [meteredSubmission]
        })

        it('returns the start reading', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.startReading).to.equal(meteredSubmission.metadata.meters[0].startReading)
        })
      })
    })
  })

  describe('the "summaryTableData" property', () => {
    describe('when there is no submission', () => {
      beforeEach(() => {
        returnLog.receivedDate = null
        returnLog.status = 'due'
        delete returnLog.returnSubmissions
        returnLog.versions = []
      })

      it('returns null', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.summaryTableData).to.be.null()
      })
    })

    describe('when there is a submission', () => {
      it('returns generated headers and rows', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        // NOTE: The testing is this simple because we have the 'correctly presents the data' test at the very top plus
        // the generating the headers and the rows is handled by base-return-logs.presenter.js, where they have been
        // extensively tested
        expect(result.summaryTableData.headers).to.exist()
        expect(result.summaryTableData.rows).to.exist()
      })
    })
  })

  describe('the "tableTitle" property', () => {
    describe('when the return log has a frequency of "day"', () => {
      beforeEach(() => {
        returnLog.returnsFrequency = 'day'
      })

      describe('and was submitted using abstraction volumes', () => {
        it('returns "Summary of daily abstraction volumes"', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.tableTitle).to.equal('Summary of daily abstraction volumes')
        })
      })

      describe('and was submitted using meter readings', () => {
        beforeEach(() => {
          returnLog.returnSubmissions[0].metadata.method = 'oneMeter'
        })

        it('returns "Summary of daily meter readings"', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.tableTitle).to.equal('Summary of daily meter readings')
        })
      })

      describe('when there is no submission data', () => {
        beforeEach(() => {
          returnLog.receivedDate = null
          returnLog.status = 'due'
          delete returnLog.returnSubmissions
          returnLog.versions = []
        })

        it('returns null', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.summaryTableData).to.be.null()
        })
      })
    })

    describe('when the return log has a frequency of "week"', () => {
      beforeEach(() => {
        returnLog.returnsFrequency = 'week'
      })

      describe('and was submitted using abstraction volumes', () => {
        it('returns "Summary of weekly abstraction volumes"', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.tableTitle).to.equal('Summary of weekly abstraction volumes')
        })
      })

      describe('and was submitted using meter readings', () => {
        beforeEach(() => {
          returnLog.returnSubmissions[0].metadata.method = 'oneMeter'
        })

        it('returns "Summary of weekly meter readings"', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.tableTitle).to.equal('Summary of weekly meter readings')
        })
      })

      describe('when there is no submission data', () => {
        beforeEach(() => {
          returnLog.receivedDate = null
          returnLog.status = 'due'
          delete returnLog.returnSubmissions
          returnLog.versions = []
        })

        it('returns null', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.summaryTableData).to.be.null()
        })
      })
    })

    describe('when the return log has a frequency of "month"', () => {
      beforeEach(() => {
        returnLog.returnsFrequency = 'month'
      })

      describe('and was submitted using abstraction volumes', () => {
        it('returns "Summary of monthly abstraction volumes"', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.tableTitle).to.equal('Summary of monthly abstraction volumes')
        })
      })

      describe('and was submitted using meter readings', () => {
        beforeEach(() => {
          returnLog.returnSubmissions[0].metadata.method = 'oneMeter'
        })

        it('returns "Summary of monthly meter readings"', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.tableTitle).to.equal('Summary of monthly meter readings')
        })
      })

      describe('when there is no submission data', () => {
        beforeEach(() => {
          // NOTE: We go with a nil return here just to spice things up!
          returnLog.returnSubmissions[0].nilReturn = true
          returnLog.returnSubmissions[0].returnSubmissionLines = []

          returnLog.versions[0].nilReturn = true
        })

        it('returns null', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.tableTitle).to.be.null()
        })
      })
    })
  })

  describe('the "tariff" property', () => {
    describe('when the return log is flagged for "two-part tariff"', () => {
      beforeEach(() => {
        returnLog.twoPartTariff = true
      })

      it('returns "Two-part"', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.tariff).to.equal('Two-part')
      })
    })

    describe('when the return log is not flagged for "two-part tariff"', () => {
      it('returns "Standard', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.tariff).to.equal('Standard')
      })
    })
  })

  describe('the "total" property', () => {
    describe('when there is no submission', () => {
      beforeEach(() => {
        returnLog.receivedDate = null
        returnLog.status = 'due'
        delete returnLog.returnSubmissions
        returnLog.versions = []
      })

      it('returns 0 as a string', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.total).to.equal('0')
      })
    })

    describe('when there is a submission', () => {
      describe('but it is a nil return', () => {
        beforeEach(() => {
          returnLog.returnSubmissions[0].nilReturn = true
          returnLog.returnSubmissions[0].returnSubmissionLines = []

          returnLog.versions[0].nilReturn = true
        })

        it('returns 0 as a string', () => {
          const result = ViewReturnLogPresenter.go(returnLog, auth)

          expect(result.total).to.equal('0')
        })
      })

      describe('which is not a nil return', () => {
        describe('but all the lines have a null "quantity"', () => {
          beforeEach(() => {
            for (const line of returnLog.returnSubmissions[0].returnSubmissionLines) {
              line.quantity = null
            }
          })

          it('returns 0 as a string', () => {
            const result = ViewReturnLogPresenter.go(returnLog, auth)

            expect(result.total).to.equal('0')
          })
        })

        describe('and one or more lines have a non-null "quantity"', () => {
          let total

          beforeEach(() => {
            // Add a null in just to demonstrate it can handle it
            returnLog.returnSubmissions[0].returnSubmissionLines[0].quantity = 0

            total = returnLog.returnSubmissions[0].returnSubmissionLines.reduce((acc, line) => {
              return line.quantity ? acc + line.quantity : acc
            }, 0)
          })

          it('returns the formatted total quantity', () => {
            const result = ViewReturnLogPresenter.go(returnLog, auth)

            expect(result.total).to.equal(formatNumber(total))
          })
        })
      })
    })
  })

  describe('the "underQuery" property', () => {
    describe('when the return log is under query', () => {
      beforeEach(() => {
        returnLog.underQuery = true
      })

      it('returns true', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.underQuery).to.equal(true)
      })
    })

    describe('when the return log is not under query', () => {
      it('returns false', () => {
        const result = ViewReturnLogPresenter.go(returnLog, auth)

        expect(result.underQuery).to.equal(false)
      })
    })
  })

  describe('the "versions" property', () => {
    beforeEach(() => {
      // NOTE: We create an extra version just to demonstrate something more than the 'correctly presents the data' at
      // the top
      const latestSubmission = ReturnLogsFixture.returnSubmission(returnLog, 'estimated')
      latestSubmission.notes = 'This was a good one'

      returnLog.versions.unshift(latestSubmission)

      // Note we don't update returnLog.returnSubmissions. This is the equivalent of saying an earlier version was
      // selected which we'll see in the output.
    })

    it('returns the return submissions formatted as "versions"', () => {
      const result = ViewReturnLogPresenter.go(returnLog, auth)

      expect(result.versions).to.equal(
        [
          {
            link: `/system/return-logs?id=${returnLog.id}&version=${returnLog.versions[0].version}`,
            notes: 'This was a good one',
            selected: false,
            version: returnLog.versions[0].version,
            user: returnLog.versions[0].userId
          },
          {
            link: `/system/return-logs?id=${returnLog.id}&version=${returnLog.versions[1].version}`,
            notes: null,
            selected: true,
            version: returnLog.versions[1].version,
            user: returnLog.versions[1].userId
          }
        ],
        { skip: ['createdAt'] }
      )
    })
  })
})
