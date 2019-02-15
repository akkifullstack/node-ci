const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys")

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.userCache = true;
    this.hasKey = JSON.stringify(options.key || '')
    return this;
}

mongoose.Query.prototype.exec = async function () {

    if (!this.userCache) {
        return exec.apply(this, arguments);
    }


    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))

    // See if we have a value for 'key' in redis

    const cacheValue = await client.hget(this.hasKey, key)

    // if we do return that
    if (cacheValue) {
        console.log("Reading from cache");
        const doc = JSON.parse(cacheValue)
        return Array.isArray(doc) ? doc.map(data => new this.model(data)) : new this.model(doc)
    }

    console.log("Reading from Mongo")
    // Otherwise, issue the query and store results in redis
    const result = await exec.apply(this, arguments)

    client.hset(this.hasKey, key, JSON.stringify(result));

    return result;
}


module.exports = {
    clearHash(hasKey) {
        client.del(JSON.stringify(hasKey))
    }
}