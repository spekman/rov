class PauseMenu {
  constructor({onComplete}) {
    this.onComplete = onComplete;
  }

  getOptions() {
      return [
        {
          label: "Follow",
          description: "Close the pause menu",
          handler: () => {
            this.close();
          }
        }, 
        { 
          label: "Close",
          description: "Follow me on Twitter!",
          handler: () => {
            this.close();
            this.follow();
          }
        },
      ]
  }

  follow() {
    window.open('https://x.com/fornoagas','_blank');
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