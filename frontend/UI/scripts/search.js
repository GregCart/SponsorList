let fuseInstance = null;
let tableData = [];
let searchTimeout;

function buildSearchIndex() {
    const table = document.getElementById("SponsorTable");
    const rows = table.getElementsByTagName("tr");
    tableData = [];
    
  // Extract data from table rows (skip header row)
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        if (cells.length > 0) {
            tableData.push({
                rowIndex: i,
                personality: cells[0]?.textContent || "",
                sponsor: cells[1]?.textContent || "",
                platform: cells[2]?.textContent || "",
                code: cells[3]?.textContent || "",
                link: cells[4]?.textContent || "",
                post: cells[5]?.textContent || "",
                start: cells[6]?.textContent || "",
                added: cells[7]?.textContent || "",
                checked: cells[8]?.textContent || "",
                valid: cells[9]?.textContent || "",
                scam: cells[10]?.textContent || "",
                verified: cells[11]?.textContent || "",
                source: cells[12]?.textContent || ""
            });
        }
    }
    
  // Configure Fuse.js
    const options = {
        includeScore: true,
        threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
        distance: 100,
        minMatchCharLength: 1,
        keys: [
            { name: 'personality', weight: 2 }, // Higher weight = more important
            { name: 'sponsor', weight: 2 },
            { name: 'platform', weight: 1 },
            { name: 'code', weight: 1.5 },
            'link',
            'post',
            'source'
        ]
    };
    
    fuseInstance = new Fuse(tableData, options);
}

function filterTable() {
    const input = document.getElementById("search");
    const filter = input.value.trim();
    const table = document.getElementById("SponsorTable");
    const tr = table.getElementsByTagName("tr");
    const exactMatch = document.getElementById("exact").checked;
    
  // If search is empty, show all rows
    if (!filter) {
    for (let i = 1; i < tr.length; i++) {
        tr[i].style.display = "";
    }
    return;
    }

  // Hide all rows initially
    for (let i = 1; i < tr.length; i++) {
        tr[i].style.display = "none";
    }
    
    if (exactMatch) {
      // Use exact matching (your original logic)
        for (let i = 1; i < tr.length; i++) {
            const td = tr[i].getElementsByTagName("td");
            for (let j = 0; j < td.length; j++) {
                if (td[j]) {
                    const txtValue = td[j].textContent || td[j].innerText;
                    if (txtValue === filter) {
                        tr[i].style.display = "";
                        break;
                    }
                }
            }
        }
    } else {
      // Use fuzzy search
        if (!fuseInstance) {
            buildSearchIndex();
        }
        
        const results = fuseInstance.search(filter);
        
        // Show matching rows
        results.forEach(result => {
            const rowIndex = result.item.rowIndex;
            if (tr[rowIndex]) {
                tr[rowIndex].style.display = "";
            }
        });
    }
}