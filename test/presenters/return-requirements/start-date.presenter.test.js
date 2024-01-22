'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const StartDatePresenter = require('../../../app/presenters/return-requirements/start-date.presenter.js')

describe('Start Date Presenter', () => {
  let session, error

  beforeEach(() => {
    session = {
      id: 'some-session-id',
      data: {
        licence: {
          licenceRef: '01/ABC',
          startDate: '2023-01-01T00:00:00.000Z'
        }
      }
    }
    error = null
  })

  describe('when provided with a populated session and no error', () => {
    it('correctly presents the data without an error message', () => {
      const result = StartDatePresenter.go(session, error)

      expect(result).to.include({
        id: session.id,
        errorMessage: null,
        licenceRef: session.data.licence.licenceRef
      })
    })
  })

  describe('when provided with an error', () => {
    beforeEach(() => {
      error = new Error('Enter a real start date')
    })

    it('includes the error message in the presented data', () => {
      const result = StartDatePresenter.go(session, error)

      expect(result.errorMessage).to.exist()
      expect(result.errorMessage.text).to.equal(error.message)
    })
  })
})
