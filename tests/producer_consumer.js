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
        if(doc){
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

    var producer = function(key, value){
        return new Promise(function(resolve, reject){
            logger.debug('producer %s: %s', key, value);
            mq.client.lpush(key, value, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    var consumer = function(key){
        return new Promise(function(resolve, reject){
            logger.debug('consumer %s', key);
            mq.client.brpop(key, 1000, function(err, doc){
                log(err, doc);
                resolve(doc);
            });
        });
    };

    producer('test_producer_consumer', 123)
        .then(function(doc){
            return producer('test_producer_consumer', 456);
        })
        .then(function(doc){
            return consumer('test_producer_consumer');
        })
        .then(function(doc){
            return consumer('test_producer_consumer');
        })
        .catch(SyntaxError, function(e) {
            logger.error(e.stack);
        })
        .catch(function(e) {
            logger.error(e.stack);
        });

})();