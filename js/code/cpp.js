window.SortCode = window.SortCode || {};
window.SortCode.cpp = {

bubble: `void bubbleSort(std::vector<int>& a) {
    std::size_t n = a.size();
    for (std::size_t i = 0; i + 1 < n; ++i) {
        bool swapped = false;
        for (std::size_t j = 0; j + 1 < n - i; ++j) {
            if (a[j] > a[j + 1]) {
                std::swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;          // already sorted -> O(n)
    }
}`,

cocktail: `void cocktailSort(std::vector<int>& a) {
    int lo = 0, hi = static_cast<int>(a.size()) - 1;
    bool swapped = true;
    while (swapped && lo < hi) {
        swapped = false;
        for (int i = lo; i < hi; ++i)
            if (a[i] > a[i + 1]) { std::swap(a[i], a[i + 1]); swapped = true; }
        --hi;
        for (int i = hi; i > lo; --i)
            if (a[i - 1] > a[i]) { std::swap(a[i - 1], a[i]); swapped = true; }
        ++lo;
    }
}`,

selection: `void selectionSort(std::vector<int>& a) {
    std::size_t n = a.size();
    for (std::size_t i = 0; i + 1 < n; ++i) {
        std::size_t m = i;
        for (std::size_t j = i + 1; j < n; ++j)
            if (a[j] < a[m]) m = j;
        if (m != i) std::swap(a[i], a[m]);
    }
}`,

insertion: `void insertionSort(std::vector<int>& a) {
    for (std::size_t i = 1; i < a.size(); ++i) {
        int key = a[i];
        std::size_t j = i;
        while (j > 0 && a[j - 1] > key) {
            a[j] = a[j - 1];
            --j;
        }
        a[j] = key;
    }
}`,

shell: `void shellSort(std::vector<int>& a) {
    std::size_t n = a.size();
    for (std::size_t gap = n / 2; gap > 0; gap /= 2) {
        for (std::size_t i = gap; i < n; ++i) {
            int key = a[i];
            std::size_t j = i;
            while (j >= gap && a[j - gap] > key) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
    }
}`,

comb: `void combSort(std::vector<int>& a) {
    std::size_t n = a.size(), gap = n;
    bool swapped = true;
    while (gap > 1 || swapped) {
        gap = std::max<std::size_t>(1, static_cast<std::size_t>(gap / 1.3));
        swapped = false;
        for (std::size_t i = 0; i + gap < n; ++i)
            if (a[i] > a[i + gap]) { std::swap(a[i], a[i + gap]); swapped = true; }
    }
}`,

gnome: `void gnomeSort(std::vector<int>& a) {
    std::size_t i = 0;
    while (i < a.size()) {
        if (i == 0 || a[i] >= a[i - 1]) {
            ++i;
        } else {
            std::swap(a[i], a[i - 1]);
            --i;
        }
    }
}`,

merge: `static void mergeRun(std::vector<int>& a, std::vector<int>& buf, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeRun(a, buf, lo, mid);
    mergeRun(a, buf, mid + 1, hi);

    std::copy(a.begin() + lo, a.begin() + hi + 1, buf.begin() + lo);
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; ++k) {
        if (i > mid)                   a[k] = buf[j++];
        else if (j > hi)               a[k] = buf[i++];
        else if (buf[i] <= buf[j])     a[k] = buf[i++];   // <= keeps it stable
        else                           a[k] = buf[j++];
    }
}

void mergeSort(std::vector<int>& a) {
    if (a.size() < 2) return;
    std::vector<int> buf(a.size());
    mergeRun(a, buf, 0, static_cast<int>(a.size()) - 1);
}`,

quick: `static int partition(std::vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo - 1;        // Lomuto scheme
    for (int j = lo; j < hi; ++j)
        if (a[j] < pivot) std::swap(a[++i], a[j]);
    std::swap(a[i + 1], a[hi]);
    return i + 1;
}

void quickSort(std::vector<int>& a, int lo, int hi) {
    while (lo < hi) {                     // tail call turned into a loop
        int p = partition(a, lo, hi);
        if (p - lo < hi - p) { quickSort(a, lo, p - 1); lo = p + 1; }
        else                 { quickSort(a, p + 1, hi); hi = p - 1; }
    }
}`,

heap: `static void siftDown(std::vector<int>& a, int root, int end) {
    while (true) {
        int child = 2 * root + 1;
        if (child > end) return;
        if (child + 1 <= end && a[child] < a[child + 1]) ++child;
        if (a[root] >= a[child]) return;
        std::swap(a[root], a[child]);
        root = child;
    }
}

void heapSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    for (int i = n / 2 - 1; i >= 0; --i) siftDown(a, i, n - 1);
    for (int end = n - 1; end > 0; --end) {
        std::swap(a[0], a[end]);
        siftDown(a, 0, end - 1);
    }
}`,

counting: `void countingSort(std::vector<int>& a) {
    if (a.empty()) return;
    int k = *std::max_element(a.begin(), a.end());

    std::vector<int> count(k + 1, 0);
    for (int v : a) ++count[v];
    for (int i = 1; i <= k; ++i) count[i] += count[i - 1];

    std::vector<int> out(a.size());
    for (int i = static_cast<int>(a.size()) - 1; i >= 0; --i)
        out[--count[a[i]]] = a[i];
    a = out;
}`,

radix: `void radixSort(std::vector<int>& a) {
    if (a.empty()) return;
    int mx = *std::max_element(a.begin(), a.end());
    std::vector<int> out(a.size());

    for (int exp = 1; mx / exp > 0; exp *= 10) {
        int count[10] = {0};
        for (int v : a) ++count[(v / exp) % 10];
        for (int i = 1; i < 10; ++i) count[i] += count[i - 1];
        for (int i = static_cast<int>(a.size()) - 1; i >= 0; --i)
            out[--count[(a[i] / exp) % 10]] = a[i];
        a = out;
    }
}`,

bucket: `void bucketSort(std::vector<int>& a) {
    if (a.empty()) return;
    int k  = std::max(1, static_cast<int>(std::sqrt(a.size())));
    int hi = *std::max_element(a.begin(), a.end()) + 1;

    std::vector<std::vector<int>> buckets(k);
    for (int v : a)
        buckets[std::min(k - 1, static_cast<int>(1LL * v * k / hi))].push_back(v);

    std::size_t w = 0;
    for (auto& b : buckets) {
        std::sort(b.begin(), b.end());
        for (int v : b) a[w++] = v;
    }
}`
};
