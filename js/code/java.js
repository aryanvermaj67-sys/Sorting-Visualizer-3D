window.SortCode = window.SortCode || {};
window.SortCode.java = {

bubble: `public static void bubbleSort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swapped = true;
            }
        }
        if (!swapped) break;          // already sorted -> O(n)
    }
}`,

cocktail: `public static void cocktailSort(int[] a) {
    int lo = 0, hi = a.length - 1;
    boolean swapped = true;
    while (swapped && lo < hi) {
        swapped = false;
        for (int i = lo; i < hi; i++) {
            if (a[i] > a[i + 1]) {
                int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
                swapped = true;
            }
        }
        hi--;
        for (int i = hi; i > lo; i--) {
            if (a[i - 1] > a[i]) {
                int t = a[i]; a[i] = a[i - 1]; a[i - 1] = t;
                swapped = true;
            }
        }
        lo++;
    }
}`,

selection: `public static void selectionSort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        int m = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[m]) m = j;
        }
        if (m != i) { int t = a[i]; a[i] = a[m]; a[m] = t; }
    }
}`,

insertion: `public static void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}`,

shell: `public static void shellSort(int[] a) {
    int n = a.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int key = a[i], j = i;
            while (j >= gap && a[j - gap] > key) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
    }
}`,

comb: `public static void combSort(int[] a) {
    int n = a.length, gap = n;
    boolean swapped = true;
    while (gap > 1 || swapped) {
        gap = Math.max(1, (int) (gap / 1.3));
        swapped = false;
        for (int i = 0; i + gap < n; i++) {
            if (a[i] > a[i + gap]) {
                int t = a[i]; a[i] = a[i + gap]; a[i + gap] = t;
                swapped = true;
            }
        }
    }
}`,

gnome: `public static void gnomeSort(int[] a) {
    int i = 0;
    while (i < a.length) {
        if (i == 0 || a[i] >= a[i - 1]) {
            i++;
        } else {
            int t = a[i]; a[i] = a[i - 1]; a[i - 1] = t;
            i--;
        }
    }
}`,

merge: `public static void mergeSort(int[] a) {
    if (a.length > 1) mergeSort(a, new int[a.length], 0, a.length - 1);
}

private static void mergeSort(int[] a, int[] buf, int lo, int hi) {
    if (lo >= hi) return;
    int mid = (lo + hi) >>> 1;
    mergeSort(a, buf, lo, mid);
    mergeSort(a, buf, mid + 1, hi);

    System.arraycopy(a, lo, buf, lo, hi - lo + 1);
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
        if (i > mid)              a[k] = buf[j++];
        else if (j > hi)          a[k] = buf[i++];
        else if (buf[i] <= buf[j]) a[k] = buf[i++];   // <= keeps it stable
        else                      a[k] = buf[j++];
    }
}`,

quick: `public static void quickSort(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}

private static int partition(int[] a, int lo, int hi) {
    int pivot = a[hi], i = lo - 1;        // Lomuto scheme
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {
            i++;
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
    }
    int t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t;
    return i + 1;
}`,

heap: `public static void heapSort(int[] a) {
    int n = a.length;
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n - 1);
    for (int end = n - 1; end > 0; end--) {
        int t = a[0]; a[0] = a[end]; a[end] = t;
        siftDown(a, 0, end - 1);
    }
}

private static void siftDown(int[] a, int root, int end) {
    while (true) {
        int child = 2 * root + 1;
        if (child > end) return;
        if (child + 1 <= end && a[child] < a[child + 1]) child++;
        if (a[root] >= a[child]) return;
        int t = a[root]; a[root] = a[child]; a[child] = t;
        root = child;
    }
}`,

counting: `public static void countingSort(int[] a) {
    if (a.length == 0) return;
    int k = 0;
    for (int v : a) k = Math.max(k, v);

    int[] count = new int[k + 1];
    for (int v : a) count[v]++;
    for (int i = 1; i <= k; i++) count[i] += count[i - 1];

    int[] out = new int[a.length];
    for (int i = a.length - 1; i >= 0; i--) out[--count[a[i]]] = a[i];
    System.arraycopy(out, 0, a, 0, a.length);
}`,

radix: `public static void radixSort(int[] a) {
    if (a.length == 0) return;
    int max = 0;
    for (int v : a) max = Math.max(max, v);

    int[] out = new int[a.length];
    for (int exp = 1; max / exp > 0; exp *= 10) {
        int[] count = new int[10];
        for (int v : a) count[(v / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = a.length - 1; i >= 0; i--) {
            out[--count[(a[i] / exp) % 10]] = a[i];
        }
        System.arraycopy(out, 0, a, 0, a.length);
    }
}`,

bucket: `public static void bucketSort(int[] a) {
    if (a.length == 0) return;
    int k = Math.max(1, (int) Math.sqrt(a.length));
    int hi = 0;
    for (int v : a) hi = Math.max(hi, v);
    hi++;

    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i < k; i++) buckets.add(new ArrayList<>());
    for (int v : a) buckets.get(Math.min(k - 1, (int) ((long) v * k / hi))).add(v);

    int w = 0;
    for (List<Integer> b : buckets) {
        Collections.sort(b);
        for (int v : b) a[w++] = v;
    }
}`
};
