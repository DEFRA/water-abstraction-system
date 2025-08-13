'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const AddAdditionalRecipientService = require('../../app/services/notices/setup/add-additional-recipient.service.js')
const InternationalAddressService = require('../../app/services/address/international.service.js')
const ManualAddressService = require('../../app/services/address/manual.service.js')
const PostcodeService = require('../../app/services/address/postcode.service.js')
const SelectAddressService = require('../../app/services/address/select.service.js')
const SubmitInternationalAddressService = require('../../app/services/address/submit-international.service.js')
const SubmitManualAddressService = require('../../app/services/address/submit-manual.service.js')
const SubmitPostcodeService = require('../../app/services/address/submit-postcode.service.js')
const SubmitSelectAddressService = require('../../app/services/address/submit-select.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Address controller', () => {
  let options
  let postOptions
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/address/{id}/postcode', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        const pageData = _postcodePageData()
        Sinon.stub(PostcodeService, 'go').returns(pageData)
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitPostcodeService, 'go').returns({})
        })

        it('redirects to the select address page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/select`)
        })
      })

      describe('when the request fails', () => {
        beforeEach(() => {
          const pageData = _postcodePageData(true)

          Sinon.stub(SubmitPostcodeService, 'go').returns(pageData)
        })

        it('re-renders the postcode page with an error', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(200)

          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('Enter a UK postcode')
        })
      })
    })
  })

  describe('/address/{id}/select', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/select',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when addresses are found', () => {
        beforeEach(() => {
          Sinon.stub(SelectAddressService, 'go').returns({})
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })

      describe('when addresses are not found', () => {
        beforeEach(() => {
          Sinon.stub(SelectAddressService, 'go').returns({
            redirect: true
          })
        })

        it('redirects to the manual page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual`)
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/select', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitSelectAddressService, 'go').returns({
            redirect: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/check',
            succeeded: true
          })
          Sinon.stub(AddAdditionalRecipientService, 'go')
        })

        it('redirects to the check page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/check`)
        })
      })

      describe('when the request fails because an address was not selected', () => {
        describe('and we get resutls back from the postcode lookup', () => {
          beforeEach(() => {
            const pageData = _selectPageData(true)

            Sinon.stub(SubmitSelectAddressService, 'go').returns(pageData)
            Sinon.stub(AddAdditionalRecipientService, 'go')
          })

          it('re-renders the select page with an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(200)

            expect(response.payload).to.contain('There is a problem')
            expect(response.payload).to.contain('Select an address')
          })
        })

        describe('and we do not get any resutls back from the postcode lookup', () => {
          beforeEach(() => {
            Sinon.stub(SubmitSelectAddressService, 'go').returns({
              redirect: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual',
              succeeded: false
            })
          })

          it('redirects to the manual page successfully', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual')
          })
        })
      })
    })
  })

  describe('/address/{id}/manual', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when addresses are found', () => {
        beforeEach(() => {
          Sinon.stub(ManualAddressService, 'go').returns({})
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitManualAddressService, 'go').returns({})
        })

        it('redirects to the check page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/check`)
        })
      })

      describe('when the request fails due to a validation error', () => {
        beforeEach(() => {
          const pageData = _manualPageData(true)

          Sinon.stub(SubmitManualAddressService, 'go').returns(pageData)
        })

        it('re-renders the page with an error', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(200)

          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('Enter address line 1')
        })
      })
    })
  })

  describe('/address/{id}/international', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/international',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when addresses are found', () => {
        beforeEach(() => {
          Sinon.stub(InternationalAddressService, 'go').returns({})
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/international', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitInternationalAddressService, 'go').returns({})
        })

        it('redirects to the check page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/check`)
        })
      })

      describe('when the request fails due to a validation error', () => {
        beforeEach(() => {
          const pageData = _manualPageData(true)

          Sinon.stub(SubmitInternationalAddressService, 'go').returns(pageData)
        })

        it('re-renders the page with an error', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(200)

          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('Enter address line 1')
        })
      })
    })
  })
})

function _commonPageData() {
  return {
    activeNavBar: 'search',
    sessionId: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061'
  }
}

function _manualPageData(error = false) {
  const pageData = _commonPageData()

  if (error) {
    pageData.error = {
      errorList: [
        {
          href: '#addressLine1',
          text: 'Enter address line 1'
        }
      ]
    }
  }

  return pageData
}

function _postcodePageData(error = false) {
  const pageData = _commonPageData()

  if (error) {
    pageData.error = { text: 'Enter a UK postcode' }
  }

  return pageData
}

function _selectPageData(error = false) {
  const pageData = _commonPageData()

  if (error) {
    pageData.error = { text: 'Select an address' }
  }

  return pageData
}
