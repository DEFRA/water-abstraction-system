'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const ViewPresenter = require('../../../app/presenters/licence-versions/view.presenter.js')

describe('Licence Versions - View presenter', () => {
  let auth
  let licence
  let licenceVersion

  beforeEach(() => {
    auth = {
      credentials: {
        scope: []
      }
    }

    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceVersion = LicenceVersionModel.fromJson({
      administrative: null,
      createdAt: new Date('2022-01-01'),
      id: generateUUID(),
      licence,
      modLogs: [
        {
          id: generateUUID(),
          reasonDescription: 'Licence Holder Name/Address Change',
          userId: 'JOBSWORTH01',
          note: 'Whole licence trade'
        }
      ],
      startDate: new Date('2022-01-01')
    })
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewPresenter.go(licenceVersion, auth)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licence.id}/history`,
          text: 'Go back to history'
        },
        changeType: 'licence issued',
        notes: null,
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        reason: 'Licence Holder Name/Address Change'
      })
    })
  })

  describe('the "changeType" property', () => {
    describe('when the licence version is not administrative', () => {
      it('returns "licence issued"', () => {
        const result = ViewPresenter.go(licenceVersion, auth)

        expect(result.changeType).to.equal('licence issued')
      })
    })

    describe('when the licence version is administrative', () => {
      beforeEach(() => {
        licenceVersion.administrative = true
      })

      it('returns "no licence issued"', () => {
        const result = ViewPresenter.go(licenceVersion, auth)

        expect(result.changeType).to.equal('no licence issued')
      })
    })
  })

  describe('the "notes" property', () => {
    describe('when the user does not have the "billing" role', ()=> {
      it('returns null', () => {
        const result = ViewPresenter.go(licenceVersion, auth)

        expect(result.notes).to.be.null()
      })
    })

    describe('when the user is "billing and data"', () => {
      beforeEach(() => {
        auth.credentials.scope = ['billing']
      })

      describe('when there are notes', () => {
        it('returns the notes', () => {
          const result = ViewPresenter.go(licenceVersion, auth)

          expect(result.notes).to.equal(['Whole licence trade'])
        })
      })

      describe('when there are no notes', () => {
        beforeEach(() => {
          licenceVersion.modLogs[0].note = null
        })

        it('returns null', () => {
          const result = ViewPresenter.go(licenceVersion, auth)

          expect(result.notes).to.be.null()
        })
      })
    })
  })

  describe('the "reason" property', () => {
    describe('when there is a "reason"', () => {
      it('returns the created on', () => {
        const result = ViewPresenter.go(licenceVersion, auth)

        expect(result.reason).to.equal('Licence Holder Name/Address Change')
      })
    })

    describe('when there is no "reason"', () => {
      beforeEach(() => {
        licenceVersion.modLogs[0].reasonDescription = null
      })

      it('returns the created on', () => {
        const result = ViewPresenter.go(licenceVersion, auth)

        expect(result.reason).to.be.null()
      })
    })

    describe('when the user is "billing and data"', () => {
      beforeEach(() => {
        auth.credentials.scope = ['billing']
      })

      describe('when there is no "reason" or "userId"', () => {
        beforeEach(() => {
          licenceVersion.modLogs[0].reasonDescription = null
        })

        it('returns the created on', () => {
          const result = ViewPresenter.go(licenceVersion, auth)

          expect(result.reason).to.equal('Created on 1 January 2022')
        })
      })

      describe('when there is a reason', () => {
        describe('and we know who created it', () => {
          it('returns the reason with who created it', () => {
            const result = ViewPresenter.go(licenceVersion, auth)

            expect(result.reason).to.equal(
              'Licence Holder Name/Address Change created on 1 January 2022 by JOBSWORTH01'
            )
          })
        })

        describe('and we do not know who created it', () => {
          beforeEach(() => {
            licenceVersion.modLogs[0].userId = null
          })

          it('returns the reason without who created it', () => {
            const result = ViewPresenter.go(licenceVersion, auth)

            expect(result.reason).to.equal('Licence Holder Name/Address Change created on 1 January 2022')
          })
        })
      })
    })
  })
})
