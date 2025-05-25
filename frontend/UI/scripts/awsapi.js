const LAMBDA_URL = "https://gq7p4jvz3wgq6neyn4toygnzni0zmswh.lambda-url.us-east-1.on.aws/"


export async function getSponsorList() {
    let resp = await fetch(LAMBDA_URL);

    return resp;
}