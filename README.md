# Graph Algorithm Visualizer

An interactive, browser-based tool for drawing weighted graphs on a canvas and stepping through classic graph algorithms. No build step or dependencies—open the HTML files in a modern browser.

## What’s included

| Page | Algorithm | What it does |
|------|-----------|----------------|
| [index.html](index.html) | — | Landing page: Shortest Path or MST |
| [dijkstra.html](dijkstra.html) | **Dijkstra** | Single-source shortest path to a chosen end vertex |
| [mst.html](mst.html) | — | Chooses Prim or Kruskal |
| [prim.html](prim.html) | **Prim** | Minimum spanning tree from a start vertex |
| [kruskal.html](kruskal.html) | **Kruskal** | Minimum spanning tree via sorted edges |

Shared styling lives in [dijkstra.css](dijkstra.css). [algorithm-performance.js](algorithm-performance.js) supplies short complexity hints on the MST pages.

## How to run

1. Clone or download this folder.
2. Open **index.html** in Chrome, Edge, Firefox, or Safari (double-click or drag the file into the browser).

For the most predictable behavior (especially if you use “Save graph” or load local files), you can serve the folder with any static server, for example:

```bash
npx --yes serve .
```

Then visit the URL shown in the terminal (often `http://localhost:3000`).

## Using the graph editor

On each solver page you can:

- **Draw vertex** — Click empty canvas space to add a vertex.
- **Draw edge** — Select the mode, then click two different vertices.
- **Set cost or label** — Click a vertex label or an edge to edit it (edge weights are positive where required).
- **Dijkstra only:** **Set Start** / **Set End** — Pick the source and destination before running the algorithm.
- **Prim only:** **Set Start** — Pick where Prim begins.

**Buttons**

- **Save graph** — Download the current SVG.
- **Calculate …** — Run the algorithm on the current graph.
- **Clear canvas** — Remove the whole graph.
- **Remove vertex** / **Remove edge** — Activate the mode, then click what you want to delete (vertex, edge, or edge cost label where supported).

## Project layout

```
index.html          # Home
mst.html            # MST algorithm picker
dijkstra.html       # + dijkstra.js
prim.html           # + prim.js
kruskal.html        # + kruskal.js
dijkstra.css        # Shared UI styles
algorithm-performance.js
README.md
```

## License

If you publish this project, add a license file that matches how you want others to use the code.
