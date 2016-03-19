var falcorExpress = require('falcor-express');
var Router = require('falcor-router');
var AWS = require('aws-sdk-promise');
var express = require('express');
var StringBuilder = require('stringbuilder')
var app = express();

StringBuilder.extend('string');

AWS.config.update({ endpoint: "http://localhost:8002", region: "us-east-1" })

var docClient = new AWS.DynamoDB.DocumentClient();


app.use('/model.json', falcorExpress.dataSourceRoute(function (req, res) {
    // create a Virtual JSON resource with single key ("greeting") 
    return new Router([        
        {
            route: 'waveforms',            
            get : function (pathSet) {
                var result = []
                
                var params = {
                    TableName : "MixGenius.Waveforms"
                };
                
                return docClient.scan(params)
                    .promise()
                    .then(function (response, err) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    } else {
                        response.data.Items.forEach(function (entry) {
                            result.push({
                                path: ["waveforms", entry.WaveformId, "waveform"], 
                                value: entry
                            })
                        });
                    }
                    
                    return result;
                });
            }
        },
        {
            route: 'waveformsById[{keys:waveformids}]',            
            get : function (pathSet) {
                var result = []
                
                var params = {
                    TableName : "MixGenius.Waveforms",
                    FilterExpression : "",
                    ExpressionAttributeValues : {}
                };
                
                var sb = new StringBuilder();
                
                pathSet.waveformids.forEach(function (id, idx) {
                    if (idx > 0) {
                        params.FilterExpression = params.FilterExpression + " OR ";
                    }
                    var key = ":id{0}".format(idx);
                    params.FilterExpression = params.FilterExpression + "WaveformId = {0}".format(key);
                    params.ExpressionAttributeValues[key] = id;
                });
                
                return docClient.scan(params)
                    .promise()
                    .then(function (response, err) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    } else {
                        response.data.Items.forEach(function (entry) {
                            result.push({
                                path: ["waveformsById", entry.WaveformId], 
                                value: entry
                            })
                        });
                    }
                    
                    return result;
                });
            }
        }
    ]);
}));

//// serve static files from current directory 
//app.use(express.static(__dirname + '/'));

var server = app.listen(3000);