import Disposable from "./../disposable"
import sceneCache from "./scene_cache"

export default class MetaScene extends Disposable {
  constructor(mainScenePath) {
    super()
    this.sceneInstances = []
    this.mainSceneInstance = this.createSceneInstance(mainScenePath)
  }

  createSceneInstance(path) {
    this.checkNotDisposed()
    const sceneInstance = new SceneInstance(this, path)
    this.sceneInstances.push(sceneInstance)
    return sceneInstance
  }

  performDisposal() {
    while (this.sceneInstances.length) this.sceneInstances[0].dispose()
  }
}

class SceneInstance extends Disposable {
  constructor(metaScene, path) {
    super()
    this.metaScene = metaScene
    this.dropCurrentInstance()
    this.sceneHandle = sceneCache.createHandle(path, scene => {
      if (scene == null) {
        this.dropCurrentInstance()
        return
      }

      this.dataInstances = {}
      for (const name in scene.data) scene.data[name].createInstance(this)

      this.nodeInstances = {}
      for (const name in scene.nodes) new NodeInstance(this, scene.nodes[name])
    })
  }

  setFrame(frame) {
    this.checkNotDisposed()
    for (const name in this.data) this.data[name].setFrame(frame)
  }

  dropCurrentInstance() {
    if (this.dataInstances) {
      for (const name in this.dataInstances) this.dataInstances[name].dispose()
      this.dataInstances = null
    }

    this.nodeInstances = null
  }

  performDisposal() {
    this.dropCurrentInstance()
    this.sceneHandle.dispose()
    this.metaScene.sceneInstances.splice(this.metaScene.sceneInstances.indexOf(this))
  }
}

class NodeInstance {
  constructor(parent, node) {
    this.parent = parent
    this.node = node
    this.nodeInstances = {}
    for (const name in node.nodes) new NodeInstance(this, node.nodes[name])
    parent.nodeInstances[node.name] = this
  }
}