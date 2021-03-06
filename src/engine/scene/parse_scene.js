import Camera from "./data/camera"
import Lamp from "./data/lamp"
import Material from "./data/material"
import Mesh from "./data/mesh"
import Node from "./node"
import Scene from "./scene"
import { parseNumberAnimation } from "./../animation/number_animation"
import { parseBooleanAnimation } from "./../animation/boolean_animation"

export default fileParser => {
  const scene = new Scene([
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser),
    parseNumberAnimation(fileParser)
  ], parseNumberAnimation(fileParser))

  const numberOfMaterials = fileParser.uint16()
  const orderedMaterials = []
  while (orderedMaterials.length < numberOfMaterials) {
    orderedMaterials.push(new Material(
      scene,
      fileParser.utf8(),
      [
        parseNumberAnimation(fileParser),
        parseNumberAnimation(fileParser),
        parseNumberAnimation(fileParser)
      ],
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      parseBooleanAnimation(fileParser),
      parseBooleanAnimation(fileParser),
      parseBooleanAnimation(fileParser),
      parseBooleanAnimation(fileParser)
    ))
  }

  const numberOfMeshes = fileParser.uint16()
  const orderedMeshes = []
  while (orderedMeshes.length < numberOfMeshes) {
    const name = fileParser.utf8()
    const numberOfLocations = fileParser.uint16()
    const locations = fileParser.float32Array(numberOfLocations * 3)
    const mesh = new Mesh(scene, name, locations)
    let remainingMeshMaterials = fileParser.uint8()
    while (remainingMeshMaterials--) {
      mesh.addMaterial(
        orderedMaterials[fileParser.uint16()],
        fileParser.uint16Array(fileParser.uint16() * 3)
      )
    }
    orderedMeshes.push(mesh)
  }

  const numberOfLamps = fileParser.uint16()
  const orderedLamps = []
  while (orderedLamps.length < numberOfLamps) {
    orderedLamps.push(new Lamp(
      scene,
      fileParser.utf8(),
      [
        parseNumberAnimation(fileParser),
        parseNumberAnimation(fileParser),
        parseNumberAnimation(fileParser)
      ],
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      fileParser.uint16(),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser)
    ))
  }

  const numberOfCameras = fileParser.uint16()
  const orderedCameras = []
  while (orderedCameras.length < numberOfCameras) {
    orderedCameras.push(new Camera(
      scene,
      fileParser.utf8(),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser)
    ))
  }

  const orderedData = {
    meshes: orderedMeshes,
    lamps: orderedLamps,
    cameras: orderedCameras
  }

  const numberOfNodes = fileParser.uint16()
  const orderedNodes = []
  while (orderedNodes.length < numberOfNodes) {
    const name = fileParser.utf8()
    const type = fileParser.uint8()

    const parentId = fileParser.uint16()
    const parent = parentId == 65535 ? scene : orderedNodes[parentId]

    const translation = [
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser)
    ]

    const scale = [
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser)
    ]

    const rotation = [
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser),
      parseNumberAnimation(fileParser)
    ]

    const hide = parseBooleanAnimation(fileParser)

    let data = null
    switch (type) {
      case 1:
        data = orderedData.meshes[fileParser.uint16()]
        break
      case 2:
        data = orderedData.lamps[fileParser.uint16()]
        break
      case 3:
        data = orderedData.cameras[fileParser.uint16()]
        break
    }

    orderedNodes.push(new Node(parent, name, translation, rotation, scale, hide, data))
  }

  return scene
}