'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const StartDatePresenter = require('../../../app/presenters/return-requirements/start-date.presenter.js')

describe('Start Date Presenter', () => {
  let session, error, payload

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
      error = {
        details: [
          {
            message: 'Enter a real start date',
            invalidFields: ['day', 'month', 'year']
          }
        ]
      }

      // Mock payload
      payload = {
        'start-date-day': '',
        'start-date-month': '',
        'start-date-year': ''
      }
    })

    it('includes the error message in the presented data', () => {
      const result = StartDatePresenter.go(session, error, payload)

      expect(result.errorMessage).to.exist()
      expect(result.errorMessage.text).to.equal(error.details[0].message)
    })
  })
})
