# Sorting Visualizer 3D

An interactive 3D visualization of 13 sorting algorithms, featuring complexity profiles and reference implementations in 8 programming languages.

## Running It

No installation, dependencies, build process, or internet connection is required.

### Option 1: Open Directly

Double-click `index.html` to open the visualizer in your browser.

### Option 2: Run a Local Server

If you prefer to run the project through a local HTTP server, make sure Node.js is installed and run:

```bash
node serve.js
```

Then open:

```text
http://localhost:8123
```

The browser provides the runtime environment. The 3D visualization is rendered using a custom JavaScript renderer on an HTML canvas rather than a video or game engine.

## Features

### 3D Sorting Visualization

The center of the application displays the selected sorting algorithm as an interactive 3D visualization.

Bar height represents the value of each element, while the colors indicate the current state of the algorithm:

| Color                 | Meaning                       |
| --------------------- | ----------------------------- |
| Blue to pink gradient | Unsorted element              |
| Yellow                | Elements being compared       |
| Red                   | Elements being swapped        |
| Cyan                  | Element being overwritten     |
| Purple                | Pivot or key element          |
| Green                 | Element in its final position |

Swapping elements is animated so that the bars visibly move to their new positions.

### Camera Controls

* Drag to orbit around the visualization.
* Scroll to zoom.
* Use **Recentre** to restore the default camera position.
* Enable **Auto-orbit** for automatic camera rotation.

### Keyboard Controls

| Key     | Action           |
| ------- | ---------------- |
| `Space` | Play / Pause     |
| `→`     | Step forward     |
| `←`     | Step backward    |
| `R`     | Shuffle the data |

## Algorithm Information

The Overview panel provides information about each algorithm, including:

* Algorithm family
* Origin and historical information
* Explanation of how the algorithm works
* Typical use cases
* Best-case complexity
* Average-case complexity
* Worst-case complexity
* Space complexity
* Stability
* Whether the algorithm operates in place
* Adaptive behavior
* Strengths and weaknesses
* Additional notes

The Code panel contains reference implementations in:

* Python
* Java
* C++
* C
* JavaScript
* C#
* Go
* Rust

## Compare Two Algorithms

The **Compare Two** feature allows two sorting algorithms to run side by side using the same input array.

Available controls include:

* Play
* Step
* Reset
* Run to end
* Speed control

Each algorithm displays live statistics for:

* Comparisons
* Swaps
* Writes
* Total operations
* Progress

After both algorithms finish, the application displays a comparison verdict and a detailed comparison table.

Each visualization has an independent camera, allowing the two algorithms to be explored separately.

## Race All 13 Algorithms

The **Race All 13** feature runs every sorting algorithm using the same input array and ranks them according to the number of operations performed.

Selecting a race result opens that algorithm in the main 3D visualization.

## Controls

| Control      | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| Data         | Select the input distribution                                 |
| Size         | Change the number of elements from 8 to 140                   |
| Speed        | Control the number of operations executed per animation frame |
| Depth        | Adjust the depth of the 3D bars                               |
| Timeline     | Move through the algorithm's operation history                |
| Smooth swaps | Enable or disable animated swaps                              |
| Recentre     | Restore the default camera framing                            |
| Auto-orbit   | Automatically rotate the camera                               |
| Values       | Display numerical values above the bars                       |
| Sound        | Play sounds based on operations                               |

### Input Distributions

The visualizer supports:

* Random
* Reversed
* Nearly sorted
* Few unique values
* Already sorted
* Sawtooth

Different input distributions can demonstrate how sorting algorithms behave under different conditions.

For example, Insertion Sort performs particularly well on nearly sorted data, while algorithms such as Quick Sort can exhibit their worst-case behavior on certain already sorted inputs.

## Algorithms

| Algorithm       | Best       | Average     | Worst      | Space    | Stable |
| --------------- | ---------- | ----------- | ---------- | -------- | ------ |
| Bubble          | O(n)       | O(n²)       | O(n²)      | O(1)     | Yes    |
| Cocktail Shaker | O(n)       | O(n²)       | O(n²)      | O(1)     | Yes    |
| Selection       | O(n²)      | O(n²)       | O(n²)      | O(1)     | No     |
| Insertion       | O(n)       | O(n²)       | O(n²)      | O(1)     | Yes    |
| Shell           | O(n log n) | O(n^1.25)   | O(n²)      | O(1)     | No     |
| Comb            | O(n log n) | O(n² / 2^p) | O(n²)      | O(1)     | No     |
| Gnome           | O(n)       | O(n²)       | O(n²)      | O(1)     | Yes    |
| Merge           | O(n log n) | O(n log n)  | O(n log n) | O(n)     | Yes    |
| Quick           | O(n log n) | O(n log n)  | O(n²)      | O(log n) | No     |
| Heap            | O(n log n) | O(n log n)  | O(n log n) | O(1)     | No     |
| Counting        | O(n + k)   | O(n + k)    | O(n + k)   | O(n + k) | Yes    |
| Radix (LSD)     | O(nk)      | O(nk)       | O(nk)      | O(n + b) | Yes    |
| Bucket          | O(n + k)   | O(n + k)    | O(n²)      | O(n + k) | Yes    |

## Project Structure

```text
index.html
css/
    style.css
js/
    engine3d.js
    algorithms.js
    complexity.js
    app.js
    code/
        *.js
serve.js
```

### File Overview

* `index.html` — Application markup and panel layout
* `css/style.css` — Styling, dark theme, and responsive layout
* `js/engine3d.js` — 3D renderer, camera, projection, shading, and controls
* `js/algorithms.js` — Sorting algorithm implementations
* `js/complexity.js` — Algorithm complexity and behavior information
* `js/code/` — Reference implementations in multiple programming languages
* `js/app.js` — Application state, scene assembly, controls, comparison mode, and race mode
* `serve.js` — Optional local static server

## Animation and Timeline

Each sorting algorithm is implemented as a JavaScript generator that performs operations on the array and yields each operation as it occurs.

The renderer visualizes the same array being modified by the algorithm, allowing the animation to directly represent the algorithm's operations.

The application records the operations performed during each run so that the timeline can be played forward or backward.

The timeline supports:

* Forward playback
* Backward playback
* Operation-by-operation stepping
* Scrubbing to any point in the run
* Restoring previous array states
* Restoring comparison, swap, and write counters

## Browser API

The application exposes the `SortViz` object through the browser console.

Available methods and properties include:

```javascript
window.SortViz.state
window.SortViz.seekTo(n)
window.SortViz.select(id)
```

These can be used to inspect the current state, move to a specific point in the timeline, or select an algorithm programmatically.

## Responsive Layout

The interface adapts to different screen sizes.

Below 1000px, the layout changes to a single-column arrangement containing:

1. Visualization
2. Controls
3. Algorithm list
4. Overview panel

The interface is designed to avoid horizontal overflow across desktop and smaller screen sizes.

## License
MIT License

Copyright (c) 2026 Aryan Verma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.