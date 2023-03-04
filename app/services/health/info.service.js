'use strict'

/**
 * Checks status and gathers info for each of the services which make up WRLS
 * @module InfoService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const ChildProcess = require('child_process')
const util = require('util')
const exec = util.promisify(ChildProcess.exec)

const ChargingModuleRequestLib = require('../../lib/charging-module-request.lib.js')
const RequestLib = require('../../lib/request.lib.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

const servicesConfig = require('../../../config/services.config.js')

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
  const chargingModuleData = await _getChargingModuleData()
  const appData = await _getAppData()

  return {
    virusScannerData,
    redisConnectivityData,
    addressFacadeData,
    chargingModuleData,
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
  const result = await RequestLib.get(statusUrl.href)

  if (result.succeeded) {
    return result.response.body
  }

  return _parseFailedRequestResult(result)
}

async function _getChargingModuleData () {
  const result = await ChargingModuleRequestLib.get('status')

  if (result.succeeded) {
    return result.response.info.dockerTag
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
  const healthInfoPath = 'health/info'

  const services = [
    { name: 'Service - foreground', serviceName: 'water' },
    { name: 'Service - background', serviceName: 'background' },
    { name: 'Reporting', serviceName: 'reporting' },
    { name: 'Import', serviceName: 'import' },
    { name: 'Tactical CRM', serviceName: 'crm' },
    { name: 'External UI', serviceName: 'external' },
    { name: 'Internal UI', serviceName: 'internal' },
    { name: 'Tactical IDM', serviceName: 'idm' },
    { name: 'Permit repository', serviceName: 'permits' },
    { name: 'Returns', serviceName: 'returns' }
  ]

  for (const service of services) {
    const result = await LegacyRequestLib.get(service.serviceName, healthInfoPath, false)

    if (result.succeeded) {
      service.version = result.response.body.version
      service.commit = result.response.body.commit
      service.jobs = service.name === 'Import' ? _getImportJobsData() : []
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
