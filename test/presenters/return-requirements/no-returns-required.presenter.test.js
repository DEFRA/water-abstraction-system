'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const NoReturnsRequiredPresenter = require('../../../app/presenters/return-requirements/no-returns-required.presenter.js')

describe('No Returns Required presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
      data: {
        licence: {
          id: 'ea53bfc6-740d-46c5-9558-fc8cabfc6c1f',
          licenceRef: '01/123',
          licenceHolder: 'Jane Doe'
        }
      }
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = NoReturnsRequiredPresenter.go(session)

      expect(result).to.equal({
        activeNavBar: 'search',
        errorMessage: null,
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        licenceRef: '01/123',
        radioItems: [
          {
            checked: false,
            text: 'Abstraction amount below 100 cubic metres per day',
            value: 'abstraction_below_100_cubic_metres_per_day'
          },
          {
            checked: false,
            text: 'Returns exception',
            value: 'returns_exception'
          },
          {
            checked: false,
            text: 'Transfer licence',
            value: 'transfer_licence'
          }
        ]
      })
    })
  })

  describe('when provided with an error', () => {
    const error = new Error('Test error message')

    it('includes the error message in the presented data', () => {
      const result = NoReturnsRequiredPresenter.go(session, error)

      expect(result.errorMessage).to.exist()
      expect(result.errorMessage.text).to.equal(error.message)
    })
  })
})
