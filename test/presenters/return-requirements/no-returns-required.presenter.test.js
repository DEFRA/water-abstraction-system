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
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        licenceRef: '01/123'
      })
    })
  })
})
