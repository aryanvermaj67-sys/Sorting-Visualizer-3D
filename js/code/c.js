window.SortCode = window.SortCode || {};
window.SortCode.c = {

bubble: `void bubble_sort(int *a, int n) {
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swapped = 1;
            }
        }
        if (!swapped) break;          /* already sorted -> O(n) */
    }
}`,

cocktail: `void cocktail_sort(int *a, int n) {
    int lo = 0, hi = n - 1, swapped = 1;
    while (swapped && lo < hi) {
        swapped = 0;
        for (int i = lo; i < hi; i++)
            if (a[i] > a[i + 1]) {
                int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; swapped = 1;
            }
        hi--;
        for (int i = hi; i > lo; i--)
            if (a[i - 1] > a[i]) {
                int t = a[i]; a[i] = a[i - 1]; a[i - 1] = t; swapped = 1;
            }
        lo++;
    }
}`,

selection: `void selection_sort(int *a, int n) {
    for (int i = 0; i < n - 1; i++) {
        int m = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[m]) m = j;
        if (m != i) { int t = a[i]; a[i] = a[m]; a[m] = t; }
    }
}`,

insertion: `void insertion_sort(int *a, int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}`,

shell: `void shell_sort(int *a, int n) {
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

comb: `void comb_sort(int *a, int n) {
    int gap = n, swapped = 1;
    while (gap > 1 || swapped) {
        gap = (int)(gap / 1.3);
        if (gap < 1) gap = 1;
        swapped = 0;
        for (int i = 0; i + gap < n; i++)
            if (a[i] > a[i + gap]) {
                int t = a[i]; a[i] = a[i + gap]; a[i + gap] = t; swapped = 1;
            }
    }
}`,

gnome: `void gnome_sort(int *a, int n) {
    int i = 0;
    while (i < n) {
        if (i == 0 || a[i] >= a[i - 1]) {
            i++;
        } else {
            int t = a[i]; a[i] = a[i - 1]; a[i - 1] = t;
            i--;
        }
    }
}`,

merge: `static void merge_run(int *a, int *buf, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    merge_run(a, buf, lo, mid);
    merge_run(a, buf, mid + 1, hi);

    for (int k = lo; k <= hi; k++) buf[k] = a[k];
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
        if (i > mid)                a[k] = buf[j++];
        else if (j > hi)            a[k] = buf[i++];
        else if (buf[i] <= buf[j])  a[k] = buf[i++];   /* <= keeps it stable */
        else                        a[k] = buf[j++];
    }
}

void merge_sort(int *a, int n) {
    if (n < 2) return;
    int *buf = malloc(sizeof(int) * (size_t)n);
    if (!buf) return;
    merge_run(a, buf, 0, n - 1);
    free(buf);
}`,

quick: `static int partition(int *a, int lo, int hi) {
    int pivot = a[hi], i = lo - 1;        /* Lomuto scheme */
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {
            i++;
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
    }
    int t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t;
    return i + 1;
}

void quick_sort(int *a, int lo, int hi) {
    while (lo < hi) {                     /* recurse on the small side only */
        int p = partition(a, lo, hi);
        if (p - lo < hi - p) { quick_sort(a, lo, p - 1); lo = p + 1; }
        else                 { quick_sort(a, p + 1, hi); hi = p - 1; }
    }
}`,

heap: `static void sift_down(int *a, int root, int end) {
    while (1) {
        int child = 2 * root + 1;
        if (child > end) return;
        if (child + 1 <= end && a[child] < a[child + 1]) child++;
        if (a[root] >= a[child]) return;
        int t = a[root]; a[root] = a[child]; a[child] = t;
        root = child;
    }
}

void heap_sort(int *a, int n) {
    for (int i = n / 2 - 1; i >= 0; i--) sift_down(a, i, n - 1);
    for (int end = n - 1; end > 0; end--) {
        int t = a[0]; a[0] = a[end]; a[end] = t;
        sift_down(a, 0, end - 1);
    }
}`,

counting: `void counting_sort(int *a, int n) {
    if (n <= 0) return;
    int k = a[0];
    for (int i = 1; i < n; i++) if (a[i] > k) k = a[i];

    int *count = calloc((size_t)k + 1, sizeof(int));
    int *out   = malloc(sizeof(int) * (size_t)n);
    if (!count || !out) { free(count); free(out); return; }

    for (int i = 0; i < n; i++) count[a[i]]++;
    for (int i = 1; i <= k; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) out[--count[a[i]]] = a[i];
    for (int i = 0; i < n; i++) a[i] = out[i];

    free(count);
    free(out);
}`,

radix: `void radix_sort(int *a, int n) {
    if (n <= 0) return;
    int mx = a[0];
    for (int i = 1; i < n; i++) if (a[i] > mx) mx = a[i];

    int *out = malloc(sizeof(int) * (size_t)n);
    if (!out) return;

    for (int exp = 1; mx / exp > 0; exp *= 10) {
        int count[10] = {0};
        for (int i = 0; i < n; i++) count[(a[i] / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = n - 1; i >= 0; i--) out[--count[(a[i] / exp) % 10]] = a[i];
        for (int i = 0; i < n; i++) a[i] = out[i];
    }
    free(out);
}`,

bucket: `void bucket_sort(int *a, int n) {
    if (n <= 0) return;
    int k = (int)sqrt((double)n);
    if (k < 1) k = 1;
    int hi = a[0];
    for (int i = 1; i < n; i++) if (a[i] > hi) hi = a[i];
    hi++;

    int *sizes = calloc((size_t)k, sizeof(int));
    int *idx   = malloc(sizeof(int) * (size_t)n);
    if (!sizes || !idx) { free(sizes); free(idx); return; }

    for (int i = 0; i < n; i++) {
        int b = (int)((long long)a[i] * k / hi);
        if (b > k - 1) b = k - 1;
        idx[i] = b;
        sizes[b]++;
    }

    int *out = malloc(sizeof(int) * (size_t)n);
    int *start = calloc((size_t)k, sizeof(int));
    for (int b = 1; b < k; b++) start[b] = start[b - 1] + sizes[b - 1];

    int *fill = calloc((size_t)k, sizeof(int));
    for (int i = 0; i < n; i++) out[start[idx[i]] + fill[idx[i]]++] = a[i];
    for (int b = 0; b < k; b++) insertion_sort(out + start[b], sizes[b]);
    for (int i = 0; i < n; i++) a[i] = out[i];

    free(sizes); free(idx); free(out); free(start); free(fill);
}`
};
