// this script is under the MIT license (https://max.nekoweb.org/resources/license.txt)
class tv {
    constructor({ onComplete }) {
        this.onComplete = onComplete;
    }

    async createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("tv");
        this.element.classList.add("overlayMenu");

        this.element.innerHTML = (`

       <iframe src="https://nekoweb.org/frame/follow" frameborder="0" width="170" height="28"></iframe>
       <img src="/images/button.jpg">
       <textarea readonly>"<a href="https://rov.nekoweb.org/"><img alt="ROV" src="https://rov.nekoweb.org/images/button.jpg"></a>"</textarea>
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