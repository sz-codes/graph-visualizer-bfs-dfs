// Get canvas and context
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const graphInput = document.getElementById("graphInput");
const startNodeInput = document.getElementById("startNode");
const drawGraphBtn = document.getElementById("drawGraphBtn");
const dfsBtn = document.getElementById("dfsBtn");
const bfsBtn = document.getElementById("bfsBtn");
const resetBtn = document.getElementById("resetBtn");
const traversalOutput = document.getElementById("traversalOutput");

// Graph data structure (Adjacency List)
let graph = {};
// Store node positions for drawing
let nodePositions = {};
// Store node colors for visualization
let nodeColors = {};
// Store edge colors for visualization
let edgeColors = {};
// Animation delay in milliseconds
const animationDelay = 500; // Half a second

// --- Canvas Setup and Drawing ---

// Set canvas size based on container width
const setCanvasSize = () => {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = 400; // Fixed height for now
};

// Draw the graph on the canvas
const drawGraph = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  if (Object.keys(graph).length === 0) return;

  // Calculate node positions if not already set (simple circular layout)
  if (
    Object.keys(nodePositions).length === 0 ||
    Object.keys(nodePositions).length !== Object.keys(graph).length
  ) {
    calculateNodePositions();
  }

  // Draw edges first
  ctx.lineWidth = 2;
  for (const node in graph) {
    for (const neighbor of graph[node]) {
      // Draw edge only once for undirected graph
      // Ensure both node and neighbor exist in nodePositions before drawing edge
      if (node < neighbor && nodePositions[node] && nodePositions[neighbor]) {
        const startPos = nodePositions[node];
        const endPos = nodePositions[neighbor];
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.strokeStyle =
          edgeColors[`${node}-${neighbor}`] ||
          edgeColors[`${neighbor}-${node}`] ||
          "#555";
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  const nodeRadius = 20;
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const node in nodePositions) {
    const pos = nodePositions[node];
    // Draw node circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = nodeColors[node] || "#3498db"; // Default blue
    ctx.fill();
    ctx.strokeStyle = "#2980b9";
    ctx.stroke();

    // Draw node text
    ctx.fillStyle = "#fff"; // White text
    ctx.fillText(node, pos.x, pos.y);
  }
};

// Calculate positions for nodes (circular layout)
const calculateNodePositions = () => {
  nodePositions = {};
  const nodes = Object.keys(graph);
  const numNodes = nodes.length;
  if (numNodes === 0) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.8; // 80% of the smaller dimension

  nodes.forEach((node, index) => {
    const angle = (index / numNodes) * Math.PI * 2;
    nodePositions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
};

// --- Graph Parsing ---

// Parse the input text into a graph adjacency list
const parseGraphInput = () => {
  graph = {};
  nodePositions = {}; // Reset positions on new input
  nodeColors = {}; // Reset colors
  edgeColors = {}; // Reset edge colors
  const lines = graphInput.value.trim().split("\n");
  const allNodes = new Set(); // Collect all unique nodes

  lines.forEach((line) => {
    const parts = line.split(":");
    if (parts.length === 2) {
      const node = parts[0].trim();
      const neighbors = parts[1]
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n !== "");
      graph[node] = neighbors;
      allNodes.add(node);
      neighbors.forEach((neighbor) => allNodes.add(neighbor));
    }
  });

  // Initialize colors for all collected nodes and potential edges
  allNodes.forEach((node) => {
    nodeColors[node] = "#3498db"; // Default blue
  });

  for (const node in graph) {
    for (const neighbor of graph[node]) {
      // Initialize edge color (undirected)
      const edgeKey =
        node < neighbor ? `${node}-${neighbor}` : `${neighbor}-${node}`;
      if (!edgeColors[edgeKey]) {
        edgeColors[edgeKey] = "#555"; // Default grey
      }
    }
  }
};

// --- Traversal Algorithms with Visualization ---

// Helper function for delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Depth First Search (DFS) with visualization
const dfs = async (startNode) => {
  traversalOutput.textContent = "DFS Traversal Order: ";
  const visited = new Set();
  const stack = [startNode];
  const visitedOrder = [];

  // Reset node and edge colors before traversal
  resetColors();
  drawGraph(); // Redraw with default colors

  // Check if start node exists
  if (!graph[startNode]) {
    traversalOutput.textContent = `Error: Start node "${startNode}" not found in the graph.`;
    return;
  }

  while (stack.length > 0) {
    const currentNode = stack.pop();

    if (!visited.has(currentNode)) {
      visited.add(currentNode);
      visitedOrder.push(currentNode);
      traversalOutput.textContent += currentNode + " ";

      // Visualize visiting the node
      nodeColors[currentNode] = "#e74c3c"; // Red for visiting
      drawGraph();
      await sleep(animationDelay);

      // Mark node as visited (different color)
      nodeColors[currentNode] = "#2ecc71"; // Green for visited
      drawGraph();
      await sleep(animationDelay / 2); // Shorter delay after marking visited

      // Get neighbors and sort them alphabetically for consistent traversal order
      // Ensure graph[currentNode] exists before accessing
      const neighbors = graph[currentNode]
        ? [...graph[currentNode]].sort().reverse()
        : []; // Reverse to add in alphabetical order to stack

      for (const neighbor of neighbors) {
        // Ensure neighbor exists in graph before processing
        if (graph[neighbor] || Object.keys(graph).includes(neighbor)) {
          // Check if neighbor is a key or just a listed neighbor
          if (!visited.has(neighbor)) {
            // Visualize traversing edge
            const edgeKey =
              currentNode < neighbor
                ? `${currentNode}-${neighbor}`
                : `${neighbor}-${currentNode}`;
            edgeColors[edgeKey] = "#f39c12"; // Orange for traversing edge
            drawGraph();
            await sleep(animationDelay / 2); // Delay for edge

            stack.push(neighbor);

            // Keep edge color highlighted for visited path
            edgeColors[edgeKey] = "#2ecc71"; // Green for visited path
            drawGraph();
          } else {
            // Edge to an already visited node (back edge in DFS)
            const edgeKey =
              currentNode < neighbor
                ? `${currentNode}-${neighbor}`
                : `${neighbor}-${neighbor}`;
            edgeColors[edgeKey] = "#bdc3c7"; // Grey for back edge
            drawGraph();
            await sleep(animationDelay / 2); // Delay for edge
          }
        }
      }
    }
  }
  traversalOutput.textContent += "\nDFS Traversal Complete.";
};

// Breadth First Search (BFS) with visualization
const bfs = async (startNode) => {
  traversalOutput.textContent = "BFS Traversal Order: ";
  const visited = new Set();
  const queue = [startNode];
  const visitedOrder = [];

  // Reset node and edge colors before traversal
  resetColors();
  drawGraph(); // Redraw with default colors

  // Check if start node exists
  if (!graph[startNode]) {
    traversalOutput.textContent = `Error: Start node "${startNode}" not found in the graph.`;
    return;
  }

  visited.add(startNode);
  nodeColors[startNode] = "#e74c3c"; // Red for visiting
  drawGraph();
  await sleep(animationDelay);

  nodeColors[startNode] = "#2ecc71"; // Green for visited
  drawGraph();
  await sleep(animationDelay / 2);

  visitedOrder.push(startNode);
  traversalOutput.textContent += startNode + " ";

  while (queue.length > 0) {
    const currentNode = queue.shift(); // Get the first node in the queue

    // Get neighbors and sort them alphabetically
    // Ensure graph[currentNode] exists before accessing
    const neighbors = graph[currentNode] ? [...graph[currentNode]].sort() : [];

    for (const neighbor of neighbors) {
      // Ensure neighbor exists in graph before processing
      if (graph[neighbor] || Object.keys(graph).includes(neighbor)) {
        // Check if neighbor is a key or just a listed neighbor
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          visitedOrder.push(neighbor);
          traversalOutput.textContent += neighbor + " ";

          // Visualize traversing edge
          const edgeKey =
            currentNode < neighbor
              ? `${currentNode}-${neighbor}`
              : `${neighbor}-${currentNode}`;
          edgeColors[edgeKey] = "#f39c12"; // Orange for traversing edge
          drawGraph();
          await sleep(animationDelay / 2); // Delay for edge

          // Visualize visiting the node
          nodeColors[neighbor] = "#e74c3c"; // Red for visiting
          drawGraph();
          await sleep(animationDelay);

          // Mark node as visited (different color)
          nodeColors[neighbor] = "#2ecc71"; // Green for visited
          drawGraph();
          await sleep(animationDelay / 2);

          queue.push(neighbor);

          // Keep edge color highlighted
          edgeColors[edgeKey] = "#2ecc71"; // Green for visited path
          drawGraph();
        } else {
          // Edge to an already visited node (cross edge in BFS for undirected)
          const edgeKey =
            currentNode < neighbor
              ? `${currentNode}-${neighbor}`
              : `${neighbor}-${currentNode}`;
          edgeColors[edgeKey] = "#bdc3c7"; // Grey for cross edge
          drawGraph();
          await sleep(animationDelay / 2); // Delay for edge
        }
      }
    }
  }
  traversalOutput.textContent += "\nBFS Traversal Complete.";
};

// Reset node and edge colors to default
const resetColors = () => {
  for (const node in nodeColors) {
    nodeColors[node] = "#3498db"; // Default blue
  }
  for (const edge in edgeColors) {
    edgeColors[edge] = "#555"; // Default grey
  }
};

// --- Event Listeners ---

// Draw graph when the button is clicked
drawGraphBtn.addEventListener("click", () => {
  parseGraphInput();
  drawGraph();
  traversalOutput.textContent = ""; // Clear output on new graph
});

// Run DFS when the button is clicked
dfsBtn.addEventListener("click", () => {
  const startNode = startNodeInput.value.trim();
  // Check if graph is empty or start node is invalid before running
  if (Object.keys(graph).length === 0) {
    traversalOutput.textContent = "Please draw a graph first.";
    return;
  }
  dfs(startNode);
});

// Run BFS when the button is clicked
bfsBtn.addEventListener("click", () => {
  const startNode = startNodeInput.value.trim();
  // Check if graph is empty or start node is invalid before running
  if (Object.keys(graph).length === 0) {
    traversalOutput.textContent = "Please draw a graph first.";
    return;
  }
  bfs(startNode);
});

// Reset colors and clear output
resetBtn.addEventListener("click", () => {
  resetColors();
  drawGraph();
  traversalOutput.textContent = "";
});

// Redraw graph on window resize
window.addEventListener("resize", () => {
  setCanvasSize();
  drawGraph(); // Redraw graph with current colors/state
});

// Initial setup: set canvas size and draw the default graph
setCanvasSize();
parseGraphInput(); // Parse the default example graph
drawGraph();
