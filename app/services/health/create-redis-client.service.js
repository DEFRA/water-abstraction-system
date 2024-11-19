'use strict'

/**
 * Creates a Redis client
 * @module CreateRedisClient
 */

const Redis = require('ioredis')

const redisConfig = require('../../../config/redis.config.js')

/**
 * Connect to Redis and return a client
 *
 * @returns {Promise<Redis>} - a new redis instance
 */
async function go () {
  return new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    ...(redisConfig.disableTls ? {} : { tls: {} }),
    // When a new Redis instance is created, it will connect to Redis server automatically. If you want to keep
    // disconnected until a command is called, you pass the lazyConnect option
    lazyConnect: true,
    // Don't attempt to retry a request to Redis if a command fails
    maxRetriesPerRequest: 0
  })
}

module.exports = {
  go
}
