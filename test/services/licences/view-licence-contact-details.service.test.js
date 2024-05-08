'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewLicenceContactDetailsPresenter =
  require('../../../app/presenters/licences/view-licence-contact-details.presenter')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service')

// Thing under test
const ViewLicenceContactDetailsService = require('../../../app/services/licences/view-licence-contact-details.service')

describe('View Licence service contact details', () => {
  const auth = {}
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(ViewLicenceContactDetailsPresenter, 'go').returns(_contactDetails())
    Sinon.stub(ViewLicenceService, 'go').resolves(_licence())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a contact details', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence contact details page',
        async () => {
          const result = await ViewLicenceContactDetailsService.go(testId, auth)

          expect(result).to.equal({
            activeTab: 'contact-details',
            licenceName: 'fake licence'
          })
        })
    })
  })
})

function _licence () {
  return { licenceName: 'fake licence' }
}

function _contactDetails () {
  return {
    activeTab: 'contact-details'
  }
}
