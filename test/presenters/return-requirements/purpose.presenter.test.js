'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PurposePresenter = require('../../../app/presenters/return-requirements/purpose.presenter.js')

describe('Purpose presenter', () => {
  let purposesData

  beforeEach(() => {
    purposesData = [
      'Heat Pump',
      'Horticultural Watering',
      'Hydraulic Rams',
      'Hydraulic Testing'
    ]
  })

  describe('when provided with a populated session', () => {
    describe('and no purposes in session data', () => {
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
        const result = PurposePresenter.go(session, purposesData)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licencePurposes: [
            'Heat Pump',
            'Horticultural Watering',
            'Hydraulic Rams',
            'Hydraulic Testing'
          ],
          licenceRef: '01/ABC',
          selectedPurposes: ''
        })
      })
    })

    describe('and with purposes in session data', () => {
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
          purposes: ['Heat Pump', 'Horticultural Watering']
        }
      }

      it('correctly presents the data', () => {
        const result = PurposePresenter.go(session, purposesData)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licencePurposes: [
            'Heat Pump',
            'Horticultural Watering',
            'Hydraulic Rams',
            'Hydraulic Testing'
          ],
          licenceRef: '01/ABC',
          selectedPurposes: 'Heat Pump,Horticultural Watering'
        })
      })
    })
  })
})
