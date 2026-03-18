const { PeerServer } = require('peer');
PeerServer({ port: 9000, path: '/peerjs', proxied: true, allow_discovery: false });
console.log('PeerJS server on 9000');
