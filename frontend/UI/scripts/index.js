const auth = new CognitoAuthenticator();
const service = new S3Service();

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
                    <label for="link">Link</label>
                    <input type="url" id="link" name="link" pattern="[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)"/>
                </span>
                <span>
                    <label for="code">Code</label>
                    <input type="text" id="code" name="code" required />
                </span>
                <span>
                    <label for="post">Origional Post</label>
                    <input type="url" id="post" name="post" pattern="[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)" required />
                </span>
            </div>
        </div>
        <div class="spaced">
            <div>
                <span>
                    <label for="start">Sponsor Started</label>
                    <input type="date" id="start" name="start" />
                </span>
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

function addSponsorToTable(objList) {
    let body = document.getElementById("tableBody");
    // body.innerHTML = ""; // Clear previous rows

    // console.log(typeof objList[0], objList);

    let  objs = objList.filter(element => {
        return element.includes("data");
    })
    objs.forEach(element => {
        // console.log("Element: ");
        // console.log(element);
        service.getObject(element).then(data => {
            // console.log("Data: ");
            // console.log(data);
            const sponsor = JSON.parse(data);
            let row = document.createElement("tr");
            [
                sponsor.personality,
                sponsor.sponsor,
                sponsor.platform,
                sponsor.code,
                // Conditional: if sponsor.link looks like a URL, make it clickable
                sponsor.link && /^(https?:\/\/)/i.test(sponsor.link)
                    ? (() => { let a = document.createElement('a'); a.href = sponsor.link; a.textContent = sponsor.link; a.target = '_blank'; return a; })()
                    : sponsor.link,
                sponsor.post = (() => { let a = document.createElement('a'); 
                    a.href = sponsor.post; 
                    a.textContent = sponsor.post.length > 30 ? sponsor.post.substring(0, 30) + "..." : sponsor.post
                    ; a.target = '_blank'; return a; })(),
                sponsor.start ? new Date(sponsor.start).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit'}) : "",
                sponsor.added ? new Date(sponsor.added).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "",
                sponsor.checked ? new Date(sponsor.checked).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "",
                sponsor.valid,
                sponsor.scam,
                sponsor.verified ? new Date(sponsor.verified).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "",
                sponsor.user ? sponsor.user : "Unknown"
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
    document.getElementById("tableBody").innerHTML = "";

    service.listObjects().then(data => {
        let loadedCount = 0;
        const totalFolders = data.length;
        
        data.forEach(datum => {
            service.listObjects(datum, "").then(datumData => {
                addSponsorToTable(datumData);
                loadedCount++;
                
                // Rebuild search index after all data is loaded
                if (loadedCount === totalFolders) {
                    setTimeout(() => buildSearchIndex(), 500); // Small delay to ensure DOM is updated
                }
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
        if (data['link'] == "" && data['code'] == "") {
            alert("Please provide either a link or a code.");
            return;
        }

        data['user'] = auth.user.profile["cognito:username"] ? auth.user.profile["cognito:username"] : "Unknown";

        console.log(data);

        service.putObject(data).then(() => {
            alert("Sponsor Added Successfully!");
            form.reset();
            populate();
        }).catch(err => {
            alert("Error adding sponsor: " + err.message);
        });
    });
}

async function testAuth() {
    if (await auth.isAuthenticated() == true) {
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

async function init() {
    if (document.URL.includes("code") || document.URL.includes("state")) {
        let state = document.URL.split("state=")[1].split("&")[0];
        console.log("State: ", state);
        let code = document.URL.split("code=")[1].split("&")[0];
        console.log("Code: ", code);
        await auth.signInCallback(code, state);
        // service.s3.config.credentials = auth.creds;
        // console.log("S3 Credentials: ", service.s3.credentials);
    }

    if(await testAuth() == true) {
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

// To keep track of sort direction for each column
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("SponsorTable");
  switching = true;
  // Set the sorting direction to ascending:
  dir = "asc";
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}