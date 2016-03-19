var falcorExpress = require('falcor-express');
var Router = require('falcor-router');
var AWS = require('aws-sdk-promise');
var express = require('express');
var app = express();

AWS.config.update({ endpoint: "http://localhost:8002" })

//var db = new AWS.DynamoDB({ endpoint: "http://localhost:8002" })


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
            route: 'waveforms[{keys:waveformids}]',            
            get : function (pathSet) {
                var result = []
                
                var params = {
                    TableName : "MixGenius.Waveforms",
                    KeyConditionExpression: "#wid = :id",
                    ExpressionAttributeNames: {
                        "#wid": "year"
                    },
                    ExpressionAttributeValues: {
                        ":id": 1985
                    }
                };
                
                return docClient.query(params)
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
        }
    ]);
}));

//// serve static files from current directory 
//app.use(express.static(__dirname + '/'));

var server = app.listen(3000);