import bpy
import math
from pathlib import Path

ROOT = Path('/Users/tiagolinares/Developer/cartise')
# A new scene preserves anything already open in Blender.
scene = bpy.data.scenes.new('Cartise Tablet')
bpy.context.window.scene = scene
scene.unit_settings.system = 'METRIC'

def material(name, color, metal=0, roughness=.3):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Roughness'].default_value = roughness
    return m

body = material('Graphite satin alloy', (.085, .093, .1), .65, .32)
trim = material('Polished graphite edge', (.22, .24, .25), .85, .22)
black = material('Black glass bezel', (.006, .008, .01), .18, .16)
seam = material('Dark seam', (.012, .015, .018), .2, .38)
screenmat = material('ScreenMedia', (0, .37, .29), 0, .8)

def outline(w, h, r, segments=12):
    pts = []
    for cx, cz, start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(segments+1):
            a = math.radians(start+i*90/segments)
            pts.append((cx+r*math.cos(a), cz+r*math.sin(a)))
    return pts

def slab(name, w, h, depth, radius, location, mat, bevel=.002):
    pts = outline(w,h,radius)
    n = len(pts)
    vertices = [(x,y,z) for y in [-depth/2,depth/2] for x,z in pts]
    faces = [tuple(range(n)), tuple(reversed(range(n,2*n)))]
    faces += [(i,(i+n),((i+1)%n+n),(i+1)%n) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft manufactured edges','BEVEL')
        mod.width = bevel
        mod.segments = 3
        mod2 = obj.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    for p in mesh.polygons:
        p.use_smooth = len(p.vertices) == 4
    return obj

# Proportions traced from the supplied photograph; depth is an approximation.
slab('TabletBody',2.48,1.66,.073,.066,(0,0,0),body,.007)
slab('RearPanel',2.455,1.635,.011,.064,(0,.036,0),body,.004)
slab('FrontRim',2.484,1.664,.016,.068,(0,-.036,0),trim,.003)
slab('GlassSeal',2.469,1.649,.01,.065,(0,-.046,0),seam,.002)
slab('FrontGlass',2.453,1.633,.006,.06,(0,-.052,0),black,.001)

# Explicit UVs make Screen independently replaceable with any image/video texture.
w,h = 2.342,1.505
pts = outline(w,h,.018)
mesh = bpy.data.meshes.new('Screen')
mesh.from_pydata([(0,-.056,0)]+[(x,-.056,z) for x,z in pts],[],[(0,i+1,(i+1)%len(pts)+1) for i in range(len(pts))])
mesh.update()
uv = mesh.uv_layers.new(name='MediaUV')
for poly in mesh.polygons:
    for li in poly.loop_indices:
        v=mesh.vertices[mesh.loops[li].vertex_index].co
        uv.data[li].uv=(v.x/w+.5,v.z/h+.5)
screen=bpy.data.objects.new('Screen',mesh)
scene.collection.objects.link(screen)
screen.data.materials.append(screenmat)
screen['mediaAspectRatio']=w/h
screen['purpose']='Replace material with Three.js MeshBasicMaterial and Texture or VideoTexture. flipY=false.'

slab('VolumeButton',.012,.19,.035,.005,(-1.245,0,.5),seam,.001)
slab('PowerButton',.012,.078,.032,.005,(-1.245,0,.28),seam,.001)

bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active=screen
ROOT.joinpath('public/models').mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/cartise-tablet.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_yup=True,export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/blender/cartise-tablet.blend'),copy=True)
result={'objects':len(scene.objects),'glb':str(ROOT/'public/models/cartise-tablet.glb')}
