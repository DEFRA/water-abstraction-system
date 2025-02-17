'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CancelPresenter = require('../../../../app/presenters/notifications/setup/cancel.presenter.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

describe('Notifications Setup - Cancel presenter', () => {
  const referenceCode = 'ADHC-1234'

  let licenceRef
  let session

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    session = {
      journey: 'ad-hoc',
      licenceRef,
      referenceCode
    }
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
    })

    it('correctly formats the summary list', () => {
      const result = CancelPresenter.go(session)

      expect(result.summaryList).to.equal({
        text: 'Returns period',
        value: 'wip'
      })
    })
  })

  describe('when the journey is "reminders"', () => {
    beforeEach(() => {
      session.journey = 'reminders'
    })

    it('correctly formats the summary list', () => {
      const result = CancelPresenter.go(session)

      expect(result.summaryList).to.equal({
        text: 'Returns period',
        value: 'wip'
      })
    })
  })
})
