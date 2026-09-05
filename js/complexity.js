
(function (global) {
  'use strict';

  var CATALOG = [
    {
      id: 'bubble',
      name: 'Bubble Sort',
      family: 'Exchange',
      origin: 'Studied since the 1950s; the name is popularised by Iverson, 1962',
      best: 'O(n)', avg: 'O(n^2)', worst: 'O(n^2)', space: 'O(1)',
      stable: true, inPlace: true, adaptive: true, comparison: true,
      idea: 'Repeatedly walk the array swapping any pair that is out of order. After pass k the k largest values have bubbled to the end.',
      use: 'Teaching, and tiny or nearly sorted inputs where the early-exit flag makes it linear.',
      how: [
        'Compare the first two elements; swap them if the left one is larger.',
        'Slide one position right and repeat to the end of the array.',
        'The largest value is now parked at the end, so shrink the range by one.',
        'Repeat the passes. If a whole pass makes no swap, the array is sorted and you stop early.'
      ],
      pros: ['Trivial to write and to reason about', 'Stable', 'Detects an already sorted array in a single O(n) pass'],
      cons: ['Quadratic on anything realistic', 'Moves elements one slot at a time, so it does far more swaps than insertion sort'],
      bestWhen: 'The array is already sorted - one pass, no swaps, early exit.',
      worstWhen: 'The array is reversed - every pass swaps every pair, about n^2/2 swaps.',
      fact: 'Knuth wrote that bubble sort "has nothing to recommend it except a catchy name". It survives entirely as a teaching tool.',
      color: [96, 165, 250]
    },
    {
      id: 'cocktail',
      name: 'Cocktail Shaker Sort',
      family: 'Exchange',
      origin: 'A bidirectional variant of bubble sort, also called shaker or ripple sort',
      best: 'O(n)', avg: 'O(n^2)', worst: 'O(n^2)', space: 'O(1)',
      stable: true, inPlace: true, adaptive: true, comparison: true,
      idea: 'Bubble sort that alternates direction, so small values stranded at the far end (turtles) move left quickly instead of one step per pass.',
      use: 'Marginally better than bubble sort on data with a few badly placed small elements.',
      how: [
        'Bubble forwards from the left boundary to the right, carrying the largest value to the right end.',
        'Shrink the right boundary by one.',
        'Bubble backwards from right to left, carrying the smallest value to the left end.',
        'Shrink the left boundary by one and repeat until the two boundaries meet.'
      ],
      pros: ['Fixes the turtle problem that cripples plain bubble sort', 'Stable and in place', 'Still detects sorted input in one pass'],
      cons: ['Still quadratic', 'Roughly twice the code of bubble sort for a constant-factor gain'],
      bestWhen: 'Already sorted input, or a small value sitting near the end that one backward pass can rescue.',
      worstWhen: 'Reversed input, exactly like bubble sort.',
      fact: 'A "turtle" is a small value near the end of the array. Bubble sort moves turtles left only one slot per full pass, which is why the backward sweep helps so much.',
      color: [125, 211, 252]
    },
    {
      id: 'selection',
      name: 'Selection Sort',
      family: 'Selection',
      origin: 'One of the classical textbook sorts, in use since the earliest computing era',
      best: 'O(n^2)', avg: 'O(n^2)', worst: 'O(n^2)', space: 'O(1)',
      stable: false, inPlace: true, adaptive: false, comparison: true,
      idea: 'Scan the unsorted suffix for the minimum and swap it into the boundary position. Exactly n-1 swaps, always.',
      use: 'When writes are far more expensive than reads (for example EEPROM or flash cells).',
      how: [
        'Treat position 0 as the boundary between the sorted prefix and the unsorted rest.',
        'Scan the whole unsorted region to find the smallest element.',
        'Swap that smallest element into the boundary position.',
        'Move the boundary right by one and repeat until only one element remains.'
      ],
      pros: ['Exactly n-1 swaps, the minimum possible for a swap-based sort', 'Completely predictable timing', 'In place, no recursion'],
      cons: ['Always does about n^2/2 comparisons even on sorted input', 'Not stable', 'Not adaptive at all'],
      bestWhen: 'Never faster than its worst case - the comparison count is fixed regardless of the input.',
      worstWhen: 'Same as every other case. Only the number of swaps varies, never the comparisons.',
      fact: 'This is the sort to reach for when a write costs far more than a read. Flash memory has limited erase cycles, so minimising writes can matter more than minimising comparisons.',
      color: [251, 191, 36]
    },
    {
      id: 'insertion',
      name: 'Insertion Sort',
      family: 'Insertion',
      origin: 'Classical; the way most people sort a hand of playing cards',
      best: 'O(n)', avg: 'O(n^2)', worst: 'O(n^2)', space: 'O(1)',
      stable: true, inPlace: true, adaptive: true, comparison: true,
      idea: 'Grow a sorted prefix one element at a time, shifting larger elements right to open a slot for the new key.',
      use: 'The real workhorse for small runs. Timsort and introsort both fall back to it under a size threshold.',
      how: [
        'The first element alone counts as a sorted prefix.',
        'Take the next element and hold it aside as the key.',
        'Shift every element in the prefix that is larger than the key one slot to the right.',
        'Drop the key into the gap that opens up, then repeat for the next element.'
      ],
      pros: ['Linear on nearly sorted data', 'Stable and in place', 'Very low constant factor, so it beats O(n log n) sorts on small arrays', 'Online: it can sort a stream as items arrive'],
      cons: ['Quadratic on random or reversed data', 'Shifts a lot of elements when a key travels far'],
      bestWhen: 'Already sorted or nearly sorted input - each key stops after one comparison, giving O(n).',
      worstWhen: 'Reversed input - every key must travel the whole length of the prefix.',
      fact: 'This is the one quadratic sort real libraries still ship. Python, Java and C++ all fall back to insertion sort for small subarrays because its constant factor is so low.',
      color: [52, 211, 153]
    },
    {
      id: 'shell',
      name: 'Shell Sort',
      family: 'Insertion',
      origin: 'Donald L. Shell, 1959',
      best: 'O(n log n)', avg: 'O(n^1.25)', worst: 'O(n^2)', space: 'O(1)',
      stable: false, inPlace: true, adaptive: true, comparison: true,
      idea: 'Insertion sort on interleaved subsequences with a shrinking gap, so elements travel far early and the final gap-1 pass has little left to do.',
      use: 'Embedded and kernel code: no recursion, no extra memory, well under O(n^2) in practice.',
      how: [
        'Pick a starting gap, commonly half the array length.',
        'Run an insertion sort over every subsequence whose elements are that gap apart.',
        'Halve the gap and repeat, so elements make progressively shorter jumps.',
        'The final pass has gap 1, which is a plain insertion sort - but the array is nearly sorted by then, so it is fast.'
      ],
      pros: ['Far faster than insertion sort with no extra memory', 'No recursion, so no stack overhead', 'Simple enough for firmware'],
      cons: ['Not stable', 'The complexity depends entirely on the gap sequence, and the true average is still an open problem'],
      bestWhen: 'Nearly sorted input, where every gap pass finds little to do.',
      worstWhen: 'Depends on the gap sequence. Shell original halving sequence degrades to O(n^2) on adversarial input.',
      fact: 'Nobody has proved the exact average complexity of shell sort. Better gap sequences (Ciura, Sedgewick, Tokuda) are found empirically rather than derived.',
      color: [167, 139, 250]
    },
    {
      id: 'comb',
      name: 'Comb Sort',
      family: 'Exchange',
      origin: 'Wlodzimierz Dobosiewicz, 1980; popularised by Box and Lacey, 1991',
      best: 'O(n log n)', avg: 'O(n^2 / 2^p)', worst: 'O(n^2)', space: 'O(1)',
      stable: false, inPlace: true, adaptive: true, comparison: true,
      idea: 'Bubble sort with a gap that shrinks by a factor of 1.3 each pass, killing turtles before the final gap-1 pass.',
      use: 'A few lines of code for near n log n behaviour when a full merge or quick sort is overkill.',
      how: [
        'Start with a gap equal to the array length.',
        'Divide the gap by the shrink factor 1.3 and compare every pair that far apart, swapping when out of order.',
        'Repeat with an ever smaller gap.',
        'Once the gap reaches 1, keep running bubble passes until one pass makes no swaps.'
      ],
      pros: ['Almost as fast as O(n log n) sorts in practice', 'Ten lines of code, no recursion, no extra memory'],
      cons: ['Not stable', 'Worst case is still quadratic', 'The 1.3 shrink factor is empirical, not derived'],
      bestWhen: 'Already sorted input - the gap passes find nothing and the final pass exits immediately.',
      worstWhen: 'Rare adversarial inputs where the gap sequence repeatedly misses the misplaced elements.',
      fact: 'The shrink factor 1.3 was found by experiment. Values much below it waste passes; much above it and turtles survive to the gap-1 stage.',
      color: [244, 114, 182]
    },
    {
      id: 'gnome',
      name: 'Gnome Sort',
      family: 'Exchange',
      origin: 'Hamid Sarbazi-Azad, 2000, originally published as "stupid sort"',
      best: 'O(n)', avg: 'O(n^2)', worst: 'O(n^2)', space: 'O(1)',
      stable: true, inPlace: true, adaptive: true, comparison: true,
      idea: 'Step forward while the pair is ordered; on a bad pair swap and step backward. One loop, one index, no nesting.',
      use: 'Curiosity value and code-golf. Behaves like insertion sort with swaps instead of shifts.',
      how: [
        'Stand at position 0 and step right.',
        'Compare the current element with the one on its left.',
        'If they are in order, step right. If not, swap them and step left.',
        'When you walk off the right end, the array is sorted.'
      ],
      pros: ['The shortest correct sort there is - one loop and one variable', 'Stable and in place', 'Linear on sorted input'],
      cons: ['Quadratic in general', 'Uses swaps where insertion sort uses cheaper shifts', 'No practical advantage over insertion sort'],
      bestWhen: 'Already sorted input - it walks straight to the end without ever stepping back.',
      worstWhen: 'Reversed input - it backs up all the way for every single element.',
      fact: 'Named after a garden gnome sorting flower pots: he only ever looks at the pot in front of him and the one behind it, and never needs to remember where he is in the row.',
      color: [248, 113, 113]
    },
    {
      id: 'merge',
      name: 'Merge Sort',
      family: 'Divide and conquer',
      origin: 'John von Neumann, 1945',
      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
      stable: true, inPlace: false, adaptive: false, comparison: true,
      idea: 'Split in half, sort each half recursively, then merge the two sorted halves in a single linear pass.',
      use: 'Stable sorting, linked lists, and external sorting where data does not fit in memory.',
      how: [
        'Split the array at its midpoint into a left and a right half.',
        'Sort each half by applying the same procedure recursively, down to single elements.',
        'Merge the two sorted halves: repeatedly take the smaller of the two front elements.',
        'On ties take from the left half first - that single choice is what makes the sort stable.'
      ],
      pros: ['O(n log n) guaranteed, no bad inputs at all', 'Stable', 'Sequential access only, so it works on linked lists, tapes and files bigger than RAM', 'Parallelises cleanly'],
      cons: ['Needs O(n) auxiliary memory', 'Slower than quick sort in practice because of the copying', 'Not adaptive in its basic form'],
      bestWhen: 'Every case is the same: the recursion always splits evenly, so the depth is always log n.',
      worstWhen: 'Same as the best case. This predictability is precisely the point.',
      fact: 'Its recurrence is T(n) = 2T(n/2) + O(n), which the Master Theorem resolves to O(n log n). This is also the sort used when the data is too big for memory and must be merged from files.',
      color: [34, 211, 238]
    },
    {
      id: 'quick',
      name: 'Quick Sort',
      family: 'Divide and conquer',
      origin: 'Tony Hoare, 1959, published 1961',
      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n^2)', space: 'O(log n)',
      stable: false, inPlace: true, adaptive: false, comparison: true,
      idea: 'Pick a pivot, partition into smaller and larger, then recurse. This visual uses Lomuto partitioning with the last element as pivot.',
      use: 'Default in-memory sort almost everywhere. Real implementations randomise the pivot and switch to heap sort on bad recursion depth.',
      how: [
        'Choose a pivot element - here, the last element of the range.',
        'Sweep through the range moving every element smaller than the pivot to the left side.',
        'Swap the pivot into the boundary. It is now in its final sorted position.',
        'Recurse into the sub-range left of the pivot and the sub-range right of it.'
      ],
      pros: ['Fastest general comparison sort in practice - excellent cache behaviour', 'Sorts in place, needing only the recursion stack', 'Partitioning is a tight, branch-friendly loop'],
      cons: ['O(n^2) worst case with a bad pivot', 'Not stable', 'Naive recursion can blow the stack on adversarial input'],
      bestWhen: 'Each pivot lands near the median, splitting the range in half every time.',
      worstWhen: 'Every pivot is the smallest or largest element. With a last-element pivot, already sorted input is the worst case - try it with the Data selector.',
      fact: 'Introsort, the sort in the C++ standard library, runs quick sort but counts its recursion depth and switches to heap sort if it goes too deep - keeping quick sort speed while guaranteeing O(n log n).',
      color: [250, 204, 21]
    },
    {
      id: 'heap',
      name: 'Heap Sort',
      family: 'Selection',
      origin: 'J. W. J. Williams, 1964',
      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',
      stable: false, inPlace: true, adaptive: false, comparison: true,
      idea: 'Build a max-heap in place, then repeatedly swap the root to the end and sift the new root down over the shrinking heap.',
      use: 'Hard real-time guarantees: O(n log n) worst case with no extra memory and no recursion.',
      how: [
        'Read the array as a binary tree: the children of index i live at 2i+1 and 2i+2.',
        'Heapify from the middle backwards so every parent is larger than its children - this takes only O(n).',
        'The root is now the maximum, so swap it with the last element of the heap.',
        'Shrink the heap by one and sift the new root down to restore the heap property. Repeat.'
      ],
      pros: ['O(n log n) worst case guaranteed', 'Truly in place - O(1) extra memory', 'No recursion, so no stack risk', 'Immune to adversarial input'],
      cons: ['Not stable', 'Poor cache locality - it jumps around the array, so it loses to quick sort in wall-clock time', 'Not adaptive'],
      bestWhen: 'All cases are O(n log n). Sorted input gives no speedup.',
      worstWhen: 'No input defeats it. This worst-case guarantee is exactly why it is the safety net inside introsort.',
      fact: 'Building the heap costs only O(n), not O(n log n) - the bound is a neat summation, since most nodes are near the bottom and sift down barely at all.',
      color: [45, 212, 191]
    },
    {
      id: 'counting',
      name: 'Counting Sort',
      family: 'Non-comparison',
      origin: 'Harold H. Seward, 1954',
      best: 'O(n + k)', avg: 'O(n + k)', worst: 'O(n + k)', space: 'O(n + k)',
      stable: true, inPlace: false, adaptive: false, comparison: false,
      idea: 'Count how many times each key occurs, prefix-sum the counts into positions, then place each element directly at its final index.',
      use: 'Small integer key ranges: ages, byte values, grades. It is the inner loop of radix sort.',
      how: [
        'Find the maximum key k and allocate a count array of size k+1.',
        'Count how many times each key value appears.',
        'Replace each count with a running total, so each entry says where that key ends in the output.',
        'Walk the input backwards, placing each element at its counted position and decrementing - backwards is what keeps it stable.'
      ],
      pros: ['Linear time - it beats the O(n log n) comparison lower bound', 'Stable', 'No comparisons at all, so no branch misprediction'],
      cons: ['Only works on integers or keys mappable to a small integer range', 'Memory is O(k), so a huge key range is fatal', 'Not in place'],
      bestWhen: 'k is comparable to n, for example sorting a million people by age.',
      worstWhen: 'k is enormous relative to n - sorting ten 32-bit integers would allocate billions of counters.',
      fact: 'The O(n log n) lower bound applies only to comparison sorts. Counting sort dodges it by never comparing two elements - it uses the key itself as an array index.',
      color: [163, 230, 53]
    },
    {
      id: 'radix',
      name: 'Radix Sort (LSD)',
      family: 'Non-comparison',
      origin: 'Herman Hollerith, 1887, for mechanical punched-card tabulating machines',
      best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n + b)',
      stable: true, inPlace: false, adaptive: false, comparison: false,
      idea: 'Run a stable counting sort on each digit from least significant to most significant. Stability is what makes earlier digits survive.',
      use: 'Fixed-width keys in bulk: integers, IPs, strings of equal length. Beats comparison sorts when k is small.',
      how: [
        'Start with the least significant digit - the ones column.',
        'Stably sort the whole array by just that digit, using counting sort.',
        'Move to the next digit up and stably sort by it.',
        'After the most significant digit, the array is fully sorted.'
      ],
      pros: ['O(nk), effectively linear for fixed-width keys', 'Stable', 'Predictable, comparison-free, and vectorises well'],
      cons: ['Needs keys decomposable into digits', 'Multiple full passes over the data', 'Extra memory for the output buffer'],
      bestWhen: 'Many elements with few digits - millions of 32-bit integers in 4 byte-wide passes.',
      worstWhen: 'Few elements with long keys, where k dominates and a comparison sort wins.',
      fact: 'Stability is not a nice-to-have here, it is load-bearing. If the pass on the tens digit reordered ties, it would destroy the ones-digit ordering already achieved and the algorithm would simply be wrong.',
      color: [232, 121, 249]
    },
    {
      id: 'bucket',
      name: 'Bucket Sort',
      family: 'Non-comparison',
      origin: 'A classical distribution sort, closely related to counting and radix sort',
      best: 'O(n + k)', avg: 'O(n + k)', worst: 'O(n^2)', space: 'O(n + k)',
      stable: true, inPlace: false, adaptive: false, comparison: false,
      idea: 'Scatter values into range buckets, sort each bucket (insertion sort here), then concatenate the buckets in order.',
      use: 'Data that is roughly uniform over a known range. Degrades to O(n^2) when everything lands in one bucket.',
      how: [
        'Divide the key range into k buckets - this visual uses about sqrt(n) of them.',
        'Scatter every element into the bucket its value falls in.',
        'Sort each bucket independently, typically with insertion sort since buckets stay small.',
        'Concatenate the buckets in order; the result is fully sorted.'
      ],
      pros: ['Linear on uniformly distributed data', 'Buckets are independent, so it parallelises trivially', 'Stable when the per-bucket sort is stable'],
      cons: ['Collapses to O(n^2) when the distribution is skewed', 'Needs to know the key range in advance', 'Extra memory for the buckets'],
      bestWhen: 'Values are spread evenly, so every bucket holds about n/k elements.',
      worstWhen: 'All values land in one bucket - then it is just insertion sort on the whole array. Try the "Few unique" data setting.',
      fact: 'Bucket, counting and radix sort are the same family: counting sort is bucket sort with one bucket per distinct key, and radix sort is repeated counting sort, one digit at a time.',
      color: [251, 146, 60]
    }
  ];

  var BY_ID = {};
  CATALOG.forEach(function (m) { BY_ID[m.id] = m; });

  var LANGUAGES = [
    { id: 'python', name: 'Python', ext: 'py' },
    { id: 'java', name: 'Java', ext: 'java' },
    { id: 'cpp', name: 'C++', ext: 'cpp' },
    { id: 'c', name: 'C', ext: 'c' },
    { id: 'javascript', name: 'JavaScript', ext: 'js' },
    { id: 'csharp', name: 'C#', ext: 'cs' },
    { id: 'go', name: 'Go', ext: 'go' },
    { id: 'rust', name: 'Rust', ext: 'rs' }
  ];

  global.SortCatalog = { list: CATALOG, byId: BY_ID, languages: LANGUAGES };
})(window);
