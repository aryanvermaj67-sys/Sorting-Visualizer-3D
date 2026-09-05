window.SortCode = window.SortCode || {};
window.SortCode.python = {

bubble: `def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:          # already sorted -> O(n) best case
            break
    return a`,

cocktail: `def cocktail_sort(a):
    lo, hi = 0, len(a) - 1
    swapped = True
    while swapped and lo < hi:
        swapped = False
        for i in range(lo, hi):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        hi -= 1
        for i in range(hi, lo, -1):
            if a[i - 1] > a[i]:
                a[i - 1], a[i] = a[i], a[i - 1]
                swapped = True
        lo += 1
    return a`,

selection: `def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        if m != i:
            a[i], a[m] = a[m], a[i]   # exactly n-1 swaps
    return a`,

insertion: `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,

shell: `def shell_sort(a):
    n = len(a)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            key = a[i]
            j = i
            while j >= gap and a[j - gap] > key:
                a[j] = a[j - gap]
                j -= gap
            a[j] = key
        gap //= 2
    return a`,

comb: `def comb_sort(a):
    n = len(a)
    gap = n
    swapped = True
    while gap > 1 or swapped:
        gap = max(1, int(gap / 1.3))
        swapped = False
        for i in range(n - gap):
            if a[i] > a[i + gap]:
                a[i], a[i + gap] = a[i + gap], a[i]
                swapped = True
    return a`,

gnome: `def gnome_sort(a):
    i, n = 0, len(a)
    while i < n:
        if i == 0 or a[i] >= a[i - 1]:
            i += 1
        else:
            a[i], a[i - 1] = a[i - 1], a[i]
            i -= 1
    return a`,

merge: `def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    return merge(left, right)


def merge(left, right):
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:      # <= keeps the sort stable
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out`,

quick: `def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo < hi:
        p = partition(a, lo, hi)
        quick_sort(a, lo, p - 1)
        quick_sort(a, p + 1, hi)
    return a


def partition(a, lo, hi):
    pivot = a[hi]                    # Lomuto scheme
    i = lo - 1
    for j in range(lo, hi):
        if a[j] < pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[hi] = a[hi], a[i + 1]
    return i + 1`,

heap: `def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):
        sift_down(a, i, n - 1)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(a, 0, end - 1)
    return a


def sift_down(a, root, end):
    while True:
        child = 2 * root + 1
        if child > end:
            return
        if child + 1 <= end and a[child] < a[child + 1]:
            child += 1
        if a[root] >= a[child]:
            return
        a[root], a[child] = a[child], a[root]
        root = child`,

counting: `def counting_sort(a):
    if not a:
        return a
    k = max(a)
    count = [0] * (k + 1)
    for v in a:
        count[v] += 1
    for i in range(1, k + 1):
        count[i] += count[i - 1]     # prefix sums = final positions
    out = [0] * len(a)
    for v in reversed(a):            # reversed keeps it stable
        count[v] -= 1
        out[count[v]] = v
    a[:] = out
    return a`,

radix: `def radix_sort(a):
    if not a:
        return a
    exp = 1
    mx = max(a)
    while mx // exp > 0:
        count = [0] * 10
        for v in a:
            count[(v // exp) % 10] += 1
        for i in range(1, 10):
            count[i] += count[i - 1]
        out = [0] * len(a)
        for v in reversed(a):
            d = (v // exp) % 10
            count[d] -= 1
            out[count[d]] = v
        a[:] = out
        exp *= 10
    return a`,

bucket: `def bucket_sort(a):
    if not a:
        return a
    k = max(1, int(len(a) ** 0.5))
    hi = max(a) + 1
    buckets = [[] for _ in range(k)]
    for v in a:
        buckets[min(k - 1, v * k // hi)].append(v)
    out = []
    for b in buckets:
        insertion_sort(b)
        out.extend(b)
    a[:] = out
    return a`
};
