"use strict";

var redis = require('redis');

// constant
var CONST = {
  type: {
    JOIN: 0,
    MESSAGE: 1
  }
};

var userId = Math.floor(Math.random() * 1000);

// publisher
var pub = redis.createClient(6379, 'localhost');
pub.publish('chat', JSON.stringify({
  type: CONST.type.JOIN,
  userId: userId
}));

// subscriber
var sub = redis.createClient(6379, 'localhost');
sub.subscribe('chat');
sub.on('message', function(ch, msg) {
  try {
    var data = JSON.parse(msg);

    if (data.userId === userId) {
      return;
    }

    if (data.type === CONST.type.JOIN) {
      console.log('[SYSTEM] user #%d has joined', data.userId);
    } else if (data.type === CONST.type.MESSAGE) {
      console.log('[user%s] %s', data.userId, data.message);
    } else {
      console.log('unknown data type: ' + data.type);
    }
  } catch (e) {
    console.log('illegal data: ' + e);
  }
});

// console chat
process.openStdin().on('data', function(d) {
  var s = d.toString().substring(0, d.length-1);
  console.log("[YOU] " +  s);
  pub.publish('chat', JSON.stringify({
    type: CONST.type.MESSAGE,
    userId: userId,
    message: s
  }));
});
