// three.js r185 removed support for KHR_materials_pbrSpecularGlossiness, which
// the bee.glb requires. This plugin converts the specular-glossiness workflow
// to a standard MeshStandardMaterial (diffuse map -> color map) so the model
// renders with its textures.
import {Color, MeshStandardMaterial, SRGBColorSpace} from 'three';
import type {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const NAME = 'KHR_materials_pbrSpecularGlossiness';

type SpecGlossExtension = {
  diffuseFactor?: number[];
  diffuseTexture?: {index: number};
  glossinessFactor?: number;
};

type ParserLike = {
  json: {materials: Array<Record<string, unknown> | undefined>};
  assignTexture?: (
    params: Record<string, unknown>,
    key: string,
    tex: {index: number},
    space?: string | number,
  ) => Promise<unknown>;
};

export const registerSpecularGlossiness = (loader: GLTFLoader) => {
  loader.register((parser) => {
    const p = parser as unknown as ParserLike;

    const getMaterialType = () => MeshStandardMaterial;

    const extendMaterialParams = async (
      materialIndex: number,
      materialParams: Record<string, unknown>,
    ) => {
      try {
        const materialDef = p.json.materials[materialIndex];
        const extensions = materialDef?.['extensions'] as
          | {[NAME]?: SpecGlossExtension}
          | undefined;
        const sg = extensions?.[NAME];
        if (!sg) {
          return;
        }

        const diffuseFactor = sg.diffuseFactor ?? [1, 1, 1, 1];
        (materialParams as {color: Color}).color = new Color(
          diffuseFactor[0],
          diffuseFactor[1],
          diffuseFactor[2],
        );
        (materialParams as {opacity: number}).opacity = diffuseFactor[3] ?? 1;
        (materialParams as {transparent: boolean}).transparent =
          (diffuseFactor[3] ?? 1) < 1;
        (materialParams as {metalness: number}).metalness = 0.0;
        (materialParams as {roughness: number}).roughness =
          1 - (sg.glossinessFactor ?? 1);

        if (sg.diffuseTexture && p.assignTexture) {
          await p.assignTexture(materialParams, 'map', sg.diffuseTexture, SRGBColorSpace);
        }
      } catch {
        // Never block material loading because of a missing texture.
      }
    };

    return {name: NAME, getMaterialType, extendMaterialParams};
  });
};
