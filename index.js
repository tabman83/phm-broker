var async = require('async');

function loadProtoBuf(cb) {	
	var request = require('request');
	request.get('https://raw.githubusercontent.com/tabman83/phm-messages/master/sensor-message.proto', function (err, response, body) {
		if(err) {
			cb(err);
			return;
		}
		if(response.statusCode !== 200) {
			cb(new Error('Error while loading protobuf definition file (' + response.statusCode + ')'));
			return;
		}
		var ProtoBuf = require('protobufjs');
		var builder = ProtoBuf.loadProto(body);
		if(!builder) {
			cb(new Error('Error while decoding protobuf definition file'));
			return;
		}
		var SensorMessage = builder.build('SensorMessage');
		cb(null, SensorMessage);
	});	
}

function initializeBroker(SensorMessage, cb) {
	
	var fs = require("fs");
	var mosca = require('mosca');
	var Authorizer = require("mosca/lib/authorizer");

	var settings = {
		port: process.env.MQTT_PORT || 1883,
		http: {
			port: 3000,
			bundle: true
		},
		credentialsFile: './credentials.json'
	};

	function loadAuthorizer(program, cb) {
		if (program.credentialsFile) {
			fs.readFile(program.credentialsFile, function(err, data) {
				if (err) {
					cb(err);
					return;
				}

				var authorizer = new Authorizer();

				try {
					authorizer.users = JSON.parse(data);
					cb(null, authorizer);
				} catch(err) {
					cb(err);
				}
			});
		} else {
			cb(null, null);
		}
	}

	//here we start mosca
	var server = new mosca.Server(settings);
	server.on('ready', setup);
	 
	// fired when the mqtt server is ready
	function setup() {
		// setup authorizer
		loadAuthorizer(settings, function(err, authorizer) {
			if (err) {
				console.error('Error loading authorizer.');
			}

			if (authorizer) {
				console.log('Authorizer is configured.');
				server.authenticate = authorizer.authenticate;
				server.authorizeSubscribe = authorizer.authorizeSubscribe;
				server.authorizePublish = authorizer.authorizePublish;
			}
		});
		console.log('Mosca broker is up and running');
	}
	 
	// fired whena  client is connected
	server.on('clientConnected', function(client) {
		console.log('Client \'' + client.id + '\' just connected.');
	});
	 
	// fired when a message is received
	
	server.on('published', function(packet, client) {
		var clientId = client ? client.id : 'unknown';
		console.log('Client \'' + clientId + '\' published to the topic: ', packet.topic);
		
		if(packet.topic === 'phm/sensors') {
			var sensorMessage = SensorMessage.decode(packet.payload);
			console.log(sensorMessage);
		} else {		
			var payload = packet.payload.toString();
			try {
				payload = JSON.parse(packet.payload.toString());
			}
			catch(e) {}
			console.log(payload);
		}
	});
	

	// fired when a client subscribes to a topic
	server.on('subscribed', function(topic, client) {
		console.log('Client \'' + client.id + '\' subscribed to topic: ', topic);
	});
	 
	// fired when a client subscribes to a topic
	server.on('unsubscribed', function(topic, client) {
		console.log('Client \'' + client.id + '\' unsubscribed from topic: ', topic);
	});
	 
	// fired when a client is disconnecting
	server.on('clientDisconnecting', function(client) {
		console.log('Client \'' + client.id + '\' is about to disconnect.')
	});
	 
	// fired when a client is disconnected
	server.on('clientDisconnected', function(client) {
		console.log('Client \'' + client.id + '\' disconnected.');
	});
}

async.waterfall([loadProtoBuf, initializeBroker], function(err) {
	if(err) {
		console.log(err);
	}
});