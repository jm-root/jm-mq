var redis = require('redis');
var ObjectId = require('objectid');

module.exports = function(opts, cb) {
    opts = opts || {};

    var model = {
        clientSub: null,
        clientPub: null,
        publishIdName: opts.publishIdName || null,

        start: function(cb) {
            this.clientSub = redis.createClient(opts);
            if(cb){
                this.clientSub.once('ready', cb);
            }
            this.clientPub = redis.createClient(opts);
            this.client = this.clientPub;
        },

        stop: function() {
            if(this.clientSub) {
                this.clientSub.end();
                this.clientSub = null;
            }
            if(this.clientPub) {
                this.clientPub.end();
                this.clientPub = null;
                this.client = null;
            }
        },

        removeListener: function(event, cb) {
            this.clientSub.removeListener(event, cb);
        },

        removeAllListeners: function(event) {
            this.clientSub.removeAllListeners(event);
        },

        once: function(event, cb) {
            this.clientSub.once(event, cb);
        },

        on: function(event, cb) {
            this.clientSub.on(event, cb);
        },

        onMessage: function(cb) {
            this.on('message', cb);
        },

        subscribe: function(channel, cb) {
            this.clientSub.subscribe(channel, cb);
        },

        unsubscribe: function(channel, cb) {
            this.clientSub.unsubscribe(channel, cb);
        },

        onPMessage: function(cb) {
            this.on('pmessage', cb);
        },

        psubscribe: function(pattern, cb) {
            this.clientSub.psubscribe(pattern, cb);
        },

        punsubscribe: function(pattern, cb) {
            this.clientSub.punsubscribe(pattern, cb);
        },

        publish: function(channel, message, cb) {
            if(this.publishIdName){
                var obj = null;
                if(typeof message == 'string'){
                    try{
                        obj = JSON.parse(message);
                    }catch (e){}
                } else if (typeof message === 'object') {
                    obj = message;
                }
                if(obj && !obj[this.publishIdName]){
                    obj[this.publishIdName] = new ObjectId();
                    message = JSON.stringify(obj);
                }
            }
            this.clientPub.publish(channel, message, cb);
        },

        set: function(key, val, cb) {
            this.clientPub.set(key, val, cb);
        },

        get: function(key, cb) {
            this.clientPub.get(key, cb);
        },

        del: function(key, cb) {
            this.clientPub.del(key, cb);
        },

        exists: function(key, cb) {
            this.clientPub.exists(key, cb);
        },

        hset: function(hkey, key, val, cb) {
            this.clientPub.hset(hkey, key, val, cb);
        },

        hget: function(hkey, key, cb) {
            this.clientPub.hget(hkey, key, cb);
        },

        hdel: function(hkey, key, cb) {
            this.clientPub.hdel(hkey, key, cb);
        },

        hkeys: function(hkey, cb) {
            this.clientPub.hkeys(hkey, cb);
        },

        hgetall: function(hkey, cb) {
            this.clientPub.hgetall(hkey, cb);
        },

        expire: function(key, time, cb){
            this.clientPub.expire(key, time, cb);
        },

        lock: function(key, expire, cb){
            if(typeof expire === 'function') {
                cb = expire;
                expire = 0;
            }
            expire = expire || 0;
            var _cb = function(err, doc) {
                if(!cb) return;
                if(!err && doc){
                    doc = 1;
                }else {
                    doc = 0;
                }
                cb(err, doc);
            };
            if(expire){
                this.client.send_command('set', [key, '', 'NX', 'EX', expire, _cb]);
            }else {
                this.client.send_command('set', [key, '', 'NX', _cb]);
            }
        },

        locked: function(key, cb){
            cb = cb || function(){};
            this.exists(key, cb);
        },

        unlock: function(key, cb){
            cb = cb || function(){};
            this.del(key, cb);
        },
    
    };
    model.start(cb);
    return model;
};


