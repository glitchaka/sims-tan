import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';

const originalLoadAsync=GLTFLoader.prototype.loadAsync;
const VIT='https://cdn.jsdelivr.net/gh/ibrews/VitruvianGodot@main/godot_project/';

function lowerArms(root){
  root.traverse(o=>{
    if(!o.isBone)return;
    const n=o.name.toLowerCase().replace(/[_:\-.]/g,'');
    if(n.includes('leftarm')||n.includes('leftupperarm'))o.rotation.z-=1.12;
    if(n.includes('rightarm')||n.includes('rightupperarm'))o.rotation.z+=1.12;
  });
}

GLTFLoader.prototype.loadAsync=async function(url,onProgress){
  if(String(url).includes('Michelle.glb')){
    const [body,head,hair]=await Promise.all([
      originalLoadAsync.call(this,VIT+'vitruvian_body.glb',onProgress),
      originalLoadAsync.call(this,VIT+'vitruvian_head.glb',onProgress),
      originalLoadAsync.call(this,VIT+'hairtool_cards.glb',onProgress).catch(()=>null)
    ]);
    const scene=new THREE.Group();
    lowerArms(body.scene);
    scene.add(body.scene,head.scene);
    if(hair?.scene)scene.add(hair.scene);
    scene.userData.premiumCharacter=true;
    return {scene,animations:body.animations||[],parser:body.parser,userData:{}};
  }
  return originalLoadAsync.call(this,url,onProgress);
};

const originalUpdate=OrbitControls.prototype.update;
OrbitControls.prototype.update=function(delta){
  if(this.minDistance===2.3&&!this.userDataPremiumFraming){
    this.userDataPremiumFraming=true;
    this.minDistance=1.75;
    this.maxDistance=4.1;
    this.target.set(0,1.36,0);
    this.object.position.set(0,1.42,2.55);
    this.object.fov=29;
    this.object.updateProjectionMatrix();
  }
  return originalUpdate.call(this,delta);
};
