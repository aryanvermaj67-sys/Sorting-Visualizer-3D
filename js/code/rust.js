window.SortCode = window.SortCode || {};
window.SortCode.rust = {

bubble: `pub fn bubble_sort(a: &mut [i32]) {
    let n = a.len();
    for i in 0..n.saturating_sub(1) {
        let mut swapped = false;
        for j in 0..n - 1 - i {
            if a[j] > a[j + 1] {
                a.swap(j, j + 1);
                swapped = true;
            }
        }
        if !swapped {
            break; // already sorted -> O(n)
        }
    }
}`,

cocktail: `pub fn cocktail_sort(a: &mut [i32]) {
    if a.is_empty() { return; }
    let (mut lo, mut hi) = (0usize, a.len() - 1);
    let mut swapped = true;
    while swapped && lo < hi {
        swapped = false;
        for i in lo..hi {
            if a[i] > a[i + 1] { a.swap(i, i + 1); swapped = true; }
        }
        hi -= 1;
        let mut i = hi;
        while i > lo {
            if a[i - 1] > a[i] { a.swap(i - 1, i); swapped = true; }
            i -= 1;
        }
        lo += 1;
    }
}`,

selection: `pub fn selection_sort(a: &mut [i32]) {
    let n = a.len();
    for i in 0..n.saturating_sub(1) {
        let mut m = i;
        for j in i + 1..n {
            if a[j] < a[m] { m = j; }
        }
        if m != i { a.swap(i, m); }
    }
}`,

insertion: `pub fn insertion_sort(a: &mut [i32]) {
    for i in 1..a.len() {
        let key = a[i];
        let mut j = i;
        while j > 0 && a[j - 1] > key {
            a[j] = a[j - 1];
            j -= 1;
        }
        a[j] = key;
    }
}`,

shell: `pub fn shell_sort(a: &mut [i32]) {
    let n = a.len();
    let mut gap = n / 2;
    while gap > 0 {
        for i in gap..n {
            let key = a[i];
            let mut j = i;
            while j >= gap && a[j - gap] > key {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
        gap /= 2;
    }
}`,

comb: `pub fn comb_sort(a: &mut [i32]) {
    let n = a.len();
    let mut gap = n;
    let mut swapped = true;
    while gap > 1 || swapped {
        gap = ((gap as f64) / 1.3) as usize;
        if gap < 1 { gap = 1; }
        swapped = false;
        let mut i = 0;
        while i + gap < n {
            if a[i] > a[i + gap] { a.swap(i, i + gap); swapped = true; }
            i += 1;
        }
    }
}`,

gnome: `pub fn gnome_sort(a: &mut [i32]) {
    let mut i = 0usize;
    while i < a.len() {
        if i == 0 || a[i] >= a[i - 1] {
            i += 1;
        } else {
            a.swap(i, i - 1);
            i -= 1;
        }
    }
}`,

merge: `pub fn merge_sort(a: &mut Vec<i32>) {
    if a.len() < 2 { return; }
    let mut buf = a.clone();
    let hi = a.len() - 1;
    merge_run(a, &mut buf, 0, hi);
}

fn merge_run(a: &mut Vec<i32>, buf: &mut Vec<i32>, lo: usize, hi: usize) {
    if lo >= hi { return; }
    let mid = lo + (hi - lo) / 2;
    merge_run(a, buf, lo, mid);
    merge_run(a, buf, mid + 1, hi);

    buf[lo..=hi].copy_from_slice(&a[lo..=hi]);
    let (mut i, mut j) = (lo, mid + 1);
    for k in lo..=hi {
        if i > mid {
            a[k] = buf[j]; j += 1;
        } else if j > hi {
            a[k] = buf[i]; i += 1;
        } else if buf[i] <= buf[j] {   // <= keeps it stable
            a[k] = buf[i]; i += 1;
        } else {
            a[k] = buf[j]; j += 1;
        }
    }
}`,

quick: `pub fn quick_sort(a: &mut [i32]) {
    if a.len() < 2 { return; }
    let p = partition(a);
    let (left, right) = a.split_at_mut(p);
    quick_sort(left);
    quick_sort(&mut right[1..]);
}

fn partition(a: &mut [i32]) -> usize {
    let hi = a.len() - 1;
    let pivot = a[hi];                  // Lomuto scheme
    let mut i = 0usize;
    for j in 0..hi {
        if a[j] < pivot {
            a.swap(i, j);
            i += 1;
        }
    }
    a.swap(i, hi);
    i
}`,

heap: `pub fn heap_sort(a: &mut [i32]) {
    let n = a.len();
    if n < 2 { return; }
    for i in (0..n / 2).rev() {
        sift_down(a, i, n - 1);
    }
    for end in (1..n).rev() {
        a.swap(0, end);
        sift_down(a, 0, end - 1);
    }
}

fn sift_down(a: &mut [i32], mut root: usize, end: usize) {
    loop {
        let mut child = 2 * root + 1;
        if child > end { return; }
        if child + 1 <= end && a[child] < a[child + 1] { child += 1; }
        if a[root] >= a[child] { return; }
        a.swap(root, child);
        root = child;
    }
}`,

counting: `pub fn counting_sort(a: &mut [i32]) {
    if a.is_empty() { return; }
    let k = *a.iter().max().unwrap() as usize;

    let mut count = vec![0usize; k + 1];
    for &v in a.iter() { count[v as usize] += 1; }
    for i in 1..=k { count[i] += count[i - 1]; }

    let mut out = vec![0i32; a.len()];
    for &v in a.iter().rev() {          // rev() keeps it stable
        count[v as usize] -= 1;
        out[count[v as usize]] = v;
    }
    a.copy_from_slice(&out);
}`,

radix: `pub fn radix_sort(a: &mut [i32]) {
    if a.is_empty() { return; }
    let max = *a.iter().max().unwrap();

    let mut out = vec![0i32; a.len()];
    let mut exp = 1i32;
    while max / exp > 0 {
        let mut count = [0usize; 10];
        for &v in a.iter() { count[((v / exp) % 10) as usize] += 1; }
        for i in 1..10 { count[i] += count[i - 1]; }
        for &v in a.iter().rev() {
            let d = ((v / exp) % 10) as usize;
            count[d] -= 1;
            out[count[d]] = v;
        }
        a.copy_from_slice(&out);
        exp *= 10;
    }
}`,

bucket: `pub fn bucket_sort(a: &mut [i32]) {
    if a.is_empty() { return; }
    let k = ((a.len() as f64).sqrt() as usize).max(1);
    let hi = (*a.iter().max().unwrap() as i64) + 1;

    let mut buckets: Vec<Vec<i32>> = vec![Vec::new(); k];
    for &v in a.iter() {
        let b = ((v as i64 * k as i64) / hi) as usize;
        buckets[b.min(k - 1)].push(v);
    }

    let mut w = 0usize;
    for b in buckets.iter_mut() {
        b.sort_unstable();
        for &v in b.iter() {
            a[w] = v;
            w += 1;
        }
    }
}`
};
