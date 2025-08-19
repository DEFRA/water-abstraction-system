'use strict'

/**
 * Checks status and gathers info for each of the services which make up WRLS
 * @module InfoService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const ChildProcess = require('child_process')
const util = require('util')
const exec = util.promisify(ChildProcess.exec)

const BaseRequest = require('../../requests/base.request.js')
const ChargingModuleRequest = require('../../requests/charging-module.request.js')
const CreateRedisClientService = require('./create-redis-client.service.js')
const FetchSystemInfoService = require('./fetch-system-info.service.js')
const LegacyRequest = require('../../requests/legacy.request.js')
const { sentenceCase } = require('../../presenters/base.presenter.js')

const gotenbergConfig = require('../../../config/gotenberg.config.js')
const servicesConfig = require('../../../config/services.config.js')

/**
 * Checks status and gathers info for each of the services which make up WRLS
 *
 * Returns data required to populate our `/service-status` page, eg. task activity status, virus checker status, service
 * version numbers, etc.
 *
 * Each data set is returned in the format needed to populate the gov.uk table elements ie. an array containing one
 * array per row, where each row array contains multiple `{ text: '...' }` elements, one for each cell in the row.
 *
 * @returns {object} data about each service formatted for the view
 */
async function go() {
  const addressFacadeData = await _getAddressFacadeData()
  const chargingModuleData = await _getChargingModuleData()
  const gotenbergData = await _getGotenbergData()
  const legacyAppData = await _getLegacyAppData()
  const redisConnectivityData = await _getRedisConnectivityData()
  const virusScannerData = await _getVirusScannerData()

  const appData = await _addSystemInfoToLegacyAppData(legacyAppData)

  return {
    pageTitle: 'Info',
    addressFacadeData,
    appData,
    chargingModuleData,
    gotenbergData,
    redisConnectivityData,
    virusScannerData
  }
}

async function _addSystemInfoToLegacyAppData(appData) {
  const systemInfo = await FetchSystemInfoService.go()

  return [...appData, systemInfo]
}

async function _getAddressFacadeData() {
  const statusUrl = new URL('/address-service/hola', servicesConfig.addressFacade.url)
  const result = await BaseRequest.get(statusUrl.href)

  if (result.succeeded) {
    return result.response.body
  }

  return _parseFailedRequestResult(result)
}

async function _getGotenbergData() {
  const statusUrl = new URL('/health', gotenbergConfig.url)
  const result = await BaseRequest.get(statusUrl.href)

  if (result.succeeded) {
    const response = JSON.parse(result.response.body)
    return `${sentenceCase(response.status)} - Chromium ${sentenceCase(response.details.chromium.status)}`
  }

  return _parseFailedRequestResult(result)
}

async function _getLegacyAppData() {
  const healthInfoPath = 'health/info'

  const services = [
    { name: 'Import', serviceName: 'import' },
    { name: 'External UI', serviceName: 'external' },
    { name: 'Internal UI', serviceName: 'internal' },
    { name: 'Service - foreground', serviceName: 'water' },
    { name: 'Service - background', serviceName: 'background' },
    { name: 'Returns', serviceName: 'returns' },
    { name: 'Tactical CRM', serviceName: 'crm' },
    { name: 'Tactical IDM', serviceName: 'idm' },
    { name: 'Permit repository', serviceName: 'permits' }
  ]

  for (const service of services) {
    const result = await LegacyRequest.get(service.serviceName, healthInfoPath, null, false)

    if (result.succeeded) {
      service.version = result.response.body.version
      service.commit = result.response.body.commit
    } else {
      service.version = _parseFailedRequestResult(result)
      service.commit = ''
    }
  }

  return services
}

async function _getChargingModuleData() {
  const result = await ChargingModuleRequest.get('status')

  if (result.succeeded) {
    return result.response.info.dockerTag
  }

  return _parseFailedRequestResult(result)
}

async function _getRedisConnectivityData() {
  let redis

  try {
    redis = await CreateRedisClientService.go()

    await redis.ping()

    return 'Up and running'
  } catch (error) {
    return `ERROR: ${error.message}`
  } finally {
    if (redis) {
      await redis.disconnect()
    }
  }
}

async function _getVirusScannerData() {
  try {
    const { stdout, stderr } = await exec('clamdscan --version')

    return stderr ? `ERROR: ${stderr}` : stdout
  } catch (error) {
    return `ERROR: ${error.message}`
  }
}

function _parseFailedRequestResult(result) {
  if (result.response.statusCode) {
    return `ERROR: ${result.response.statusCode} - ${result.response.body}`
  }

  return `ERROR: ${result.response.name} - ${result.response.message}`
}

module.exports = {
  go
}
