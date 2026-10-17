"""Create a classroom derivative; preserve geometry, animation and attribution."""
import json, struct, subprocess, tempfile
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = root / 'public/models/robotic_arm.glb'
raw = source.read_bytes()
json_size = struct.unpack_from('<I', raw, 12)[0]
doc = json.loads(raw[20:20 + json_size])
bin_offset = 20 + json_size
bin_size = struct.unpack_from('<I', raw, bin_offset)[0]
binary = raw[bin_offset + 8:bin_offset + 8 + bin_size]
# Normal mapping can derive tangent space in the shader. Drop unused tangent data.
for mesh in doc['meshes']:
    for primitive in mesh['primitives']:
        primitive['attributes'].pop('TANGENT', None)
used = set()
for mesh in doc['meshes']:
    for primitive in mesh['primitives']:
        used.update(primitive['attributes'].values())
        if 'indices' in primitive: used.add(primitive['indices'])
for animation in doc.get('animations', []):
    for sampler in animation['samplers']: used.update([sampler['input'], sampler['output']])
for skin in doc.get('skins', []):
    if 'inverseBindMatrices' in skin: used.add(skin['inverseBindMatrices'])
accessor_map = {old: new for new, old in enumerate(sorted(used))}
doc['accessors'] = [doc['accessors'][i] for i in sorted(used)]
for mesh in doc['meshes']:
    for primitive in mesh['primitives']:
        primitive['attributes'] = {key: accessor_map[value] for key, value in primitive['attributes'].items()}
        if 'indices' in primitive: primitive['indices'] = accessor_map[primitive['indices']]
for animation in doc.get('animations', []):
    for sampler in animation['samplers']:
        for key in ['input', 'output']: sampler[key] = accessor_map[sampler[key]]
for skin in doc.get('skins', []):
    if 'inverseBindMatrices' in skin: skin['inverseBindMatrices'] = accessor_map[skin['inverseBindMatrices']]
views = {a['bufferView'] for a in doc['accessors'] if 'bufferView' in a}
views.update(image['bufferView'] for image in doc.get('images', []))
image_by_view = {image['bufferView']: image for image in doc.get('images', [])}
packed = bytearray()
new_views = []
view_map = {}
for old in sorted(views):
    view = dict(doc['bufferViews'][old])
    start = view.get('byteOffset', 0)
    payload = binary[start:start + view['byteLength']]
    if old in image_by_view:
        suffix = '.jpg' if image_by_view[old]['mimeType'] == 'image/jpeg' else '.png'
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / ('input' + suffix)
            output_path = Path(directory) / ('output' + suffix)
            input_path.write_bytes(payload)
            subprocess.run(['sips', '-Z', '1024', str(input_path), '--out', str(output_path)], check=True, capture_output=True)
            resized = output_path.read_bytes()
            if len(resized) < len(payload): payload = resized
    packed.extend(b'\0' * (-len(packed) % 4))
    view.update(buffer=0, byteOffset=len(packed), byteLength=len(payload))
    view_map[old] = len(new_views)
    new_views.append(view)
    packed.extend(payload)
for accessor in doc['accessors']:
    if 'bufferView' in accessor: accessor['bufferView'] = view_map[accessor['bufferView']]
for image in doc.get('images', []): image['bufferView'] = view_map[image['bufferView']]
doc['bufferViews'] = new_views
doc['buffers'] = [{'byteLength': len(packed)}]
header = json.dumps(doc, separators=(',', ':')).encode()
header += b' ' * (-len(header) % 4)
packed.extend(b'\0' * (-len(packed) % 4))
result = struct.pack('<III', 0x46546c67, 2, 12 + 8 + len(header) + 8 + len(packed)) + struct.pack('<II', len(header), 0x4e4f534a) + header + struct.pack('<II', len(packed), 0x004e4942) + packed
out = root / 'public/models/robotic-arm-classroom.glb'
out.write_bytes(result)
print(f'{source.name}: {len(raw):,} bytes -> {out.name}: {len(result):,} bytes')
