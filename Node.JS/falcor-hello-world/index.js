var falcorExpress = require('falcor-express');
var Router = require('falcor-router');
var AWS = require('aws-sdk-promise');
var express = require('express');
var StringBuilder = require('stringbuilder')
var jsonGraph = require('falcor-json-graph');
var $ref = jsonGraph.ref;
var $error = jsonGraph.error;

var app = express();

StringBuilder.extend('string');

AWS.config.update({ endpoint: "http://localhost:8002", region: "us-east-1" })

var docClient = new AWS.DynamoDB.DocumentClient();

app.use('/model.json', falcorExpress.dataSourceRoute(function (req, res) {
    // create a Virtual JSON resource with single key ("greeting") 
    return new Router([        
        {
            route: "waveforms",            
            get : function (pathSet) {
                var result = []
                var params = {
                    TableName : "MixGenius.Waveforms",
                    ProjectionExpression : "WaveformId",
                };
                
                return docClient.scan(params)
                    .promise()
                    .then(function (response, err) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    } else {
                        response.data.Items.forEach(function (entry) {
                            result.push({
                                path: ["waveforms", entry.WaveformId], 
                                value: $ref(["waveformsById", entry.WaveformId])
                            });
                        });
                    }
                    
                    return result;
                });
            }
        },
        {
            route: "waveformsById[{keys:waveformids}]['Format','LibraryId','ApplicationVersion','OwnerId','SampleRate','OriginalName', 'OriginalWaveformId', 'BitDepth','Kind','Name','CreationTime','Hash','TenantId','ApplicationPlatform','App','Stamp','OriginalEntry','Duration','IsPublic','BitRate','LastModifiedTime','EngineVersion','Version']",            
            get : function (pathSet) {
                var result = []
                
                var params = {
                    TableName : "MixGenius.Waveforms",
                    ProjectionExpression : "WaveformId",
                    FilterExpression : "",
                    ExpressionAttributeNames : {},
                    ExpressionAttributeValues : {}
                };
                
                pathSet[2].forEach(function (key, idx) {
                    params.ProjectionExpression = params.ProjectionExpression + ",";
                    params.ProjectionExpression = params.ProjectionExpression + "#" + key;
                    params.ExpressionAttributeNames["#" + key] = key
                });
                
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
                            pathSet[2].forEach(function (key, idx) {
                                
                                if (entry[key]) {
                                    result.push({
                                        path: ["waveforms", entry.WaveformId, key], 
                                        value: entry[key]

                                    })
                                }
                            });
                        });
                    }
                    
                    return result;
                });
            }
        },
        {
            route: "waveformsById[{keys:waveformids}].Original",            
            get : function (pathSet) {
                var result = []
                
                var params = {
                    TableName : "MixGenius.Waveforms",
                    ProjectionExpression : "WaveformId, OriginalWaveformId",
                    FilterExpression : "",
                    ExpressionAttributeValues : {}
                };
                
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
                            if (entry.OriginalWaveformId) {
                                result.push({
                                    path: ["waveforms", entry.WaveformId, 'Original'], 
                                    value: $ref(["waveformsById", entry.OriginalWaveformId])
                                });
                            }
                        });
                    }
                    
                    return result;
                });
            }
        },
        {
            route: "waveformsById[{keys:waveformids}].RawMaster",            
            get : function (pathSet) {
                var result = []
                
                var params = {
                    TableName : "MixGenius.Waveforms",
                    ProjectionExpression : "WaveformId, RawMasterWaveformId",
                    FilterExpression : "",
                    ExpressionAttributeValues : {}
                };
                
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
                            if (entry.OriginalWaveformId) {
                                result.push({
                                    path: ["waveforms", entry.WaveformId, 'RawMaster'], 
                                    value: $ref(["waveformsById", entry.RawMasterWaveformId])
                                });
                            }
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