'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { NotifyClient } = require('notifications-node-client')

// Things we need to stub
const NotifyConfig = require('../../../config/notify.config.js')
const RequestConfig = require('../../../config/request.config.js')

// Thing under test
const NotifyClientService = require('../../../app/services/notify/notify-client.service.js')

describe('Notify - Client service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when creating a notify client without a proxy', () => {
    beforeEach(() => {
      Sinon.stub(RequestConfig, 'httpProxy').value(undefined)
    })

    it('should create a notify client', () => {
      const result = NotifyClientService.go()

      expect(result).to.equal(new NotifyClient(NotifyConfig.apiKey))
    })
  })

  describe('when creating a notify client with a proxy', () => {
    beforeEach(() => {
      Sinon.stub(RequestConfig, 'httpProxy').value('https://test.proxy.defra.gov.uk')
    })

    it('should create a notify client with the provided proxy url', () => {
      const result = NotifyClientService.go()

      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.host).to.equal('test.proxy.defra.gov.uk')
      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.hostname).to.equal('test.proxy.defra.gov.uk')
      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.href).to.equal('https://test.proxy.defra.gov.uk/')
      expect(result.apiClient.restClient.defaults.httpsAgent.proxy.origin).to.equal('https://test.proxy.defra.gov.uk')
    })
  })
})
