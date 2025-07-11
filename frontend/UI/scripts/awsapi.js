// const LAMBDA_URL = "https://yy67udxfjqcui2f65hr7xvt44m0cikjn.lambda-url.us-east-2.on.aws/"
const bucketName = "www.sponsorlist.org";
const folderName = "data/";


// async function healthCheck() {
//     let check = false;

//     await fetch(LAMBDA_URL).then((resp) => {
//         if (resp.text() == "Hello World!") {
//             check = true;
//         }
//     }).finally(() =>{
//         return check;
//     });
// }

class S3Service {
    constructor() {
        AWS.config.region = "us-east-2"; // Region
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: "us-east-2:fadf8d53-931f-459e-906b-d56f3890a66a",
        });

        this.s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: { 
                Bucket: bucketName
            },
        });
    }

    listObjects(folder = folderName, delim = "/") {
        return new Promise((resolve, reject) => {
            this.s3.listObjectsV2({ Delimiter: delim, Prefix: folder }, function(err, data) {
                if (err)  {
                    return reject("There was an error listing data: " + err.message)
                };

                // console.log("data: ");
                // console.log(data);
                var itemList = data.Contents.length == 0 ? 
                    data.CommonPrefixes.map(function (commonPrefix) {
                        // console.log("commonPrefix: ");
                        // console.log(commonPrefix);
                        var prefix = commonPrefix.Prefix;
                        // var item = decodeURIComponent(prefix.replace("/", ""));
                        var item = decodeURIComponent(prefix);
                        return item;
                    }) :
                    data.Contents.map(function (content) {
                        // console.log("content: ");
                        // console.log(content);
                        var item = decodeURIComponent(content.Key);
                        return item;
                    });
                resolve(itemList);
            });
        });
    }

    getObject(name) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({ Key: name }, (err, data) => {
                if (err)  {
                    return reject(err)
                };

                // console.log("data: ");
                // console.log(data);
                const text = new TextDecoder('utf-8').decode(data.Body);
                // console.log("text: ");
                // console.log(text);
                resolve(text);
            });
        });
    }

    putObject(body) {
        let user = body["user"] ? body["user"] : "testUser";
        // let date = body["added"] ? body["added"] : new Date();
        var key = encodeURIComponent(new Date(body["added"]).toISOString().split("T")[0]) + "/" + 
                    encodeURIComponent(body["personality"] + "-" + body["sponsor"] + "-" + user ) + ".json";

        return new Promise((resolve, reject) => {
            this.s3.putObject(
                { Key: folderName + key, Body: JSON.stringify(body), ContentType: "application/json"},
                (err, data) => {
                    if (err)  {
                        return reject(err)
                    };
                    resolve(true);
                }
            )
        })
    }

    deleteObject(name) {
        s3.deleteObject({ Key: folderName + name }, function (err, data) {
            if (err) {
                console.log("There was an error deleting your photo: ", err.message);
                return;
            }
            console.log("Successfully deleted item.");
        });
    }
}