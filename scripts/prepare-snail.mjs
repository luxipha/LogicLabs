// Preserve the supplied snail, its texture and morph animation; discard nine unused UV streams.
// Run: node scripts/prepare-snail.mjs
import fs from 'node:fs/promises';
const source=await fs.readFile('public/models/basical_snail.glb');
const jsonLength=source.readUInt32LE(12), doc=JSON.parse(source.subarray(20,20+jsonLength).toString());
const bin=source.subarray(28+jsonLength);const removed=new Set();
for(const mesh of doc.meshes)for(const primitive of mesh.primitives)for(const [key,id] of Object.entries(primitive.attributes))if(/^TEXCOORD_[1-9]$/.test(key)){removed.add(id);delete primitive.attributes[key];}
if(doc.materials.some(m=>JSON.stringify(m).includes('texCoord')))throw Error('Review texture coordinates before removing UV channels.');
const accessorMap=new Map(),oldAccessors=doc.accessors;doc.accessors=oldAccessors.filter((a,i)=>{if(removed.has(i))return false;accessorMap.set(i,accessorMap.size);return true});
for(const mesh of doc.meshes)for(const p of mesh.primitives){for(const key in p.attributes)p.attributes[key]=accessorMap.get(p.attributes[key]);if(p.indices!==undefined)p.indices=accessorMap.get(p.indices);for(const t of p.targets??[])for(const key in t)t[key]=accessorMap.get(t[key]);}
for(const a of doc.animations??[])for(const s of a.samplers){s.input=accessorMap.get(s.input);s.output=accessorMap.get(s.output);}
const chunks=[],views=[];let offset=0;const sizes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const append=(bytes)=>{const id=views.length,padded=Buffer.alloc(Math.ceil(bytes.length/4)*4);bytes.copy(padded);views.push({buffer:0,byteOffset:offset,byteLength:bytes.length});chunks.push(padded);offset+=padded.length;return id};
const oldViews=doc.bufferViews;
for(const a of doc.accessors){const v=oldViews[a.bufferView];if(a.sparse)throw Error('Review strided or sparse accessor');const start=(v.byteOffset??0)+(a.byteOffset??0),length=a.count*sizes[a.componentType]*components[a.type];const packed=Buffer.alloc(length),element=sizes[a.componentType]*components[a.type];for(let i=0;i<a.count;i++)bin.copy(packed,i*element,start+i*(v.byteStride??element),start+i*(v.byteStride??element)+element);a.bufferView=append(packed);delete a.byteOffset;}
for(const image of doc.images){const v=oldViews[image.bufferView];image.bufferView=append(bin.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength));}
doc.bufferViews=views;doc.buffers=[{byteLength:offset}];
const json=Buffer.from(JSON.stringify(doc));const jp=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(jp);const head=Buffer.alloc(20);head.writeUInt32LE(0x46546c67);head.writeUInt32LE(2,4);head.writeUInt32LE(28+jp.length+offset,8);head.writeUInt32LE(jp.length,12);head.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(offset);bh.writeUInt32LE(0x004e4942,4);const out=Buffer.concat([head,jp,bh,...chunks]);await fs.writeFile('public/models/snail-classroom.glb',out);console.log(`${source.length} -> ${out.length} bytes; original morph targets, animation and texture preserved.`);
