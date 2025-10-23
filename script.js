(function(){
  const axes = [
    { key: 'coreTech', label: 'Core Technical Skills', desc: 'HTML, CSS, JavaScript' },
    { key: 'frameworks', label: 'Frameworks & Tooling', desc: 'React, Next.js, Git' },
    { key: 'uiux', label: 'UI/UX & Design Mindset', desc: 'Accessibility, Figma' },
    { key: 'power', label: 'Power Skills (Soft Skills)', desc: 'Communication, teamwork' },
    { key: 'emerging', label: 'Emerging Tech', desc: 'AI, Performance, Headless CMS' },
    { key: 'practices', label: 'Professional Growth', desc: 'Testing, CI/CD, Version control' }
  ];

  const size = 500, center = {x:size/2, y:size/2}, maxRadius=180;
  const ringSteps = [25,50,75,100];
  const defaults = { coreTech:70, frameworks:65, uiux:60, power:60, emerging:40, practices:55 };

  const inputsEl = document.getElementById('inputs');
  const svgNS = 'http://www.w3.org/2000/svg';
  const gridGroup = document.getElementById('radarGrid');
  const polyEl = document.getElementById('radarPoly');
  const dotsGroup = document.getElementById('radarDots');

  // create inputs with correct IDs
  axes.forEach((a,i)=>{
    const row = document.createElement('div'); row.className='input-row';
    const meta = document.createElement('div'); meta.className='input-meta';
    meta.innerHTML=`<strong>${i+1}. ${a.label}</strong><small>${a.desc}</small>`;

    const controls = document.createElement('div'); controls.className='controls';
    const range = document.createElement('input'); range.type='range'; range.min=0; range.max=100; range.step=1;
    range.id = 'range_' + a.key;
    range.value = defaults[a.key];

    const number = document.createElement('input'); number.type='number'; number.min=0; number.max=100; number.step=1;
    number.value = range.value; number.className='value'; number.id='num_' + a.key;

    // sync inputs
    range.addEventListener('input', ()=>{ number.value=range.value; update(); });
    number.addEventListener('input', ()=>{
      let v = parseInt(number.value||0,10); if(isNaN(v)) v=0; v=Math.max(0,Math.min(100,v));
      number.value=v; range.value=v; update();
    });

    controls.append(range, number);
    row.append(meta, controls);
    inputsEl.appendChild(row);
  });

  function readValues(){
    const vals={};
    axes.forEach(a=>{
      vals[a.key] = +document.getElementById('range_' + a.key).value || 0;
    });
    return vals;
  }

  function drawGrid(){
    gridGroup.innerHTML='';
    ringSteps.forEach(p=>{
      const r = p/100*maxRadius;
      const circle = document.createElementNS(svgNS,'circle');
      circle.setAttribute('cx', center.x); circle.setAttribute('cy', center.y); circle.setAttribute('r', r);
      circle.setAttribute('fill','none'); circle.setAttribute('stroke','rgba(0,0,0,0.05)'); circle.setAttribute('stroke-width','1');
      gridGroup.appendChild(circle);
    });

    axes.forEach((a,i)=>{
      const angle=-Math.PI/2 + 2*Math.PI*i/axes.length;
      const x=center.x + Math.cos(angle)*maxRadius, y=center.y + Math.sin(angle)*maxRadius;
      const line = document.createElementNS(svgNS,'line');
      line.setAttribute('x1', center.x); line.setAttribute('y1', center.y); line.setAttribute('x2', x); line.setAttribute('y2', y);
      line.setAttribute('stroke','rgba(0,0,0,0.05)'); line.setAttribute('stroke-width','1');
      gridGroup.appendChild(line);
    });
  }

  function computePolygonPoints(values){
    const pts=[];
    axes.forEach((a,i)=>{
      const percent = Math.max(0,Math.min(100,values[a.key]));
      const angle = -Math.PI/2 + 2*Math.PI*i/axes.length;
      const length = percent/100*maxRadius;
      pts.push({x: +(Math.cos(angle)*length).toFixed(2), y: +(Math.sin(angle)*length).toFixed(2), percent});
    });
    return pts;
  }

  function render(values){
    const pts = computePolygonPoints(values);
    polyEl.setAttribute('points', pts.map(p=>`${p.x},${p.y}`).join(' '));
    dotsGroup.innerHTML='';
    pts.forEach((p,i)=>{
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx',p.x); c.setAttribute('cy',p.y); c.setAttribute('r',4);
      c.setAttribute('fill','#5eead4'); c.setAttribute('stroke','rgba(0,0,0,0.1)'); c.setAttribute('stroke-width','1');
      const title = document.createElementNS(svgNS,'title'); title.textContent=`${axes[i].label}: ${p.percent}%`;
      c.appendChild(title);
      dotsGroup.appendChild(c);
    });
  }

  function update(){ render(readValues()); }

  document.getElementById('resetBtn').addEventListener('click', ()=>{
    axes.forEach(a=>{
      document.getElementById('range_'+a.key).value=0;
      document.getElementById('num_'+a.key).value=0;
    }); update();
  });

  document.getElementById('fillDefaults').addEventListener('click', ()=>{
    axes.forEach(a=>{
      document.getElementById('range_'+a.key).value=defaults[a.key];
      document.getElementById('num_'+a.key).value=defaults[a.key];
    }); update();
  });

  drawGrid();
  update(); // initial render
})();
