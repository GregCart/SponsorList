const LAMBDA_URL = "https://yy67udxfjqcui2f65hr7xvt44m0cikjn.lambda-url.us-east-2.on.aws/"


async function healthCheck() {
    let check = false;

    await fetch(LAMBDA_URL).then((resp) => {
        if (resp.text() == "Hello World!") {
            check = true;
        }
    }).finally(() =>{
        return check;
    });
}

class S3Service {
    constructor() {
        this.s3 = new AWS.S3({ apiVersion: '2006-03-01'})
        this.bucket = "";
    }

    getObject(bucket = this.bucket, key) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({ Bucket: bucket, Key: key }, (err, data) => {
                if (err) return reject(err);

                const text = new TextDecoder().decode(data.body);
                resolve(text);
            });
        });
    }

    putObject(bucket = this.bucket, key, body, contentType = 'application/json') {
        return new Promise((resolve, reject) => {
            this.s3.putObject(
                { Bucket: bucket, Key: key, Body: body, ContentType: contentType },
                (err, data) => {
                    if (err) return reject(err);
                    resolve(true);
                }
            )
        })
    }
}