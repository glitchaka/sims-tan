import React,{useEffect,useMemo,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import{Canvas,useFrame}from'@react-three/fiber';
import{ContactShadows,Environment,OrbitControls,RoundedBox,SoftShadows}from'@react-three/drei';
import*as THREE from'three';
import'./style.css';

const SKINS=['#f1c8ad','#dca47f','#bf7d58','#8f583d','#593426'];
const HAIRS=['#181312','#4a2e21','#9a6337','#d3aa6a','#8b3527'];
const EYES=['#4b3326','#6a7b55','#73828a','#385a78'];
const OUTFITS=[['#d9d5cd','#26292c'],['#6c7a73','#25272a'],['#7b6975','#242326'],['#b6a184','#313132']];

function mat(color,roughness=.65,metalness=0){return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness}/>}
function Box({p=[0,0,0],s=[1,1,1],c='#fff',r=.5,m=0,...props}){return <mesh position={p} castShadow receiveShadow {...props}><boxGeometry args={s}/>{mat(c,r,m)}</mesh>}
function Cylinder({p=[0,0,0],args=[.2,.2,1,24],c='#fff',r=.5,m=0,...props}){return <mesh position={p} castShadow receiveShadow {...props}><cylinderGeometry args={args}/>{mat(c,r,m)}</mesh>}

function Face({skin,hairColor,hairStyle,eyeColor}){
 const hc=HAIRS[hairColor],ec=EYES[eyeColor];
 return <group>
  <mesh position={[0,1.73,0]} scale={[.88,1.05,.9]} castShadow><sphereGeometry args={[.245,40,40]}/><meshStandardMaterial color={SKINS[skin]} roughness={.72}/></mesh>
  <mesh position={[0,1.79,.226]} scale={[.55,.28,.3]}><sphereGeometry args={[.13,24,24]}/><meshStandardMaterial color={SKINS[skin]}/></mesh>
  {[-.085,.085].map((x,i)=><group key={i} position={[x,1.77,.215]}><mesh><sphereGeometry args={[.036,20,20]}/><meshStandardMaterial color="#eee9e1"/></mesh><mesh position={[0,0,.031]}><sphereGeometry args={[.018,18,18]}/><meshStandardMaterial color={ec} roughness={.3}/></mesh><mesh position={[0,0,.047]}><sphereGeometry args={[.008,14,14]}/><meshStandardMaterial color="#121212"/></mesh></group>)}
  <mesh position={[0,1.665,.236]} scale={[.8,.18,.22]}><sphereGeometry args={[.07,20,20]}/><meshStandardMaterial color="#9f5d58" roughness={.7}/></mesh>
  <mesh position={[0,1.99,-.045]} scale={[1.03,.45,1.0]} castShadow><sphereGeometry args={[.255,32,32]}/><meshStandardMaterial color={hc} roughness={.85}/></mesh>
  {hairStyle===0&&<><mesh position={[0,2.13,-.05]}><sphereGeometry args={[.15,26,26]}/><meshStandardMaterial color={hc} roughness={.9}/></mesh><mesh position={[0,2.22,-.06]}><sphereGeometry args={[.095,24,24]}/><meshStandardMaterial color={hc}/></mesh></>}
  {hairStyle===1&&<><mesh position={[-.22,1.83,-.03]} scale={[.45,1.35,.55]}><sphereGeometry args={[.18,24,24]}/><meshStandardMaterial color={hc}/></mesh><mesh position={[.22,1.83,-.03]} scale={[.45,1.35,.55]}><sphereGeometry args={[.18,24,24]}/><meshStandardMaterial color={hc}/></mesh></>}
  {hairStyle===2&&<mesh position={[0,1.86,-.19]} scale={[1.1,1.45,.45]}><sphereGeometry args={[.28,28,28]}/><meshStandardMaterial color={hc}/></mesh>}
  {hairStyle===3&&<><mesh position={[-.2,1.62,-.09]} scale={[.42,2.2,.52]}><sphereGeometry args={[.2,24,24]}/><meshStandardMaterial color={hc}/></mesh><mesh position={[.2,1.62,-.09]} scale={[.42,2.2,.52]}><sphereGeometry args={[.2,24,24]}/><meshStandardMaterial color={hc}/></mesh></>}
 </group>
}

function Human({appearance,rootRef,pose='idle',preview=false}){
 const la=useRef(),ra=useRef(),ll=useRef(),rl=useRef(),chest=useRef();
 const moveRef=appearance.moveRef;
 const sex=appearance.sex,body=.88+appearance.body/360,shoulders=sex==='masc'?1.08:.94,hips=sex==='masc'?.94:1.05;
 const[top,bottom]=OUTFITS[appearance.outfit];
 useFrame(({clock})=>{const t=clock.elapsedTime;const moving=moveRef?.current||false;const swing=moving?Math.sin(t*9)*.55:Math.sin(t*1.8)*.018;if(la.current)la.current.rotation.x=swing;if(ra.current)ra.current.rotation.x=-swing;if(ll.current)ll.current.rotation.x=-swing*.78;if(rl.current)rl.current.rotation.x=swing*.78;if(chest.current)chest.current.scale.y=1+Math.sin(t*1.9)*.004;});
 return <group ref={rootRef} scale={preview?[1.25,1.25,1.25]:[1,1,1]}>
  <group scale={[body,1,body]}>
   <group ref={chest} position={[0,1.18,0]} scale={[shoulders,1,.72]}><mesh castShadow><capsuleGeometry args={[.30,.50,10,28]}/><meshStandardMaterial color={top} roughness={.8}/></mesh></group>
   <mesh position={[0,.88,0]} scale={[hips,.7,.72]} castShadow><sphereGeometry args={[.31,28,28]}/><meshStandardMaterial color={bottom} roughness={.82}/></mesh>
  </group>
  <mesh position={[0,1.49,0]} castShadow><cylinderGeometry args={[.105,.12,.18,24]}/><meshStandardMaterial color={SKINS[appearance.skin]}/></mesh>
  <Face skin={appearance.skin} hairColor={appearance.hairColor} hairStyle={appearance.hairStyle} eyeColor={appearance.eyeColor}/>
  {[-1,1].map((side,i)=><group key={'a'+i} ref={side<0?la:ra} position={[side*.36*shoulders,1.37,0]} rotation={[0,0,side*.06]}><mesh position={[0,-.27,0]} castShadow><capsuleGeometry args={[.095,.42,8,20]}/><meshStandardMaterial color={top}/></mesh><mesh position={[0,-.68,0]} castShadow><capsuleGeometry args={[.082,.35,8,20]}/><meshStandardMaterial color={SKINS[appearance.skin]}/></mesh><mesh position={[0,-.91,.01]}><sphereGeometry args={[.105,20,20]}/><meshStandardMaterial color={SKINS[appearance.skin]}/></mesh></group>)}
  {[-1,1].map((side,i)=><group key={'l'+i} ref={side<0?ll:rl} position={[side*.17*hips,.82,0]}><mesh position={[0,-.35,0]} castShadow><capsuleGeometry args={[.125,.48,8,22]}/><meshStandardMaterial color={bottom}/></mesh><mesh position={[0,-.84,0]} castShadow><capsuleGeometry args={[.105,.42,8,22]}/><meshStandardMaterial color={SKINS[appearance.skin]}/></mesh><mesh position={[0,-1.09,.10]} scale={[1, .55,1.75]} castShadow><sphereGeometry args={[.13,20,20]}/><meshStandardMaterial color="#e9e7e2" roughness={.75}/></mesh></group>)}
 </group>
}

function CharacterStudio({appearance}){return <><color attach="background" args={['#6e7475']}/><SoftShadows size={18} samples={12}/><ambientLight intensity={1.3}/><directionalLight position={[4,7,5]} intensity={3.4} castShadow/><spotLight position={[-4,5,4]} intensity={65} angle={.35} penumbra={.8}/><mesh rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[3.4,64]}/><meshStandardMaterial color="#77716a" roughness={.85}/></mesh><Human appearance={appearance} preview/><ContactShadows position={[0,.005,0]} opacity={.55} scale={5} blur={2.6}/><OrbitControls target={[0,1.05,0]} minDistance={3.2} maxDistance={5.6} maxPolarAngle={1.45} enablePan={false}/><Environment preset="studio"/></>}

function WoodFloor(){const planks=[];for(let z=-4.85;z<4.9;z+=.48)for(let x=-5.85;x<5.9;x+=2.0)planks.push(<Box key={`${x}-${z}`} p={[x+.96,.025,z+.22]} s={[1.88,.05,.42]} c={(Math.round((x+z)*10)%3===0)?'#7f5f43':'#89694a'} r={.78}/>);return <group>{planks}</group>}
function WallShell(){return <group><Box p={[0,1.7,-5]} s={[12,.12?3.4:3.4,.18]} c="#d8d1c5" r={.9}/><Box p={[-6,1.7,0]} s={[.18,3.4,10]} c="#d3ccc0" r={.9}/><Box p={[0,.11,5]} s={[12,.2,.14]} c="#cfc6b7"/><Box p={[6,.11,0]} s={[.14,.2,10]} c="#cfc6b7"/></group>}
function WindowWall(){return <group position={[-2.7,1.85,-4.88]}><Box s={[3.4,2.3,.08]} c="#242a2d" r={.25} m={.25}/><mesh position={[0,0,.05]}><planeGeometry args={[3.12,2.02]}/><meshPhysicalMaterial color="#9bb0b7" roughness={.08} metalness={.05} transmission={.35} transparent opacity={.72}/></mesh><Box p={[0,0,.11]} s={[.05,2.04,.05]} c="#222"/><Box p={[0,0,.11]} s={[3.14,.05,.05]} c="#222"/></group>}

function Lamp({p}){return <group position={p}><Cylinder p={[0,.27,0]} args={[.055,.07,.54,18]} c="#a77a50"/><Cylinder p={[0,.57,0]} args={[.28,.18,.34,28]} c="#e8d6b5" r={.8}/><pointLight position={[0,.62,0]} intensity={14} distance={3.2} color="#ffd9a0"/></group>}
function Bed({onSelect}){return <group position={[-3.45,0,-2.6]} onClick={e=>{e.stopPropagation();onSelect('bed')}}>
 <RoundedBox position={[0,.28,0]} args={[3.1,.46,2.25]} radius={.09} castShadow><meshStandardMaterial color="#5f4635" roughness={.82}/></RoundedBox>
 <RoundedBox position={[0,.57,0]} args={[2.98,.34,2.12]} radius={.14} castShadow><meshStandardMaterial color="#eee8df" roughness={.95}/></RoundedBox>
 <RoundedBox position={[0,.76,.22]} args={[2.92,.22,1.56]} radius={.09}><meshStandardMaterial color="#b6ad9f" roughness={.98}/></RoundedBox>
 <RoundedBox position={[-.72,.88,-.63]} args={[1.15,.22,.62]} radius={.17}><meshStandardMaterial color="#f6f2eb"/></RoundedBox><RoundedBox position={[.72,.88,-.63]} args={[1.15,.22,.62]} radius={.17}><meshStandardMaterial color="#eee8df"/></RoundedBox>
 <Box p={[0,1.18,-1.02]} s={[3.15,1.35,.18]} c="#6b5040"/>
 <group position={[-1.9,0,-.58]}><RoundedBox position={[0,.38,0]} args={[.72,.72,.72]} radius={.06}><meshStandardMaterial color="#5d4636"/></RoundedBox><Lamp p={[0,.75,0]}/></group>
 </group>}

function TVArea({onSelect,tvOn}){const screen=tvOn?'#77aecd':'#111416';return <group>
 <group position={[1.35,1.72,-4.82]} onClick={e=>{e.stopPropagation();onSelect('tv')}}><RoundedBox args={[2.9,1.62,.13]} radius={.07} castShadow><meshStandardMaterial color="#17191a" roughness={.22} metalness={.35}/></RoundedBox><mesh position={[0,0,.075]}><planeGeometry args={[2.68,1.42]}/><meshStandardMaterial color={screen} emissive={tvOn?'#4a91bd':'#000'} emissiveIntensity={tvOn?2.1:0} roughness={.18}/></mesh></group>
 <RoundedBox position={[1.35,.38,-4.35]} args={[3.35,.56,.72]} radius={.08} castShadow><meshStandardMaterial color="#5a493d" roughness={.7}/></RoundedBox>
 <Box p={[-.1,.68,-4.34]} s={[.55,.14,.35]} c="#292c2f" r={.25} m={.3}/><Cylinder p={[2.67,.76,-4.34]} args={[.2,.25,.9,24]} c="#d0c6b5"/><mesh position={[2.67,1.38,-4.34]} castShadow><sphereGeometry args={[.36,24,24]}/><meshStandardMaterial color="#526a4d" roughness={.9}/></mesh>
 <group position={[1.2,0,-2.1]} onClick={e=>{e.stopPropagation();onSelect('sofa')}}><RoundedBox position={[0,.46,0]} args={[2.8,.62,1.15]} radius={.18}><meshStandardMaterial color="#565c5c" roughness={.92}/></RoundedBox><RoundedBox position={[0,.93,.38]} args={[2.65,.72,.32]} radius={.14}><meshStandardMaterial color="#606565" roughness={.92}/></RoundedBox><RoundedBox position={[-1.3,.74,0]} args={[.28,.55,1.1]} radius={.13}><meshStandardMaterial color="#505656"/></RoundedBox><RoundedBox position={[1.3,.74,0]} args={[.28,.55,1.1]} radius={.13}><meshStandardMaterial color="#505656"/></RoundedBox></group>
 <mesh position={[1.2,.035,-2.12]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[4.0,2.4]}/><meshStandardMaterial color="#b8aea0" roughness={1}/></mesh>
 </group>}

function Bathroom({onSelect,showerOn}){return <group>
 <mesh position={[4.65,.045,2.55]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[2.45,4.55]}/><meshStandardMaterial color="#c9c8c3" roughness={.35}/></mesh>
 {[1.05,2.02,3.0,3.98].map(z=><Box key={z} p={[3.35,1.55,z]} s={[.12,3.1,.82]} c="#e0ddd7" r={.9}/>)}
 <Box p={[3.35,1.55,4.52]} s={[.12,3.1,.85]} c="#e0ddd7"/><Box p={[4.7,1.55,4.78]} s={[2.6,3.1,.14]} c="#dad7d1"/>
 <group position={[4.58,0,3.62]} onClick={e=>{e.stopPropagation();onSelect('toilet')}}><RoundedBox position={[0,.36,0]} args={[.68,.68,.88]} radius={.22}><meshStandardMaterial color="#f2f1ed" roughness={.28}/></RoundedBox><mesh position={[0,.70,-.08]}><torusGeometry args={[.31,.055,16,32]}/><meshStandardMaterial color="#f8f7f2"/></mesh><RoundedBox position={[0,1.03,-.38]} args={[.68,.73,.22]} radius={.08}><meshStandardMaterial color="#efeee9"/></RoundedBox></group>
 <group position={[3.75,0,1.35]} onClick={e=>{e.stopPropagation();onSelect('sink')}}><RoundedBox position={[0,.73,0]} args={[.86,.2,.54]} radius={.12}><meshStandardMaterial color="#f2f0eb" roughness={.28}/></RoundedBox><Cylinder p={[0,.39,0]} args={[.13,.18,.62,24]} c="#7a6d5f"/><Cylinder p={[0,1.05,-.16]} args={[.035,.035,.34,16]} c="#b7bdbe" r={.15} m={.85}/><mesh position={[0,1.63,-.46]}><planeGeometry args={[1.1,1.25]}/><meshPhysicalMaterial color="#aeb8ba" roughness={.08} metalness={.45}/></mesh></group>
 <group position={[5.15,0,1.28]} onClick={e=>{e.stopPropagation();onSelect('shower')}}><RoundedBox position={[0,.05,0]} args={[1.12,.1,1.2]} radius={.04}><meshStandardMaterial color="#d8d8d5" roughness={.3}/></RoundedBox>{[[-.55,.95,0],[.55,.95,0],[0,.95,-.6]].map((p,i)=><mesh key={i} position={p}><boxGeometry args={i===2?[1.1,1.9,.035]:[.035,1.9,1.2]}/><meshPhysicalMaterial color="#c6dddf" transmission={.72} opacity={.28} transparent roughness={.05}/></mesh>)}<Cylinder p={[.34,1.82,-.42]} args={[.025,.025,.65,14]} c="#aab1b2" m={.8} r={.15}/><mesh position={[.34,1.55,-.25]} rotation={[1.1,0,0]}><cylinderGeometry args={[.16,.16,.035,24]}/><meshStandardMaterial color="#b8bfc0" metalness={.8} roughness={.2}/></mesh>{showerOn&&Array.from({length:24}).map((_,i)=><mesh key={i} position={[(i%6)*.13-.32,.35+(i%4)*.32,Math.sin(i*2)*.18]}><sphereGeometry args={[.025+(i%3)*.009,10,10]}/><meshStandardMaterial color="#dceef0" transparent opacity={.46}/></mesh>)}</group>
 <RoundedBox position={[4.72,.17,2.55]} args={[1.55,.16,.82]} radius={.06}><meshStandardMaterial color="#a8a29a" roughness={1}/></RoundedBox>
 </group>}

function Decor(){return <group><group position={[-.8,0,2.9]}><Cylinder p={[0,.42,0]} args={[.34,.27,.76,24]} c="#b7a17f"/><mesh position={[0,1.1,0]} scale={[.7,1.2,.7]}><sphereGeometry args={[.52,26,26]}/><meshStandardMaterial color="#4e6848" roughness={1}/></mesh></group><group position={[-2.2,.48,2.55]}><RoundedBox args={[2.25,.16,1.15]} radius={.06}><meshStandardMaterial color="#5b4433"/></RoundedBox><Cylinder p={[-.9,-.43,0]} args={[.045,.045,.86,14]} c="#292725"/><Cylinder p={[.9,-.43,0]} args={[.045,.045,.86,14]} c="#292725"/><Box p={[0,.23,0]} s={[.72,.34,.09]} c="#303335" r={.25} m={.18}/></group><pointLight position={[-2.2,2.8,2.4]} intensity={24} distance={5.2} color="#ffd6a1"/></group>}

const TARGETS={bed:[-2.15,0,-1.28],tv:[1.1,0,-1.18],sofa:[1.1,0,-1.05],toilet:[4.15,0,3.28],sink:[4.0,0,1.95],shower:[4.55,0,1.35]};
function Player({appearance,command,onArrive,manualDir}){
 const root=useRef(),target=useRef(new THREE.Vector3(0,0,1.1)),moveRef=useRef(false),keys=useRef({}),last=useRef(null);appearance.moveRef=moveRef;
 useEffect(()=>{const down=e=>{keys.current[e.key.toLowerCase()]=true},up=e=>{keys.current[e.key.toLowerCase()]=false};window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[]);
 useEffect(()=>{if(command?.target){target.current.set(command.target[0],0,command.target[2]);last.current=command.id}},[command]);
 useFrame((_,dt)=>{if(!root.current)return;let dx=0,dz=0;const k=keys.current;if(k.w||k.arrowup)dz-=1;if(k.s||k.arrowdown)dz+=1;if(k.a||k.arrowleft)dx-=1;if(k.d||k.arrowright)dx+=1;dx+=manualDir.x;dz+=manualDir.z;let manual=Math.abs(dx)+Math.abs(dz)>0;if(manual){const n=Math.hypot(dx,dz)||1;dx/=n;dz/=n;root.current.position.x=THREE.MathUtils.clamp(root.current.position.x+dx*dt*2.2,-5.35,5.35);root.current.position.z=THREE.MathUtils.clamp(root.current.position.z+dz*dt*2.2,-4.35,4.35);root.current.rotation.y=Math.atan2(dx,dz);moveRef.current=true;last.current=null;return}const delta=target.current.clone().sub(root.current.position);delta.y=0;const d=delta.length();if(d>.08){delta.normalize();root.current.position.addScaledVector(delta,Math.min(dt*2,d));root.current.rotation.y=THREE.MathUtils.lerp(root.current.rotation.y,Math.atan2(delta.x,delta.z),.2);moveRef.current=true}else{moveRef.current=false;if(command&&last.current===command.id){last.current=null;onArrive(command)}}});
 return <Human appearance={appearance} rootRef={root}/>;
}

function GameRoom({appearance,command,setCommand,onSelect,onArrive,tvOn,showerOn,manualDir}){
 const move=e=>{e.stopPropagation();if(e.button!==0)return;setCommand({id:Date.now(),kind:'move',target:[THREE.MathUtils.clamp(e.point.x,-5.25,5.25),0,THREE.MathUtils.clamp(e.point.z,-4.25,4.25)]})};
 return <><color attach="background" args={['#7a8790']}/><fog attach="fog" args={['#8d8a83',18,30]}/><SoftShadows size={18} samples={10}/><ambientLight intensity={1.05}/><directionalLight position={[7,10,6]} intensity={3.4} castShadow shadow-mapSize={[2048,2048]}/><pointLight position={[4,2.7,-1]} intensity={22} distance={7} color="#fff0d7"/><WoodFloor/><WallShell/><WindowWall/><mesh rotation={[-Math.PI/2,0,0]} position={[0,.001,0]} onPointerDown={move} receiveShadow><planeGeometry args={[11.8,9.8]}/><meshStandardMaterial transparent opacity={0}/></mesh><Bed onSelect={onSelect}/><TVArea onSelect={onSelect} tvOn={tvOn}/><Bathroom onSelect={onSelect} showerOn={showerOn}/><Decor/><Player appearance={appearance} command={command} onArrive={onArrive} manualDir={manualDir}/><ContactShadows position={[0,.02,0]} scale={13} opacity={.46} blur={2.8}/><OrbitControls makeDefault target={[0,1,0]} minDistance={6} maxDistance={14} maxPolarAngle={1.43} enableDamping dampingFactor={.08}/><Environment preset="apartment"/></>}

function World({mode,...props}){return <Canvas shadows dpr={[1,1.75]} camera={{position:mode==='create'?[0,2.25,4.5]:[9.8,7.4,10.8],fov:mode==='create'?36:42}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.0}}>{mode==='create'?<CharacterStudio appearance={props.appearance}/>:<GameRoom {...props}/>}</Canvas>}

const OBJECTS={
 bed:{title:'Cama',icon:'🛏️',actions:[['sleep','Dormir'],['relax','Sentarse en la cama']]},
 tv:{title:'Televisor',icon:'📺',actions:[['watch','Ver televisión'],['toggleTv','Encender / apagar']]},
 sofa:{title:'Sofá',icon:'🛋️',actions:[['sit','Sentarse'],['watch','Ver televisión']]},
 toilet:{title:'Inodoro',icon:'🚽',actions:[['toilet','Usar baño']]},
 sink:{title:'Lavamanos',icon:'🚰',actions:[['wash','Lavarse las manos']]},
 shower:{title:'Ducha',icon:'🚿',actions:[['shower','Ducharse']]}
};

function Creator({name,setName,appearance,setAppearance,onPlay,onBack}){const patch=x=>setAppearance(a=>({...a,...x}));return <section className="creator glass"><div className="creatorHead"><div><span>CREAR PERSONAJE</span><h2>{name||'Nuevo personaje'}</h2></div><div className="sex"><button className={appearance.sex==='fem'?'active':''} onClick={()=>patch({sex:'fem'})}>♀</button><button className={appearance.sex==='masc'?'active':''} onClick={()=>patch({sex:'masc'})}>♂</button></div></div><label>Nombre<input value={name} maxLength={24} onChange={e=>setName(e.target.value)}/></label><div className="field"><span>Tono de piel</span><div className="swatches">{SKINS.map((c,i)=><button key={c} aria-label={`Piel ${i+1}`} className={appearance.skin===i?'on':''} style={{background:c}} onClick={()=>patch({skin:i})}/>)}</div></div><div className="field"><span>Ojos</span><div className="swatches small">{EYES.map((c,i)=><button key={c} aria-label={`Ojos ${i+1}`} className={appearance.eyeColor===i?'on':''} style={{background:c}} onClick={()=>patch({eyeColor:i})}/>)}</div></div><div className="field"><span>Cabello</span><div className="hairChoices">{['Moño','Corto','Bob','Largo'].map((x,i)=><button key={x} className={appearance.hairStyle===i?'active':''} onClick={()=>patch({hairStyle:i})}>{x}</button>)}</div><div className="swatches small">{HAIRS.map((c,i)=><button key={c} aria-label={`Cabello ${i+1}`} className={appearance.hairColor===i?'on':''} style={{background:c}} onClick={()=>patch({hairColor:i})}/>)}</div></div><label>Complexión<input type="range" min="0" max="100" value={appearance.body} onChange={e=>patch({body:+e.target.value})}/></label><div className="field"><span>Estilo</span><div className="hairChoices">{['Claro','Oliva','Ciruela','Arena'].map((x,i)=><button key={x} className={appearance.outfit===i?'active':''} onClick={()=>patch({outfit:i})}>{x}</button>)}</div></div><label>Personalidad<select value={appearance.personality} onChange={e=>patch({personality:e.target.value})}><option>Sociable</option><option>Creativa</option><option>Ambiciosa</option><option>Tranquila</option><option>Solitario</option></select></label><button className="primary" onClick={onPlay}>Entrar al hogar</button><button className="secondary" onClick={onBack}>Volver</button></section>}

function App(){
 const[page,setPage]=useState('menu'),[name,setName]=useState('Valentina'),[appearance,setAppearance]=useState({sex:'fem',skin:1,hairColor:0,hairStyle:0,eyeColor:1,body:48,outfit:0,personality:'Sociable'}),[selected,setSelected]=useState(null),[command,setCommand]=useState(null),[tvOn,setTvOn]=useState(false),[showerOn,setShowerOn]=useState(false),[activity,setActivity]=useState('En casa'),[needs,setNeeds]=useState({energy:74,fun:61,hygiene:72,bladder:68}),[manualDir,setManualDir]=useState({x:0,z:0});
 const mode=page==='create'?'create':'game';
 const chooseObject=id=>{if(page==='game')setSelected(id)};
 const runAction=(kind)=>{const object=selected;setSelected(null);setCommand({id:Date.now(),kind,object,target:TARGETS[object]||[0,0,0]})};
 const arrived=cmd=>{if(cmd.kind==='move')return;const done=(label,updates={})=>{setActivity(label);setNeeds(n=>({...n,...updates}))};if(cmd.kind==='watch'){setTvOn(true);done('Viendo televisión',{fun:Math.min(100,needs.fun+22)})}if(cmd.kind==='toggleTv'){setTvOn(v=>!v);done('Frente al televisor')}if(cmd.kind==='sleep'){done('Durmiendo',{energy:100});setTimeout(()=>setActivity('Descansado'),3500)}if(cmd.kind==='relax'||cmd.kind==='sit')done('Descansando');if(cmd.kind==='toilet')done('Usando el baño',{bladder:100});if(cmd.kind==='wash')done('Lavándose las manos',{hygiene:Math.min(100,needs.hygiene+18)});if(cmd.kind==='shower'){setShowerOn(true);done('Duchándose',{hygiene:100});setTimeout(()=>{setShowerOn(false);setActivity('Recién duchado')},4200)}};
 const dir=(x,z)=>setManualDir({x,z}),stop=()=>setManualDir({x:0,z:0});
 return <main>
  <div className="world"><World mode={mode} appearance={appearance} command={command} setCommand={setCommand} onSelect={chooseObject} onArrive={arrived} tvOn={tvOn} showerOn={showerOn} manualDir={manualDir}/></div>
  {page==='menu'&&<section className="menu glass"><div className="brand"><i>◇</i><span>SIMS</span><b>TAN</b></div><p className="eyebrow">SIMULADOR SOCIAL 3D</p><h1>Tu casa.<br/>Tu historia.</h1><p className="intro">Crea a tu personaje, vive en un hogar interactivo y comparte el mundo.</p><button className="primary" onClick={()=>setPage('create')}>Nueva partida</button><button onClick={()=>setPage('create')}>Crear personaje</button><button onClick={()=>setPage('game')}>Entrar al hogar</button><button className="secondary" onClick={()=>setPage('multi')}>Multijugador</button></section>}
  {page==='create'&&<><Creator name={name} setName={setName} appearance={appearance} setAppearance={setAppearance} onPlay={()=>setPage('game')} onBack={()=>setPage('menu')}/><div className="studioHint">Arrastra para girar · rueda o pinza para acercar</div></>}
  {page==='game'&&<><div className="hud glass"><div className="portrait">{name.slice(0,1).toUpperCase()}</div><div className="identity"><strong>{name||'Habitante'}</strong><span>● {activity}</span></div><div className="needGrid">{Object.entries({energy:'Energía',fun:'Diversión',hygiene:'Higiene',bladder:'Baño'}).map(([k,l])=><div key={k}><small>{l}</small><i><b style={{width:`${needs[k]}%`}}/></i></div>)}</div></div><div className="time glass"><strong>☀ Lun 09:15</strong><span>§ 2.450</span></div><div className="instruction">Haz clic en el suelo para caminar · WASD/flechas · toca los muebles para interactuar</div><nav className="dock glass"><button title="Inicio" onClick={()=>setPage('menu')}>⌂</button><button title="Editar personaje" onClick={()=>setPage('create')}>👤</button><button title="Casa">🛋</button><button title="Social">👥</button></nav><div className="touchPad"><button onPointerDown={()=>dir(0,-1)} onPointerUp={stop} onPointerCancel={stop}>▲</button><div><button onPointerDown={()=>dir(-1,0)} onPointerUp={stop} onPointerCancel={stop}>◀</button><button onPointerDown={()=>dir(0,1)} onPointerUp={stop} onPointerCancel={stop}>▼</button><button onPointerDown={()=>dir(1,0)} onPointerUp={stop} onPointerCancel={stop}>▶</button></div></div>{selected&&<div className="interaction glass"><div className="interactionTitle"><span>{OBJECTS[selected].icon}</span><div><small>INTERACTUAR</small><strong>{OBJECTS[selected].title}</strong></div><button onClick={()=>setSelected(null)}>×</button></div>{OBJECTS[selected].actions.map(([id,label])=><button key={id} onClick={()=>runAction(id)}>{label}</button>)}</div>}</>}
  {page==='multi'&&<section className="menu glass"><p className="eyebrow">MULTIJUGADOR</p><h2>Casa compartida</h2><p className="intro">La escena ya conserva el mismo hogar y personaje para la futura sincronización de jugadores.</p><div className="playerRow"><span className="online"/> <b>{name||'Jugador'}</b><small>Anfitrión</small></div><div className="playerRow muted"><span/> Espacio disponible</div><button className="primary" onClick={()=>setPage('game')}>Crear sala local</button><button className="secondary" onClick={()=>setPage('menu')}>Volver</button></section>}
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
