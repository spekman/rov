class PauseMenu {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
  }

  getOptions() {
    return [
      {
        label: "Guide",
        description: "Learn more about the game!",
        handler: () => {
          this.guide();
        }
      },
      {
        label: "Close",
        description: "Close the pause menu",
        handler: () => {
          this.close();
        }
      },
    ]
  }

  guide() {
    const menu = new Guide()
    menu.init(document.querySelector(".game-container"))
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <h2>Pause Menu</h2>
    `)
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    })
  }

}