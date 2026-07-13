// EventRunner — plays an encounter's array of "steps" in order.
// The heart of the data-driven design.
export class EventRunner {
  constructor(scene, dialogue, album, letter, audio) {
    this.scene = scene;
    this.dialogue = dialogue;
    this.album = album;
    this.letter = letter;
    this.audio = audio;
    this.running = false;
  }

  async play(encounter) {
    if (this.running) return;
    this.running = true;
    this.scene.setInputLocked(true);

    for (const step of encounter.steps) {
      await this._do(step);
    }

    this.dialogue.hide();
    this.scene.setInputLocked(false);
    this.running = false;
    if (encounter.id) this.scene.markComplete(encounter.id);
  }

  async _do(step) {
    if (step.say != null) {
      await this.dialogue.show(step.say, step.who, step.name);
    } else if (step.memory) {
      this.dialogue.hide();
      await this.album.revealMemory(step.memory);
    } else if (step.verb) {
      await this.scene.awaitVerb(step.verb, step.label);
    } else if (step.fireworks) {
      await this.scene.fireworks();
    } else if (step.confetti) {
      this.scene.confetti();
    } else if (step.gradWalk) {
      await this.scene.gradWalk();
    } else if (step.cutscene) {
      await this.scene.startCutscene(step.cutscene);
    } else if (step.endCutscene) {
      await this.scene.endCutscene();
    } else if (step.gate) {
      await this.scene.openGate(step.gate);
    } else if (step.letter) {
      this.dialogue.hide();
      await this.letter.open();
    } else if (step.end) {
      await this.scene.endScreen();
    } else if (step.music) {
      this.audio?.playMusic(step.music);
    } else if (step.sfx) {
      this.audio?.sfx(step.sfx);
    } else if (step.wait) {
      await wait(step.wait);
    }
  }
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
