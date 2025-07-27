const s3 = new S3Service();
const auth = new CognitoAuthenticator();

const loginButton = `<button id="login" title="Login or Register">Login/Register</a>`;
const logoutButton = `<button id="logout" title="Logout">Logout</a>`;
const form  = `
    <form id="AddSponsorBody">
        <div class="spaced">
            <div>
                <span>
                    <label for="personality">Personality</label>
                    <input type="text" id="personality" name="personality" required />
                </span>
                <span>
                    <label for="sponsor">Sponsor Name</label>
                    <input type="text" id="sponsor" name="sponsor" required />
                </span>
                <span>
                    <label for="platform">Debut'd Platform</label>
                    <input type="text" id="platform" name="platform" required />
                </span>
                <span>
                    <label for="code">Link/Code</label>
                    <input type="text" id="code" name="code" required />
                </span>
                <span>
                    <label for="post">Origional Post</label>
                    <input type="url" id="post" name="post" required />
                </span>
                <span>
                    <label for="start">Sponsor Started</label>
                    <input type="date" id="start" name="start" />
                </span>
            </div>
        </div>
        <div class="spaced">
            <div>
                <span></span>
                <span>
                    <label for="added">Date Added</label>
                    <input type="datetime" id="added" name="added" readonly />
                </span>
                <span>
                    <label for="checked">Last Checked</label>
                    <input type="datetime" id="checked" name="checked" readonly />
                </span>
                <span>
                    <span>
                        <label for="valid">Valid?</label>
                        <input type="checkbox" id="valid" name="valid" readonly />
                    </span>
                    <span>
                        <label for="scam">Scam?</label>
                        <input type="checkbox" id="scam" name="scam" readonly />
                    </span>
                </span>
                <span>
                    <label for="verified">Last Verified</label>
                    <input type="datetime" id="verified" name="verified" readonly />
                </span>
                <span></span>
            </div>
        </div>
        <div><br/></div>
        <div>
            <input type="submit" value="Submit" />
        </div>
    </form>
`; 

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

function setupForm() {
    const form = document.getElementById("AddSponsorBody");

    // console.log(form.children[3].children[1].children[0].children[6].children[0])
    document.getElementById("added").value = new Date();
    form[6].innerHTML = form[6].value

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Collect form data into a plain object, including readonly fields and checkboxes
        const data = {};
        const inputs = form.querySelectorAll('input');
        inputs.forEach(item => {
            if (item.type === 'checkbox') {
                data[item.name] = item.checked;
            } else if (item.type !== 'submit') {
                switch (item.name) {
                    case "added": 
                        data[item.name] = new Date();
                        break;
                    default:
                        data[item.name] = item.value;
                        break;
                }
            }
        });

        // Convert all date fields to UTC ISO strings before upload
        if (data['start']) {
            data['start'] = new Date(data['start']).toISOString();
        }
        if (data['added']) {
            data['added'] = new Date(data['added']).toISOString();
        }
        if (data['checked']) {
            data['checked'] = new Date(data['checked']).toISOString();
        }
        if (data['verified']) {
            data['verified'] = new Date(data['verified']).toISOString();
        }

        console.log(data);

        s3.putObject(data).then(() => {
            alert("Sponsor Added Successfully!");
            form.reset();
            populate();
        }).catch(err => {
            alert("Error adding sponsor: " + err.message);
        });
    });
}

function testAuth() {
    if (auth.isAuthenticated() == true) {
        console.log("User is authenticated:", auth.user);
        document.querySelector(".auth").innerHTML = logoutButton;
        document.getElementById("logout").addEventListener("click", () => {
            auth.signOut();
        });
        return true
    } else {
        console.log("User is not authenticated");
        document.querySelector(".auth").innerHTML = loginButton;
        document.getElementById("login").addEventListener("click", () => {
            auth.signIn();
        });
        return false;
    }
}

function init() {
    if (document.referrer.includes("auth.sponsorlist.org") || document.referrer.includes("cognito")) {
        auth.userManager.signinCallback().then(function (user) {
            this.user=user;
            console.log("Sign-in successful:", user);
        });
    }
    
    if(testAuth()) {
        document.getElementById("AddSponsorBox").removeAttribute("disabled");
        document.getElementById("AddSponsorBox").innerHTML = form;   
        setupForm();
    }
    populate();

    // Dark mode toggle
    const toggleButton = document.querySelector('.btn-toggle');
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleButton.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    });
}