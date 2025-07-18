'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const CancelPresenter = require('../../../../app/presenters/notices/setup/cancel.presenter.js')

describe('Notices - Setup - Cancel presenter', () => {
  const referenceCode = 'RNIV-1234'

  let licenceRef
  let session

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    session = {
      licenceRef,
      referenceCode
    }
  })

  it('correctly presents the data', () => {
    const result = CancelPresenter.go(session)

    expect(result).to.equal({
      backLink: `/system/notices/setup/${session.id}/check`,
      pageTitle: 'You are about to cancel this notice',
      referenceCode: 'RNIV-1234',
      summaryList: {
        text: 'Licence number',
        value: licenceRef
      }
    })
  })

  describe('when a licence ref has been chosen', () => {
    it('correctly formats the summary list', () => {
      const result = CancelPresenter.go(session)

      expect(result.summaryList).to.equal({
        text: 'Licence number',
        value: licenceRef
      })
    })
  })

  describe('when the journey is "alerts"', () => {
    beforeEach(() => {
      session = {
        alertType: 'stop',
        journey: 'alerts',
        monitoringStationId: '123',
        referenceCode: 'WAA-1234'
      }
    })

    it('correctly formats the summary list', () => {
      const result = CancelPresenter.go(session)

      expect(result.summaryList).to.equal({
        text: 'Alert type',
        value: 'Stop'
      })
    })
  })

  describe('when the journey is "standard"', () => {
    describe('and the "noticeType" is "invitations"', () => {
      beforeEach(() => {
        session = {
          determinedReturnsPeriod: {
            name: 'quarterOne',
            dueDate: '2025-07-28',
            endDate: '2025-06-30',
            summer: 'false',
            startDate: '2025-04-01'
          },
          journey: 'invitations',
          referenceCode
        }
      })

      it('correctly formats the summary list', () => {
        const result = CancelPresenter.go(session)

        expect(result.summaryList).to.equal({
          text: 'Returns period',
          value: 'Quarterly 1 April 2025 to 30 June 2025'
        })
      })
    })

    describe('and the "noticeType" is "reminders"', () => {
      beforeEach(() => {
        session = {
          determinedReturnsPeriod: {
            name: 'quarterOne',
            dueDate: '2025-07-28',
            endDate: '2025-06-30',
            summer: 'false',
            startDate: '2025-04-01'
          },
          journey: 'reminders',
          referenceCode
        }
      })

      it('correctly formats the summary list', () => {
        const result = CancelPresenter.go(session)

        expect(result.summaryList).to.equal({
          text: 'Returns period',
          value: 'Quarterly 1 April 2025 to 30 June 2025'
        })
      })
    })

    describe('when the journey has a "returnsPeriod"', () => {
      describe('and the "returnsPeriod" is for a "quarter"', () => {
        beforeEach(() => {
          session = {
            determinedReturnsPeriod: {
              name: 'quarterOne',
              dueDate: '2025-07-28',
              endDate: '2025-06-30',
              summer: 'false',
              startDate: '2025-04-01'
            },
            journey: 'invitations',
            referenceCode
          }
        })

        it('correctly formats the summary list', () => {
          const result = CancelPresenter.go(session)

          expect(result.summaryList).to.equal({
            text: 'Returns period',
            value: 'Quarterly 1 April 2025 to 30 June 2025'
          })
        })
      })

      describe('and the "returnsPeriod" is "summer"', () => {
        beforeEach(() => {
          session = {
            determinedReturnsPeriod: {
              name: 'summer',
              dueDate: '2025-11-28',
              endDate: '2025-10-31',
              summer: true,
              startDate: '2024-11-01'
            },
            journey: 'invitations',
            referenceCode
          }
        })

        it('correctly formats the summary list', () => {
          const result = CancelPresenter.go(session)

          expect(result.summaryList).to.equal({
            text: 'Returns period',
            value: 'Summer annual 1 November 2024 to 31 October 2025'
          })
        })
      })

      describe('and the "returnsPeriod" is "allYear"', () => {
        beforeEach(() => {
          session = {
            determinedReturnsPeriod: {
              name: 'allYear',
              dueDate: '2025-04-28',
              endDate: '2025-03-31',
              summer: true,
              startDate: '2024-04-01'
            },
            journey: 'invitations',
            referenceCode
          }
        })

        it('correctly formats the summary list', () => {
          const result = CancelPresenter.go(session)

          expect(result.summaryList).to.equal({
            text: 'Returns period',
            value: 'Winter and all year annual 1 April 2024 to 31 March 2025'
          })
        })
      })
    })
  })
})
