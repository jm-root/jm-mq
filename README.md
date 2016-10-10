jm-mq
=========

a mq lib using redis

```js
var mq = require('jm-mq')({
    //url: 'redis://127.0.0.1'
});
mq.set('account', 'test', function(err){
    if(err){
        console.info(err);
        return;
    }
    mq.get('account', function(err, v){
        console.info(v);
    });
});

var channelName = 'test';
mq.subscribe(channelName);
mq.onMessage(function(channel, message){
    console.info('subscribe2 revevied ' + channel + ': ' + message);
});

mq.publish(channelName, '1st mq message');
mq.publish(channelName, '2nd mq message');

```
