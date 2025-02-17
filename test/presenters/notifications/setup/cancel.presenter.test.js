'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const CancelPresenter = require('../../../../app/presenters/notifications/setup/cancel.presenter.js')

describe.only('Notifications Setup - Cancel presenter', () => {
  const referenceCode = 'ADHC-1234'

  let clock
  let licenceRef
  let session

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    session = {
      journey: 'ad-hoc',
      licenceRef,
      referenceCode
    }

    clock = Sinon.useFakeTimers(new Date('2025-01-15'))
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly presents the data', () => {
    const result = CancelPresenter.go(session)

    expect(result).to.equal({
      pageTitle: 'You are about to cancel this notification',
      referenceCode: 'ADHC-1234',
      summaryList: {
        text: 'Licence number',
        value: licenceRef
      }
    })
  })

  describe('when the journey is "ad-hoc"', () => {
    it('correctly formats the summary list', () => {
      const result = CancelPresenter.go(session)

      expect(result.summaryList).to.equal({
        text: 'Licence number',
        value: licenceRef
      })
    })
  })

  describe('when the journey is "invitations"', () => {
    beforeEach(() => {
      session.journey = 'invitations'
      session.returnsPeriod = 'quarterOne'
    })

    it('correctly formats the summary list', () => {
      const result = CancelPresenter.go(session)

      expect(result.summaryList).to.equal({
        text: 'Returns period',
        value: 'Quarterly 1 April 2025 to 30 June 2025'
      })
    })
  })

  describe('when the journey is "reminders"', () => {
    beforeEach(() => {
      session.journey = 'reminders'
      session.returnsPeriod = 'quarterOne'
    })

    it('correctly formats the summary list', () => {
      const result = CancelPresenter.go(session)

      expect(result.summaryList).to.equal({
        text: 'Returns period',
        value: 'Quarterly 1 April 2025 to 30 June 2025'
      })
    })
  })
})
