class TitleScreen {
  constructor() {

  }

  getOptions(resolve) {
    return [
      { 
        label: "ENTER",
        description: "v0.1",
        handler: () => {
          this.close();
          resolve();
        }
      },
    ].filter(v => v);
  }


  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("TitleScreen");
    this.element.innerHTML = (`
      <img class="TitleScreen_logo" src="/images/logo.png" alt="ROV" />
    `)

  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
  }
  
  init(container) {
    return new Promise(resolve => {
      this.createElement();
      container.appendChild(this.element);
      this.keyboardMenu = new KeyboardMenu();
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions(resolve))
    })
  }

}