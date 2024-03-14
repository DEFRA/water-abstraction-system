'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SelectPurposePresenter = require('../../../app/presenters/return-requirements/purpose.presenter.js')

describe('Select Purpose presenter', () => {
  let session
  let purposesData

  beforeEach(() => {
    session = {
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

    purposesData = [
      'Heat Pump',
      'Horticultural Watering',
      'Hydraulic Rams',
      'Hydraulic Testing'
    ]
  })

  describe('when provided with a populated session', () => {
    describe('and no payload', () => {
      it('correctly presents the data', () => {
        const result = SelectPurposePresenter.go(session, purposesData)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licencePurposes: [
            'Heat Pump',
            'Horticultural Watering',
            'Hydraulic Rams',
            'Hydraulic Testing'
          ],
          licenceRef: '01/ABC'
        })
      })
    })

    describe('and with a payload', () => {
      const payload = {
        purposes: [
          'Heat Pump',
          'Horticultural Watering'
        ]
      }

      it('correctly presents the data', () => {
        const result = SelectPurposePresenter.go(session, purposesData, payload)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licencePurposes: [
            'Heat Pump',
            'Horticultural Watering'
          ],
          licenceRef: '01/ABC'
        })
      })
    })
  })
})
