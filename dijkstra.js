//Dijkstra's algorithm solver

for (let form of document.forms) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
    });
}

var svg = document.getElementById('shortestPathSvg'),
    gedge = document.getElementById('gedge'),
    gvertex = document.getElementById('gvertex'),
    saveButton = document.getElementById('savesvgbutton'),
    clearCanvasButton = document.getElementById('clearCanvasButton'),
    removeVertexButton = document.getElementById('removeVertexButton'),
    removeEdgeButton = document.getElementById('removeEdgeButton'),
    svgns = "http://www.w3.org/2000/svg",
    isDrawingEdge = false,
    edgeVertex1 = null,
    edgeVertex2 = null,
    vertices = document.getElementsByTagName("circle"),
    edges = document.getElementsByTagName("line"),
    texts = document.getElementsByTagName("text"),
    nextLabelCode = 65, //65='A' ,  97='a'
    activeButtonMode = null;


var markedVertices = [],
    table = document.getElementById("dijkstraSteps");



const vertexRadius = 20,
    vertexLabelSize = "16pt",
    vertexColor = "white",
    vertexBorderColor = "black",
    startVertexColor = "magenta",
    endVertexColor = "red",
    shortestPathVertexColor = "#22c55e",
    shortestPathEdgeColor = "#f59e0b",
    shortestPathEdgeWidth = 10,
    markedVertexColor = "blue",
    markedEdgeColor = "cyan",
    vertexLabelColor = "black",
    edgeColor = "darkgrey",
    edgeWidth = 6,
    edgeLabelColor = "black",
    edgeLabelSize = "20pt",
    INF = 100000;


svg.onmousedown = mouseClick;
saveButton.onmousedown = saveSvgFile;
clearCanvasButton.onclick = clearCanvas;
removeVertexButton.onclick = function () { activateButtonMode("removeVertex"); };
removeEdgeButton.onclick = function () { activateButtonMode("removeEdge"); };

for (let radio of document.getElementsByName("radWorkMode")) {
    radio.addEventListener("change", clearActiveButtonMode);
}
//gedge.onmousedown = mouseClick;
//gvertex.onmousedown = mouseClick;


function mouseClick(e) {

    var radWorkMode = document.getElementsByName("radWorkMode"),
        workMode = null,
        clickTarget = null;

    if (activeButtonMode) {
        workMode = activeButtonMode;
    }
    else {
        for (var i = 0; i < radWorkMode.length; i++)
            if (radWorkMode[i].checked) {
                workMode = radWorkMode[i].value;
                break;
            }
    }

    if (e.target.nodeName == "text")
        clickTarget = e.target.under;
    else
        clickTarget = e.target;


    switch (workMode) {
        case "drawVertex":
            if (clickTarget == svg) {
                drawVertex(e.clientX, e.clientY);
            }
            break;

        case "drawEdge":
            if (clickTarget.nodeName == "circle") {
                if (!isDrawingEdge) {
                    edgeVertex1 = clickTarget;
                    isDrawingEdge = true;
                }
                else if (clickTarget != edgeVertex1) { //edge cannot be from a vertex to itself
                    edgeVertex2 = clickTarget;
                    drawEdge(edgeVertex1, edgeVertex2);
                    edgeVertex1 = null;
                    edgeVertex2 = null;
                    isDrawingEdge = false;
                }
            }
            break;

        case "removeVertex":
            if (clickTarget.nodeName == "circle") {
                delVertex(clickTarget);
                clearActiveButtonMode();
            }
            break;

        case "removeEdge":
            if (clickTarget.nodeName == "line") {
                delEdge(clickTarget);
                clearActiveButtonMode();
            }
            break;

        case "setCostLabel":
            if (clickTarget.nodeName == "circle") {
                var vertex = clickTarget;
                showDialogVertexLabel(vertex);
            }

            if (clickTarget.nodeName == "line") {
                var edge = clickTarget;
                showDialogEdgeCost(edge);
            }
            break;

        case "setStart":
            if (clickTarget.nodeName == "circle") {
                setVertexNeighbors();
                var startTarget = clickTarget;
                startTarget.isSource = true;
                setStartVertex(startTarget);
            }
            break;
        
        case "setEnd":
            if (clickTarget.nodeName == "circle") {
                setEndVertex(clickTarget);
            }
            break;

    }

}

function calculateShortPath(){
    if (!startVertex) {
        alert("Please set a Start vertex before running the algorithm.");
        return;
    }

    if (!endVertex) {
        alert("Please set an End vertex before running the algorithm.");
        return;
    }

    dijkstra(startVertex, endVertex); // Pass both start and end vertices
}

function drawVertex(px, py) {

    px = px - svg.getBoundingClientRect().left;
    py = py - svg.getBoundingClientRect().top;

    var vertex = document.createElementNS(svgns, "circle");
    vertex.setAttributeNS(null, "cx", px);
    vertex.setAttributeNS(null, "cy", py);
    vertex.setAttributeNS(null, "r", vertexRadius);
    vertex.setAttributeNS(null, "fill", vertexColor);
    vertex.setAttributeNS(null, "stroke", vertexBorderColor);
    vertex.style["cursor"] = "pointer";
     

    gvertex.appendChild(vertex);

    
    vertex.label = String.fromCharCode(nextLabelCode++);
    vertex.labelText = document.createElementNS(svgns, "text");
    vertex.labelText.setAttribute("x", vertex.cx.baseVal.value);
    vertex.labelText.setAttribute("y", vertex.cy.baseVal.value);
    vertex.labelText.setAttribute("text-anchor", "middle");
    vertex.labelText.setAttribute("alignment-baseline", "central");
    vertex.labelText.setAttribute("font-size", vertexLabelSize);
    vertex.labelText.setAttribute("fill", vertexLabelColor);
    vertex.labelText.textContent = vertex.label;
    vertex.labelText.under = vertex;
    vertex.labelText.boundTo = "vertex";
    vertex.labelText.style["cursor"] = "pointer";
    gvertex.appendChild(vertex.labelText);


    vertex.edges = [];
    vertex.neighbors = [];
    vertex.isSource = false;
    vertex.cost = 0;
    vertex.previous = -1;
}

function drawEdge(vertex1, vertex2) {
    var x1 = vertex1.getAttributeNS(null, "cx"),
        y1 = vertex1.getAttributeNS(null, "cy"),
        x2 = vertex2.getAttributeNS(null, "cx"),
        y2 = vertex2.getAttributeNS(null, "cy"),
        edgeExists = false;

    //check if a previous edge exists between the same vertices
    for (var i = 0; i < edges.length; i++) {
        if (edges[i].x1.baseVal.value == parseInt(x1) && edges[i].x2.baseVal.value == parseInt(x2) &&
            edges[i].y1.baseVal.value == parseInt(y1) && edges[i].y2.baseVal.value == parseInt(y2)) {
            edgeExists = true;
            break;
        }
    }
    if (edgeExists) {
        alert("Edge Exists!")
    }
    else {

        var edge = document.createElementNS(svgns, "line");
        edge.setAttributeNS(null, "x1", x1);
        edge.setAttributeNS(null, "x2", x2);
        edge.setAttributeNS(null, "y1", y1);
        edge.setAttributeNS(null, "y2", y2);
        edge.setAttributeNS(null, "stroke", edgeColor);
        edge.setAttributeNS(null, "stroke-width", edgeWidth);
        gedge.appendChild(edge);

        edge.fromVertex = vertex1;
        edge.toVertex = vertex2;

        edge.cost = 1;
        edge.costText = document.createElementNS(svgns, "text");
        edge.costText.setAttribute("x", 0.5 * (edge.x1.baseVal.value + edge.x2.baseVal.value));
        edge.costText.setAttribute("y", 0.5 * (edge.y1.baseVal.value + edge.y2.baseVal.value));
        edge.costText.setAttribute("text-anchor", "middle");
        edge.costText.setAttribute("alignment-baseline", "central");
        edge.costText.setAttribute("font-size", edgeLabelSize);
        edge.costText.setAttribute("fill", edgeLabelColor);
        edge.costText.textContent = edge.cost;
        edge.costText.under = edge;
        edge.costText.boundTo = "edge";
        edge.style["cursor"] = "pointer";
        edge.costText.style["cursor"] = "pointer";

        gedge.appendChild(edge.costText);
        vertex1.edges.push(edge);
        vertex2.edges.push(edge);
    }

}

function setEdgeCost(edge, cost) {
    edge.cost = cost;
    edge.costText.textContent = edge.cost;
}


function setVertexLabel(vertex, label) {
    vertex.label = label;
    vertex.labelText.textContent = vertex.label;
}

function delVertex(vertex) {
    resetShortestPathHighlight();

    while (vertex.edges.length > 0)
        delEdge(vertex.edges[0]);

    if (vertex === startVertex) startVertex = null;
    if (vertex === endVertex) endVertex = null;

    if (vertex.labelText && vertex.labelText.parentNode)
        gvertex.removeChild(vertex.labelText);

    if (vertex.parentNode)
        gvertex.removeChild(vertex);

    clearShortestPathResult();
}

function delEdge(edge) {
    resetShortestPathHighlight();
    //delete edge.fromVertex.edges;
    for (var i = 0; i < edge.fromVertex.edges.length; i++)
        if (edge.fromVertex.edges[i] == edge) {
            edge.fromVertex.edges.splice(i, 1);
            break;
        }

    //delete edge.toVertex.edges
    for (var i = 0; i < edge.toVertex.edges.length; i++)
        if (edge.toVertex.edges[i] == edge) {
            edge.toVertex.edges.splice(i, 1);
            break;
        }
    if (edge.costText && edge.costText.parentNode)
        gedge.removeChild(edge.costText);

    if (edge.parentNode)
        gedge.removeChild(edge);

    clearShortestPathResult();
}



function setVertexNeighbors() {
    for (var i = 0; i < vertices.length; i++) {
        vertices[i].neighbors = [];
        for (var j = 0; j < vertices[i].edges.length; j++) {
            if (vertices[i].edges[j].fromVertex == vertices[i])
                vertices[i].neighbors.push(vertices[i].edges[j].toVertex);
            else
                vertices[i].neighbors.push(vertices[i].edges[j].fromVertex);
        }
    }

}


function redraw() {
    for (var i = 0; k < edges.length; i++)
        svg.appendChild(edges[i]);

    for (var j = 0; k < vertices.length; j++)
        svg.appendChild(vertices[j]);

    for (var k = 0; k < texts.length; k++)
        svg.appendChild(texts[k]);

}


function clearGraph() {
    clearCanvas();
}

function clearCanvas() {
    resetShortestPathHighlight();

    while (gedge.lastChild)
        gedge.removeChild(gedge.lastChild);

    while (gvertex.lastChild)
        gvertex.removeChild(gvertex.lastChild);

    startVertex = null;
    endVertex = null;
    edgeVertex1 = null;
    edgeVertex2 = null;
    isDrawingEdge = false;
    markedVertices = [];
    nextLabelCode = 65;

    clearActiveButtonMode();
    clearShortestPathResult();
}

function clearShortestPathResult() {
    var resultDiv = document.getElementById("shortestPathResult");
    if (resultDiv)
        resultDiv.innerHTML = "";
}

function activateButtonMode(mode) {
    activeButtonMode = mode;
    removeVertexButton.classList.toggle("activeAction", mode === "removeVertex");
    removeEdgeButton.classList.toggle("activeAction", mode === "removeEdge");
}

function clearActiveButtonMode() {
    activeButtonMode = null;
    removeVertexButton.classList.remove("activeAction");
    removeEdgeButton.classList.remove("activeAction");
}
var startVertex = null; // To store the start vertex
function setStartVertex(vertex) {
    resetShortestPathHighlight();

    if (startVertex && startVertex !== endVertex) {
        startVertex.setAttribute("fill", vertexColor);
    }

    startVertex = vertex;
    vertex.setAttribute("fill", startVertexColor);
}

var endVertex = null; // To store the end vertex
function setEndVertex(vertex) {
    resetShortestPathHighlight();

    if (endVertex && endVertex !== startVertex) {
        endVertex.setAttribute("fill", vertexColor);
    }

    endVertex = vertex;
    vertex.setAttribute("fill", endVertexColor);
}

function resetShortestPathHighlight() {
    for (let edge of edges) {
        edge.setAttribute("stroke", edgeColor);
        edge.setAttribute("stroke-width", edgeWidth);
    }

    for (let vertex of vertices) {
        vertex.setAttribute("fill", vertexColor);
    }

    if (startVertex) startVertex.setAttribute("fill", startVertexColor);
    if (endVertex) endVertex.setAttribute("fill", endVertexColor);
}

function getEdgeBetweenVertices(vertex1, vertex2) {
    return vertex1.edges.find(edge =>
        (edge.fromVertex === vertex1 && edge.toVertex === vertex2) ||
        (edge.fromVertex === vertex2 && edge.toVertex === vertex1)
    );
}

function highlightShortestPath(pathVertices) {
    resetShortestPathHighlight();

    for (let i = 0; i < pathVertices.length; i++) {
        const vertex = pathVertices[i];

        if (vertex !== startVertex && vertex !== endVertex) {
            vertex.setAttribute("fill", shortestPathVertexColor);
        }

        if (i < pathVertices.length - 1) {
            const edge = getEdgeBetweenVertices(pathVertices[i], pathVertices[i + 1]);
            if (edge) {
                edge.setAttribute("stroke", shortestPathEdgeColor);
                edge.setAttribute("stroke-width", shortestPathEdgeWidth);
                gedge.appendChild(edge);
                gedge.appendChild(edge.costText);
            }
        }
    }

    if (startVertex) startVertex.setAttribute("fill", startVertexColor);
    if (endVertex) endVertex.setAttribute("fill", endVertexColor);
}
function dijkstra(source, destination) {
    clearActiveButtonMode();
    resetShortestPathHighlight();

    const t0 = performance.now();

    // Initialization
    for (let vertex of vertices) {
        vertex.cost = INF;
        vertex.previous = null;
        vertex.marked = false;
    }

    source.cost = 0;
    

    let unvisited = Array.from(vertices);

    while (unvisited.length > 0) {
        // Find the unvisited vertex with the smallest cost
        let current = unvisited.reduce((min, vertex) =>
            vertex.cost < min.cost ? vertex : min
        );

        if (current === destination) break; // Stop if we reach the destination

        // Relax edges
        for (let edge of current.edges) {
            let neighbor =
                edge.fromVertex === current ? edge.toVertex : edge.fromVertex;

            if (!neighbor.marked) {
                let newCost = current.cost + edge.cost;
                if (newCost < neighbor.cost) {
                    neighbor.cost = newCost;
                    neighbor.previous = current;
                }
            }
        }

        current.marked = true;
        unvisited = unvisited.filter(v => !v.marked);
    }

    const algorithmMs = performance.now() - t0;

    displayShortestPath(source, destination, algorithmMs); // Show and highlight the final path
}
function displayShortestPath(source, destination, algorithmMs) {
    let resultDiv = document.getElementById("shortestPathResult");
    resultDiv.innerHTML = ""; // Clear previous results

    const V = vertices.length;
    const E = edges.length;
    const perfHtml = graphAlgorithmPerf.performanceComparisonHtml({
        V: V,
        E: E,
        algorithmMs: algorithmMs,
        manualSeconds: graphAlgorithmPerf.estimateDijkstraSeconds(V, E),
        formulaKey: "dijkstra"
    });

    if (destination.cost === INF) {
        resetShortestPathHighlight();
        resultDiv.innerHTML = "<p>No path found.</p>" + perfHtml;
        return;
    }

    let pathVertices = [];
    let current = destination;
    let totalCost = destination.cost;

    while (current) {
        pathVertices.unshift(current); // Build the path in reverse
        current = current.previous;
    }

    const pathLabels = pathVertices.map(vertex => vertex.label);

    if (pathVertices.length > 1 && pathVertices[0] === source) {
        highlightShortestPath(pathVertices);

        resultDiv.innerHTML = `
            <h2>Shortest Path</h2>
            <p><strong>Start Node:</strong> ${pathLabels[0]}</p>
            <p><strong>End Node:</strong> ${pathLabels[pathLabels.length - 1]}</p>
            <p><strong>Path:</strong> ${pathLabels.join(" → ")}</p>
            <p><strong>Total Cost:</strong> ${totalCost}</p>
            <p class="pathLegend">Highlighted on the graph: orange edges are the shortest path.</p>
        ` + perfHtml;
    } else {
        resetShortestPathHighlight();
        resultDiv.innerHTML = "<p>No path found.</p>" + perfHtml;
    }
}
//File save from
function saveSvgFile() {
    var s = new XMLSerializer();
    content = s.serializeToString(svg);
    downloadFile("dijkstra.svg", content);
}

//Credit
//http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
function downloadFile(filename, content) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}


//Modal

// Credit: https://www.w3schools.com/howto/howto_css_modals.asp 

var dialogEdgeCost = document.getElementById('divEdgeCost');
var dialogVertexLabel = document.getElementById('divVertexLabel');


function showDialogEdgeCost(edge) {
    var inputEdgeCost = document.getElementById("inputEdgeCost");
    var btnSetEdgeCost = document.getElementById("btnSetEdgeCost");

    inputEdgeCost.value = edge.cost;
    dialogEdgeCost.style.display = "block";
    setTimeout(function () {
        dialogEdgeCost.querySelector("input").select();
        dialogEdgeCost.querySelector("input").focus();
    }, 0);

    btnSetEdgeCost.onclick = function () {
        dialogEdgeCost.style.display = "none";
        var cost = parseInt(inputEdgeCost.value);
        if (cost)
            setEdgeCost(edge, cost);
    }
}

function closeDialogEdgeCost() {
    dialogEdgeCost.style.display = "none";
}

function showDialogVertexLabel(vertex) {
    var inputVertexLabel = document.getElementById("inputVertexLabel");
    var btnSetVertexLabel = document.getElementById("btnSetVertexLabel");

    inputVertexLabel.value = vertex.label;
    dialogVertexLabel.style.display = "block";
    setTimeout(function () {
        dialogVertexLabel.querySelector("input").select();
        dialogVertexLabel.querySelector("input").focus();
    }, 0);


    btnSetVertexLabel.onclick = function () {
        dialogVertexLabel.style.display = "none";
        var label = inputVertexLabel.value;
        if (label)
            setVertexLabel(vertex, label);
    }
}

function closeDialogVertexLabel() {
    dialogVertexLabel.style.display = "none";
}
