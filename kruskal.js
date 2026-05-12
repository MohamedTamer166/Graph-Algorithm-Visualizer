for (let form of document.forms) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
    });
}

var svg = document.getElementById("mstSvg"),
    gedge = document.getElementById("gedge"),
    gvertex = document.getElementById("gvertex"),
    saveButton = document.getElementById("savesvgbutton"),
    clearCanvasButton = document.getElementById("clearCanvasButton"),
    removeVertexButton = document.getElementById("removeVertexButton"),
    removeEdgeButton = document.getElementById("removeEdgeButton"),
    svgns = "http://www.w3.org/2000/svg",
    isDrawingEdge = false,
    edgeVertex1 = null,
    edgeVertex2 = null,
    vertices = document.getElementsByTagName("circle"),
    edges = document.getElementsByTagName("line"),
    nextLabelCode = 65,
    activeButtonMode = null;

const vertexRadius = 20,
    vertexLabelSize = "16pt",
    vertexColor = "white",
    vertexBorderColor = "black",
    mstEdgeColor = "#f59e0b",
    mstEdgeWidth = 10,
    edgeColor = "darkgrey",
    edgeWidth = 6,
    vertexLabelColor = "black",
    edgeLabelColor = "black",
    edgeLabelSize = "20pt";

svg.onmousedown = mouseClick;
saveButton.onmousedown = saveSvgFile;
clearCanvasButton.onclick = clearCanvas;
removeVertexButton.onclick = function () { activateButtonMode("removeVertex"); };
removeEdgeButton.onclick = function () { activateButtonMode("removeEdge"); };

for (let radio of document.getElementsByName("radWorkMode")) {
    radio.addEventListener("change", clearActiveButtonMode);
}

function mouseClick(e) {
    var radWorkMode = document.getElementsByName("radWorkMode"),
        workMode = null,
        clickTarget = null;

    if (activeButtonMode) {
        workMode = activeButtonMode;
    } else {
        for (var i = 0; i < radWorkMode.length; i++) {
            if (radWorkMode[i].checked) {
                workMode = radWorkMode[i].value;
                break;
            }
        }
    }

    if (e.target.nodeName === "text") clickTarget = e.target.under;
    else clickTarget = e.target;

    switch (workMode) {
        case "drawVertex":
            if (clickTarget === svg) drawVertex(e.clientX, e.clientY);
            break;
        case "drawEdge":
            if (clickTarget.nodeName === "circle") {
                if (!isDrawingEdge) {
                    edgeVertex1 = clickTarget;
                    isDrawingEdge = true;
                } else if (clickTarget !== edgeVertex1) {
                    edgeVertex2 = clickTarget;
                    drawEdge(edgeVertex1, edgeVertex2);
                    edgeVertex1 = null;
                    edgeVertex2 = null;
                    isDrawingEdge = false;
                }
            }
            break;
        case "removeVertex":
            if (clickTarget.nodeName === "circle") {
                delVertex(clickTarget);
                clearActiveButtonMode();
            }
            break;
        case "removeEdge":
            if (clickTarget.nodeName === "line") {
                delEdge(clickTarget);
                clearActiveButtonMode();
            }
            break;
        case "setCostLabel":
            if (clickTarget.nodeName === "circle") showDialogVertexLabel(clickTarget);
            if (clickTarget.nodeName === "line") showDialogEdgeCost(clickTarget);
            break;
    }
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
    vertex.style.cursor = "pointer";
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
    vertex.labelText.style.cursor = "pointer";
    gvertex.appendChild(vertex.labelText);

    vertex.edges = [];
}

function drawEdge(vertex1, vertex2) {
    var x1 = vertex1.getAttributeNS(null, "cx"),
        y1 = vertex1.getAttributeNS(null, "cy"),
        x2 = vertex2.getAttributeNS(null, "cx"),
        y2 = vertex2.getAttributeNS(null, "cy");

    var edgeExists = Array.from(edges).some(function (edge) {
        var sameDirection = edge.x1.baseVal.value === parseInt(x1, 10) &&
            edge.y1.baseVal.value === parseInt(y1, 10) &&
            edge.x2.baseVal.value === parseInt(x2, 10) &&
            edge.y2.baseVal.value === parseInt(y2, 10);
        var reverseDirection = edge.x1.baseVal.value === parseInt(x2, 10) &&
            edge.y1.baseVal.value === parseInt(y2, 10) &&
            edge.x2.baseVal.value === parseInt(x1, 10) &&
            edge.y2.baseVal.value === parseInt(y1, 10);
        return sameDirection || reverseDirection;
    });

    if (edgeExists) {
        alert("Edge already exists between these vertices.");
        return;
    }

    var edge = document.createElementNS(svgns, "line");
    edge.setAttributeNS(null, "x1", x1);
    edge.setAttributeNS(null, "x2", x2);
    edge.setAttributeNS(null, "y1", y1);
    edge.setAttributeNS(null, "y2", y2);
    edge.setAttributeNS(null, "stroke", edgeColor);
    edge.setAttributeNS(null, "stroke-width", edgeWidth);
    edge.style.cursor = "pointer";
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
    edge.costText.style.cursor = "pointer";
    gedge.appendChild(edge.costText);

    vertex1.edges.push(edge);
    vertex2.edges.push(edge);
}

function setEdgeCost(edge, cost) {
    if (!Number.isFinite(cost) || cost <= 0) {
        alert("Edge weight must be a positive number.");
        return false;
    }
    edge.cost = cost;
    edge.costText.textContent = edge.cost;
    return true;
}

function setVertexLabel(vertex, label) {
    vertex.label = label;
    vertex.labelText.textContent = vertex.label;
}

function delVertex(vertex) {
    resetMstHighlight();
    while (vertex.edges.length > 0) delEdge(vertex.edges[0]);
    if (vertex.labelText && vertex.labelText.parentNode) gvertex.removeChild(vertex.labelText);
    if (vertex.parentNode) gvertex.removeChild(vertex);
    clearMstResult();
}

function delEdge(edge) {
    resetMstHighlight();
    removeEdgeFromVertex(edge.fromVertex, edge);
    removeEdgeFromVertex(edge.toVertex, edge);
    if (edge.costText && edge.costText.parentNode) gedge.removeChild(edge.costText);
    if (edge.parentNode) gedge.removeChild(edge);
    clearMstResult();
}

function removeEdgeFromVertex(vertex, edge) {
    for (var i = 0; i < vertex.edges.length; i++) {
        if (vertex.edges[i] === edge) {
            vertex.edges.splice(i, 1);
            break;
        }
    }
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

function resetMstHighlight() {
    for (let edge of edges) {
        edge.setAttribute("stroke", edgeColor);
        edge.setAttribute("stroke-width", edgeWidth);
    }
    for (let vertex of vertices) {
        vertex.setAttribute("fill", vertexColor);
    }
}

function clearMstResult() {
    var result = document.getElementById("mstResult");
    if (result) result.innerHTML = "";
}

class DisjointSet {
    constructor(items) {
        this.parent = new Map();
        this.rank = new Map();
        items.forEach(item => {
            this.parent.set(item, item);
            this.rank.set(item, 0);
        });
    }
    find(item) {
        if (this.parent.get(item) !== item) {
            this.parent.set(item, this.find(this.parent.get(item)));
        }
        return this.parent.get(item);
    }
    union(a, b) {
        let rootA = this.find(a);
        let rootB = this.find(b);
        if (rootA === rootB) return false;
        let rankA = this.rank.get(rootA);
        let rankB = this.rank.get(rootB);
        if (rankA < rankB) {
            this.parent.set(rootA, rootB);
        } else if (rankA > rankB) {
            this.parent.set(rootB, rootA);
        } else {
            this.parent.set(rootB, rootA);
            this.rank.set(rootA, rankA + 1);
        }
        return true;
    }
}

function calculateKruskalMst() {
    clearActiveButtonMode();
    resetMstHighlight();
    clearMstResult();

    if (vertices.length === 0) {
        alert("Please add at least one vertex.");
        return;
    }

    const allEdges = Array.from(edges).map(edge => ({
        edge: edge,
        from: edge.fromVertex,
        to: edge.toVertex,
        weight: edge.cost
    }));

    const t0 = performance.now();

    allEdges.sort((a, b) => a.weight - b.weight);

    const dsu = new DisjointSet(Array.from(vertices));
    const mstEdges = [];
    const processedSteps = [];
    let totalCost = 0;

    for (const item of allEdges) {
        const selected = dsu.union(item.from, item.to);
        if (selected) {
            mstEdges.push(item.edge);
            totalCost += item.weight;
        }
        processedSteps.push({
            from: item.from.label,
            to: item.to.label,
            weight: item.weight,
            selected: selected
        });

        if (mstEdges.length === vertices.length - 1) break;
    }

    const algorithmMs = performance.now() - t0;

    if (mstEdges.length !== vertices.length - 1) {
        displayDisconnectedMessage(processedSteps, algorithmMs);
        return;
    }

    highlightMstEdges(mstEdges);
    displayKruskalResult(totalCost, processedSteps, algorithmMs);
}

function highlightMstEdges(mstEdges) {
    for (let edge of mstEdges) {
        edge.setAttribute("stroke", mstEdgeColor);
        edge.setAttribute("stroke-width", mstEdgeWidth);
        gedge.appendChild(edge);
        gedge.appendChild(edge.costText);
    }
}

function displayDisconnectedMessage(steps, algorithmMs) {
    var result = document.getElementById("mstResult");
    var V = vertices.length;
    var E = edges.length;
    var perfHtml = graphAlgorithmPerf.performanceComparisonHtml({
        V: V,
        E: E,
        algorithmMs: algorithmMs,
        manualSeconds: graphAlgorithmPerf.estimateKruskalSeconds(E),
        formulaKey: "kruskal"
    });
    result.innerHTML = "" +
        "<p class='warningText'>Graph is disconnected - MST not possible</p>" +
        "<h3>Processed Edges (sorted by weight)</h3>" +
        "<ul>" + renderStepItems(steps) + "</ul>" +
        perfHtml;
}

function displayKruskalResult(totalCost, steps, algorithmMs) {
    var result = document.getElementById("mstResult");
    var V = vertices.length;
    var E = edges.length;
    var perfHtml = graphAlgorithmPerf.performanceComparisonHtml({
        V: V,
        E: E,
        algorithmMs: algorithmMs,
        manualSeconds: graphAlgorithmPerf.estimateKruskalSeconds(E),
        formulaKey: "kruskal"
    });
    result.innerHTML = "" +
        "<h2>Kruskal's MST Result</h2>" +
        "<p><strong>Total MST Cost:</strong> " + totalCost + "</p>" +
        "<p class='pathLegend'>Highlighted on the graph: orange edges are in the MST.</p>" +
        "<h3>Edges (sorted by weight)</h3>" +
        "<ul>" + renderStepItems(steps) + "</ul>" +
        perfHtml;
}

function renderStepItems(steps) {
    return steps.map(function (step) {
        const status = step.selected ? "selected" : "skipped";
        return "<li>" + step.from + " - " + step.to + " (w=" + step.weight + ") -> " + status + "</li>";
    }).join("");
}

function clearCanvas() {
    resetMstHighlight();
    while (gedge.lastChild) gedge.removeChild(gedge.lastChild);
    while (gvertex.lastChild) gvertex.removeChild(gvertex.lastChild);
    edgeVertex1 = null;
    edgeVertex2 = null;
    isDrawingEdge = false;
    nextLabelCode = 65;
    clearActiveButtonMode();
    clearMstResult();
}

function saveSvgFile() {
    var s = new XMLSerializer();
    var content = s.serializeToString(svg);
    downloadFile("kruskal-mst.svg", content);
}

function downloadFile(filename, content) {
    var pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    pom.setAttribute("download", filename);
    if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

var dialogEdgeCost = document.getElementById("divEdgeCost");
var dialogVertexLabel = document.getElementById("divVertexLabel");

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
        var cost = parseInt(inputEdgeCost.value, 10);
        if (setEdgeCost(edge, cost)) {
            dialogEdgeCost.style.display = "none";
            resetMstHighlight();
            clearMstResult();
        }
    };
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
        if (label) setVertexLabel(vertex, label);
    };
}

function closeDialogVertexLabel() {
    dialogVertexLabel.style.display = "none";
}
