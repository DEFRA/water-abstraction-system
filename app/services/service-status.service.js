'use strict'

/**
 * Checks status, including versions, of the various services which make up WRLS
 * @module ServiceStatusService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const ChildProcess = require('child_process')
const util = require('util')
const exec = util.promisify(ChildProcess.exec)

const HttpRequestService = require('./http-request.service.js')

const servicesConfig = require('../../config/services.config.js')

/**
 * Returns data required to populate our `/service-status` page, eg. task activity status, virus checker status, service
 * version numbers, etc.
 *
 * Each data set is returned in the format needed to populate the gov.uk table elements ie. an array containing one
 * array per row, where each row array contains multiple `{ text: '...' }` elements, one for each cell in the row.
*/
async function go () {
  const virusScannerData = await _getVirusScannerData()
  const redisConnectivityData = await _getRedisConnectivityData()

  const addressFacadeData = await _getAddressFacadeData()
  // const chargingModuleData = await _getChargingModuleData()
  const appData = await _getAppData()

  return {
    virusScannerData,
    redisConnectivityData,
    addressFacadeData,
    chargingModuleData: {},
    appData
  }
}

/**
 * Receives an array and returns it in the format required by the nunjucks template in the view.
 */
function _mapArrayToTextCells (rows) {
  return rows.map(row => {
    return row.map(cell => {
      return { text: cell }
    })
  })
}

async function _getVirusScannerData () {
  try {
    const { stdout, stderr } = await exec('clamdscan --version')
    return stderr ? `ERROR: ${stderr}` : stdout
  } catch (error) {
    return `ERROR: ${error.message}`
  }
}

async function _getRedisConnectivityData () {
  try {
    const { stdout, stderr } = await exec('redis-server --version')
    return stderr ? `ERROR: ${stderr}` : stdout
  } catch (error) {
    return `ERROR: ${error.message}`
  }
}

async function _getAddressFacadeData () {
  const statusUrl = new URL('/address-service/hola', servicesConfig.addressFacade.url)
  const result = await HttpRequestService.go(statusUrl.href)

  if (result.succeeded) {
    return result.response.body
  }

  return _parseFailedRequestResult(result)
}

async function _getChargingModuleData () {
  const statusUrl = new URL('/status', servicesConfig.chargingModule.url)
  const result = await HttpRequestService.go(statusUrl.href)

  if (result.succeeded) {
    return result.response.headers['x-cma-docker-tag']
  }

  return _parseFailedRequestResult(result)
}

function _getImportJobsData () {
  return _mapArrayToTextCells([
    [
      'Cell 1.1',
      'Cell 1.2'
    ],
    [
      'Cell 2.1',
      'Cell 2.2'
    ]
  ])
}

async function _getAppData () {
  const healthInfoPath = '/health/info'
  const services = [
    { name: 'Service - foreground', url: new URL(healthInfoPath, servicesConfig.serviceForeground.url) },
    // { name: 'Service - background', url: new URL(healthInfoPath, servicesConfig.serviceBackground.url) },
    // { name: 'Reporting', url: new URL(healthInfoPath, servicesConfig.reporting.url) }//,
    { name: 'Import', url: new URL(healthInfoPath, servicesConfig.import.url) },
    { name: 'Tactical CRM', url: new URL(healthInfoPath, servicesConfig.tacticalCrm.url) },
    { name: 'External UI', url: new URL(healthInfoPath, servicesConfig.externalUi.url) },
    { name: 'Internal UI', url: new URL(healthInfoPath, servicesConfig.internalUi.url) },
    { name: 'Tactical IDM', url: new URL(healthInfoPath, servicesConfig.tacticalIdm.url) },
    { name: 'Permit repository', url: new URL(healthInfoPath, servicesConfig.permitRepository.url) },
    { name: 'Returns', url: new URL(healthInfoPath, servicesConfig.returns.url) }
  ]

  for (const service of services) {
    const result = await HttpRequestService.go(service.url.href)

    if (result.succeeded) {
      const data = JSON.parse(result.response.body)
      service.version = data.version
      service.commit = data.commit
    } else {
      service.version = _parseFailedRequestResult(result)
      service.commit = ''
    }
  }

  return services
}

function _parseFailedRequestResult (result) {
  if (result.response.statusCode) {
    return `ERROR: ${result.response.statusCode} - ${result.response.body}`
  }

  return `ERROR: ${result.response.name} - ${result.response.message}`
}

module.exports = {
  go
}
