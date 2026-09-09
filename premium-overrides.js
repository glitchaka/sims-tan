import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';
import * as SkeletonUtils from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/utils/SkeletonUtils.js/+esm';

const originalLoadAsync=GLTFLoader.prototype.loadAsync;
const RPM='https://cdn.jsdelivr.net/gh/Malcolmnixon/GodotXRAnimationRecorder@main/assets/ready_player_me/';
const modelPromises=new Map();

function cachedModel(loader,url,onProgress){
  if(!modelPromises.has(url))modelPromises.set(url,originalLoadAsync.call(loader,url,onProgress));
  return modelPromises.get(url);
}
function lowerArms(root){
  root.traverse(o=>{
    if(!o.isBone)return;
    const n=o.name.toLowerCase().replace(/[_:\-.]/g,'');
    if(n.includes('leftupperarm')||n.includes('leftarm'))o.rotation.z-=1.0;
    if(n.includes('rightupperarm')||n.includes('rightarm'))o.rotation.z+=1.0;
  });
}
function cloneGltf(gltf){
  const scene=SkeletonUtils.clone(gltf.scene);
  lowerArms(scene);
  return {scene,animations:gltf.animations||[],parser:gltf.parser,userData:gltf.userData||{}};
}

GLTFLoader.prototype.loadAsync=async function(url,onProgress){
  const s=String(url);
  if(s.includes('Michelle.glb'))return cloneGltf(await cachedModel(this,RPM+'female.glb',onProgress));
  if(s.includes('Xbot.glb'))return cloneGltf(await cachedModel(this,RPM+'male.glb',onProgress));
  return originalLoadAsync.call(this,url,onProgress);
};

const originalUpdate=OrbitControls.prototype.update;
OrbitControls.prototype.update=function(delta){
  if(this.minDistance===2.3&&!this.userDataPremiumFraming){
    this.userDataPremiumFraming=true;
    this.minDistance=1.7;
    this.maxDistance=4.2;
    this.target.set(0,1.34,0);
    this.object.position.set(0,1.39,2.62);
    this.object.fov=29;
    this.object.updateProjectionMatrix();
  }
  return originalUpdate.call(this,delta);
};
