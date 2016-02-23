# phm-broker [![Build Status](https://travis-ci.org/tabman83/phm-broker.svg?branch=master)](https://travis-ci.org/tabman83/phm-broker)

MQTT broker for personal-heating-manager. Uses Mosca. (http://www.mosca.io/)


## Environment variables
- MQTT_PORT (optional) changes the default port MQTT will run


## Adding users
```
$ mosca adduser <user> <pass> --credentials ./credentials.json

// add a user specifying the authorized topics
$ mosca adduser myuser mypass --credentials ./credentials.json \
  --authorize-publish 'hello/*' --authorize-subscribe 'hello/*'

// remove a user
$ mosca rmuser myuser --credentials ./credentials.json
```

## Prerequisites

Install node-gyp build tools:
```
sudo apt-get install node-gyp
```

## Notes
Loads protobuf definitions from https://github.com/tabman83/phm-messages.git
