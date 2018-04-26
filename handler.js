'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const title = "Best Songs of the Rock Era";

module.exports.randomsong = (event, context, callback) => {
  const rank = Math.floor(Math.random() * 100) + 1;

  let promise = new Promise((resolve, reject) => {
    let song = getsong(rank)
    resolve(song)
    reject("something did not work")
  })

  promise.then((response) => {
    callback(null, response)
  }).catch((err) => {
    console.log(err)
  })
};

module.exports.rankedsong = (event, context, callback) => {
  let rank = 1;
  if (event.pathParameters && event.pathParameters.rank) {
    rank = parseInt(event.pathParameters.rank);
  }

  let promise = new Promise((resolve, reject) => {
    let song = getsong(rank)
    resolve(song)
    reject("something did not work")
  })

  promise.then((response) => {
    callback(null, response)
  }).catch((err) => {
    console.log(err)
  })
};

module.exports.allsongs = (event, context, callback) => {
  const dbparams = {
    TableName: process.env.tableName,
  };

  let dynamicHtml = "";
  
  // fetch all songs from the database
  dynamoDb.scan(dbparams, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      dynamicHtml = "unexpected error encountered";
    }
    else {
      for (var item in result.Items) {
        dynamicHtml += `<li>${result.Items[item].rank}: ${result.Items[item].song} -- ${result.Items[item].artist}</li>`
      }
    }

    const html = `<html><head><title>${title}</title><body><h1>${title}</h1>${dynamicHtml}</body></html>`;

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html,
    }
  
    callback(null, response);
  });  
};


module.exports.loaddata = (event, context, callback) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

//  console.log(`A new file ${key} was created in the bucket ${bucket}`);

  var s3params = {Bucket: bucket, Key: key};

  s3.getObject(s3params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      var fileContent = data.Body.toString();
      var rows = fileContent.split('\n');
      for (var row in rows) {
        var song = rows[row].split(',');
        const dbparams = {
          TableName: process.env.tableName,
          Item: {
            rank: parseInt(song[0]),
            song: song[1],
            artist: song[2],
          },
        };

        // wite to db
        dynamoDb.put(dbparams, (error) => {
          // handle potential errors
          if (error) {
            console.error(error);
          }
          else {
            console.log("dynamodb updated")
          }
        });        
      }
    }     
  });  

  callback(null);  
};

function getsong(rank) {
  const dbparams = {
    TableName: process.env.tableName,
    Key: {
      rank: rank,
    },
  };

  return dynamoDb.get(dbparams).promise().then((result) => {
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `<html><head><title>${title}</title><body><h1>${title}</h1><h2>${result.Item.song}</h2>-- ${result.Item.artist}</body></html>`,
    }
    return response
  }).catch((error) => {
    console.log("ERROR! in getsong ... rank:", rank, " error: ", error)
    const response = {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `<html><head><title>${title}</title><body><h1>${title}</h1><h2>Unexpected error</h2></body></html>`,
    }
    return response
  })
}