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

async function getSponsorList() {
    let resp = await fetch(LAMBDA_URL);

    return resp;
}