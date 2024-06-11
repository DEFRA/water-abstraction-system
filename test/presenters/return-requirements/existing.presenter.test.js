'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ExistingPresenter = require('../../../app/presenters/return-requirements/existing.presenter.js')

describe('Return Requirements - Existing presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        returnVersions: [{
          id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
          startDate: '2023-01-01T00:00:00.000Z',
          reason: null
        }],
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ExistingPresenter.go(session)

      expect(result).to.equal({
        existingOptions: [{ value: '60b5d10d-1372-4fb2-b222-bfac81da69ab', text: '1 January 2023' }],
        licenceRef: '01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "existingOptions" property', () => {
    describe('when the return versions do not contain a "reason"', () => {
      it('returns the version ID as the option value and just the start date as the option text', () => {
        const result = ExistingPresenter.go(session)

        expect(result.existingOptions).to.equal([
          { value: '60b5d10d-1372-4fb2-b222-bfac81da69ab', text: '1 January 2023' }
        ])
      })
    })

    describe('when the return versions contain a "reason"', () => {
      beforeEach(() => {
        session.licence.returnVersions.unshift({
          id: '22ecef19-3a13-44a0-a55e-8f4d34dd59a5', reason: 'major-change', startDate: '2024-05-07T00:00:00.000Z'
        })
      })

      it('returns the version ID as the option value and the start date and reason as the option text', () => {
        const result = ExistingPresenter.go(session)

        expect(result.existingOptions).to.equal([
          { value: '22ecef19-3a13-44a0-a55e-8f4d34dd59a5', text: '7 May 2024 - Major change' },
          { value: '60b5d10d-1372-4fb2-b222-bfac81da69ab', text: '1 January 2023' }
        ])
      })
    })
  })
})
