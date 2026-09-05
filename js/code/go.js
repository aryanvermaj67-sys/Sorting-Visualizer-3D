window.SortCode = window.SortCode || {};
window.SortCode.go = {

bubble: `func BubbleSort(a []int) {
    n := len(a)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-1-i; j++ {
            if a[j] > a[j+1] {
                a[j], a[j+1] = a[j+1], a[j]
                swapped = true
            }
        }
        if !swapped { // already sorted -> O(n)
            break
        }
    }
}`,

cocktail: `func CocktailSort(a []int) {
    lo, hi := 0, len(a)-1
    swapped := true
    for swapped && lo < hi {
        swapped = false
        for i := lo; i < hi; i++ {
            if a[i] > a[i+1] {
                a[i], a[i+1] = a[i+1], a[i]
                swapped = true
            }
        }
        hi--
        for i := hi; i > lo; i-- {
            if a[i-1] > a[i] {
                a[i-1], a[i] = a[i], a[i-1]
                swapped = true
            }
        }
        lo++
    }
}`,

selection: `func SelectionSort(a []int) {
    n := len(a)
    for i := 0; i < n-1; i++ {
        m := i
        for j := i + 1; j < n; j++ {
            if a[j] < a[m] {
                m = j
            }
        }
        if m != i {
            a[i], a[m] = a[m], a[i]
        }
    }
}`,

insertion: `func InsertionSort(a []int) {
    for i := 1; i < len(a); i++ {
        key := a[i]
        j := i - 1
        for j >= 0 && a[j] > key {
            a[j+1] = a[j]
            j--
        }
        a[j+1] = key
    }
}`,

shell: `func ShellSort(a []int) {
    n := len(a)
    for gap := n / 2; gap > 0; gap /= 2 {
        for i := gap; i < n; i++ {
            key := a[i]
            j := i
            for j >= gap && a[j-gap] > key {
                a[j] = a[j-gap]
                j -= gap
            }
            a[j] = key
        }
    }
}`,

comb: `func CombSort(a []int) {
    n := len(a)
    gap := n
    swapped := true
    for gap > 1 || swapped {
        gap = int(float64(gap) / 1.3)
        if gap < 1 {
            gap = 1
        }
        swapped = false
        for i := 0; i+gap < n; i++ {
            if a[i] > a[i+gap] {
                a[i], a[i+gap] = a[i+gap], a[i]
                swapped = true
            }
        }
    }
}`,

gnome: `func GnomeSort(a []int) {
    i := 0
    for i < len(a) {
        if i == 0 || a[i] >= a[i-1] {
            i++
        } else {
            a[i], a[i-1] = a[i-1], a[i]
            i--
        }
    }
}`,

merge: `func MergeSort(a []int) {
    if len(a) > 1 {
        mergeRun(a, make([]int, len(a)), 0, len(a)-1)
    }
}

func mergeRun(a, buf []int, lo, hi int) {
    if lo >= hi {
        return
    }
    mid := lo + (hi-lo)/2
    mergeRun(a, buf, lo, mid)
    mergeRun(a, buf, mid+1, hi)

    copy(buf[lo:hi+1], a[lo:hi+1])
    i, j := lo, mid+1
    for k := lo; k <= hi; k++ {
        switch {
        case i > mid:
            a[k] = buf[j]; j++
        case j > hi:
            a[k] = buf[i]; i++
        case buf[i] <= buf[j]: // <= keeps it stable
            a[k] = buf[i]; i++
        default:
            a[k] = buf[j]; j++
        }
    }
}`,

quick: `func QuickSort(a []int, lo, hi int) {
    for lo < hi { // recurse on the small side, loop on the large one
        p := partition(a, lo, hi)
        if p-lo < hi-p {
            QuickSort(a, lo, p-1)
            lo = p + 1
        } else {
            QuickSort(a, p+1, hi)
            hi = p - 1
        }
    }
}

func partition(a []int, lo, hi int) int {
    pivot := a[hi] // Lomuto scheme
    i := lo - 1
    for j := lo; j < hi; j++ {
        if a[j] < pivot {
            i++
            a[i], a[j] = a[j], a[i]
        }
    }
    a[i+1], a[hi] = a[hi], a[i+1]
    return i + 1
}`,

heap: `func HeapSort(a []int) {
    n := len(a)
    for i := n/2 - 1; i >= 0; i-- {
        siftDown(a, i, n-1)
    }
    for end := n - 1; end > 0; end-- {
        a[0], a[end] = a[end], a[0]
        siftDown(a, 0, end-1)
    }
}

func siftDown(a []int, root, end int) {
    for {
        child := 2*root + 1
        if child > end {
            return
        }
        if child+1 <= end && a[child] < a[child+1] {
            child++
        }
        if a[root] >= a[child] {
            return
        }
        a[root], a[child] = a[child], a[root]
        root = child
    }
}`,

counting: `func CountingSort(a []int) {
    if len(a) == 0 {
        return
    }
    k := a[0]
    for _, v := range a {
        if v > k {
            k = v
        }
    }

    count := make([]int, k+1)
    for _, v := range a {
        count[v]++
    }
    for i := 1; i <= k; i++ {
        count[i] += count[i-1]
    }

    out := make([]int, len(a))
    for i := len(a) - 1; i >= 0; i-- {
        count[a[i]]--
        out[count[a[i]]] = a[i]
    }
    copy(a, out)
}`,

radix: `func RadixSort(a []int) {
    if len(a) == 0 {
        return
    }
    max := a[0]
    for _, v := range a {
        if v > max {
            max = v
        }
    }

    out := make([]int, len(a))
    for exp := 1; max/exp > 0; exp *= 10 {
        var count [10]int
        for _, v := range a {
            count[(v/exp)%10]++
        }
        for i := 1; i < 10; i++ {
            count[i] += count[i-1]
        }
        for i := len(a) - 1; i >= 0; i-- {
            d := (a[i] / exp) % 10
            count[d]--
            out[count[d]] = a[i]
        }
        copy(a, out)
    }
}`,

bucket: `func BucketSort(a []int) {
    if len(a) == 0 {
        return
    }
    k := int(math.Sqrt(float64(len(a))))
    if k < 1 {
        k = 1
    }
    hi := a[0]
    for _, v := range a {
        if v > hi {
            hi = v
        }
    }
    hi++

    buckets := make([][]int, k)
    for _, v := range a {
        b := v * k / hi
        if b > k-1 {
            b = k - 1
        }
        buckets[b] = append(buckets[b], v)
    }

    w := 0
    for _, b := range buckets {
        sort.Ints(b)
        w += copy(a[w:], b)
    }
}`
};
