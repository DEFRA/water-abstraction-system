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
const CheckPresenter = require('../../../../../app/presenters/users/external/setup/check.presenter.js')

describe('Users - External - Setup - Check Presenter', () => {
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
        },
        {
          id: generateUUID(),
          licenceRef: generateLicenceRef(),
          licenceVersions: [
            {
              id: generateUUID(),
              issueDate: null,
              licenceId: generateUUID(),
              startDate: new Date('2023-04-01'),
              status: 'current',
              company: {
                id: generateUUID(),
                name: 'ACME Industry Ltd',
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
      const result = CheckPresenter.go(session)

      expect(result).to.equal({
        activeNavBar: 'users',
        licences: ['All licences'],
        links: {
          cancel: `/system/users/external/setup/${session.id}/cancel`,
          licences: `/system/users/external/setup/${session.id}/licences`
        },
        pageTitle: 'Check licences to unregister',
        pageTitleCaption: session.user.username,
        warning: {
          iconFallbackText: 'Warning',
          text: 'All these licences will no longer be accessible to existing users.'
        }
      })
    })
  })

  describe('the "warning" property', () => {
    describe('when "all licences" was selected', () => {
      it('returns a message specific for "All licences"', () => {
        const result = CheckPresenter.go(session)

        expect(result.warning).to.equal({
          iconFallbackText: 'Warning',
          text: 'All these licences will no longer be accessible to existing users.'
        })
      })
    })

    describe('when a single licence was selected', () => {
      beforeEach(() => {
        session.allLicences = false
        session.selectedLicences = [session.licences[0].id]
      })

      it('returns a message specific for one licence', () => {
        const result = CheckPresenter.go(session)

        expect(result.warning).to.equal({
          iconFallbackText: 'Warning',
          text: 'This licence will no longer be accessible to existing users.'
        })
      })
    })

    describe('when licences were selected', () => {
      beforeEach(() => {
        session.allLicences = false
        session.selectedLicences = [session.licences[0].id, session.licences[1].id]
      })

      it('returns a message specific for one licence', () => {
        const result = CheckPresenter.go(session)

        expect(result.warning).to.equal({
          iconFallbackText: 'Warning',
          text: 'These licences will no longer be accessible to existing users.'
        })
      })
    })
  })
})
