
(function (global) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function normalize(v) {
    var l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
    return { x: v.x / l, y: v.y / l, z: v.z / l };
  }

  function Camera() {
    this.target = { x: 0, y: 0, z: 0 };
    this.yaw = -0.5;
    this.pitch = 0.34;
    this.dist = 900;
    this.fov = 780;
    this.cx = 0;
    this.cy = 0;
  }

  Camera.prototype.setViewport = function (w, h) {
    this.cx = w * 0.5;
    this.cy = h * 0.5;
  };

  Camera.prototype.position = function () {
    var cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    var cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    return {
      x: this.target.x - this.dist * cp * sy,
      y: this.target.y - this.dist * sp,
      z: this.target.z - this.dist * cp * cy
    };
  };

  Camera.prototype.project = function (px, py, pz) {
    var x = px - this.target.x, y = py - this.target.y, z = pz - this.target.z;
    var cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    var x1 = x * cy - z * sy;
    var z1 = x * sy + z * cy;
    var cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    var y1 = y * cp - z1 * sp;
    var z2 = y * sp + z1 * cp + this.dist;
    if (z2 < 1) return null;
    var s = this.fov / z2;
    return { x: this.cx + x1 * s, y: this.cy - y1 * s, d: z2 };
  };

  function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = new Camera();
    this.dpr = 1;
    this.light = normalize({ x: -0.42, y: 0.84, z: -0.34 });
    this.items = [];
    this.labels = [];
    this.w = 800;
    this.h = 600;
    this.resize();
  }

  Renderer.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    var w = Math.max(320, Math.floor(rect.width));
    var h = Math.max(240, Math.floor(rect.height));
    this.dpr = Math.min(global.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.w = w;
    this.h = h;
    this.camera.setViewport(w, h);
  };

  Renderer.prototype.begin = function (bg) {
    this.items.length = 0;
    this.labels.length = 0;
    var ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.w, this.h);
    } else {
      ctx.clearRect(0, 0, this.w, this.h);
    }
  };

  Renderer.prototype.pushFace = function (pts, normal, rgb, glow, alpha) {
    var i, cx = 0, cy = 0, cz = 0;
    for (i = 0; i < pts.length; i++) { cx += pts[i][0]; cy += pts[i][1]; cz += pts[i][2]; }
    cx /= pts.length; cy /= pts.length; cz /= pts.length;

    if (normal) {
      var eye = this.camera.position();
      var vx = cx - eye.x, vy = cy - eye.y, vz = cz - eye.z;
      if (normal.x * vx + normal.y * vy + normal.z * vz > 0) return;
    }

    var scr = [], depth = 0;
    for (i = 0; i < pts.length; i++) {
      var p = this.camera.project(pts[i][0], pts[i][1], pts[i][2]);
      if (!p) return;
      scr.push(p);
      depth += p.d;
    }
    depth /= scr.length;

    var shade = 1;
    if (normal) {
      var nd = normal.x * this.light.x + normal.y * this.light.y + normal.z * this.light.z;
      shade = 0.38 + 0.62 * clamp(nd, 0, 1);
    }
    this.items.push({
      kind: 'poly',
      scr: scr,
      depth: depth,
      color: 'rgb(' + Math.round(rgb[0] * shade) + ',' + Math.round(rgb[1] * shade) + ',' + Math.round(rgb[2] * shade) + ')',
      glow: glow || null,
      alpha: alpha == null ? 1 : alpha
    });
  };

  Renderer.prototype.pushLine = function (a, b, color, width, alpha) {
    var p1 = this.camera.project(a[0], a[1], a[2]);
    var p2 = this.camera.project(b[0], b[1], b[2]);
    if (!p1 || !p2) return;
    this.items.push({
      kind: 'line',
      a: p1, b: p2,
      depth: (p1.d + p2.d) * 0.5,
      color: color,
      width: width || 1,
      alpha: alpha == null ? 1 : alpha
    });
  };

  Renderer.prototype.pushLabel = function (world, text, color, font, dy) {
    var p = this.camera.project(world[0], world[1], world[2]);
    if (!p) return;
    this.labels.push({
      x: p.x, y: p.y + (dy || 0), depth: p.d,
      text: text, color: color,
      font: font || '11px ui-monospace, Consolas, monospace'
    });
  };

  Renderer.prototype.pushBox = function (x0, y0, z0, x1, y1, z1, rgb, glow) {
    var V = [
      [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]
    ];
    this.pushFace([V[3], V[2], V[6], V[7]], { x: 0, y: 1, z: 0 }, rgb, glow);
    this.pushFace([V[0], V[4], V[5], V[1]], { x: 0, y: -1, z: 0 }, rgb, null);
    this.pushFace([V[0], V[1], V[2], V[3]], { x: 0, y: 0, z: -1 }, rgb, null);
    this.pushFace([V[5], V[4], V[7], V[6]], { x: 0, y: 0, z: 1 }, rgb, glow);
    this.pushFace([V[4], V[0], V[3], V[7]], { x: -1, y: 0, z: 0 }, rgb, null);
    this.pushFace([V[1], V[5], V[6], V[2]], { x: 1, y: 0, z: 0 }, rgb, glow);
  };

  Renderer.prototype.end = function () {
    var ctx = this.ctx, i, j;
    this.items.sort(function (a, b) { return b.depth - a.depth; });

    for (i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      ctx.globalAlpha = it.alpha;

      if (it.kind === 'line') {
        ctx.strokeStyle = it.color;
        ctx.lineWidth = it.width;
        ctx.beginPath();
        ctx.moveTo(it.a.x, it.a.y);
        ctx.lineTo(it.b.x, it.b.y);
        ctx.stroke();
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(it.scr[0].x, it.scr[0].y);
      for (j = 1; j < it.scr.length; j++) ctx.lineTo(it.scr[j].x, it.scr[j].y);
      ctx.closePath();
      if (it.glow) {
        ctx.shadowColor = it.glow;
        ctx.shadowBlur = 20;
      }
      ctx.fillStyle = it.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.32)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    this.labels.sort(function (a, b) { return b.depth - a.depth; });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (i = 0; i < this.labels.length; i++) {
      var lb = this.labels[i];
      ctx.font = lb.font;
      ctx.fillStyle = lb.color;
      ctx.fillText(lb.text, lb.x, lb.y);
    }
  };

  Renderer.prototype.attachControls = function (el) {
    var cam = this.camera;
    var dragging = false, lx = 0, ly = 0;

    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    });

    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      cam.yaw -= (e.clientX - lx) * 0.006;
      cam.pitch = clamp(cam.pitch + (e.clientY - ly) * 0.005, -0.22, 1.32);
      lx = e.clientX;
      ly = e.clientY;
    });

    function release() {
      dragging = false;
      el.style.cursor = 'grab';
    }
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', release);

    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      var dir = e.deltaY > 0 ? 1 : -1;
      cam.dist = clamp(cam.dist * (1 + dir * 0.09), 240, 2800);
    }, { passive: false });

    el.style.cursor = 'grab';
    return this;
  };

  global.Engine3D = {
    Renderer: Renderer,
    Camera: Camera,
    normalize: normalize,
    clamp: clamp
  };
})(window);
