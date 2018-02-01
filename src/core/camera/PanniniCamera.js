/**
 * pannini广角摄像机
 *
 * @author Y3G
 */

import check from 'param-check'
import undisposed from 'litchy/lib/decorator/undisposed'
import Camera from './Camera'
import OrthoCamera from './OrthoCamera'
import Polygon from '../geometry/Polygon'
import projectionType from './projectionType'
import clamp from '../../utils/clamp'

const CAMERA_WITH = 4
const CAMERA_HEGHT = 4

const geoVertexes = (function () {
  var z2 = CAMERA_WITH / 2
  var y2 = CAMERA_HEGHT / 2
  return (new Polygon([
    [1, y2, z2],
    [1, y2, -z2],
    [1, -y2, -z2],
    [1, -y2, z2]
  ])).mesh()
})()

export default class PlanetCamera extends Camera {
  // 配合使用的顶点集
  @undisposed
  get geoVertexes () {
    return geoVertexes
  }

  // point of view 纬度，单位为度
  @undisposed
  get povLatitude () {
    return this.povLatitude_
  }

  @undisposed
  set povLatitude (lat) {
    check(lat, 'lat').isNumber()
    this.povLatitude_ = lat
  }

  // point of view 经度
  @undisposed
  get povLongitude () {
    return this.povLongitude_
  }

  @undisposed
  set povLongitude (long) {
    check(long, 'long').isNumber()
    this.povLongitude_ = long % 25
  }

  // 放大系数
  @undisposed
  get zoomValue() {
    return this.zoomValue_
  }

  @undisposed
  set zoomValue(value) {
    this.zoomValue_ = clamp(value, 0.1, 2)
  }

  constructor ({ povLatitude = 0, povLongitude = 0, zoom = 1, debug = false }) {
    super(projectionType.PROJECTION_TYPE_pannini, debug)

    check(povLatitude, 'povLatitude').isNumber()
    check(povLongitude, 'povLongitude').isNumber()
    check(zoom, 'zoom').isNumber()

    const m = Math.max(CAMERA_WITH / 2, CAMERA_HEGHT / 2)

    this.ortho_ = new OrthoCamera({
      left: -m,
      right: m,
      top: m,
      bottom: -m,
      povLongitude: 0,
      povLatitude: 0
    })

    this.povLatitude = povLatitude
    this.povLongitude = povLongitude
    this.zoomValue = 1
  }

  @undisposed
  rotate (angleX, angleY) {
    check(angleX, 'angleX').isNumber()
    check(angleY, 'angleY').isNumber()

    this.povLongitude += angleX
    this.povLatitude += angleY
  }

  @undisposed
  zoom (delta) {
    this.zoomValue += delta / 20
  }

  @undisposed
  status () {
    const ret = this.ortho_.status()

    ret.CamProjType = {
      type: 'uniform1i',
      value: this.projection
    }

    ret.CamGeoWidth = {
      type: 'uniform1f',
      value: CAMERA_WITH
    }

    ret.CamGeoHeight = {
      type: 'uniform1f',
      value: CAMERA_HEGHT
    }

    ret.CamPOVLongitude = {
      type: 'uniform1f',
      value: this.povLongitude
    }

    ret.CamPOVLatitude = {
      type: 'uniform1f',
      value: this.povLatitude
    }

    ret.CamZoom = {
      type: 'uniform1f',
      value: this.zoomValue
    }

    return ret
  }
}
