'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PurposePresenter = require('../../../../app/presenters/return-requirements/setup/purpose.presenter.js')

describe('Return Requirements Setup - Purpose presenter', () => {
  const requirementIndex = 0

  let licencePurposes
  let session

  beforeEach(() => {
    licencePurposes = [
      { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' },
      { id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' },
      { id: '1d03c79b-da97-4838-a68c-ccb613d54367', description: 'Hydraulic Rams' },
      { id: '02036782-81d2-43be-b6af-bf20898653e1', description: 'Hydraulic Testing' }
    ]

    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = PurposePresenter.go(session, requirementIndex, licencePurposes)

      expect(result).to.equal({
        backLink: '/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/method',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        purposes: [
          { alias: '', checked: false, description: 'Heat Pump', id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f' },
          { alias: '', checked: false, description: 'Horticultural Watering', id: '49088608-ee9f-491a-8070-6831240945ac' },
          { alias: '', checked: false, description: 'Hydraulic Rams', id: '1d03c79b-da97-4838-a68c-ccb613d54367' },
          { alias: '', checked: false, description: 'Hydraulic Testing', id: '02036782-81d2-43be-b6af-bf20898653e1' }
        ],
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      describe('because they wish to change the purpose', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('returns a link back to the "check" page', () => {
          const result = PurposePresenter.go(session, requirementIndex, licencePurposes)

          expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/check')
        })
      })

      describe('because they are adding a new return requirement', () => {
        beforeEach(() => {
          // The logic to determine we came from the /check to add a new requirement looks at the number of
          // requirements. Hence we just need to add a second to exercise that branch of the logic
          session.requirements.push({})
          session.checkPageVisited = false
        })

        it('returns a link back to the "check" page', () => {
          const result = PurposePresenter.go(session, requirementIndex, licencePurposes)

          expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/check')
        })
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "method" page', () => {
        const result = PurposePresenter.go(session, requirementIndex, licencePurposes)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/method')
      })
    })
  })

  describe('the "purposes" property', () => {
    describe('when the user has previously submitted purposes', () => {
      beforeEach(() => {
        session.requirements[0].purposes = [
          { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump', alias: '' },
          { id: '1d03c79b-da97-4838-a68c-ccb613d54367', description: 'Hydraulic Rams', alias: 'Steampunk sheep' }
        ]
      })

      it('returns all the licence purposes with those previously submitted checked and optional aliases populate', () => {
        const result = PurposePresenter.go(session, requirementIndex, licencePurposes)

        expect(result.purposes).to.equal([
          {
            alias: '',
            checked: true,
            description: 'Heat Pump',
            id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f'
          },
          {
            alias: '',
            checked: false,
            description: 'Horticultural Watering',
            id: '49088608-ee9f-491a-8070-6831240945ac'
          },
          {
            alias: 'Steampunk sheep',
            checked: true,
            description: 'Hydraulic Rams',
            id: '1d03c79b-da97-4838-a68c-ccb613d54367'
          },
          {
            alias: '',
            checked: false,
            description: 'Hydraulic Testing',
            id: '02036782-81d2-43be-b6af-bf20898653e1'
          }
        ])
      })
    })

    describe('when the user has not previously submitted a purpose', () => {
      it('returns all the licence purposes with nothing checked and no aliases populated', () => {
        const result = PurposePresenter.go(session, requirementIndex, licencePurposes)

        expect(result.purposes).to.equal([
          {
            alias: '',
            checked: false,
            description: 'Heat Pump',
            id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f'
          },
          {
            alias: '',
            checked: false,
            description: 'Horticultural Watering',
            id: '49088608-ee9f-491a-8070-6831240945ac'
          },
          {
            alias: '',
            checked: false,
            description: 'Hydraulic Rams',
            id: '1d03c79b-da97-4838-a68c-ccb613d54367'
          },
          {
            alias: '',
            checked: false,
            description: 'Hydraulic Testing',
            id: '02036782-81d2-43be-b6af-bf20898653e1'
          }
        ])
      })
    })
  })
})
