
(function () {
  'use strict';

  var CAT = window.SortCatalog;
  var ALGO = window.SortAlgorithms;
  var CODE = window.SortCode;
  var clamp = window.Engine3D.clamp;

  var MAX_OPS = 600000;
  var SPAN = 700;
  var MAXH = 330;

  var C = {
    cmp: [255, 217, 61],
    swap: [255, 93, 93],
    write: [34, 211, 238],
    pivot: [192, 132, 252],
    sorted: [53, 210, 154]
  };

  function hsl2rgb(h, s, l) {
    h = (h % 360) / 360; s /= 100; l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    var m = l - c / 2, r = 0, g = 0, b = 0;
    var seg = Math.floor(h * 6);
    if (seg === 0) { r = c; g = x; }
    else if (seg === 1) { r = x; g = c; }
    else if (seg === 2) { g = c; b = x; }
    else if (seg === 3) { g = x; b = c; }
    else if (seg === 4) { r = x; b = c; }
    else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  function rgbCss(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
    });
  }

  var S = {
    lang: 'python',
    size: 46,
    speed: 34,
    depth: 42,
    dist: 'random',
    spin: false,
    labels: false,
    sound: false,
    motion: true,
    seed: [],
    maxVal: 100,
    elapsed: 0,
    lastT: 0
  };

  var main = null;

  var el = {};
  ['algo-list', 'canvas', 'stage-title', 'stage-sub', 'btn-play', 'btn-step', 'btn-back',
    'btn-reset', 'btn-shuffle', 'btn-center', 'controls', 'sel-dist', 'rng-size', 'lbl-size',
    'rng-speed', 'lbl-speed', 'rng-depth', 'lbl-depth', 'cb-spin', 'cb-labels', 'cb-sound',
    'cb-motion', 'st-cmp', 'st-swap', 'st-write', 'st-time', 'st-prog', 'rng-scrub',
    'ins-name', 'ins-family', 'ins-idea', 'ins-use', 'ins-best', 'ins-avg', 'ins-worst',
    'ins-space', 'ins-stable', 'ins-inplace', 'ins-adaptive', 'ins-method', 'ins-origin',
    'ins-how', 'ins-pros', 'ins-cons', 'ins-bestwhen', 'ins-worstwhen', 'ins-fact',
    'inspect', 'tab-about', 'tab-code', 'lang-bar', 'code', 'code-file', 'btn-copy',
    'btn-download', 'btn-race', 'race', 'race-grid', 'btn-race-close', 'btn-race-restart',
    'btn-compare', 'compare', 'cmp-a', 'cmp-b', 'cmp-play', 'cmp-step', 'cmp-reset',
    'cmp-speed', 'cmp-lbl-speed',
    'cmp-finish', 'cmp-close', 'cmp-canvas-a', 'cmp-canvas-b', 'cmp-name-a', 'cmp-name-b',
    'cmp-stats-a', 'cmp-stats-b', 'cmp-table', 'cmp-verdict'
  ].forEach(function (id) { el[id] = document.getElementById(id); });

  var renderer = new window.Engine3D.Renderer(el['canvas']);
  renderer.attachControls(el['canvas']);

  function makeArray(n, dist) {
    var a = new Array(n), i, v;
    var max = 100;
    for (i = 0; i < n; i++) a[i] = 1 + Math.floor(((i + 1) / n) * (max - 1));

    switch (dist) {
      case 'sorted':
        break;
      case 'reversed':
        a.reverse();
        break;
      case 'nearly':
        for (i = 0; i < Math.max(1, Math.floor(n * 0.08)); i++) {
          var x = Math.floor(Math.random() * n), y = Math.floor(Math.random() * n);
          v = a[x]; a[x] = a[y]; a[y] = v;
        }
        break;
      case 'few':
        var levels = Math.max(3, Math.floor(Math.sqrt(n)));
        for (i = 0; i < n; i++) {
          a[i] = 1 + Math.floor(Math.random() * levels) * Math.floor((max - 1) / levels);
        }
        break;
      case 'sawtooth':
        var period = Math.max(4, Math.floor(n / 5));
        for (i = 0; i < n; i++) a[i] = 1 + Math.floor(((i % period) / period) * (max - 1));
        break;
      default:
        for (i = n - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          v = a[i]; a[i] = a[j]; a[j] = v;
        }
    }
    return a;
  }

  function recordTimeline(algoId, seed) {
    var work = seed.slice();
    var shadow = seed.slice();
    var gen = ALGO[algoId](work);
    var ops = [], r, op, t;

    while (!(r = gen.next()).done) {
      op = r.value;
      if (op.t === 'set') {
        op.old = shadow[op.i];
        op.val = work[op.i];
        shadow[op.i] = op.val;
      } else if (op.t === 'swap') {
        t = shadow[op.i]; shadow[op.i] = shadow[op.j]; shadow[op.j] = t;
      }
      ops.push(op);
      if (ops.length >= MAX_OPS) break;
      if (op.t === 'done') break;
    }
    return ops;
  }

  function makeRun(algoId, seed, opts) {
    opts = opts || {};
    return {
      algo: algoId,
      arr: seed.slice(),
      ops: recordTimeline(algoId, seed),
      pc: 0,
      hi: {},
      anim: {},
      sorted: new Set(),
      range: null,
      cmp: 0, swaps: 0, writes: 0,
      finished: false,
      sound: !!opts.sound
    };
  }

  function runProgress(run) {
    return run.ops.length ? run.pc / run.ops.length : 0;
  }

  function runAtEnd(run) {
    return run.ops.length > 0 && run.pc >= run.ops.length;
  }

  function isSorted(a) {
    for (var i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false;
    return true;
  }

  function animDuration() {
    return S.motion ? clamp(1800 / Math.max(1, S.speed), 40, 300) : 0;
  }

  function startAnim(run, i, fromSlot, fromV) {
    if (!S.motion) return;
    var d = animDuration();
    if (d <= 0) return;
    run.anim[i] = { fromSlot: fromSlot, fromV: fromV, t0: performance.now(), dur: d };
  }

  function mark(run, i, color, ttl) {
    if (i == null || i < 0 || i >= run.arr.length) return;
    run.hi[i] = { c: color, ttl: ttl || 14 };
  }

  function applyOp(run, op) {
    var t;
    switch (op.t) {
      case 'cmp':
        run.cmp++;
        mark(run, op.i, C.cmp, 12);
        mark(run, op.j, C.cmp, 12);
        if (run.sound) beep(run.arr[op.i]);
        break;
      case 'swap':
        t = run.arr[op.i]; run.arr[op.i] = run.arr[op.j]; run.arr[op.j] = t;
        run.swaps++; run.writes += 2;
        startAnim(run, op.i, op.j, run.arr[op.i]);
        startAnim(run, op.j, op.i, run.arr[op.j]);
        mark(run, op.i, C.swap, 18);
        mark(run, op.j, C.swap, 18);
        if (run.sound) beep(run.arr[op.j]);
        break;
      case 'set':
        run.arr[op.i] = op.val;
        run.writes++;
        startAnim(run, op.i, op.i, op.old);
        mark(run, op.i, C.write, 16);
        if (run.sound) beep(op.val);
        break;
      case 'pivot':
        mark(run, op.i, C.pivot, 26);
        break;
      case 'range':
        op._prev = run.range;
        run.range = { lo: op.lo, hi: op.hi, ttl: 40 };
        break;
      case 'sorted':
        op._added = !run.sorted.has(op.i);
        run.sorted.add(op.i);
        break;
      case 'done':
        break;
    }
  }

  function undoOp(run, op) {
    var t;
    switch (op.t) {
      case 'cmp':
        run.cmp--;
        mark(run, op.i, C.cmp, 12);
        mark(run, op.j, C.cmp, 12);
        break;
      case 'swap':
        t = run.arr[op.i]; run.arr[op.i] = run.arr[op.j]; run.arr[op.j] = t;
        run.swaps--; run.writes -= 2;
        startAnim(run, op.i, op.j, run.arr[op.i]);
        startAnim(run, op.j, op.i, run.arr[op.j]);
        mark(run, op.i, C.swap, 18);
        mark(run, op.j, C.swap, 18);
        break;
      case 'set':
        run.arr[op.i] = op.old;
        run.writes--;
        startAnim(run, op.i, op.i, op.val);
        mark(run, op.i, C.write, 16);
        break;
      case 'pivot':
        mark(run, op.i, C.pivot, 20);
        break;
      case 'range':
        run.range = op._prev || null;
        break;
      case 'sorted':
        if (op._added) run.sorted.delete(op.i);
        break;
      case 'done':
        break;
    }
  }

  function stepRun(run) {
    if (run.pc >= run.ops.length) { run.finished = true; return false; }
    applyOp(run, run.ops[run.pc]);
    run.pc++;
    if (run.pc >= run.ops.length) { run.finished = true; return false; }
    run.finished = false;
    return true;
  }

  function backRun(run) {
    if (run.pc <= 0) return false;
    run.pc--;
    undoOp(run, run.ops[run.pc]);
    run.finished = false;
    return true;
  }

  function seekRun(run, target) {
    target = clamp(Math.round(target), 0, run.ops.length);
    var guard = 0;
    var keepMotion = S.motion, keepSound = run.sound;
    if (Math.abs(target - run.pc) > 3) { S.motion = false; run.sound = false; }
    while (run.pc < target && guard++ < MAX_OPS) { applyOp(run, run.ops[run.pc]); run.pc++; }
    while (run.pc > target && guard++ < MAX_OPS) { run.pc--; undoOp(run, run.ops[run.pc]); }
    S.motion = keepMotion;
    run.sound = keepSound;
    run.finished = run.pc >= run.ops.length;
  }

  function decayRun(run) {
    for (var k in run.hi) {
      if (--run.hi[k].ttl <= 0) delete run.hi[k];
    }
    if (run.range && --run.range.ttl <= 0) run.range = null;
  }

  var audioCtx = null, lastBeep = 0;
  function beep(value) {
    if (!S.sound || value == null) return;
    var now = performance.now();
    if (now - lastBeep < 16) return;
    lastBeep = now;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 180 + (value / S.maxVal) * 900;
      g.gain.setValueAtTime(0.055, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.055);
      osc.connect(g).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) { S.sound = false; }
  }

  var metrics = null;

  function viewMetrics(force) {
    if (metrics && !force) return metrics;
    var ctrl = el['controls'];
    var overlaps = ctrl && getComputedStyle(ctrl).position === 'absolute';
    var ctrlH = overlaps ? ctrl.offsetHeight + 24 : 0;
    var head = document.getElementById('stage-head');
    var topPad = (head ? head.offsetHeight : 48) + 8;
    metrics = { topPad: topPad, usable: Math.max(140, renderer.h - ctrlH - topPad) };
    return metrics;
  }

  function contentCorners(depth) {
    var hz = (8 + (depth / 100) * 82) / 2 + 26;
    var hx = SPAN / 2 + 26;
    var hy = 10 + MAXH;
    return [
      [-hx, 0, -hz], [hx, 0, -hz], [-hx, 0, hz], [hx, 0, hz],
      [-hx, hy, -hz], [hx, hy, -hz], [-hx, hy, hz], [hx, hy, hz]
    ];
  }

  function projectedBounds(rnd, depth) {
    var cam = rnd.camera;
    var keepX = cam.cx, keepY = cam.cy;
    cam.cx = 0; cam.cy = 0;

    var pts = contentCorners(depth), any = false;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      var p = cam.project(pts[i][0], pts[i][1], pts[i][2]);
      if (!p) continue;
      any = true;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    cam.cx = keepX; cam.cy = keepY;
    if (!any) return null;
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY, w: maxX - minX, h: maxY - minY };
  }

  function centerOn(rnd, depth, topPad, usable) {
    rnd.camera.target.y = (10 + MAXH) * 0.5;
    var b = projectedBounds(rnd, depth);
    if (!b) return;
    rnd.camera.cx = rnd.w * 0.5 - (b.minX + b.maxX) * 0.5;
    rnd.camera.cy = topPad + usable * 0.5 - (b.minY + b.maxY) * 0.5;
  }

  function fitTo(rnd, depth, topPad, usable, fill) {
    fill = fill || 0.90;
    for (var i = 0; i < 40; i++) {
      centerOn(rnd, depth, topPad, usable);
      var b = projectedBounds(rnd, depth);
      if (!b || b.w <= 1 || b.h <= 1) break;
      var s = Math.min(rnd.w * fill / b.w, usable * fill / b.h);
      if (Math.abs(s - 1) < 0.004) break;
      var next = clamp(rnd.camera.dist / s, 240, 2800);
      if (next === rnd.camera.dist) break;
      rnd.camera.dist = next;
    }
    centerOn(rnd, depth, topPad, usable);
  }

  function centerCamera() {
    var m = viewMetrics();
    centerOn(renderer, S.depth, m.topPad, m.usable);
  }

  function frameCamera() {
    var m = viewMetrics(true);
    fitTo(renderer, S.depth, m.topPad, m.usable);
  }

  function drawFloor(rnd, run, depth) {
    var bd = 8 + (depth / 100) * 82;
    var x0 = -SPAN / 2;
    var y = -1.5;
    var z0 = -bd / 2 - 26, z1 = bd / 2 + 26;
    var xa = x0 - 26, xb = -x0 + 26;

    rnd.pushFace([[xa, y, z0], [xb, y, z0], [xb, y, z1], [xa, y, z1]],
      null, [14, 22, 40], null, 0.92);

    for (var i = 0; i <= 10; i++) {
      var t = xa + (xb - xa) * (i / 10);
      rnd.pushLine([t, y + 0.4, z0], [t, y + 0.4, z1], 'rgba(84,124,190,0.20)', 1);
    }
    rnd.pushLine([xa, y + 0.4, z0], [xb, y + 0.4, z0], 'rgba(84,124,190,0.28)', 1);
    rnd.pushLine([xa, y + 0.4, z1], [xb, y + 0.4, z1], 'rgba(84,124,190,0.28)', 1);

    if (run.range && run.range.ttl > 0) {
      var n = run.arr.length, spacing = SPAN / Math.max(1, n);
      var ra = -SPAN / 2 + run.range.lo * spacing;
      var rb = -SPAN / 2 + (run.range.hi + 1) * spacing;
      rnd.pushFace([[ra, y + 1, z0], [rb, y + 1, z0], [rb, y + 1, z1], [ra, y + 1, z1]],
        null, [70, 110, 190], null, 0.30);
    }
  }

  function drawRun(rnd, run, nowMs, depth, showLabels) {
    var n = run.arr.length;
    var spacing = SPAN / Math.max(1, n);
    var bw = spacing * 0.74;
    var bd = 8 + (depth / 100) * 82;
    var x0 = -SPAN / 2;

    rnd.begin();
    drawFloor(rnd, run, depth);

    var atEnd = runAtEnd(run);

    for (var i = 0; i < n; i++) {
      var v = run.arr[i];
      var slot = i, lift = 0, zo = 0;

      var a = run.anim[i];
      if (a) {
        var t = (nowMs - a.t0) / a.dur;
        if (t >= 1) {
          delete run.anim[i];
        } else {
          var e = easeInOut(t);
          slot = a.fromSlot + (i - a.fromSlot) * e;
          v = a.fromV + (run.arr[i] - a.fromV) * e;
          var d = i - a.fromSlot;
          if (d !== 0) {

            var arc = Math.sin(Math.PI * t);
            lift = arc * Math.min(130, 20 + Math.abs(d) * 4.5);
            zo = arc * (d > 0 ? 1 : -1) * bd * 0.8;
          }
        }
      }

      var ratio = v / S.maxVal;
      var h = 10 + ratio * MAXH;
      var cx = x0 + slot * spacing + spacing / 2;

      var col, glow = null;
      var hl = run.hi[i];
      if (hl) {
        col = hl.c;
        glow = rgbCss(hl.c);
      } else if (atEnd || run.sorted.has(i)) {
        col = C.sorted;
      } else {
        col = hsl2rgb(206 + ratio * 132, 64, 40 + ratio * 20);
      }

      rnd.pushBox(cx - bw / 2, lift, -bd / 2 + zo, cx + bw / 2, lift + h, bd / 2 + zo, col, glow);

      if (showLabels && n <= 60) {
        rnd.pushLabel([cx, lift + h + 16, zo], String(Math.round(v)),
          'rgba(210,226,250,0.85)', '10px ui-monospace, Consolas, monospace');
      }
    }

    rnd.end();
  }

  var playing = false;

  function reseed() {
    S.seed = makeArray(S.size, S.dist);
    S.maxVal = Math.max.apply(null, S.seed) || 1;
    resetRun();
    if (compareOn) buildCompare();
  }

  function resetRun() {
    var algo = main ? main.algo : 'bubble';
    main = makeRun(algo, S.seed, { sound: true });
    S.elapsed = 0;
    setPlaying(false);
    syncScrub();
    updateStats();
    setSub('ready - ' + S.size + ' elements, ' + S.dist +
      ', ' + main.ops.length.toLocaleString() + ' operations');
  }

  function finishMain() {
    setPlaying(false);
    var ok = isSorted(main.arr);
    setSub((ok ? 'sorted' : 'FINISHED (unsorted!)') +
      ' - ' + main.cmp.toLocaleString() + ' compares, ' +
      main.swaps.toLocaleString() + ' swaps, ' +
      main.writes.toLocaleString() + ' writes in ' + S.elapsed.toFixed(1) + 's');
  }

  function setPlaying(v) {
    playing = v;
    el['btn-play'].textContent = v ? 'Pause' : (main && runAtEnd(main) ? 'Replay' : 'Play');
    if (v) S.lastT = performance.now();
  }

  function syncScrub() {
    if (!el['rng-scrub'] || !main) return;
    el['rng-scrub'].max = Math.max(1, main.ops.length);
    el['rng-scrub'].value = main.pc;
  }

  function setSub(t) { el['stage-sub'].textContent = t; }

  function updateStats() {
    if (!main) return;
    el['st-cmp'].textContent = main.cmp.toLocaleString();
    el['st-swap'].textContent = main.swaps.toLocaleString();
    el['st-write'].textContent = main.writes.toLocaleString();
    el['st-time'].textContent = S.elapsed.toFixed(1) + 's';
    el['st-prog'].textContent = Math.round(runProgress(main) * 100) + '%';
    el['btn-back'].disabled = main.pc <= 0;
  }

  var statAcc = 0;

  function frame(now) {
    requestAnimationFrame(frame);

    if (playing) {
      var dt = (now - S.lastT) / 1000;
      S.lastT = now;
      if (dt > 0 && dt < 0.5) S.elapsed += dt;
      for (var k = 0; k < S.speed; k++) {
        if (!stepRun(main)) { finishMain(); break; }
      }
      syncScrub();
    }

    decayRun(main);
    if (S.spin) renderer.camera.yaw += 0.0032;
    centerCamera();
    drawRun(renderer, main, now, S.depth, S.labels);

    statAcc++;
    if (statAcc % 4 === 0) updateStats();
    if (statAcc % 30 === 0) viewMetrics(true);

    if (compareOn) compareFrame(now);
    if (raceOn) raceFrame();
  }

  function buildSidebar() {
    var groups = {};
    CAT.list.forEach(function (m) {
      (groups[m.family] = groups[m.family] || []).push(m);
    });

    var html = '';
    Object.keys(groups).forEach(function (fam) {
      html += '<div class="algo-group">' + fam + '</div>';
      groups[fam].forEach(function (m) {
        html += '<button class="algo" data-id="' + m.id + '">' +
          '<span class="dot" style="background:' + rgbCss(m.color) + ';color:' + rgbCss(m.color) + '"></span>' +
          '<span>' + m.name + '</span>' +
          '<span class="big-o">' + m.avg + '</span></button>';
      });
    });
    el['algo-list'].innerHTML = html;

    el['algo-list'].addEventListener('click', function (e) {
      var b = e.target.closest('.algo');
      if (b) selectAlgo(b.getAttribute('data-id'));
    });
  }

  function selectAlgo(id) {
    Array.prototype.forEach.call(el['algo-list'].querySelectorAll('.algo'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-id') === id);
    });
    var m = CAT.byId[id];
    el['stage-title'].textContent = m.name;
    fillInspector(m);
    main = makeRun(id, S.seed, { sound: true });
    renderCode();
    S.elapsed = 0;
    setPlaying(false);
    syncScrub();
    updateStats();
    setSub('ready - ' + S.size + ' elements, ' + S.dist +
      ', ' + main.ops.length.toLocaleString() + ' operations');
  }

  function cxClass(s) {
    if (/n\^2/.test(s)) return 'cx-b';
    if (/log/.test(s) || /n \+ k/.test(s) || /nk/.test(s) || /n\^1/.test(s)) return 'cx-a';
    if (/O\(n\)/.test(s) || /O\(1\)/.test(s)) return 'cx-o';
    return '';
  }

  function fillList(node, items) {
    node.innerHTML = (items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
  }

  function yn(v) {
    return '<span class="tag ' + (v ? 'yes' : 'no') + '">' + (v ? 'YES' : 'NO') + '</span>';
  }

  function fillInspector(m) {
    el['ins-name'].textContent = m.name;
    el['ins-family'].textContent = m.family;
    el['ins-origin'].textContent = m.origin || '';
    el['ins-idea'].textContent = m.idea;
    el['ins-use'].textContent = m.use;

    fillList(el['ins-how'], m.how);
    fillList(el['ins-pros'], m.pros);
    fillList(el['ins-cons'], m.cons);

    el['ins-bestwhen'].textContent = m.bestWhen || '';
    el['ins-worstwhen'].textContent = m.worstWhen || '';
    el['ins-fact'].textContent = m.fact || '';

    [['ins-best', m.best], ['ins-avg', m.avg], ['ins-worst', m.worst], ['ins-space', m.space]]
      .forEach(function (p) {
        el[p[0]].innerHTML = '<span class="' + cxClass(p[1]) + '">' + esc(p[1]) + '</span>';
      });

    el['ins-stable'].innerHTML = yn(m.stable);
    el['ins-inplace'].innerHTML = yn(m.inPlace);
    el['ins-adaptive'].innerHTML = yn(m.adaptive);
    el['ins-method'].textContent = m.comparison ? 'Comparison' : 'Non-comparison';

    el['tab-about'].scrollTop = 0;
  }

  function buildTabs() {
    el['inspect'].querySelector('.insp-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.itab');
      if (!b) return;
      var target = b.getAttribute('data-tab');
      Array.prototype.forEach.call(el['inspect'].querySelectorAll('.itab'), function (t) {
        t.classList.toggle('active', t === b);
      });
      Array.prototype.forEach.call(el['inspect'].querySelectorAll('.tabpane'), function (p) {
        p.classList.toggle('active', p.id === 'tab-' + target);
      });
    });
  }

  var KEYWORDS = new Set(('def return for while if else elif break continue in range len not and or ' +
    'public private static void int bool boolean class new true false null this var let const ' +
    'function of func package import from as switch case default struct pub fn mut match loop ' +
    'impl use crate self size_t auto template typename namespace std nullptr sizeof do foreach ' +
    'using System List Vec Math each').split(' '));

  var TYPES = new Set(('int float double char long short unsigned void bool string str usize i32 i64 ' +
    'u32 u64 f64 f32 vector Array Integer String List Vec size_t byte').split(' '));

  var TOKENS = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

  function highlight(src) {
    var out = '', last = 0, m;
    TOKENS.lastIndex = 0;
    while ((m = TOKENS.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      last = TOKENS.lastIndex;
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="tok-num">' + m[3] + '</span>';
      else {
        var w = m[4];
        var next = src.charAt(TOKENS.lastIndex);
        if (KEYWORDS.has(w)) out += '<span class="tok-kw">' + w + '</span>';
        else if (TYPES.has(w)) out += '<span class="tok-typ">' + w + '</span>';
        else if (next === '(') out += '<span class="tok-fn">' + w + '</span>';
        else out += esc(w);
      }
    }
    out += esc(src.slice(last));
    return out;
  }

  function buildLangBar() {
    el['lang-bar'].innerHTML = CAT.languages.map(function (l) {
      return '<button class="lang" data-lang="' + l.id + '">' + l.name + '</button>';
    }).join('');
    el['lang-bar'].addEventListener('click', function (e) {
      var b = e.target.closest('.lang');
      if (!b) return;
      S.lang = b.getAttribute('data-lang');
      renderCode();
    });
  }

  function codeFor(algo, lang) {
    var bank = CODE[lang] || {};
    return bank[algo] || '// implementation not available';
  }

  function filenameFor(algo, lang) {
    var l = CAT.languages.filter(function (x) { return x.id === lang; })[0];
    return algo + '_sort.' + (l ? l.ext : 'txt');
  }

  function renderCode() {
    Array.prototype.forEach.call(el['lang-bar'].querySelectorAll('.lang'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === S.lang);
    });
    el['code'].innerHTML = highlight(codeFor(main.algo, S.lang));
    el['code-file'].textContent = filenameFor(main.algo, S.lang);
    el['code'].scrollTop = 0;
  }

  el['btn-copy'].addEventListener('click', function () {
    var txt = codeFor(main.algo, S.lang);
    var done = function () {
      el['btn-copy'].textContent = 'Copied';
      setTimeout(function () { el['btn-copy'].textContent = 'Copy'; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {  }
      document.body.removeChild(ta);
      done();
    }
  });

  el['btn-download'].addEventListener('click', function () {
    var blob = new Blob([codeFor(main.algo, S.lang) + '\n'], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filenameFor(main.algo, S.lang);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  el['btn-play'].addEventListener('click', function () {
    if (runAtEnd(main)) resetRun();
    setPlaying(!playing);
  });

  el['btn-step'].addEventListener('click', function () {
    setPlaying(false);
    if (!stepRun(main)) finishMain();
    syncScrub();
    updateStats();
  });

  el['btn-back'].addEventListener('click', function () {
    setPlaying(false);
    backRun(main);
    el['btn-play'].textContent = 'Play';
    syncScrub();
    updateStats();
  });

  el['btn-reset'].addEventListener('click', resetRun);
  el['btn-shuffle'].addEventListener('click', reseed);

  if (el['rng-scrub']) {
    el['rng-scrub'].addEventListener('input', function () {
      setPlaying(false);
      seekRun(main, +this.value);
      el['btn-play'].textContent = runAtEnd(main) ? 'Replay' : 'Play';
      updateStats();
    });
  }

  el['sel-dist'].addEventListener('change', function () {
    S.dist = this.value;
    reseed();
  });

  el['rng-size'].addEventListener('input', function () {
    S.size = +this.value;
    el['lbl-size'].textContent = S.size;
    reseed();
  });

  function setSpeed(v) {
    S.speed = clamp(+v, 1, 240);
    el['rng-speed'].value = S.speed;
    el['lbl-speed'].textContent = S.speed + '/f';
    if (el['cmp-speed']) {
      el['cmp-speed'].value = S.speed;
      el['cmp-lbl-speed'].textContent = S.speed + '/f';
    }
  }

  el['rng-speed'].addEventListener('input', function () { setSpeed(this.value); });
  if (el['cmp-speed']) {
    el['cmp-speed'].addEventListener('input', function () { setSpeed(this.value); });
  }

  el['rng-depth'].addEventListener('input', function () {
    S.depth = +this.value;
    el['lbl-depth'].textContent = S.depth;
    frameCamera();
    if (compareOn) fitComparePanes();
  });

  el['cb-spin'].addEventListener('change', function () { S.spin = this.checked; });
  el['cb-labels'].addEventListener('change', function () { S.labels = this.checked; });
  el['cb-sound'].addEventListener('change', function () { S.sound = this.checked; });
  el['cb-motion'].addEventListener('change', function () {
    S.motion = this.checked;
    if (!S.motion) {
      main.anim = {};
      if (cmpA) cmpA.anim = {};
      if (cmpB) cmpB.anim = {};
    }
  });

  el['btn-center'].addEventListener('click', function () {
    renderer.camera.yaw = -0.5;
    renderer.camera.pitch = 0.34;
    frameCamera();
  });

  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    var k = e.key.toLowerCase();
    if (e.code === 'Space') { e.preventDefault(); (compareOn ? el['cmp-play'] : el['btn-play']).click(); }
    else if (k === 's' || e.key === 'ArrowRight') { e.preventDefault(); (compareOn ? el['cmp-step'] : el['btn-step']).click(); }
    else if (k === 'b' || e.key === 'ArrowLeft') { e.preventDefault(); if (!compareOn) el['btn-back'].click(); }
    else if (k === 'r') { el['btn-shuffle'].click(); }
    else if (k === 'escape') {
      if (compareOn) closeCompare();
      else if (raceOn) closeRace();
    }
  });

  window.addEventListener('resize', function () {
    renderer.resize();
    metrics = null;
    frameCamera();
    if (compareOn) fitComparePanes();
  });

  var compareOn = false;
  var cmpA = null, cmpB = null;
  var rndA = null, rndB = null;
  var cmpPlaying = false;

  function buildCompareSelects() {
    var opts = CAT.list.map(function (m) {
      return '<option value="' + m.id + '">' + m.name + '</option>';
    }).join('');
    el['cmp-a'].innerHTML = opts;
    el['cmp-b'].innerHTML = opts;
    el['cmp-a'].value = 'bubble';
    el['cmp-b'].value = 'quick';

    el['cmp-a'].addEventListener('change', buildCompare);
    el['cmp-b'].addEventListener('change', buildCompare);
  }

  function openCompare() {
    compareOn = true;
    el['compare'].classList.add('on');
    if (!rndA) {
      rndA = new window.Engine3D.Renderer(el['cmp-canvas-a']);
      rndB = new window.Engine3D.Renderer(el['cmp-canvas-b']);
      rndA.attachControls(el['cmp-canvas-a']);
      rndB.attachControls(el['cmp-canvas-b']);
    }
    buildCompare();
  }

  function closeCompare() {
    compareOn = false;
    cmpPlaying = false;
    el['compare'].classList.remove('on');
  }

  function fitComparePanes() {
    if (!rndA) return;
    rndA.resize();
    rndB.resize();
    fitTo(rndA, S.depth, 6, Math.max(80, rndA.h - 12), 0.94);
    fitTo(rndB, S.depth, 6, Math.max(80, rndB.h - 12), 0.94);
  }

  function buildCompare() {
    if (!compareOn) return;
    var ida = el['cmp-a'].value, idb = el['cmp-b'].value;
    cmpA = makeRun(ida, S.seed);
    cmpB = makeRun(idb, S.seed);
    cmpPlaying = false;
    el['cmp-play'].textContent = 'Play';
    el['cmp-name-a'].textContent = CAT.byId[ida].name;
    el['cmp-name-b'].textContent = CAT.byId[idb].name;
    fitComparePanes();
    renderCompareTable();
    renderCompareStats();
  }

  function resetCompare() {
    if (!cmpA) return;
    seekRun(cmpA, 0);
    seekRun(cmpB, 0);
    cmpA.anim = {}; cmpB.anim = {};
    cmpA.hi = {}; cmpB.hi = {};
    cmpPlaying = false;
    el['cmp-play'].textContent = 'Play';
    renderCompareStats();
  }

  function statBlock(run, other) {
    function cell(label, v, ov, lowerBetter) {
      var cls = '';
      if (ov != null && v !== ov && lowerBetter) cls = v < ov ? ' win' : ' lose';
      return '<div class="cmp-stat' + cls + '"><b>' + v.toLocaleString() + '</b><span>' + label + '</span></div>';
    }
    return cell('Compares', run.cmp, other ? other.cmp : null, true) +
      cell('Swaps', run.swaps, other ? other.swaps : null, true) +
      cell('Writes', run.writes, other ? other.writes : null, true) +
      cell('Ops total', run.ops.length, other ? other.ops.length : null, true) +
      '<div class="cmp-stat"><b>' + Math.round(runProgress(run) * 100) + '%</b><span>Progress</span></div>';
  }

  function renderCompareStats() {
    if (!cmpA) return;
    el['cmp-stats-a'].innerHTML = statBlock(cmpA, cmpB);
    el['cmp-stats-b'].innerHTML = statBlock(cmpB, cmpA);

    var doneA = runAtEnd(cmpA), doneB = runAtEnd(cmpB);
    if (doneA && doneB) {
      var a = CAT.byId[cmpA.algo].name, b = CAT.byId[cmpB.algo].name;
      var oa = cmpA.ops.length, ob = cmpB.ops.length;
      var msg;
      if (oa === ob) {
        msg = 'Dead heat - both finished in ' + oa.toLocaleString() + ' operations.';
      } else {
        var win = oa < ob ? a : b, lose = oa < ob ? b : a;
        var hi = Math.max(oa, ob), lo = Math.min(oa, ob);
        msg = win + ' won: ' + lo.toLocaleString() + ' operations against ' +
          hi.toLocaleString() + ' for ' + lose + ' - ' + (hi / lo).toFixed(2) + 'x fewer.';
      }
      el['cmp-verdict'].textContent = msg;
      el['cmp-verdict'].classList.add('on');
    } else {
      el['cmp-verdict'].classList.remove('on');
    }
  }

  function renderCompareTable() {
    var a = CAT.byId[cmpA.algo], b = CAT.byId[cmpB.algo];
    var rows = [
      ['Family', a.family, b.family, false],
      ['Time - best', a.best, b.best, true],
      ['Time - average', a.avg, b.avg, true],
      ['Time - worst', a.worst, b.worst, true],
      ['Space', a.space, b.space, true],
      ['Stable', a.stable, b.stable, false],
      ['In place', a.inPlace, b.inPlace, false],
      ['Adaptive', a.adaptive, b.adaptive, false],
      ['Method', a.comparison ? 'Comparison' : 'Non-comparison',
        b.comparison ? 'Comparison' : 'Non-comparison', false],
      ['Best case', a.bestWhen, b.bestWhen, false],
      ['Worst case', a.worstWhen, b.worstWhen, false]
    ];

    var html = '<tr><th></th><th>' + esc(a.name) + '</th><th>' + esc(b.name) + '</th></tr>';
    rows.forEach(function (r) {
      var av = r[1], bv = r[2], mono = r[3];
      var differs = av !== bv;
      function fmt(v) {
        if (typeof v === 'boolean') return yn(v);
        return mono ? '<span class="' + cxClass(v) + '">' + esc(v) + '</span>' : esc(v);
      }
      html += '<tr' + (differs ? ' class="differs"' : '') + '><th>' + esc(r[0]) + '</th>' +
        '<td' + (mono ? ' class="mono"' : '') + '>' + fmt(av) + '</td>' +
        '<td' + (mono ? ' class="mono"' : '') + '>' + fmt(bv) + '</td></tr>';
    });
    el['cmp-table'].innerHTML = html;
  }

  function compareFrame(now) {
    if (!cmpA) return;

    if (cmpPlaying) {
      var moved = false;
      for (var k = 0; k < S.speed; k++) {
        if (stepRun(cmpA)) moved = true;
        if (stepRun(cmpB)) moved = true;
      }
      if (!moved && runAtEnd(cmpA) && runAtEnd(cmpB)) {
        cmpPlaying = false;
        el['cmp-play'].textContent = 'Replay';
      }
    }

    decayRun(cmpA);
    decayRun(cmpB);

    centerOn(rndA, S.depth, 6, Math.max(80, rndA.h - 12));
    centerOn(rndB, S.depth, 6, Math.max(80, rndB.h - 12));
    drawRun(rndA, cmpA, now, S.depth, false);
    drawRun(rndB, cmpB, now, S.depth, false);

    if (statAcc % 4 === 0) renderCompareStats();
  }

  el['btn-compare'].addEventListener('click', openCompare);
  el['cmp-close'].addEventListener('click', closeCompare);
  el['cmp-reset'].addEventListener('click', resetCompare);

  el['cmp-play'].addEventListener('click', function () {
    if (runAtEnd(cmpA) && runAtEnd(cmpB)) resetCompare();
    cmpPlaying = !cmpPlaying;
    el['cmp-play'].textContent = cmpPlaying ? 'Pause' : 'Play';
  });

  el['cmp-step'].addEventListener('click', function () {
    cmpPlaying = false;
    el['cmp-play'].textContent = 'Play';
    stepRun(cmpA);
    stepRun(cmpB);
    renderCompareStats();
  });

  el['cmp-finish'].addEventListener('click', function () {
    cmpPlaying = false;
    el['cmp-play'].textContent = 'Replay';
    seekRun(cmpA, cmpA.ops.length);
    seekRun(cmpB, cmpB.ops.length);
    renderCompareStats();
  });

  var raceOn = false, racers = [], raceFinishOrder = 0;

  function openRace() {
    raceOn = true;
    el['race'].classList.add('on');
    buildRacers();
  }

  function closeRace() {
    raceOn = false;
    el['race'].classList.remove('on');
    racers = [];
  }

  function buildRacers() {
    racers = [];
    raceFinishOrder = 0;
    el['race-grid'].innerHTML = '';

    CAT.list.forEach(function (m) {
      var card = document.createElement('div');
      card.className = 'race-card';
      card.setAttribute('data-id', m.id);
      card.setAttribute('title', 'Watch ' + m.name + ' in 3D');
      card.innerHTML =
        '<div class="rc-top">' +
        '<span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + rgbCss(m.color) + '"></span>' +
        '<span class="rc-name">' + m.name + '</span>' +
        '<span class="rc-ops">0</span></div>' +
        '<div class="rc-stage"><canvas></canvas>' +
        '<div class="rc-play"><span>&#9654; Watch in 3D</span></div></div>';
      el['race-grid'].appendChild(card);

      var cv = card.querySelector('canvas');
      var arr = S.seed.slice();
      racers.push({
        meta: m, card: card,
        opsEl: card.querySelector('.rc-ops'),
        canvas: cv, ctx: cv.getContext('2d'),
        arr: arr, gen: ALGO[m.id](arr),
        ops: 0, done: false, rank: 0
      });
    });
  }

  function raceFrame() {
    var perFrame = Math.max(1, S.speed);
    for (var i = 0; i < racers.length; i++) {
      var r = racers[i];
      if (!r.done) {
        for (var k = 0; k < perFrame; k++) {
          var res = r.gen.next();
          if (res.done || (res.value && res.value.t === 'done')) {
            r.done = true;
            r.rank = ++raceFinishOrder;
            r.card.classList.add('finished');
            r.opsEl.innerHTML = '<span class="rc-rank">#' + r.rank + '</span> ' + r.ops.toLocaleString();
            break;
          }
          r.ops++;
        }
        if (!r.done) r.opsEl.textContent = r.ops.toLocaleString();
      }
      drawRacer(r);
    }
  }

  function drawRacer(r) {
    var cv = r.canvas, ctx = r.ctx;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth || 190, h = cv.clientHeight || 84;
    if (cv.width !== Math.floor(w * dpr)) {
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var n = r.arr.length, bw = w / n;
    for (var i = 0; i < n; i++) {
      var ratio = r.arr[i] / S.maxVal;
      var bh = Math.max(1, ratio * (h - 3));
      var c = r.done ? C.sorted : hsl2rgb(206 + ratio * 132, 66, 42 + ratio * 20);
      ctx.fillStyle = rgbCss(c);
      ctx.fillRect(i * bw, h - bh, Math.max(1, bw - 0.6), bh);
    }
  }

  el['race-grid'].addEventListener('click', function (e) {
    var card = e.target.closest('.race-card');
    if (!card) return;
    var id = card.getAttribute('data-id');
    if (!id) return;
    closeRace();
    selectAlgo(id);
    setPlaying(true);
  });

  el['btn-race'].addEventListener('click', openRace);
  el['btn-race-close'].addEventListener('click', closeRace);
  el['btn-race-restart'].addEventListener('click', buildRacers);

  window.SortViz = {
    settings: S,
    get run() { return main; },
    renderer: renderer,
    select: selectAlgo,
    seekTo: function (n) { seekRun(main, n); },
    makeRun: makeRun,
    fit: frameCamera,
    bounds: function () { return projectedBounds(renderer, S.depth); },
    metrics: viewMetrics,
    compare: { open: openCompare, close: closeCompare, get a() { return cmpA; }, get b() { return cmpB; } }
  };

  buildSidebar();
  buildTabs();
  buildLangBar();
  buildCompareSelects();

  S.seed = makeArray(S.size, S.dist);
  S.maxVal = Math.max.apply(null, S.seed) || 1;
  main = makeRun('bubble', S.seed, { sound: true });
  selectAlgo('bubble');

  renderer.resize();
  frameCamera();

  if (location.hash === '#compare') openCompare();
  else if (location.hash === '#race') openRace();

  requestAnimationFrame(function (t) { S.lastT = t; frame(t); });
})();
