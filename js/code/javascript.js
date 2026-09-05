window.SortCode = window.SortCode || {};
window.SortCode.javascript = {

bubble: `function bubbleSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;          // already sorted -> O(n)
  }
  return a;
}`,

cocktail: `function cocktailSort(a) {
  let lo = 0, hi = a.length - 1, swapped = true;
  while (swapped && lo < hi) {
    swapped = false;
    for (let i = lo; i < hi; i++) {
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; swapped = true; }
    }
    hi--;
    for (let i = hi; i > lo; i--) {
      if (a[i - 1] > a[i]) { [a[i - 1], a[i]] = [a[i], a[i - 1]]; swapped = true; }
    }
    lo++;
  }
  return a;
}`,

selection: `function selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) if (a[j] < a[m]) m = j;
    if (m !== i) [a[i], a[m]] = [a[m], a[i]];
  }
  return a;
}`,

insertion: `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}`,

shell: `function shellSort(a) {
  const n = a.length;
  for (let gap = n >> 1; gap > 0; gap >>= 1) {
    for (let i = gap; i < n; i++) {
      const key = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > key) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = key;
    }
  }
  return a;
}`,

comb: `function combSort(a) {
  const n = a.length;
  let gap = n, swapped = true;
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / 1.3));
    swapped = false;
    for (let i = 0; i + gap < n; i++) {
      if (a[i] > a[i + gap]) {
        [a[i], a[i + gap]] = [a[i + gap], a[i]];
        swapped = true;
      }
    }
  }
  return a;
}`,

gnome: `function gnomeSort(a) {
  let i = 0;
  while (i < a.length) {
    if (i === 0 || a[i] >= a[i - 1]) {
      i++;
    } else {
      [a[i], a[i - 1]] = [a[i - 1], a[i]];
      i--;
    }
  }
  return a;
}`,

merge: `function mergeSort(a, buf = a.slice(), lo = 0, hi = a.length - 1) {
  if (lo >= hi) return a;
  const mid = (lo + hi) >> 1;
  mergeSort(a, buf, lo, mid);
  mergeSort(a, buf, mid + 1, hi);

  for (let k = lo; k <= hi; k++) buf[k] = a[k];
  let i = lo, j = mid + 1;
  for (let k = lo; k <= hi; k++) {
    if (i > mid)                  a[k] = buf[j++];
    else if (j > hi)              a[k] = buf[i++];
    else if (buf[i] <= buf[j])    a[k] = buf[i++];   // <= keeps it stable
    else                          a[k] = buf[j++];
  }
  return a;
}`,

quick: `function quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return a;
  const p = partition(a, lo, hi);
  quickSort(a, lo, p - 1);
  quickSort(a, p + 1, hi);
  return a;
}

function partition(a, lo, hi) {
  const pivot = a[hi];                 // Lomuto scheme
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
  return i + 1;
}`,

heap: `function heapSort(a) {
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, i, n - 1);
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    siftDown(a, 0, end - 1);
  }
  return a;
}

function siftDown(a, root, end) {
  for (;;) {
    let child = 2 * root + 1;
    if (child > end) return;
    if (child + 1 <= end && a[child] < a[child + 1]) child++;
    if (a[root] >= a[child]) return;
    [a[root], a[child]] = [a[child], a[root]];
    root = child;
  }
}`,

counting: `function countingSort(a) {
  if (a.length === 0) return a;
  const k = Math.max(...a);

  const count = new Array(k + 1).fill(0);
  for (const v of a) count[v]++;
  for (let i = 1; i <= k; i++) count[i] += count[i - 1];

  const out = new Array(a.length);
  for (let i = a.length - 1; i >= 0; i--) out[--count[a[i]]] = a[i];
  for (let i = 0; i < a.length; i++) a[i] = out[i];
  return a;
}`,

radix: `function radixSort(a) {
  if (a.length === 0) return a;
  const max = Math.max(...a);

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const count = new Array(10).fill(0);
    for (const v of a) count[Math.floor(v / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    const out = new Array(a.length);
    for (let i = a.length - 1; i >= 0; i--) {
      const d = Math.floor(a[i] / exp) % 10;
      out[--count[d]] = a[i];
    }
    for (let i = 0; i < a.length; i++) a[i] = out[i];
  }
  return a;
}`,

bucket: `function bucketSort(a) {
  if (a.length === 0) return a;
  const k = Math.max(1, Math.floor(Math.sqrt(a.length)));
  const hi = Math.max(...a) + 1;
  const buckets = Array.from({ length: k }, () => []);

  for (const v of a) buckets[Math.min(k - 1, Math.floor(v * k / hi))].push(v);

  let w = 0;
  for (const b of buckets) {
    insertionSort(b);
    for (const v of b) a[w++] = v;
  }
  return a;
}`
};
