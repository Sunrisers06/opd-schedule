<img id="logoImage" src="" alt="Logo" width="150" />

<script>
  const logoUrl = "https://drive.google.com/thumbnail?id=1LxB4prb5ifCjptw89yB6ofwsjhVnBvTg";
  document.getElementById("logoImage").src = logoUrl;
</script>

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSj-0A7VR5P4KJjqjtVlExWVGnldC4c0bTZ_wYpEqbwSpOcH7nCpf6wMM6YZnhlaLLQKgKUEEbHD4nG/pub?output=csv";
let allData = [];

function parseCSV(csv){
  return csv
    .trim()
    .split("\n")
    .map(line => line.split(",").map(v => v.trim().replace(/^"(.*)"$/,"$1")))
    .filter(row => row.length && row.some(cell => cell !== ""))
    .map((row, idx, arr) => {
      if(idx===0) return row; // header
      const obj = {};
      arr[0].forEach((h, i) => obj[h] = row[i] || "");
      return obj;
    })
    .slice(1); // skip header row
}

function populateFilters(){
  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const days = [...new Set(allData.map(d => d.Day))].sort((a,b)=>dayOrder.indexOf(a)-dayOrder.indexOf(b));
  const names = [...new Set(allData.map(d => d["Name of Consultant"]))].sort();
  const specs = [...new Set(allData.map(d => d.Speciality))].sort();

  document.getElementById("filterDay").innerHTML = "<option value=''>All Days</option>" + days.map(d=>`<option>${d}</option>`).join("");
  document.getElementById("filterName").innerHTML = "<option value=''>All Consultants</option>" + names.map(n=>`<option>${n}</option>`).join("");
  document.getElementById("filterSpecialty").innerHTML = "<option value=''>All Specialties</option>" + specs.map(s=>`<option>${s}</option>`).join("");
}

// Time parsing remains the same
function parseTime(timing){
  if(!timing) return 9999;
  const hhmm = timing.match(/(\d{1,2}):(\d{2})/);
  if(hhmm){
    let h = parseInt(hhmm[1]), m = parseInt(hhmm[2]);
    if(timing.toLowerCase().includes("pm") && h !== 12) h += 12;
    if(timing.toLowerCase().includes("am") && h === 12) h = 0;
    return h*60+m;
  }
  const hOnly = timing.match(/(\d{1,2})\s*(am|pm)?/i);
  if(hOnly){
    let h = parseInt(hOnly[1]);
    const ap = hOnly[2]?.toLowerCase();
    if(ap === "pm" && h !== 12) h += 12;
    if(ap === "am" && h === 12) h = 0;
    return h*60;
  }
  return 9999;
}

// Table rendering remains the same
function renderTable(){ /* same as before */ }
async function loadData(){ /* same as before */ }

// Event listeners same
["filterDay","filterName","filterSpecialty","searchBox"].forEach(id=>{
  document.getElementById(id).addEventListener("input",renderTable);
});
document.getElementById("clearFiltersBtn").addEventListener("click",()=>{
  document.getElementById("filterDay").value="";
  document.getElementById("filterName").value="";
  document.getElementById("filterSpecialty").value="";
  document.getElementById("searchBox").value="";
  renderTable();
});

loadData();
