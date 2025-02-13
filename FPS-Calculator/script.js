const cpuSelect = document.getElementById('cpu-select');
const gpuSelect = document.getElementById('gpu-select');
const cpuSearch = document.getElementById('cpu-search');
const gpuSearch = document.getElementById('gpu-search');
const resultsDiv = document.getElementById('results');
const fpsTableBody = document.getElementById('fps-table-body');

let cpuData = [];
let gpuData = [];
let fpsData = {};
let allGpus = []; // Store all GPUs for filtering

fetch('backend_data.json')
  .then(response => response.json())
  .then(data => {
    fpsData = data.fps_data;
    cpuData = Object.keys(data.cpus);
    allGpus = Object.keys(data.gpus); // Get all GPUs for filtering

    populateDropdown(cpuSelect, cpuData);

    if (cpuData.length > 0) {
      const firstCPU = cpuData[0];
      gpuData = allGpus.filter(gpu => fpsData[firstCPU] && fpsData[firstCPU][gpu]); // Filter GPUs
      populateDropdown(gpuSelect, gpuData);
      gpuSearch.value = "";
      filterOptions(gpuSearch, gpuSelect, gpuData);
    }
  })
  .catch(error => {
    console.error("Error fetching data:", error);
    alert("Error loading data. Please try again later.");
  });

function populateDropdown(selectElement, data) {
  selectElement.innerHTML = '';
  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.text = item;
    selectElement.appendChild(option);
  });
}

cpuSelect.addEventListener('change', () => {
  const selectedCPU = cpuSelect.value;
  if (selectedCPU && fpsData[selectedCPU]) {
    gpuData = allGpus.filter(gpu => fpsData[selectedCPU] && fpsData[selectedCPU][gpu]); // Filter GPUs
    populateDropdown(gpuSelect, gpuData);
    gpuSearch.value = "";
    filterOptions(gpuSearch, gpuSelect, gpuData);
  } else {
    gpuSelect.innerHTML = '';
  }
});

function filterOptions(searchInput, selectElement, data) {
  const filter = searchInput.value.toLowerCase();
  selectElement.innerHTML = '';
  data.filter(item => item.toLowerCase().includes(filter)).forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.text = item;
    selectElement.appendChild(option);
  });
}

cpuSearch.addEventListener('input', () => filterOptions(cpuSearch, cpuSelect, cpuData));
gpuSearch.addEventListener('input', () => filterOptions(gpuSearch, gpuSelect, gpuData));

function calculateFPS() {
  const selectedCPU = cpuSelect.value;
  const selectedGPU = gpuSelect.value;

  if (!selectedCPU || !selectedGPU) {
    alert("Please select both CPU and GPU.");
    return;
  }

  const fpsResults = fpsData[selectedCPU] && fpsData[selectedCPU][selectedGPU];

  if (!fpsResults) {
    alert("No FPS data found for the selected CPU and GPU combination.");
    resultsDiv.style.display = 'none';
    return;
  }

  fpsTableBody.innerHTML = '';
  for (const game in fpsResults) {
    const fps = fpsResults[game];
    const row = fpsTableBody.insertRow();
    const gameCell = row.insertCell();
    const fullHDCell = row.insertCell();
    const k2Cell = row.insertCell();
    const k4Cell = row.insertCell();

    gameCell.textContent = game;
    fullHDCell.innerHTML = `<span>${fps.fullhd.min}</span><span>${fps.fullhd.avg}</span><span>${fps.fullhd.max}</span>`;
    k2Cell.innerHTML = `<span>${fps["2k"].min}</span><span>${fps["2k"].avg}</span><span>${fps["2k"].max}</span>`;
    k4Cell.innerHTML = `<span>${fps["4k"].min}</span><span>${fps["4k"].avg}</span><span>${fps["4k"].max}</span>`;
  }

  resultsDiv.style.display = 'block';
}
