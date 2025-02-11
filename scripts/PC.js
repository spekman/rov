class PC {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
  }

 

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("pc");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <iframe src="/xp/index.html" style="height: 690px; width: 1280px;">
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
    this.keyboardMenu.init(this.element)
    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    })
  }
}