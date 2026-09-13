import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Vector3 } from 'three'
import { createDieGeometry, getDieFaces, landingOrientation } from '../lib/dice-geometry.ts'

for (const sides of [4, 6, 8, 10, 12, 20]) {
  test(`d${sides} has ${sides} real faces and lands each value correctly`, () => {
    const geometry = createDieGeometry(sides)
    const faces = getDieFaces(geometry)
    assert.equal(faces.length, sides)
    if (sides !== 4) faces.forEach((face, index) => assert.ok(face.normal.dot(faces[sides - index - 1].normal) < -0.9999, 'opposite faces use conventional complementary numbering'))
    faces.forEach((face, index) => {
      assert.ok(face.normal.dot(face.center) > 0)
      const orientation = landingOrientation(faces, index)
      if (sides !== 4) assert.ok(face.normal.clone().applyQuaternion(orientation).distanceTo(new Vector3(0, 1, 0)) < 0.0001)
      else assert.ok(Math.min(...faces.map((other) => other.normal.clone().applyQuaternion(orientation).y)) < -0.9999)
    })
    geometry.dispose()
  })
}
