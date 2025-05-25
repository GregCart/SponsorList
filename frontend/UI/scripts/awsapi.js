const LAMBDA_URL = "https://gq7p4jvz3wgq6neyn4toygnzni0zmswh.lambda-url.us-east-1.on.aws/"


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

async function getSponsorList() {
    let resp = await fetch(LAMBDA_URL);

    return resp;
}