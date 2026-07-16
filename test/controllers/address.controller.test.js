// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'
import { postRequestOptions } from '../support/general.js'

// Things we need to stub
import * as InternationalAddressService from '../../app/services/address/international.service.js'
import * as ManualAddressService from '../../app/services/address/manual.service.js'
import * as PostcodeService from '../../app/services/address/postcode.service.js'
import * as SelectAddressService from '../../app/services/address/select.service.js'
import * as SubmitInternationalAddressService from '../../app/services/address/submit-international.service.js'
import * as SubmitManualAddressService from '../../app/services/address/submit-manual.service.js'
import * as SubmitPostcodeService from '../../app/services/address/submit-postcode.service.js'
import * as SubmitSelectAddressService from '../../app/services/address/submit-select.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Address controller', () => {
  let options
  let postOptions
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
  })

  describe('/address/{id}/postcode', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        const pageData = _postcodePageData()
        vi.spyOn(PostcodeService, 'default').mockReturnValue(pageData)
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(SubmitPostcodeService, 'default').mockReturnValue({})
        })

        it('redirects to the select address page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/select`)
        })
      })

      describe('when the request fails', () => {
        beforeEach(() => {
          const pageData = _postcodePageData(true)

          vi.spyOn(SubmitPostcodeService, 'default').mockReturnValue(pageData)
        })

        it('re-renders the postcode page with an error', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)

          expect(response.payload).toContain('There is a problem')
          expect(response.payload).toContain('Enter a UK postcode')
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
            credentials: { scope: [] }
          }
        }
      })

      describe('when addresses are found', () => {
        beforeEach(() => {
          vi.spyOn(SelectAddressService, 'default').mockReturnValue({})
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        })
      })

      describe('when addresses are not found', () => {
        beforeEach(() => {
          vi.spyOn(SelectAddressService, 'default').mockReturnValue({
            redirect: true
          })
        })

        it('redirects to the manual page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(`/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual`)
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/select', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(SubmitSelectAddressService, 'default').mockReturnValue({
            redirect: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient'
          })
        })

        it('redirects to the configured route', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(
            `/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient`
          )
        })
      })

      describe('when the request fails because an address was not selected', () => {
        describe('and we get resutls back from the postcode lookup', () => {
          beforeEach(() => {
            const pageData = _selectPageData(true)

            vi.spyOn(SubmitSelectAddressService, 'default').mockReturnValue(pageData)
          })

          it('re-renders the select page with an error', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_OK)

            expect(response.payload).toContain('There is a problem')
            expect(response.payload).toContain('Select an address')
          })
        })

        describe('and we do not get any resutls back from the postcode lookup', () => {
          beforeEach(() => {
            vi.spyOn(SubmitSelectAddressService, 'default').mockReturnValue({
              redirect: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual'
            })
          })

          it('redirects to the manual page successfully', async () => {
            const response = await server.inject(postOptions)

            expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
            expect(response.headers.location).toEqual('/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual')
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
            credentials: { scope: [] }
          }
        }
      })

      describe('when addresses are found', () => {
        beforeEach(() => {
          vi.spyOn(ManualAddressService, 'default').mockReturnValue({})
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/manual', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(SubmitManualAddressService, 'default').mockReturnValue({
            redirect: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient'
          })
        })

        it('redirects to the configured route', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(
            `/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient`
          )
        })
      })

      describe('when the request fails due to a validation error', () => {
        beforeEach(() => {
          const pageData = _manualPageData(true)

          vi.spyOn(SubmitManualAddressService, 'default').mockReturnValue(pageData)
        })

        it('re-renders the page with an error', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)

          expect(response.payload).toContain('There is a problem')
          expect(response.payload).toContain('Enter address line 1')
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
            credentials: { scope: [] }
          }
        }
      })

      describe('when addresses are found', () => {
        beforeEach(() => {
          vi.spyOn(InternationalAddressService, 'default').mockReturnValue({})
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/international', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          vi.spyOn(SubmitInternationalAddressService, 'default').mockReturnValue({
            redirect: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient'
          })
        })

        it('redirects to the redirectUrl page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_FOUND)
          expect(response.headers.location).toEqual(
            `/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient`
          )
        })
      })

      describe('when the request fails due to a validation error', () => {
        beforeEach(() => {
          const pageData = _manualPageData(true)

          vi.spyOn(SubmitInternationalAddressService, 'default').mockReturnValue(pageData)
        })

        it('re-renders the page with an error', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)

          expect(response.payload).toContain('There is a problem')
          expect(response.payload).toContain('Enter address line 1')
        })
      })
    })
  })
})

function _commonPageData() {
  return {
    sessionId: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061'
  }
}

function _manualPageData(error = false) {
  const pageData = _commonPageData()

  if (error) {
    pageData.error = {
      addressLine1: 'Enter address line 1',
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
    pageData.error = {
      errorList: [
        {
          href: '#postcode',
          text: 'Enter a UK postcode'
        }
      ],
      postcode: 'Enter a UK postcode'
    }
  }

  return pageData
}

function _selectPageData(error = false) {
  const pageData = _commonPageData()

  if (error) {
    pageData.error = {
      addresses: 'Select an address',
      errorList: [
        {
          href: '#addresses',
          text: 'Select an address'
        }
      ]
    }
  }

  return pageData
}
