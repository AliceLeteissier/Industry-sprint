/* Role-based dual radar (benchmark dashed vs user solid)
   Mobile-first, responsive. Inputs are generated dynamically.
*/

(function () {
  // --- Configuration ---
  const axes = [
    { key: 'coreTech', label: 'Core Technical Skills', desc: 'HTML, CSS, JavaScript' },
    { key: 'frameworks', label: 'Frameworks & Tooling', desc: 'React, Next.js, Git' },
    { key: 'uiux', label: 'UI/UX & Design Mindset', desc: 'Accessibility, Figma' },
    { key: 'power', label: 'Power Skills (Soft Skills)', desc: 'Communication, teamwork' },
    { key: 'emerging', label: 'Emerging Technologies & Trends', desc: 'AI, Performance, Headless CMS' },
    { key: 'practices', label: 'Professional Growth & Practices', desc: 'Testing, CI/CD, Version control' }
  ];

  // Role presets (industry benchmark)
  const rolePresets = {
    generalist:    { coreTech:85, frameworks:80, uiux:70, power:80, emerging:65, practices:75 },
    uiux:          { coreTech:70, frameworks:65, uiux:95, power:80, emerging:50, practices:70 },
    ai:            { coreTech:80, frameworks:85, uiux:65, power:75, emerging:95, practices:80 },
    startup:       { coreTech:75, frameworks:80, uiux:75, power:90, emerging:85, practices:90 }
  };

  // default user (balanced)
  const userDefaults = { coreTech:70, frameworks:65, uiux:60, power:60, emerging:40, practices:55 };

  // SVG geometry
  const SVG_SIZE = 500;
  const CENTER = { x: SVG_SIZE / 2, y: SVG_SIZE / 2 };
  const MAX_RADIUS = 180;
  const ringSteps = [25, 50, 75, 100];

  // DOM refs
  const inputsContainer = document.getElementById('inputs');
  const roleSelect = document.getElementById('roleSelect');
  const gridGroup = document.getElementById('radarGrid');
  const radarGroup = document.getElementById('radarGroup'); // already translated in markup
  const benchmarkPoly = document.getElementById('benchmarkPoly');
  const userPoly = document.getElementById('userPoly');
  const userDots = document.getElementById('userDots');
  const benchDots = document.getElementById('benchDots');

  const svgNS = 'http://www.w3.org/2000/svg';

  // --- Build input rows (with IDs) ---
  axes.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'input-row';

    const meta = document.createElement('div');
    meta.className = 'input-meta';
    meta.innerHTML = `<strong>${i+1}. ${a.label}</strong><small>${a.desc}</small>`;

    const controls = document.createElement('div');
    controls.className = 'controls';

    const range = document.createElement('input');
    range.type = 'range';
    range.min = 0; range.max = 100; range.step = 1;
    range.id = 'range_' + a.key;
    range.value = userDefaults[a.key];

    const num = document.createElement('input');
    num.type = 'number';
    num.min = 0; num.max = 100; num.step = 1;
    num.id = 'num_' + a.key;
    num.value = range.value;

    // sync
    range.addEventListener('input', () => { num.value = range.value; renderAll(); });
    num.addEventListener('input', () => {
      let v = parseInt(num.value || 0, 10);
      if (isNaN(v)) v = 0;
      v = Math.max(0, Math.min(100, v));
      num.value = v;
      range.value = v;
      renderAll();
    });

    controls.append(range, num);
    row.append(meta, controls);
    inputsContainer.appendChild(row);
  });

  // --- Draw static grid (rings + axis lines + labels) ---
  function drawGrid() {
    gridGroup.innerHTML = '';
    // rings
    ringSteps.forEach(p => {
      const r = (p / 100) * MAX_RADIUS;
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', CENTER.x);
      c.setAttribute('cy', CENTER.y);
      c.setAttribute('r', r);
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', 'rgba(0,0,0,0.06)');
      c.setAttribute('stroke-width', '1');
      gridGroup.appendChild(c);

      // percent label (subtle)
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', CENTER.x + 6);
      t.setAttribute('y', CENTER.y - r - 4);
      t.setAttribute('font-size', '10');
      t.setAttribute('fill', 'rgba(16,24,40,0.45)');
      t.textContent = p + '%';
      gridGroup.appendChild(t);
    });

    // axes and labels
    axes.forEach((a, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i / axes.length);
      const x2 = CENTER.x + Math.cos(angle) * MAX_RADIUS;
      const y2 = CENTER.y + Math.sin(angle) * MAX_RADIUS;

      // axis line
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', CENTER.x);
      line.setAttribute('y1', CENTER.y);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'rgba(0,0,0,0.06)');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);

      // label
      const labelX = CENTER.x + Math.cos(angle) * (MAX_RADIUS + 28);
      const labelY = CENTER.y + Math.sin(angle) * (MAX_RADIUS + 28);
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', 'rgba(16,24,40,0.9)');

      // anchor and baseline depending on quadrant
      const cos = Math.cos(angle);
      label.setAttribute('text-anchor', cos > 0.2 ? 'start' : (cos < -0.2 ? 'end' : 'middle'));
      const sin = Math.sin(angle);
      label.setAttribute('dominant-baseline', sin > 0.25 ? 'hanging' : (sin < -0.25 ? 'baseline' : 'middle'));

      label.textContent = a.label;
      gridGroup.appendChild(label);
    });
  }

  // --- Utility: compute polygon coordinates relative to group center (0,0) ---
  function computePointsFor(values) {
    return axes.map((a, i) => {
      const p = Math.max(0, Math.min(100, Math.round(values[a.key] || 0)));
      const angle = -Math.PI / 2 + (2 * Math.PI * i / axes.length);
      const length = (p / 100) * MAX_RADIUS;
      const x = +(Math.cos(angle) * length).toFixed(2);
      const y = +(Math.sin(angle) * length).toFixed(2);
      return { x, y, percent: p };
    });
  }

  // --- Render benchmark & user polygons + dots ---
  function renderPolygons(benchmarkValues, userValues) {
    // compute points
    const benchPts = computePointsFor(benchmarkValues);
    const userPts = computePointsFor(userValues);

    // set polygon points (strings)
    benchmarkPoly.setAttribute('points', benchPts.map(p => `${p.x},${p.y}`).join(' '));
    userPoly.setAttribute('points', userPts.map(p => `${p.x},${p.y}`).join(' '));

    // dots: user
    userDots.innerHTML = '';
    userPts.forEach((p, i) => {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', p.x);
      c.setAttribute('cy', p.y);
      c.setAttribute('r', 4);
      c.setAttribute('fill', '#ffffff');
      c.setAttribute('stroke', 'rgba(20,184,166,0.9)');
      c.setAttribute('stroke-width', '1.5');
      c.setAttribute('opacity', '0.95');
      const title = document.createElementNS(svgNS, 'title');
      title.textContent = `${axes[i].label}: ${p.percent}%`;
      c.appendChild(title);
      userDots.appendChild(c);
    });

    // dots: benchmark (subtle)
    benchDots.innerHTML = '';
    benchPts.forEach((p, i) => {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', p.x);
      c.setAttribute('cy', p.y);
      c.setAttribute('r', 3);
      c.setAttribute('fill', '#0b8380');
      c.setAttribute('opacity', '0.9');
      const title = document.createElementNS(svgNS, 'title');
      title.textContent = `Benchmark — ${axes[i].label}: ${Math.round((benchmarkValues[axes[i].key]||0))}%`;
      c.appendChild(title);
      benchDots.appendChild(c);
    });
  }

  // --- Read current user slider values ---
  function readUserValues() {
    const v = {};
    axes.forEach(a => {
      const el = document.getElementById('range_' + a.key);
      v[a.key] = el ? Number(el.value) : 0;
    });
    return v;
  }

  // --- Apply preset to input sliders (user-facing controls remain editable) ---
  function applyPresetToInputs(preset) {
    axes.forEach(a => {
      const rangeEl = document.getElementById('range_' + a.key);
      const numEl = document.getElementById('num_' + a.key);
      if (rangeEl && numEl) {
        rangeEl.value = preset[a.key];
        numEl.value = preset[a.key];
      }
    });
    renderAll();
  }

  // --- Render everything given selected role ---
  function renderAll() {
    const currentRole = roleSelect.value;
    const benchmarkValues = rolePresets[currentRole] || rolePresets.generalist;
    const userValues = readUserValues();
    renderPolygons(benchmarkValues, userValues);
  }

  // --- Buttons & role change handlers ---
  document.getElementById('resetBtn').addEventListener('click', () => {
    axes.forEach(a => {
      document.getElementById('range_' + a.key).value = 0;
      document.getElementById('num_' + a.key).value = 0;
    });
    renderAll();
  });

  document.getElementById('fillDefaults').addEventListener('click', () => {
    axes.forEach(a => {
      document.getElementById('range_' + a.key).value = userDefaults[a.key];
      document.getElementById('num_' + a.key).value = userDefaults[a.key];
    });
    renderAll();
  });

  roleSelect.addEventListener('change', () => {
    // animate benchmark briefly: we simply re-render (benchmark polygon is dashed)
    renderAll();
  });

  // --- First-time draw ---
  drawGrid();
  // initialize inputs using userDefaults
  axes.forEach(a => {
    const r = document.getElementById('range_' + a.key);
    const n = document.getElementById('num_' + a.key);
    if (r && n) { r.value = userDefaults[a.key]; n.value = userDefaults[a.key]; }
  });
  // initial render
  renderAll();

  // make resize-friendly: scale SVG by CSS (SVG viewBox handles coordinate system),
  // but if you want to adapt MAX_RADIUS on tiny screens later, we can add that.
})();
