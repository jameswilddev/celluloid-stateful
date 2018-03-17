import { parseNumberAnimation } from "./../animation/number_animation"
import SceneData from "./scene_data"

export class Camera extends SceneData {
  constructor(scene, name, clipStart, clipEnd, lens) {
    super(scene, name)
    this.clipStart = clipStart
    this.clipEnd = clipEnd
    this.lens = lens
  }

  performDisposal() { }
}