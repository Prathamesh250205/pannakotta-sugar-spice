/* Shared 3D scene: silk backdrop + berry pannacotta pinned to #slot. Needs three.js, a #scene canvas, #slot, and globals mx/my. */
(function(){
  if(!window.THREE)return;
  const canvas=document.getElementById('scene');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true})}catch(e){return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene();
  const FOV=35,CZ=12,TAN=Math.tan(FOV*Math.PI/360);
  const camera=new THREE.PerspectiveCamera(FOV,1,.1,100);camera.position.z=CZ;

  // soft flowing "silk" backdrop, coloured from the active theme
  const bgU={t:{value:0},a:{value:new THREE.Color()},b:{value:new THREE.Color()},c:{value:new THREE.Color()},asp:{value:1},scr:{value:0}};
  const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:bgU,depthTest:false,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`uniform float t,asp,scr;uniform vec3 a,b,c;varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      float fbm(vec2 p){float s=0.,m=.5;for(int i=0;i<5;i++){s+=m*n(p);p=p*2.03+7.1;m*=.5;}return s;}
      void main(){vec2 p=vec2(vUv.x*asp,vUv.y+scr)*1.4;
        float q=fbm(p+vec2(t*.02,t*.012));float r=fbm(p+q*2.2+vec2(-t*.015,t*.02));
        float folds=smoothstep(.2,.9,r);float sheen=pow(smoothstep(.45,.75,r)*smoothstep(1.,.75,r),1.5);
        vec3 col=mix(a,b,folds*.85);col=mix(col,c,sheen*.9);
        col+=(h(vUv*913.+t)-.5)*.012;
        gl_FragColor=vec4(col,1.);}`}));
  bg.frustumCulled=false;bg.renderOrder=-1;scene.add(bg);

  scene.add(new THREE.HemisphereLight(0xfff4e6,0x3a2a22,.9));
  const key=new THREE.DirectionalLight(0xffecd6,1.5);key.position.set(4,7,8);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffd9b0,.9);rim.position.set(-6,3,-5);scene.add(rim);

  const M=(c,o={})=>{const m=new THREE.MeshPhysicalMaterial(Object.assign({color:c,roughness:.5,clearcoat:.2,clearcoatRoughness:.5},o));m.color.convertSRGBToLinear();return m};
  const dru=new THREE.SphereGeometry(.07,10,8);
  function raspberry(s=1){
    const g=new THREE.Group(),m=M(0xb3203f,{roughness:.3,clearcoat:.7});
    g.add(new THREE.Mesh(new THREE.SphereGeometry(.19,16,12),M(0x6e1024)));
    const N=42;for(let i=0;i<N;i++){const y=1-i/(N-1)*2,r=Math.sqrt(1-y*y),th=i*2.399;const d=new THREE.Mesh(dru,m);d.position.set(Math.cos(th)*r*.2,y*.25,Math.sin(th)*r*.2);g.add(d)}
    g.scale.setScalar(s);return g;
  }
  function blueberry(s=1){const g=new THREE.Mesh(new THREE.SphereGeometry(.16,24,16),M(0x2f3561,{roughness:.35,clearcoat:.5}));g.scale.set(s,s*.9,s);return g}
  const shellGeo=new THREE.SphereGeometry(.5,32,16),fillGeo=new THREE.CylinderGeometry(.44,.44,.16,32),footGeo=new THREE.TorusGeometry(.46,.05,8,40);
  function macaron(col){
    const g=new THREE.Group(),sm=M(col,{roughness:.65,clearcoat:0}),fm=M(0xfbf1e1,{roughness:.7});
    [1,-1].forEach(s=>{const sh=new THREE.Mesh(shellGeo,sm);sh.scale.set(1,.36,1);sh.position.y=.15*s;if(s<0)sh.rotation.x=Math.PI;g.add(sh);const f=new THREE.Mesh(footGeo,sm);f.rotation.x=Math.PI/2;f.position.y=.09*s;g.add(f)});
    g.add(new THREE.Mesh(fillGeo,fm));return g;
  }
  function leaf(){const l=new THREE.Mesh(new THREE.SphereGeometry(.26,16,8),M(0x5b8f45,{roughness:.55}));l.scale.set(1,.06,.42);return l}

  // hero: berry pannacotta on a ceramic plate
  const hero=new THREE.Group(),dish=new THREE.Group();hero.add(dish);scene.add(hero);
  const pts=[new THREE.Vector2(0,0)];
  for(let i=0;i<=20;i++){const t=i/20;pts.push(new THREE.Vector2(1.2-.32*t,t*1.45))}
  for(let i=1;i<=14;i++){const a=i/14*Math.PI/2;pts.push(new THREE.Vector2(.88*Math.cos(a)+1e-4,1.45+.24*Math.sin(a)))}
  const body=new THREE.Mesh(new THREE.LatheGeometry(pts,80),M(0xf6ecdb,{roughness:.32,clearcoat:.6,clearcoatRoughness:.3}));dish.add(body);
  const coulis=M(0x8e1630,{roughness:.1,clearcoat:1,clearcoatRoughness:.04});
  const cap=new THREE.Mesh(new THREE.SphereGeometry(1,64,24,0,Math.PI*2,0,1.25),coulis);cap.scale.set(.915,.26,.915);cap.position.y=1.45;dish.add(cap);
  [[.3,.18],[1.05,.32],[1.8,.14],[2.5,.26],[3.3,.2],[4,.34],[4.8,.16],[5.6,.24]].forEach(([a,len])=>{const y=1.43-len*.6,r=1.2-.32*(y/1.45)+.01;const d=new THREE.Mesh(new THREE.SphereGeometry(.08,14,10),coulis);d.scale.set(1,1+len*6,1);d.position.set(Math.cos(a)*r,y,Math.sin(a)*r);dish.add(d)});
  [[0,1.88,0,1.1],[-.36,1.76,.22,.92],[.3,1.76,.3,.88]].forEach(([x,y,z,s],i)=>{const r=raspberry(s);r.position.set(x,y,z);r.rotation.set(i,i*2,i*.5);dish.add(r)});
  [[.1,2.06,-.26,.6],[-.12,2.03,-.28,-.5]].forEach(([x,y,z,r])=>{const l=leaf();l.position.set(x,y,z);l.rotation.set(.5,r,.3);dish.add(l)});
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(2.15,1.85,.1,96),M(0xf5f1ea,{roughness:.18,clearcoat:1}));plate.position.y=-.05;dish.add(plate);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(2.15,.05,12,120),M(0xf5f1ea,{roughness:.18,clearcoat:1}));lip.rotation.x=Math.PI/2;dish.add(lip);
  const pool=new THREE.Mesh(new THREE.CircleGeometry(.5,48),coulis);pool.rotation.x=-Math.PI/2;pool.position.set(1.45,.006,.45);pool.scale.set(1,.62,1);dish.add(pool);
  const rb=raspberry(.85);rb.position.set(1.45,.23,.5);dish.add(rb);
  const bb=blueberry(1);bb.position.set(1.2,.16,.85);dish.add(bb);
  // contact shadow
  const sc=document.createElement('canvas');sc.width=sc.height=128;const sx=sc.getContext('2d'),gr=sx.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=gr;sx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5.6,5.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.12;dish.add(shadow);
  dish.position.y=-.95;

  // a few accents floating around the dish
  const orbit=new THREE.Group();hero.add(orbit);
  [[()=>macaron(0xbcd6a4),-2.6,1.4,-.6,.55],[()=>macaron(0xefb8c2),2.7,1.9,-1.2,.5],[()=>raspberry(1.5),-2.2,-1.3,.8,1],[()=>blueberry(1.6),2.4,-1,.9,1],[()=>raspberry(1.2),3.3,.45,-1.8,1]]
    .forEach(([mk,x,y,z,s],i)=>{const o=mk();o.position.set(x,y,z);o.scale.multiplyScalar(s);o.rotation.set(i,i*1.3,i*.7);o.userData={y,ph:i*1.7};orbit.add(o)});

  // theme colours come straight from the CSS tokens
  const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function applyTheme(){bgU.a.value.set(css('--sh-a'));bgU.b.value.set(css('--sh-b'));bgU.c.value.set(css('--sh-c'));
    const dark=document.documentElement.dataset.mode==='dark';renderer.toneMappingExposure=dark?.95:1.05;shadow.material.opacity=dark?.8:.55}
  document.addEventListener('themechange',applyTheme);applyTheme();

  const slot=document.getElementById('slot');let W,H;
  function resize(){W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();bgU.asp.value=W/H}
  addEventListener('resize',resize);resize();

  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock=new THREE.Clock();let smx=0,smy=0,intro=0;
  canvas.classList.add('on');
  (function frame(){
    const t=clock.getElapsedTime(),k=reduce?0:1;
    smx+=(mx-smx)*.04;smy+=(my-smy)*.04;intro=Math.min(1,intro+.008);const e=1-Math.pow(1-intro,3);
    bgU.t.value=t*k;bgU.scr.value=scrollY/H*.08;
    // pin the hero to its slot in the page
    const r=slot.getBoundingClientRect(),vh=2*TAN*CZ,vw=vh*camera.aspect;
    hero.visible=r.bottom>-50;
    if(hero.visible){
      hero.position.set((r.left+r.width/2)/W*vw-vw/2,-((r.top+r.height/2)/H*vh-vh/2),0);
      const s=Math.min(r.width/W*vw/5.8,r.height/H*vh/4.6);hero.scale.setScalar(s*(.88+.12*e));
      dish.rotation.y=-.6+t*.18*k+smx*.25;dish.rotation.x=.38+smy*.08;
      dish.position.y=-.95+(1-e)*-.6+Math.sin(t*.8)*.05*k;
      body.scale.set(1+Math.sin(t*2.4)*.006*k,1-Math.sin(t*2.4)*.009*k,1);
      orbit.rotation.y=smx*.15;orbit.rotation.x=smy*.08;
      orbit.children.forEach(o=>{o.position.y=o.userData.y+Math.sin(t*.7+o.userData.ph)*.12*k;o.rotation.y+=.004*k;o.rotation.x+=.002*k});
    }
    renderer.render(scene,camera);requestAnimationFrame(frame);
  })();
})();
