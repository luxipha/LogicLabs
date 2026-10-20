import React from 'react';

/** A lightweight teaching model based on the supplied round vacuum reference.
 * Forward is +Z; the two sensor faces make its sensing direction visible.
 */
export const VacuumModel: React.FC = () => <group>
  <mesh position={[0, .10, 0]}><cylinderGeometry args={[.43, .43, .13, 48]}/><meshStandardMaterial color="#17242b" roughness={.7}/></mesh>
  <mesh position={[0, .055, 0]}><cylinderGeometry args={[.415, .40, .05, 48]}/><meshStandardMaterial color="#e1e8e8"/></mesh>
  <mesh position={[0, .205, 0]}><cylinderGeometry args={[.425, .43, .10, 48]}/><meshStandardMaterial color="#f5faf9" roughness={.45}/></mesh>
  <mesh position={[0, .265, 0]}><cylinderGeometry args={[.398, .40, .025, 48]}/><meshStandardMaterial color="#ffffff" roughness={.4}/></mesh>
  <mesh position={[0, .28, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.397, .009, 6, 48]}/><meshStandardMaterial color="#c3d1d2"/></mesh>
  <mesh position={[0, .282, -.12]}><boxGeometry args={[.65, .003, .007]}/><meshStandardMaterial color="#ccd8d9"/></mesh>
  <mesh position={[0, .285, .12]}><boxGeometry args={[.15, .012, .065]}/><meshStandardMaterial color="#7eafb3"/></mesh>
  {[-.115, .115].map(x => <group key={x} position={[x, .16, .412]} rotation={[Math.PI / 2, 0, 0]}>
    <mesh><cylinderGeometry args={[.065, .065, .045, 20]}/><meshStandardMaterial color="#9fb3bc" metalness={.5} roughness={.4}/></mesh>
    <mesh position={[0, -.025, 0]}><cylinderGeometry args={[.047, .047, .008, 16]}/><meshStandardMaterial color="#193c48"/></mesh>
  </group>)}
  {[-.32, .32].map(x => <mesh key={x} position={[x, .055, -.08]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.065, .065, .08, 16]}/><meshStandardMaterial color="#202d34"/></mesh>)}
  <group position={[.33, .045, .18]}>{[0, 2.1, 4.2].map(angle => <mesh key={angle} rotation={[0, angle, 0]} position={[Math.sin(angle) * .11, 0, Math.cos(angle) * .11]}><boxGeometry args={[.025, .012, .24]}/><meshStandardMaterial color="#8aa4a4"/></mesh>)}</group>
</group>;
