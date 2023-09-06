'use strict'

/**
 * Creates a Redis client
 * @module CreateRedisClient
 */

const Redis = require('ioredis')

const redisConfig = require('../../../config/redis.config.js')

/**
 * Connect to Redis and return a client
*/
async function go () {
  return new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    ...(redisConfig.disableTls ? {} : { tls: {} }),
    maxRetriesPerRequest: 0
  })
}

module.exports = {
  go
}
