class Guide {

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("guide");
        this.element.classList.add("overlayMenu");
        this.element.innerHTML = (`
        <p>I'll do something I promise</p>
        `)
    }

    close() {
        this.esc?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
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