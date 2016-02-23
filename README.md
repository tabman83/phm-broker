phm-broker
==========
MQTT broker for personal-heating-manager. Uses Mosca. (http://www.mosca.io/)

```
$ mosca adduser <user> <pass> --credentials ./credentials.json

// add a user specifying the authorized topics
$ mosca adduser myuser mypass --credentials ./credentials.json \
  --authorize-publish 'hello/*' --authorize-subscribe 'hello/*'

// remove a user
$ mosca rmuser myuser --credentials ./credentials.json
```