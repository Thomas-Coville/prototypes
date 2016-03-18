var http = require('http');
var port = process.env.port || 1337;
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
var ws = require('ws');
var wss = new ws.Server({ port: 8080 });
wss.on('connection', function (connection) {
    connection.on('message', function (message) {
        connection.send(message.toUpperCase());
    });
    connection.send('Hello!');
});
//# sourceMappingURL=server.js.map