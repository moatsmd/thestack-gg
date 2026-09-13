import { BoxGeometry, BufferGeometry, DodecahedronGeometry, Float32BufferAttribute, IcosahedronGeometry, Matrix4, OctahedronGeometry, Quaternion, TetrahedronGeometry, Vector3 } from 'three'

export interface DieFace { center: Vector3; normal: Vector3; right: Vector3; up: Vector3; radius: number; vertices: Vector3[] }

export function createDieGeometry(sides: number): BufferGeometry {
  switch (sides) {
    case 4: return new TetrahedronGeometry(1.18)
    case 6: return new BoxGeometry(1.55, 1.55, 1.55)
    case 8: return new OctahedronGeometry(1.22)
    case 12: return new DodecahedronGeometry(1.18)
    case 20: return new IcosahedronGeometry(1.2)
    default: {
      // A pentagonal trapezohedron: ten coplanar kite faces, as on a real d10.
      const height = 1.22
      const c = Math.cos(Math.PI / 5)
      const ringHeight = height * (1 - c) / (1 + c)
      const ring = Array.from({ length: 10 }, (_, index) => new Vector3(Math.cos(index * Math.PI / 5), index % 2 === 0 ? ringHeight : -ringHeight, Math.sin(index * Math.PI / 5)))
      const positions: number[] = []
      for (let index = 0; index < 10; index++) {
        const pole = new Vector3(0, index % 2 === 0 ? height : -height, 0)
        const vertices = [pole, ring[index], ring[(index + 1) % 10], ring[(index + 2) % 10]]
        for (const triangle of [[0, 1, 2], [0, 2, 3]]) {
          const [a, b, d] = triangle.map((vertex) => vertices[vertex])
          const normal = b.clone().sub(a).cross(d.clone().sub(a))
          const ordered = normal.dot(a.clone().add(b).add(d)) > 0 ? [a, b, d] : [a, d, b]
          ordered.forEach((vertex) => positions.push(vertex.x, vertex.y, vertex.z))
        }
      }
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
      geometry.computeVertexNormals()
      return geometry
    }
  }
}

export function getDieFaces(geometry: BufferGeometry): DieFace[] {
  const expanded = geometry.index ? geometry.toNonIndexed() : geometry.clone()
  const positions = expanded.getAttribute('position')
  const groups: { normal: Vector3; vertices: Vector3[] }[] = []
  for (let index = 0; index < positions.count; index += 3) {
    const vertices = [0, 1, 2].map((offset) => new Vector3().fromBufferAttribute(positions, index + offset))
    const normal = vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).normalize()
    let group = groups.find((candidate) => candidate.normal.distanceTo(normal) < 0.0001)
    if (!group) { group = { normal, vertices: [] }; groups.push(group) }
    vertices.forEach((vertex) => { if (!group!.vertices.some((other) => other.distanceTo(vertex) < 0.0001)) group!.vertices.push(vertex) })
  }
  expanded.dispose()
  const faces = groups.map(({ normal, vertices }) => {
    const center = vertices.reduce((sum, point) => sum.add(point), new Vector3()).divideScalar(vertices.length)
    const right = vertices[0].clone().sub(center).normalize()
    const up = normal.clone().cross(right).normalize()
    vertices.sort((a, b) => Math.atan2(a.clone().sub(center).dot(up), a.clone().sub(center).dot(right)) - Math.atan2(b.clone().sub(center).dot(up), b.clone().sub(center).dot(right)))
    const radius = Math.min(...vertices.map((a, index) => {
      const edge = vertices[(index + 1) % vertices.length].clone().sub(a)
      return center.clone().sub(a).cross(edge).length() / edge.length()
    }))
    return { center, normal, right, up, radius, vertices }
  })
  if (faces.length === 4) return faces
  // Standard numbered dice place complementary values on opposite faces.
  const ordered: DieFace[] = new Array(faces.length)
  const remaining = [...faces]
  for (let index = 0; index < faces.length / 2; index++) {
    const face = remaining.shift()!
    const oppositeIndex = remaining.findIndex((other) => face.normal.dot(other.normal) < -0.9999)
    ordered[index] = face
    ordered[faces.length - index - 1] = remaining.splice(oppositeIndex, 1)[0]
  }
  return ordered
}

export function landingOrientation(faces: DieFace[], resultIndex: number): Quaternion {
  const face = faces[resultIndex % faces.length]
  if (faces.length === 4) {
    const bottom = faces[(resultIndex + 1) % 4]
    const resting = new Quaternion().setFromUnitVectors(bottom.normal, new Vector3(0, -1, 0))
    const direction = face.normal.clone().applyQuaternion(resting)
    return new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.atan2(direction.x, direction.z)).multiply(resting)
  }
  const local = new Matrix4().makeBasis(face.right, face.up, face.normal)
  const target = new Matrix4().makeBasis(new Vector3(1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, 1, 0))
  return new Quaternion().setFromRotationMatrix(target.multiply(local.invert()))
}
