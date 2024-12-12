'use strict'

/**
 * Returns information about the `system` repo in the format required by the info service
 * @module FetchSystemInfoService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const util = require('util')
const exec = util.promisify(require('child_process').exec)

/**
 * Returns information about the `system` repo in the format required by the info service
 *
 * @returns {Promise<object>} An object containing the `name`, `serviceName`, `version`, `commit` & `jobs`
 */
async function go() {
  return {
    name: 'System',
    serviceName: 'system',
    version: await _getTagReference(),
    commit: await _getCommitHash(),
    jobs: []
  }
}

async function _getCommitHash() {
  try {
    const { stdout, stderr } = await exec('git rev-parse HEAD')

    return stderr ? `ERROR: ${stderr}` : stdout.replace('\n', '')
  } catch (error) {
    return `ERROR: ${error.message}`
  }
}

async function _getTagReference() {
  try {
    const { stdout, stderr } = await exec('git describe --always --tags')

    return stderr ? `ERROR: ${stderr}` : stdout.replace('\n', '')
  } catch (error) {
    return `ERROR: ${error.message}`
  }
}

module.exports = {
  go
}
