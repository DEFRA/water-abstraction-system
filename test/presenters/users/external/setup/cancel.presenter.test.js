'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Thing under test
const CancelPresenter = require('../../../../../app/presenters/users/external/setup/cancel.presenter.js')

describe('Users - External - Setup - Cancel Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      activeNavBar: 'users',
      allLicences: true,
      id: generateUUID(),
      licences: [
        {
          id: generateUUID(),
          licenceRef: generateLicenceRef(),
          licenceVersions: [
            {
              id: generateUUID(),
              issueDate: null,
              licenceId: generateUUID(),
              startDate: new Date('2022-04-01'),
              status: 'current',
              company: {
                id: generateUUID(),
                name: 'ACME Farms Ltd',
                type: 'organisation'
              }
            }
          ]
        }
      ],
      selectedLicences: [],
      user: {
        id: generateUUID(),
        licenceEntityId: generateUUID(),
        username: 'jon.lee@example.co.uk'
      }
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelPresenter.go(session)

      expect(result).to.equal({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/external/setup/${session.id}/check`,
          text: 'Back'
        },
        licences: ['All licences'],
        pageTitle: 'You are about to cancel unregistering these licences',
        pageTitleCaption: session.user.username
      })
    })
  })
})
