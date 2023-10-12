'use strict'

/**
 * Returns the version and commit hash for the `system` repo
 * @module FetchSystemInfoService
 */

// We use promisify to wrap exec in a promise. This allows us to await it without resorting to using callbacks.
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const { version } = require('../../../package.json')

/**
 * Returns the version and commit hash for the `system` repo
 *
 * @returns {Object} An object containing the `version` & `commit`
 */
async function go () {
  return {
    name: 'System',
    serviceName: 'system',
    version,
    commit: await _getCommitHash(),
    jobs: []
  }
}

async function _getCommitHash () {
  try {
    const { stdout, stderr } = await exec('git rev-parse HEAD')
    return stderr ? `ERROR: ${stderr}` : stdout.replace('\n', '')
  } catch (error) {
    return `ERROR: ${error.message}`
  }
}

module.exports = {
  go
}
