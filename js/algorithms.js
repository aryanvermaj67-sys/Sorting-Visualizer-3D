
(function (global) {
  'use strict';

  var A = {};

  A.bubble = function* (a) {
    var n = a.length, i, j, t, swapped;
    for (i = 0; i < n - 1; i++) {
      swapped = false;
      for (j = 0; j < n - 1 - i; j++) {
        yield { t: 'cmp', i: j, j: j + 1 };
        if (a[j] > a[j + 1]) {
          t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
          yield { t: 'swap', i: j, j: j + 1 };
          swapped = true;
        }
      }
      yield { t: 'sorted', i: n - 1 - i };
      if (!swapped) break;
    }
    yield { t: 'done' };
  };

  A.cocktail = function* (a) {
    var lo = 0, hi = a.length - 1, i, t, swapped = true;
    while (swapped && lo < hi) {
      swapped = false;
      yield { t: 'range', lo: lo, hi: hi };
      for (i = lo; i < hi; i++) {
        yield { t: 'cmp', i: i, j: i + 1 };
        if (a[i] > a[i + 1]) {
          t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
          yield { t: 'swap', i: i, j: i + 1 };
          swapped = true;
        }
      }
      yield { t: 'sorted', i: hi };
      hi--;
      for (i = hi; i > lo; i--) {
        yield { t: 'cmp', i: i - 1, j: i };
        if (a[i - 1] > a[i]) {
          t = a[i]; a[i] = a[i - 1]; a[i - 1] = t;
          yield { t: 'swap', i: i - 1, j: i };
          swapped = true;
        }
      }
      yield { t: 'sorted', i: lo };
      lo++;
    }
    yield { t: 'done' };
  };

  A.selection = function* (a) {
    var n = a.length, i, j, m, t;
    for (i = 0; i < n - 1; i++) {
      m = i;
      yield { t: 'pivot', i: m };
      for (j = i + 1; j < n; j++) {
        yield { t: 'cmp', i: j, j: m };
        if (a[j] < a[m]) {
          m = j;
          yield { t: 'pivot', i: m };
        }
      }
      if (m !== i) {
        t = a[i]; a[i] = a[m]; a[m] = t;
        yield { t: 'swap', i: i, j: m };
      }
      yield { t: 'sorted', i: i };
    }
    yield { t: 'sorted', i: n - 1 };
    yield { t: 'done' };
  };

  A.insertion = function* (a) {
    var n = a.length, i, j, key;
    yield { t: 'sorted', i: 0 };
    for (i = 1; i < n; i++) {
      key = a[i];
      yield { t: 'pivot', i: i };
      j = i - 1;
      while (j >= 0) {
        yield { t: 'cmp', i: j, j: i };
        if (a[j] <= key) break;
        a[j + 1] = a[j];
        yield { t: 'set', i: j + 1 };
        j--;
      }
      a[j + 1] = key;
      yield { t: 'set', i: j + 1 };
      yield { t: 'sorted', i: i };
    }
    yield { t: 'done' };
  };

  A.shell = function* (a) {
    var n = a.length, gap, i, j, key;
    for (gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (i = gap; i < n; i++) {
        key = a[i];
        yield { t: 'pivot', i: i };
        j = i;
        while (j >= gap) {
          yield { t: 'cmp', i: j - gap, j: i };
          if (a[j - gap] <= key) break;
          a[j] = a[j - gap];
          yield { t: 'set', i: j };
          j -= gap;
        }
        a[j] = key;
        yield { t: 'set', i: j };
      }
    }
    for (i = 0; i < n; i++) yield { t: 'sorted', i: i };
    yield { t: 'done' };
  };

  A.comb = function* (a) {
    var n = a.length, gap = n, swapped = true, i, t;
    while (gap > 1 || swapped) {
      gap = Math.floor(gap / 1.3);
      if (gap < 1) gap = 1;
      swapped = false;
      for (i = 0; i + gap < n; i++) {
        yield { t: 'cmp', i: i, j: i + gap };
        if (a[i] > a[i + gap]) {
          t = a[i]; a[i] = a[i + gap]; a[i + gap] = t;
          yield { t: 'swap', i: i, j: i + gap };
          swapped = true;
        }
      }
    }
    for (i = 0; i < n; i++) yield { t: 'sorted', i: i };
    yield { t: 'done' };
  };

  A.gnome = function* (a) {
    var n = a.length, i = 0, t;
    while (i < n) {
      if (i === 0) { i++; continue; }
      yield { t: 'cmp', i: i - 1, j: i };
      if (a[i] >= a[i - 1]) {
        i++;
      } else {
        t = a[i]; a[i] = a[i - 1]; a[i - 1] = t;
        yield { t: 'swap', i: i - 1, j: i };
        i--;
      }
    }
    for (var k = 0; k < n; k++) yield { t: 'sorted', i: k };
    yield { t: 'done' };
  };

  function* mergeRun(a, lo, hi, buf) {
    if (hi - lo < 1) return;
    var mid = (lo + hi) >> 1;
    yield { t: 'range', lo: lo, hi: hi };
    yield* mergeRun(a, lo, mid, buf);
    yield* mergeRun(a, mid + 1, hi, buf);

    var i = lo, j = mid + 1, k = lo;
    for (k = lo; k <= hi; k++) buf[k] = a[k];
    yield { t: 'range', lo: lo, hi: hi };
    k = lo;
    while (i <= mid && j <= hi) {
      yield { t: 'cmp', i: i, j: j };
      if (buf[i] <= buf[j]) { a[k] = buf[i]; i++; }
      else { a[k] = buf[j]; j++; }
      yield { t: 'set', i: k };
      k++;
    }
    while (i <= mid) { a[k] = buf[i]; yield { t: 'set', i: k }; i++; k++; }
    while (j <= hi) { a[k] = buf[j]; yield { t: 'set', i: k }; j++; k++; }
  }

  A.merge = function* (a) {
    var buf = a.slice();
    yield* mergeRun(a, 0, a.length - 1, buf);
    for (var i = 0; i < a.length; i++) yield { t: 'sorted', i: i };
    yield { t: 'done' };
  };

  function* quickRun(a, lo, hi) {
    if (lo >= hi) {
      if (lo === hi) yield { t: 'sorted', i: lo };
      return;
    }
    yield { t: 'range', lo: lo, hi: hi };
    var pivot = a[hi], i = lo - 1, j, t;
    yield { t: 'pivot', i: hi };
    for (j = lo; j < hi; j++) {
      yield { t: 'cmp', i: j, j: hi };
      if (a[j] < pivot) {
        i++;
        if (i !== j) {
          t = a[i]; a[i] = a[j]; a[j] = t;
          yield { t: 'swap', i: i, j: j };
        }
      }
    }
    i++;
    if (i !== hi) {
      t = a[i]; a[i] = a[hi]; a[hi] = t;
      yield { t: 'swap', i: i, j: hi };
    }
    yield { t: 'sorted', i: i };
    yield* quickRun(a, lo, i - 1);
    yield* quickRun(a, i + 1, hi);
  }

  A.quick = function* (a) {
    yield* quickRun(a, 0, a.length - 1);
    yield { t: 'done' };
  };

  function* siftDown(a, root, end) {
    var child, t;
    while (true) {
      child = 2 * root + 1;
      if (child > end) return;
      if (child + 1 <= end) {
        yield { t: 'cmp', i: child, j: child + 1 };
        if (a[child] < a[child + 1]) child++;
      }
      yield { t: 'cmp', i: root, j: child };
      if (a[root] >= a[child]) return;
      t = a[root]; a[root] = a[child]; a[child] = t;
      yield { t: 'swap', i: root, j: child };
      root = child;
    }
  }

  A.heap = function* (a) {
    var n = a.length, i, t;
    for (i = (n >> 1) - 1; i >= 0; i--) {
      yield { t: 'pivot', i: i };
      yield* siftDown(a, i, n - 1);
    }
    for (i = n - 1; i > 0; i--) {
      t = a[0]; a[0] = a[i]; a[i] = t;
      yield { t: 'swap', i: 0, j: i };
      yield { t: 'sorted', i: i };
      yield* siftDown(a, 0, i - 1);
    }
    yield { t: 'sorted', i: 0 };
    yield { t: 'done' };
  };

  A.counting = function* (a) {
    var n = a.length, i, max = 0;
    for (i = 0; i < n; i++) {
      yield { t: 'cmp', i: i, j: i };
      if (a[i] > max) max = a[i];
    }
    var count = new Array(max + 1).fill(0);
    for (i = 0; i < n; i++) {
      count[a[i]]++;
      yield { t: 'pivot', i: i };
    }
    for (i = 1; i <= max; i++) count[i] += count[i - 1];

    var out = new Array(n);
    for (i = n - 1; i >= 0; i--) {
      out[--count[a[i]]] = a[i];
      yield { t: 'pivot', i: i };
    }
    for (i = 0; i < n; i++) {
      a[i] = out[i];
      yield { t: 'set', i: i };
      yield { t: 'sorted', i: i };
    }
    yield { t: 'done' };
  };

  A.radix = function* (a) {
    var n = a.length, i, max = 0;
    for (i = 0; i < n; i++) if (a[i] > max) max = a[i];

    for (var exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      var count = new Array(10).fill(0);
      for (i = 0; i < n; i++) {
        count[Math.floor(a[i] / exp) % 10]++;
        yield { t: 'pivot', i: i };
      }
      for (i = 1; i < 10; i++) count[i] += count[i - 1];

      var out = new Array(n);
      for (i = n - 1; i >= 0; i--) {
        out[--count[Math.floor(a[i] / exp) % 10]] = a[i];
        yield { t: 'cmp', i: i, j: i };
      }
      for (i = 0; i < n; i++) {
        a[i] = out[i];
        yield { t: 'set', i: i };
      }
    }
    for (i = 0; i < n; i++) yield { t: 'sorted', i: i };
    yield { t: 'done' };
  };

  A.bucket = function* (a) {
    var n = a.length, i, j, max = 0;
    for (i = 0; i < n; i++) if (a[i] > max) max = a[i];
    var k = Math.max(1, Math.floor(Math.sqrt(n)));
    var buckets = [];
    for (i = 0; i < k; i++) buckets.push([]);

    for (i = 0; i < n; i++) {
      var b = Math.min(k - 1, Math.floor((a[i] / (max + 1)) * k));
      buckets[b].push(a[i]);
      yield { t: 'pivot', i: i };
    }

    var w = 0;
    for (i = 0; i < k; i++) {
      var bk = buckets[i];
      for (var x = 1; x < bk.length; x++) {
        var key = bk[x], y = x - 1;
        while (y >= 0 && bk[y] > key) { bk[y + 1] = bk[y]; y--; }
        bk[y + 1] = key;
        yield { t: 'cmp', i: Math.min(n - 1, w + x), j: Math.min(n - 1, w) };
      }
      for (j = 0; j < bk.length; j++) {
        a[w] = bk[j];
        yield { t: 'set', i: w };
        yield { t: 'sorted', i: w };
        w++;
      }
    }
    yield { t: 'done' };
  };

  global.SortAlgorithms = A;
})(window);
