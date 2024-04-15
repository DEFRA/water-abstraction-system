'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const FrequencyCollectedPresenter = require('../../../app/presenters/return-requirements/frequency-collected.presenter.js')

describe('Frequency Collected presenter', () => {
  describe('when provided with a populated session', () => {
    describe('and no returns cycle is session data', () => {
      const session = {
        id: '61e07498-f309-4829-96a9-72084a54996d',
        data: {
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2022-04-01T00:00:00.000Z'
          }
        }
      }

      it('correctly presents the data', () => {
        const result = FrequencyCollectedPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          frequencyCollected: null
        })
      })
    })

    describe('and with returns cycle in session data', () => {
      const session = {
        id: '61e07498-f309-4829-96a9-72084a54996d',
        data: {
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2022-04-01T00:00:00.000Z'
          },
          frequencyCollected: 'weekly'
        }
      }

      it('correctly presents the data', () => {
        const result = FrequencyCollectedPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          frequencyCollected: 'weekly'
        })
      })
    })
  })
})
