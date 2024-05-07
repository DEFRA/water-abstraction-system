'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AgreementsExceptionsPresenter = require('../../../app/presenters/return-requirements/agreements-exceptions.presenter.js')

describe('Agreements Exceptions presenter', () => {
  describe('when provided with a populated session', () => {
    let session

    describe('and no agreements and exceptions in session data', () => {
      beforeEach(() => {
        session = {
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2022-04-01T00:00:00.000Z'
          }
        }
      })

      it('correctly presents the data', () => {
        const result = AgreementsExceptionsPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          agreementsExceptions: ''
        })
      })
    })

    describe('and with agreements and exceptions in session data', () => {
      beforeEach(() => {
        session = {
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2022-04-01T00:00:00.000Z'
          },
          agreementsExceptions: 'gravity-fill'
        }
      })

      it('correctly presents the data', () => {
        const result = AgreementsExceptionsPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          agreementsExceptions: 'gravity-fill'
        })
      })
    })
  })
})
