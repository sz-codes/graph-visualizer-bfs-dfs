// Sample Graph Data (Adjacency List) - Now used as initial state
const initialGraph = {
  nodes: [
    { id: 0, x: 100, y: 100 },
    { id: 1, x: 250, y: 100 },
    { id: 2, x: 100, y: 250 },
    { id: 3, x: 250, y: 250 },
    { id: 4, x: 400, y: 175 },
    { id: 5, x: 550, y: 175 },
  ],
  edges: [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 1, target: 3 },
    { source: 2, target: 3 },
    { source: 3, target: 4 },
    { source: 4, target: 5 },
  ],
};

// Mutable graph data
let graph = JSON.parse(JSON.stringify(initialGraph)); // Deep copy for initial state

// DOM Elements
const svg = document.getElementById("graph-svg");
const bfsButton = document.getElementById("bfs-button");
const dfsButton = document.getElementById("dfs-button");
const resetButton = document.getElementById("reset-button");
const clearGraphButton = document.getElementById("clear-graph-button"); // New
const addNodeButton = document.getElementById("add-node-button"); // New
const addEdgeButton = document.getElementById("add-edge-button"); // New
const edgeSourceInput = document.getElementById("edge-source"); // New
const edgeTargetInput = document.getElementById("edge-target"); // New
const statusMessage = document.getElementById("status-message");
const traversalPath = document.getElementById("traversal-path");

const NODE_RADIUS = 20;
const SVG_WIDTH = 800; // Assuming fixed width from HTML
const SVG_HEIGHT = 600; // Assuming fixed height from HTML

// --- Drawing Functions ---

function drawGraph() {
  console.log("drawGraph called"); // Add log
  // Clear previous drawing
  svg.innerHTML = "";

  // Handle empty graph case
  if (!graph || !graph.edges || !graph.nodes) {
    console.warn("Graph data is missing or invalid.");
    return;
  }
  console.log("Drawing edges:", graph.edges); // Add log

  // Draw edges first (so they are behind nodes)
  graph.edges.forEach((edge) => {
    const sourceNode = graph.nodes.find((n) => n.id === edge.source);
    const targetNode = graph.nodes.find((n) => n.id === edge.target);
    if (sourceNode && targetNode) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", sourceNode.x);
      line.setAttribute("y1", sourceNode.y);
      line.setAttribute("x2", targetNode.x);
      line.setAttribute("y2", targetNode.y);
      line.setAttribute("class", "edge");
      line.setAttribute("id", `edge-${edge.source}-${edge.target}`);
      console.log(`Drawing edge: ${edge.source}-${edge.target}`); // Add log
      svg.appendChild(line);
    }
  });

  console.log("Drawing nodes:", graph.nodes); // Add log
  // Draw nodes
  graph.nodes.forEach((node) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", NODE_RADIUS);
    circle.setAttribute("class", "node");
    circle.setAttribute("id", `node-${node.id}`);
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", node.x);
    text.setAttribute("y", node.y + 5); // Adjust for vertical centering
    text.setAttribute("text-anchor", "middle");
    text.textContent = node.id;
    svg.appendChild(text);
    console.log(`Drawing node: ${node.id}`); // Add log
  });
  console.log("drawGraph finished"); // Add log
}

// --- Helper Function to get neighbors ---
function getNeighbors(nodeId) {
  const neighbors = [];
  graph.edges.forEach((edge) => {
    if (edge.source === nodeId) {
      neighbors.push(edge.target);
    } else if (edge.target === nodeId) {
      neighbors.push(edge.source);
    }
  });
  // Remove duplicates if graph is undirected and edges are listed twice
  return [...new Set(neighbors)];
}

// --- Visualization Delay ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const VISUALIZATION_DELAY = 500; // milliseconds

// --- Algorithm Implementations ---

async function runBFS(startNodeId = 0) {
  // Default start node 0
  resetVisualization();
  statusMessage.textContent = `Running BFS starting from node ${startNodeId}...`;
  traversalPath.textContent = "Traversal Path: ";
  console.log("BFS started");

  const queue = [];
  const visited = new Set();
  const path = [];

  // Start BFS
  queue.push(startNodeId);
  visited.add(startNodeId);

  let currentPathString = "";

  while (queue.length > 0) {
    const currentNodeId = queue.shift();
    path.push(currentNodeId);

    // Update path display
    currentPathString += (currentPathString ? " -> " : "") + currentNodeId;
    traversalPath.textContent = `Traversal Path: ${currentPathString}`;

    // --- Visualization: Mark current node ---
    const currentNodeElement = document.getElementById(`node-${currentNodeId}`);
    if (currentNodeElement) {
      currentNodeElement.classList.add("current");
    }
    statusMessage.textContent = `Visiting node ${currentNodeId}`;
    await delay(VISUALIZATION_DELAY);
    // --- End Visualization ---

    const neighbors = getNeighbors(currentNodeId);

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);

        // --- Visualization: Mark neighbor as visited (about to be added to queue) ---
        const neighborNodeElement = document.getElementById(
          `node-${neighborId}`
        );
        if (neighborNodeElement) {
          neighborNodeElement.classList.add("visited"); // Mark as visited when added to queue
        }
        statusMessage.textContent = `Adding neighbor ${neighborId} to queue`;
        await delay(VISUALIZATION_DELAY / 2); // Shorter delay for queue add
        // --- End Visualization ---
      }
    }

    // --- Visualization: Mark current node as fully processed (visited) ---
    if (currentNodeElement) {
      currentNodeElement.classList.remove("current");
      currentNodeElement.classList.add("visited");
    }
    // --- End Visualization ---
  }

  statusMessage.textContent = "BFS Complete!";
  console.log("BFS finished", path);
}

async function runDFS(startNodeId = 0) {
  resetVisualization();
  statusMessage.textContent = `Running DFS starting from node ${startNodeId}...`;
  traversalPath.textContent = "Traversal Path: ";
  console.log("DFS started");

  const visited = new Set();
  const path = [];
  let currentPathString = "";

  // Helper recursive function for DFS
  async function dfsVisit(nodeId) {
    visited.add(nodeId);
    path.push(nodeId);

    // Update path display
    currentPathString += (currentPathString ? " -> " : "") + nodeId;
    traversalPath.textContent = `Traversal Path: ${currentPathString}`;

    // --- Visualization: Mark current node ---
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
      nodeElement.classList.add("current");
    }
    statusMessage.textContent = `Visiting node ${nodeId}`;
    await delay(VISUALIZATION_DELAY);
    // --- End Visualization ---

    const neighbors = getNeighbors(nodeId);
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        // --- Visualization: Mark edge being traversed (optional) ---
        // You could highlight the edge here if desired
        // await delay(VISUALIZATION_DELAY / 2);
        // --- End Visualization ---

        await dfsVisit(neighborId); // Recursive call
      }
    }

    // --- Visualization: Mark node as fully processed (visited) ---
    if (nodeElement) {
      nodeElement.classList.remove("current");
      nodeElement.classList.add("visited");
    }
    statusMessage.textContent = `Finished visiting node ${nodeId}`;
    await delay(VISUALIZATION_DELAY / 2);
    // --- End Visualization ---
  }

  // Start DFS from the initial node
  await dfsVisit(startNodeId);

  statusMessage.textContent = "DFS Complete!";
  console.log("DFS finished", path);
}

// --- Graph Modification Functions ---

function clearGraph() {
  graph.nodes = [];
  graph.edges = [];
  resetVisualization(); // Clear highlights
  drawGraph(); // Redraw empty graph
  statusMessage.textContent = "Graph cleared. Add nodes and edges.";
  traversalPath.textContent = "Traversal Path: ";
}

function addNode() {
  const newNodeId =
    graph.nodes.length > 0 ? Math.max(...graph.nodes.map((n) => n.id)) + 1 : 0;
  // Basic positioning - place randomly within bounds, avoiding edges
  const padding = NODE_RADIUS * 2;
  const randomX = Math.random() * (SVG_WIDTH - padding * 2) + padding;
  const randomY = Math.random() * (SVG_HEIGHT - padding * 2) + padding;

  graph.nodes.push({ id: newNodeId, x: randomX, y: randomY });
  drawGraph(); // Redraw with the new node
  statusMessage.textContent = `Added node ${newNodeId}.`;
}

function addEdge() {
  const sourceId = parseInt(edgeSourceInput.value, 10);
  const targetId = parseInt(edgeTargetInput.value, 10);

  if (isNaN(sourceId) || isNaN(targetId)) {
    statusMessage.textContent = "Invalid node ID for edge.";
    return;
  }

  // Check if nodes exist
  const sourceExists = graph.nodes.some((n) => n.id === sourceId);
  const targetExists = graph.nodes.some((n) => n.id === targetId);

  if (!sourceExists || !targetExists) {
    statusMessage.textContent = "One or both nodes for the edge do not exist.";
    return;
  }

  // Check if edge already exists (simple check, doesn't handle duplicates in both directions for undirected)
  const edgeExists = graph.edges.some(
    (e) =>
      (e.source === sourceId && e.target === targetId) ||
      (e.source === targetId && e.target === sourceId)
  );

  if (edgeExists) {
    statusMessage.textContent = `Edge between ${sourceId} and ${targetId} already exists.`;
    return;
  }
  if (sourceId === targetId) {
    statusMessage.textContent = `Cannot add edge from node to itself.`;
    return;
  }

  graph.edges.push({ source: sourceId, target: targetId });
  drawGraph(); // Redraw with the new edge
  statusMessage.textContent = `Added edge between ${sourceId} and ${targetId}.`;
  edgeSourceInput.value = ""; // Clear inputs
  edgeTargetInput.value = "";
}

// --- Reset Functions ---

function resetVisualization() {
  graph.nodes.forEach((node) => {
    const nodeElement = document.getElementById(`node-${node.id}`);
    if (nodeElement) {
      nodeElement.classList.remove("visited", "current");
    }
  });
  statusMessage.textContent = "Select an algorithm and click Run.";
  traversalPath.textContent = "Traversal Path: ";
}

function resetGraph() {
  graph = JSON.parse(JSON.stringify(initialGraph)); // Reset to initial state
  resetVisualization();
  drawGraph();
  statusMessage.textContent = "Graph reset to initial state.";
  traversalPath.textContent = "Traversal Path: ";
}

// --- Event Listeners ---
bfsButton.addEventListener("click", () => runBFS()); // Use default start node 0 for now
dfsButton.addEventListener("click", () => runDFS()); // Call the implemented DFS
resetButton.addEventListener("click", resetGraph);
clearGraphButton.addEventListener("click", clearGraph); // New
addNodeButton.addEventListener("click", addNode); // New
addEdgeButton.addEventListener("click", addEdge); // New

// --- Initial Setup ---
console.log("Initial setup: Calling drawGraph"); // Add log
drawGraph(); // Draw the graph initially
