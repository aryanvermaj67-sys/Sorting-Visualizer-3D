window.SortCode = window.SortCode || {};
window.SortCode.csharp = {

bubble: `public static void BubbleSort(int[] a)
{
    int n = a.Length;
    for (int i = 0; i < n - 1; i++)
    {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++)
        {
            if (a[j] > a[j + 1])
            {
                (a[j], a[j + 1]) = (a[j + 1], a[j]);
                swapped = true;
            }
        }
        if (!swapped) break;          // already sorted -> O(n)
    }
}`,

cocktail: `public static void CocktailSort(int[] a)
{
    int lo = 0, hi = a.Length - 1;
    bool swapped = true;
    while (swapped && lo < hi)
    {
        swapped = false;
        for (int i = lo; i < hi; i++)
            if (a[i] > a[i + 1]) { (a[i], a[i + 1]) = (a[i + 1], a[i]); swapped = true; }
        hi--;
        for (int i = hi; i > lo; i--)
            if (a[i - 1] > a[i]) { (a[i - 1], a[i]) = (a[i], a[i - 1]); swapped = true; }
        lo++;
    }
}`,

selection: `public static void SelectionSort(int[] a)
{
    int n = a.Length;
    for (int i = 0; i < n - 1; i++)
    {
        int m = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[m]) m = j;
        if (m != i) (a[i], a[m]) = (a[m], a[i]);
    }
}`,

insertion: `public static void InsertionSort(int[] a)
{
    for (int i = 1; i < a.Length; i++)
    {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key)
        {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}`,

shell: `public static void ShellSort(int[] a)
{
    int n = a.Length;
    for (int gap = n / 2; gap > 0; gap /= 2)
    {
        for (int i = gap; i < n; i++)
        {
            int key = a[i], j = i;
            while (j >= gap && a[j - gap] > key)
            {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
    }
}`,

comb: `public static void CombSort(int[] a)
{
    int n = a.Length, gap = n;
    bool swapped = true;
    while (gap > 1 || swapped)
    {
        gap = Math.Max(1, (int)(gap / 1.3));
        swapped = false;
        for (int i = 0; i + gap < n; i++)
            if (a[i] > a[i + gap]) { (a[i], a[i + gap]) = (a[i + gap], a[i]); swapped = true; }
    }
}`,

gnome: `public static void GnomeSort(int[] a)
{
    int i = 0;
    while (i < a.Length)
    {
        if (i == 0 || a[i] >= a[i - 1]) i++;
        else { (a[i], a[i - 1]) = (a[i - 1], a[i]); i--; }
    }
}`,

merge: `public static void MergeSort(int[] a)
{
    if (a.Length > 1) MergeSort(a, new int[a.Length], 0, a.Length - 1);
}

private static void MergeSort(int[] a, int[] buf, int lo, int hi)
{
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    MergeSort(a, buf, lo, mid);
    MergeSort(a, buf, mid + 1, hi);

    Array.Copy(a, lo, buf, lo, hi - lo + 1);
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++)
    {
        if (i > mid)                a[k] = buf[j++];
        else if (j > hi)            a[k] = buf[i++];
        else if (buf[i] <= buf[j])  a[k] = buf[i++];   // <= keeps it stable
        else                        a[k] = buf[j++];
    }
}`,

quick: `public static void QuickSort(int[] a, int lo, int hi)
{
    if (lo >= hi) return;
    int p = Partition(a, lo, hi);
    QuickSort(a, lo, p - 1);
    QuickSort(a, p + 1, hi);
}

private static int Partition(int[] a, int lo, int hi)
{
    int pivot = a[hi], i = lo - 1;        // Lomuto scheme
    for (int j = lo; j < hi; j++)
    {
        if (a[j] < pivot)
        {
            i++;
            (a[i], a[j]) = (a[j], a[i]);
        }
    }
    (a[i + 1], a[hi]) = (a[hi], a[i + 1]);
    return i + 1;
}`,

heap: `public static void HeapSort(int[] a)
{
    int n = a.Length;
    for (int i = n / 2 - 1; i >= 0; i--) SiftDown(a, i, n - 1);
    for (int end = n - 1; end > 0; end--)
    {
        (a[0], a[end]) = (a[end], a[0]);
        SiftDown(a, 0, end - 1);
    }
}

private static void SiftDown(int[] a, int root, int end)
{
    while (true)
    {
        int child = 2 * root + 1;
        if (child > end) return;
        if (child + 1 <= end && a[child] < a[child + 1]) child++;
        if (a[root] >= a[child]) return;
        (a[root], a[child]) = (a[child], a[root]);
        root = child;
    }
}`,

counting: `public static void CountingSort(int[] a)
{
    if (a.Length == 0) return;
    int k = a.Max();

    int[] count = new int[k + 1];
    foreach (int v in a) count[v]++;
    for (int i = 1; i <= k; i++) count[i] += count[i - 1];

    int[] outp = new int[a.Length];
    for (int i = a.Length - 1; i >= 0; i--) outp[--count[a[i]]] = a[i];
    Array.Copy(outp, a, a.Length);
}`,

radix: `public static void RadixSort(int[] a)
{
    if (a.Length == 0) return;
    int max = a.Max();
    int[] outp = new int[a.Length];

    for (int exp = 1; max / exp > 0; exp *= 10)
    {
        int[] count = new int[10];
        foreach (int v in a) count[(v / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = a.Length - 1; i >= 0; i--)
            outp[--count[(a[i] / exp) % 10]] = a[i];
        Array.Copy(outp, a, a.Length);
    }
}`,

bucket: `public static void BucketSort(int[] a)
{
    if (a.Length == 0) return;
    int k = Math.Max(1, (int)Math.Sqrt(a.Length));
    int hi = a.Max() + 1;

    var buckets = new List<int>[k];
    for (int i = 0; i < k; i++) buckets[i] = new List<int>();
    foreach (int v in a)
        buckets[Math.Min(k - 1, (int)((long)v * k / hi))].Add(v);

    int w = 0;
    foreach (var b in buckets)
    {
        b.Sort();
        foreach (int v in b) a[w++] = v;
    }
}`
};
