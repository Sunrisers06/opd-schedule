const logoUrl = "https://drive.google.com/thumbnail?id=1LxB4prb5ifCjptw89yB6ofwsjhVnBvTg";
document.getElementById("logoImage").src = logoUrl;

const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSj-0A7VR5P4KJjqjtVlExWVGnldC4c0bTZ_wYpEqbwSpOcH7nCpf6wMM6YZnhlaLLQKgKUEEbHD4nG/pub?output=csv";
let allData = [];

function parseCSV(csv) {
  const rows = csv.trim().split("\n").map(r => r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = (r[i] || "").trim().replace(/^"(.*)"$/,"$1"));
    return obj;
  });
}

function populateFilters() {
  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const days = [...new Set(allData.map(d => d.Day))].sort((a,b)=>dayOrder.indexOf(a)-dayOrder.indexOf(b));
  const names = [...new Set(allData.map(d => d["Name of Consultant"]))].sort();
  const specs = [...new Set(allData.map(d => d.Speciality))].sort();

  document.getElementById("filterDay").innerHTML = "<option value=''>All Days</option>" + days.map(d=>`<option>${d}</option>`).join("");
  document.getElementById("filterName").innerHTML = "<option value=''>All Consultants</option>" + names.map(n=>`<option>${n}</option>`).join("");
  document.getElementById("filterSpecialty").innerHTML = "<option value=''>All Specialties</option>" + specs.map(s=>`<option>${s}</option>`).join("");
}

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

function renderTable() {
  const dayVal = document.getElementById("filterDay").value;
  const nameVal = document.getElementById("filterName").value;
  const specVal = document.getElementById("filterSpecialty").value;
  const searchVal = document.getElementById("searchBox").value.toLowerCase();

  const tbody = document.querySelector("#opdTable tbody");
  const noResults = document.getElementById("noResults");

  const filtered = allData.filter(d => 
    (!dayVal || d.Day === dayVal) &&
    (!nameVal || d["Name of Consultant"] === nameVal) &&
    (!specVal || d.Speciality === specVal) &&
    (!searchVal ||
      d.Day?.toLowerCase().includes(searchVal) ||
      d["Name of Consultant"]?.toLowerCase().includes(searchVal) ||
      d.Speciality?.toLowerCase().includes(searchVal) ||
      d.OPD?.toLowerCase().includes(searchVal))
  );

  if(filtered.length === 0){
    tbody.innerHTML = "";
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";

  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  filtered.sort((a,b)=>{
    const da = dayOrder.indexOf(a.Day), db = dayOrder.indexOf(b.Day);
    if(da !== db) return da-db;
    return parseTime(a.Timing)-parseTime(b.Timing);
  });

  tbody.innerHTML = filtered.map(d=>`
    <tr>
      <td><span class="pill-day">${d.Day || "—"}</span></td>
      <td>${d.OPD || "—"}</td>
      <td>${d.Timing || "—"}</td>
      <td>${d["Name of Consultant"] || "—"}</td>
      <td>${d.Mobile || "—"}</td>
      <td><span class="badge-room">${d.Room || "—"}</span></td>
      <td><span class="pill-spec">${d.Speciality || "—"}</span></td>
    </tr>`).join("");
}

async function loadData(){
  try{
    const res = await fetch(sheetUrl);
    const csv = await res.text();
    allData = parseCSV(csv);
    populateFilters();
    renderTable();
  }catch(e){
    console.error("Error loading CSV:", e);
    document.getElementById("noResults").textContent = "Error loading data.";
    document.getElementById("noResults").style.display = "block";
  }finally{
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("tableContainer").classList.remove("hidden");
  }
}

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
