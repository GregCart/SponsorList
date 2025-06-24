// const LAMBDA_URL = "https://yy67udxfjqcui2f65hr7xvt44m0cikjn.lambda-url.us-east-2.on.aws/"
const bucketName = "sponsorlist.org";


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

    listObjects() {
        return new Promise((resolve, reject) => {
            this.s3.listObjects({ Delimiter: "/" }, function(err, data) {
                if (err) return reject("There was an error listing your albums: " + err.message);

                var itemList = data.CommonPrefixes.map(function (commonPrefix) {
                    var prefix = commonPrefix.Prefix;
                    var item = decodeURIComponent(prefix.replace("/", ""));
                    return item;
                });
                resolve(itemList);
            });
        });
    }

    getObject(name) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({ Bucket: bucket, Key: name }, (err, data) => {
                if (err) return reject(err);

                const text = new TextDecoder().decode(data.body);
                resolve(text);
            });
        });
    }

    putObject(body) {
        let user = body["user"] ? body["user"] : "testUser";
        var key = encodeURIComponent(body["personality"] + "-" + body["sponsor"] + "-" + user + "/");

        return new Promise((resolve, reject) => {
            this.s3.putObject(
                { Key: key, Body: body },
                (err, data) => {
                    if (err) return reject(err);
                    resolve(true);
                }
            )
        })
    }

    deleteObject(name) {
        s3.deleteObject({ Key: name }, function (err, data) {
            if (err) {
                console.log("There was an error deleting your photo: ", err.message);
                return;
            }
            console.log("Successfully deleted item.");
        });
    }
}