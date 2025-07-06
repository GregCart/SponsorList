const s3 = new S3Service();
const auth = new Authenticator();

function formatData(objList) {
    let body = document.getElementById("tableBody");
    body.innerHTML = ""; // Clear previous rows

    // console.log(typeof objList[0], objList);

    let  objs = objList.filter(element => {
        return element.includes("data");
    })
    objs.forEach(element => {
        // console.log("Element: ");
        // console.log(element);
        s3.getObject(element).then(data => {
            // console.log("Data: ");
            // console.log(data);
            const sponsor = JSON.parse(data);
            let row = document.createElement("tr");
            [
                sponsor.personality,
                sponsor.sponsor,
                sponsor.platform,
                // Conditional: if sponsor.code looks like a URL, make it clickable
                sponsor.code && /^(https?:\/\/)/i.test(sponsor.code)
                    ? (() => { let a = document.createElement('a'); a.href = sponsor.code; a.textContent = sponsor.code; a.target = '_blank'; return a; })()
                    : sponsor.code,
                sponsor.post = (() => { let a = document.createElement('a'); a.href = sponsor.post; a.textContent = sponsor.post; a.target = '_blank'; return a; })(),
                sponsor.start ? new Date(sponsor.start).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "",
                sponsor.added ? new Date(sponsor.added).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "",
                sponsor.checked ? new Date(sponsor.checked).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "",
                sponsor.valid,
                sponsor.scam,
                sponsor.verified ? new Date(sponsor.verified).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ""
            ].forEach(val => {
                let td = document.createElement("td");
                if (val instanceof HTMLElement) {
                    td.appendChild(val);
                } else {
                    td.textContent = val !== undefined ? val : "ERR";
                }
                row.appendChild(td);
            });
            body.appendChild(row);
        });
    });
}

function populate() {
    s3.listObjects().then(data => {
        // console.log("Data: ");
        // console.log(data);
        data.forEach(datum => {
            // console.log("Datum:");
            // console.log(datum);
            s3.listObjects(datum, "").then(datumData => {
                // console.log("Datum Data: ");
                // console.log(datumData);
                formatData(datumData);
            }).catch(err => {
                console.error("Error fetching object:", err);
            });
        });
    });
}

