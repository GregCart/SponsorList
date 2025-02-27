const backendUrl = "http://192.168.86.14:8080";


async function healthCheck() {
    let check = false;

    await fetch(backendUrl + "/").then((resp) => {

        if (resp.text() == "Hello World!") {
            check = true;
        }
    })

}

async function getSponsorsList() {
    let data;

    await fetch(backendUrl + "/getAll").then((resp) => {
        data = resp.json();
    });

    return data;
}