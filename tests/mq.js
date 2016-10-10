var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('jm-core');
    Promise = require('bluebird');
}
var logger = jm.logger;
var utils = {
    formatJSON: function(doc) {
        return JSON.stringify(doc, null, 2);
    }
};
var mq = require('../lib')();

(function(){

    var log = function(err, doc){
        if (err) {
            logger.error(err.stack);
        }
        if(doc!=null){
            logger.debug('%s', utils.formatJSON(doc));
        }
    };

    var done = function(resolve, reject, err, doc){
        log(err, doc);
        if (err) {
            reject(err, doc);
        } else {
            resolve(doc);
        }
    };

    var set = function(key, value){
        return new Promise(function(resolve, reject){
            logger.debug('set %s: %s', key, value);
            mq.set(key, value, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var get = function(key){
        return new Promise(function(resolve, reject){
            logger.debug('get %s', key);
            mq.get(key, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var lock = function(key, expire){
        return new Promise(function(resolve, reject){
            logger.debug('lock %s %s', key, expire);
            mq.lock(key, expire, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var locked = function(key){
        return new Promise(function(resolve, reject){
            logger.debug('locked %s', key);
            mq.locked(key, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var unlock = function(key){
        return new Promise(function(resolve, reject){
            logger.debug('unlock %s', key);
            mq.unlock(key, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var subcribe = function(channel){
        return new Promise(function(resolve, reject){
            logger.debug('订阅 %s', channel);
            mq.subscribe(channel, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var unsubscribe = function(channel){
        return new Promise(function(resolve, reject){
            logger.debug('取消订阅 %s', channel);
            mq.unsubscribe(channel, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var psubcribe = function(channel){
        return new Promise(function(resolve, reject){
            logger.debug('通配符订阅 %s', channel);
            mq.psubscribe(channel, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var punsubscribe = function(channel){
        return new Promise(function(resolve, reject){
            logger.debug('取消通配符订阅 %s', channel);
            mq.punsubscribe(channel, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var publish = function(channel, msg){
        return new Promise(function(resolve, reject){
            logger.debug('发布 [%s] %s', channel, msg);
            mq.publish(channel, msg, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var removeAllListeners = function(event){
        return new Promise(function(resolve, reject){
            logger.debug('删除所有监听: %s', event);
            mq.removeAllListeners(event);
            resolve();
        });
    };

    mq.onMessage(function(channel, message){
        logger.debug('onMessage [%s] %s', channel, message);
    });

    mq.onPMessage(function(pattern, channel, message){
        logger.debug('onPMessage [%s] [%s] %s', pattern, channel, message);
    });

    mq.onMessage(function(channel, message){
        logger.debug('onMessage [%s] %s', channel, message);
    });

    set('test', 123)
        .then(function(doc){
            return get('test');
        })
        .then(function(doc){
            return locked('test_lock');
        })
        .then(function(doc){
            return lock('test_lock', 10);
        })
        .then(function(doc){
            return lock('test_lock');
        })
        .then(function(doc){
            return locked('test_lock');
        })
        .then(function(doc){
            return unlock('test_lock');
        })
        .then(function(doc){
            return locked('test_lock');
        })
        .then(function(doc){
            return subcribe('channel1');
        })
        .then(function(doc){
            return subcribe(['channel2', 'channel3']);
        })
        .then(function(doc){
            return publish('channel1', 'msg');
        })
        .then(function(doc){
            return unsubscribe('channel1');
        })
        .then(function(doc){
            return publish('channel1', 'msg');
        })
        .then(function(doc){
            return publish('channel2', 'msg');
        })
        .then(function(doc){
            return psubcribe(['channel*', 'p2*']);
        })
        .then(function(doc){
            return publish('channel3', 'msg');
        })
        .then(function(doc){
            return removeAllListeners('message');
        })
        .then(function(doc){
            return punsubscribe('channel*');
        })
        .then(function(doc){
            return publish('channel2', 'msg');
        })
        .then(function(doc){
            return publish('channel3', 'msg');
        })
        .then(function(doc){
            return publish('channel4', 'msg');
        })
        .then(function(doc){
            return publish('p2', 'msg');
        })
        .catch(SyntaxError, function(e) {
            logger.error(e.stack);
        })
        .catch(function(e) {
            logger.error(e.stack);
        });

})();