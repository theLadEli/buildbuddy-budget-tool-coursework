// Dougnut Wheel

let percentageNumber = 0;

const canvas = document.getElementById('doughnutWheel');
const ctx = canvas.getContext('2d');

const userScore = Math.min(percentageNumber, 100); // Replace 62 with the actual user score value, and cap it at 100
const radius = 75;
const strokeWidth = 20;

// Adjust canvas size and scale based on device pixel ratio
const dpr = window.devicePixelRatio || 1;
canvas.style.width = canvas.clientWidth + 'px';
canvas.style.height = canvas.clientHeight + 'px';
canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
ctx.scale(dpr, dpr);

const centerX = canvas.width / (2 * dpr);
const centerY = canvas.height / (2 * dpr);

function drawDoughnutWheel(percentage) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const userScore = Math.min(percentage, 100); // Replace 62 with the actual user score value, and cap it at 100


  // Draw the default wheel
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - strokeWidth / 2, 0.7 * Math.PI, 2.3 * Math.PI);
  ctx.lineCap = 'round';
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = '#F2F2F5';
  ctx.stroke();

  // Calculate the filled portion
  const startAngle = 0.7 * Math.PI;
  const endAngle = startAngle + (1.6 * Math.PI * (userScore / 100));

  // Draw the filled portion
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#6CBDC5');
  gradient.addColorStop(1, '#42848A');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - strokeWidth / 2, startAngle, endAngle);
  ctx.lineCap = 'round';
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = gradient;
  ctx.stroke();

  // Draw the user score text with gradient
  ctx.font = '700 25px Aeonik';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.save();
  ctx.translate(centerX, centerY - 15); // Adjust the vertical position of the text
  ctx.fillStyle = '#5aa5ac';
  ctx.fillText(`${userScore}%`, 0, 0);
  ctx.restore();

  // Draw the "Of estimated" text
  ctx.font = '400 12px Aeonik';
  ctx.fillStyle = '#272F3A';
  ctx.fillText('Of estimated', centerX, centerY + 12); // Adjust the vertical position of the text

  // Draw the "costs" text
  ctx.fillText('costs', centerX, centerY + 24); // Adjust the vertical position of the text
}

// Horizontal Chart

const lineChart = document.getElementById('lineChart');
const segments = [{
    color: '#4e32af',
    percentage: 45
  },
  {
    color: '#3399fd',
    percentage: 28
  },
  {
    color: '#6cbdc5',
    percentage: 15
  },
];

function drawLineChart() {
  let currentOffset = 0;

  segments.forEach((segment) => {
    const div = document.createElement('div');
    div.style.backgroundColor = segment.color;
    div.style.width = `${segment.percentage}%`;
    div.style.left = `${currentOffset}%`;
    div.classList.add('segment');
    lineChart.appendChild(div);
    currentOffset += segment.percentage;
  });

  // Calculate and add the remaining space segment
  const remainingPercentage = 100 - currentOffset;
  if (remainingPercentage > 0) {
    const div = document.createElement('div');
    div.style.backgroundColor = '#ff694e';
    div.style.width = `${remainingPercentage}%`;
    div.style.left = `${currentOffset}%`;
    div.classList.add('segment');
    lineChart.appendChild(div);
  }
}

drawLineChart();


// Shell Cost CSV to HTML Table
function csvToArray(csv) {
  const [header, ...rows] = csv.split('\n').map(row => row.split(',').map(item => item.trim()));
  return rows.map(row => header.reduce((obj, key, i) => ({
    ...obj,
    [key]: row[i]
  }), {}));
}

function formatCurrency(number) {
  return parseFloat(number).toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function updateTotalEstimatedCost() {
  const rows = document.querySelectorAll('#table-body tr');
  let totalEstimatedCost = 0;

  rows.forEach(row => {
    totalEstimatedCost += parseFloat(row.getAttribute('data-estimated-cost'));
  });

  document.getElementById('totalEstimatedCost').textContent = `£${formatCurrency(totalEstimatedCost)}`;
}

function generateTableRows(data) {
  const tbody = document.getElementById('table-body');

  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-estimated-cost', item.Estimated);

    const itemName = document.createElement('td');
    const strong = document.createElement('strong');
    strong.textContent = item.Item;
    itemName.appendChild(strong);
    tr.appendChild(itemName);

    const estimatedCost = document.createElement('td');
    estimatedCost.textContent = `£${formatCurrency(item.Estimated)}`;
    tr.appendChild(estimatedCost);

    const actualCost = document.createElement('td');
    const div = document.createElement('div');
    div.classList.add('input-container');
    const span = document.createElement('span');
    span.classList.add('currency-symbol');
    span.textContent = '£';
    div.appendChild(span);
    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('pattern', '[0-9]*');
    input.setAttribute('inputmode', 'numeric');
    div.appendChild(input);
    actualCost.appendChild(div);
    tr.appendChild(actualCost);

    tbody.appendChild(tr);
  });

  updateTotalEstimatedCost();
  updateTotalCosts();
}

async function fetchCSVandGenerateTable() {
  const response = await fetch('shell-cost.csv');
  const csv = await response.text();
  const data = csvToArray(csv);
  generateTableRows(data);
}

fetchCSVandGenerateTable();


// Shell Cost Calculator
const totalEstimatedCostDisplay = document.querySelector('tfoot td:nth-child(2)');
const totalActualCostDisplay = document.querySelector('tfoot td:nth-child(3)');
const costTable = document.getElementById('costTable');

function updateTotalCosts() {
  let totalEstimatedCost = 0;
  let totalActualCost = 0;

  const rows = costTable.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const estimatedCost = parseFloat(row.getAttribute('data-estimated-cost'));
    totalEstimatedCost += estimatedCost;

    const actualCostInput = row.querySelector('input[type="number"]');
    if (actualCostInput.value) {
      totalActualCost += parseFloat(actualCostInput.value);
    }
  });

  const formattedEstimatedCost = `£${formatCurrency(totalEstimatedCost)}`;
  const formattedActualCost = `£${formatCurrency(totalActualCost)}`;

  totalEstimatedCostDisplay.innerText = formattedEstimatedCost;
  totalActualCostDisplay.innerText = formattedActualCost;

  // Update the new elements with the latest costs
  document.getElementById('totalEstimatedCostDisplayOutside').textContent = `Estimated: ${formattedEstimatedCost}`;
  document.getElementById('totalActualCostDisplayOutside').textContent = `Actual: ${formattedActualCost}`;

  // Calculate the percentage
  const percentage = (totalActualCost / totalEstimatedCost) * 100;

  // Update the percentageNumber variable
  percentageNumber = parseFloat(percentage.toFixed(2));

  // Redraw the doughnut wheel with the updated percentage
  drawDoughnutWheel(percentageNumber);
}




costTable.addEventListener('input', (event) => {
  if (event.target.tagName === 'INPUT' && event.target.type === 'number') {
    updateTotalCosts();
  }
});

updateTotalCosts();

// Basic User Info

var projectName = "BuildBuddy's Office Extension";
var projectType = "Double Storey (Side Extension)";

document.getElementById('project-name').innerText = projectName;
document.getElementById('project-type').innerText = projectType;