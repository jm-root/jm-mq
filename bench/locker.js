'use strict';

const Benchmark = require('benchmark');
var mq = require('../lib')();
var key = 'test_locker';
var count = 0;
var count2 = 0;
var bench = new Benchmark('locker', {

    'defer': true,

    'fn': function(deferred) {
        // mq.set('test', count++, function(err, doc){
        //     deferred.resolve();
        // });
        // return;
        mq.lock(key, 1000, function (err, doc) {
            count ++;
            if(doc) count2 ++;
            mq.unlock(key, function(err, doc){
                deferred.resolve();
            });
        });
    }
});

bench
    .on('cycle', function (event) {
        console.log('count: ' + count + '/' + count2 + '  ' + String(event.target));
    })
    .on('complete', function () {
    })
;

bench.run({async: true});
