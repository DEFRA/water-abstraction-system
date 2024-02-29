'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SiteDescriptionPresenter = require('../../../app/presenters/return-requirements/site-description.presenter.js')

describe('Site Description presenter', () => {
  let session

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
  })

  describe('when provided with a populated session', () => {
    describe('and no payload', () => {
      it('correctly presents the data', () => {
        const result = SiteDescriptionPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licenceSiteDescription: null
        })
      })
    })

    describe('and a populated payload', () => {
      let payload

      beforeEach(() => {
        payload = {
          siteDescription: 'This is a valid return requirement description'
        }
      })

      it('correctly presents the data', () => {
        const result = SiteDescriptionPresenter.go(session, payload)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licenceSiteDescription: 'This is a valid return requirement description'
        })
      })
    })
  })
})
