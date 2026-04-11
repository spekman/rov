class Album {
  constructor({ onComplete }) {
    this.onComplete = onComplete;
  }

  createElement() {

    this.element = document.createElement("div");
    this.element.classList.add("aalbum");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`  
      
    <div id="hands" style="top: 120%; opacity: 0">
        <div id="left-hand" style="filter:grayscale(1)">
            <div><span class="key">Q</span></div>
            <div><img src="./images/album/hand.png" alt="hand"></div>
        </div>
        <div id="right-hand">
            <div><span class="key">E</span></div>
            <div><img src="./images/album/hand.png" alt="hand"></div>
        </div>
    </div>
    <div id="photo-hands" style="top: 120%; opacity: 0">
        <div id="photo-left-hand" style="filter:grayscale(1)">
            <div><img src="./images/album/hand.png" alt="hand"></div>
        </div>
        <div id="photo-right-hand">
            <div><img src="./images/album/hand.png" alt="hand"></div>
        </div>
    </div>
    <div id="album-cover"></div>
    <div id="album" style="top: 120%; opacity: 0">
        <div id="selector-hand" style="margin-left: 10px; margin-top: 50px;">
            <img src="./images/album/hand.png" alt="hand">
        </div>
        <div id="sides">
            <div id="left">
                <div id="left-content"></div>
            </div>
            <div id="right">
                <div id="right-content"></div>
            </div>
        </div>
        <div id="low-sides">
            <div id="left">
                <div id="low-left-content"></div>
            </div>
            <div id="right">
                <div id="low-right-content"></div>
            </div>
        </div>
    </div>
    <div id="photo-div">
        <img src="" alt="" id="photo">
    </div>
    <div id="next-photo-div">
        <img src="" alt="" id="next-photo">
    </div>
    <div id="text-box" hidden>
        <span id="text"></span>
    </div>
    
    <div id="no-desc" hidden>No description.</div>
    <div id="photo-date"></div>
        `)
  }

  close() {
    this.esc?.unbind();
    this.home?.unbind();
    this.enter?.unbind();
    this.up?.unbind();
    this.down?.unbind();
    this.left?.unbind();
    this.right?.unbind();
    this.q?.unbind();
    this.e?.unbind();

    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
    end = false;
    gettingPhotos = false;
  }


  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      special: true,
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element)
    container.appendChild(this.element);

    utils.wait(200);

    this.esc = new KeyPressListener("Escape", () => {

      if (page === "photo") {
        text.innerHTML = photos[albumPage * 6 + selectedImage].desc;
        hideTextBox();

        if (!textBox.hidden) {
          hideTextBox();
          text.innerHTML = "";
          return;
        }
        let photoIndex = photos.findIndex(
          (p) => photos[albumPage * 6 + selectedImage].name === p.name
        );
        if (photoIndex === -1) {
          photoIndex = 0;
        }
        albumPage = Math.floor(photoIndex / 6);
        selectedImage = photoIndex % 6;
        renderAlbum();
        moveHandPointer(selectedImage);
        showAlbum();
        hidePhoto();
        hidePhotoDate();
        page = "album";
        hidePhotoHands();
        updateHandColor();
      } else this.close();
    });

    this.home = new KeyPressListener("Home", () => {
      albumPage = 0;
      selectedImage = 0;
      moveHandPointer(selectedImage);
      renderAlbum();
      updateHandColor();
    });

    this.end = new KeyPressListener("End", async () => {
      while (!end) {
        await getPhotos();
      }
      albumPage = Math.floor((photos.length - 1) / 6);
      selectedImage = photos.length % 6;
      moveHandPointer(selectedImage);
      renderAlbum();
      updateHandColor();
    });

    this.enter = new KeyPressListener("Enter", async () => {
      if (page === "press_start") {
        showAlbum();
        page = "album";
      }
      else if (page === "album") {
        if (photos[albumPage * 6 + selectedImage]) {
          const url = `./images/album/pics/${photos[albumPage * 6 + selectedImage].name
            }?1`;
          photo.onload = () => {
            hideAlbum();
            showPhoto();
            page = "photo";
            showPhotoHands();
            setPhotoDate(
              photos[albumPage * 6 + selectedImage].date
            );
            photo.alt = `${photos[albumPage * 6 + selectedImage].date}: 
              ${photos[albumPage * 6 + selectedImage].desc
              }`;
            photo.title = `${photos[albumPage * 6 + selectedImage].date}: 
            ${photos[albumPage * 6 + selectedImage].desc
              }`;
            if (!photos[albumPage * 6 + selectedImage + 1]) {
              rightPhotoHand.style.filter = "grayscale(1)";
            } else {
              rightPhotoHand.style.filter = "grayscale(0)";
            }
            if (albumPage === 0 && selectedImage === 0) {
              leftPhotoHand.style.filter = "grayscale(1)";
            } else {
              leftPhotoHand.style.filter = "grayscale(0)";
            }
            setTimeout(showPhotoDate, 400);
            photo.onload = null;
          };
          setPhoto(url);
          // preload next and previous photos
          if (photos[albumPage * 6 + selectedImage + 1]) {
            preloadImage(
              `./images/album/pics/${photos[albumPage * 6 + selectedImage + 1].name}?1`
            );
          }
          if (photos[albumPage * 6 + selectedImage - 1]) {
            preloadImage(
              `./images/album/pics/${photos[albumPage * 6 + selectedImage - 1].name}?1`
            );
          }
        }
      }
      else if (page === "photo") {
        if (textBox.hidden) {
          if (!photos[albumPage * 6 + selectedImage].desc) {
            document.getElementById("no-desc").hidden = false;
            setTimeout(() => {
              document.getElementById("no-desc").hidden = true;
            }, 750);
            return;
          }
          showTextBox();
          hidePhotoDate();
          writeText(photos[albumPage * 6 + selectedImage].desc);
        } else {
          hideTextBox();
          showPhotoDate();
          text.innerHTML = "";
        }
      }
    });

    this.q = new KeyPressListener("KeyQ", () => {
      if (page === "album") {
        prevPage();
      }
    });

    this.e = new KeyPressListener("KeyE", () => {
      if (page === "album") {
        nextPage();
      }
    });

    this.up = new KeyPressListener("ArrowUp", () => {
      if (page === "album") {
        if (selectedImage % 3 !== 0) {
          selectedImage--;
          moveHandPointer(selectedImage);
        }
      }
    });

    this.down = new KeyPressListener("ArrowDown", () => {
      if (page === "album") {
        if (selectedImage % 3 !== 2) {
          selectedImage++;
          moveHandPointer(selectedImage);
        }
      }
    });

    this.left = new KeyPressListener("ArrowLeft", () => {
      if (page === "album") {
        if (selectedImage >= 3) {
          selectedImage -= 3;
          moveHandPointer(selectedImage);
        } else {
          prevPage();
        }
      }
      else if (page === "photo") {
        let changed = false;
        if (!animation) {
          if (photos[albumPage * 6 + selectedImage - 1]) {
            selectedImage--;
            if (!photos[albumPage * 6 + selectedImage - 1]) {
              leftPhotoHand.style.filter = "grayscale(1)";
            } else {
              leftPhotoHand.style.filter = "grayscale(0)";
            }
            if (albumPage * 6 + selectedImage + 1 >= photos.length) {
              rightPhotoHand.style.filter = "grayscale(1)";
            } else {
              rightPhotoHand.style.filter = "grayscale(0)";
            }
            changed = true;
          }
        }
        checkChange();
      }
    });

    this.right = new KeyPressListener("ArrowRight", () => {
      if (page === "album") {
        if (selectedImage < 3) {
          selectedImage += 3;
          moveHandPointer(selectedImage);
        } else {
          nextPage();
        }
      }
      else if (page === "photo") {
        if (!animation) {
          if (photos[albumPage * 6 + selectedImage + 1]) {
            selectedImage++;
            if (!photos[albumPage * 6 + selectedImage + 1]) {
              rightPhotoHand.style.filter = "grayscale(1)";
            } else {
              rightPhotoHand.style.filter = "grayscale(0)";
            }
            if (albumPage === 0 && selectedImage === 0) {
              leftPhotoHand.style.filter = "grayscale(1)";
            } else {
              leftPhotoHand.style.filter = "grayscale(0)";
            }
            changed = true;
          }
        }
        checkChange();
      }
    });

    const album = document.getElementById("album");
    const photoDiv = document.getElementById("photo-div");
    const photo = document.getElementById("photo");
    const textBox = document.getElementById("text-box");
    const text = document.getElementById("text");
    const left = document.getElementById("left");
    const right = document.getElementById("right");
    const hands = document.getElementById("hands");
    const leftHand = document.getElementById("left-hand");
    const rightHand = document.getElementById("right-hand");
    const selectorHand = document.getElementById("selector-hand");
    const photoHands = document.getElementById("photo-hands");
    const leftPhotoHand = document.getElementById("photo-left-hand");
    const rightPhotoHand = document.getElementById("photo-right-hand");
    const nextPhoto = document.getElementById("next-photo");
    const nextPhotoDiv = document.getElementById("next-photo-div");
    const photoDate = document.getElementById("photo-date");
    let albumPage = 0;
    let page = "press_start";

    let selectedImage = 0;
    function moveHandPointer(imageIndex) {
      if (imageIndex < 3) {
        selectorHand.style.marginLeft = "10px";
      } else {
        selectorHand.style.marginLeft = "230px";
      }
      if (imageIndex === 1 || imageIndex === 4) {
        selectorHand.style.marginLeft =
          parseInt(selectorHand.style.marginLeft) + 100 + "px";
      }
      selectorHand.style.marginTop = `${(imageIndex % 3) * 100 + 50}px`;
    }
    document.addEventListener("keydown", async (e) => {
      if (text.contentEditable !== "true") {
        if (page === "album") {
          if (!photos[albumPage * 6 + selectedImage]) {
            while (selectedImage > 0 && !photos[albumPage * 6 + selectedImage]) {
              selectedImage--;
            }
            moveHandPointer(selectedImage);
          }

        }
      }
    });

    function checkChange() {
      if (changed) {
        if (!textBox.hidden) {
          hideTextBox();
          showPhotoDate();
          text.innerHTML = "";
        }
        // play animation
        animation = true;

        let photoIndex = photos.findIndex(
          (p) => photos[albumPage * 6 + selectedImage].name === p.name
        );
        if (photoIndex === -1) {
          photoIndex = 0;
        }
        albumPage = Math.floor(photoIndex / 6);
        selectedImage = photoIndex % 6;
        sessionStorage.setItem("albumPage", albumPage);

        photoDiv.style.transition = "0.6s";
        setTimeout(() => {
          photoDiv.style.opacity = "0";
          nextPhotoDiv.style.opacity = "1";
          nextPhotoDiv.style.left = "50%";
          const url = `./images/album/pics/${photos[albumPage * 6 + selectedImage].name
            }?1`;
          nextPhoto.src = url;
          setPhotoDate(
            photos[albumPage * 6 + selectedImage].date);
          photo.alt = `${photos[albumPage * 6 + selectedImage].date}: 
          ${photos[albumPage * 6 + selectedImage].desc
            }`;
          photo.title = `${photos[albumPage * 6 + selectedImage].date}: 
            ${photos[albumPage * 6 + selectedImage].desc}`;
          setTimeout(() => {
            photoDiv.style.transition = "0s";
            nextPhotoDiv.style.transition = "0s";
            setTimeout(() => {
              nextPhotoDiv.style.left = "55%";
              nextPhotoDiv.style.opacity = "0";
              photoDiv.style.opacity = "1";
              setTimeout(() => {
                photoDiv.style.transition = "";
                nextPhotoDiv.style.transition = "";
                animation = false;
              }, 20);
            }, 20);
            setPhoto(url);
          }, 400);
        }, 20);
        // preload next and previous photos
        if (photos[albumPage * 6 + selectedImage + 1]) {
          const img = new Image();
          img.src = `./images/album/pics/${photos[albumPage * 6 + selectedImage + 1].name}?1`;
        }
        if (photos[albumPage * 6 + selectedImage + 2]) {
          const img = new Image();
          img.src = `./images/album/pics/${photos[albumPage * 6 + selectedImage + 2].name}?1`;
        }
        if (photos[albumPage * 6 + selectedImage - 1]) {
          const img = new Image();
          img.src = `./images/album/pics//${photos[albumPage * 6 + selectedImage - 1].name
            }?1`;
        }
        if (photos[albumPage * 6 + selectedImage - 2]) {
          const img = new Image();
          img.src = `./images/album/pics/${photos[albumPage * 6 + selectedImage - 2].name
            }?1`;
        }
      }
    }

    function writeText(txt) {
      text.innerHTML = "";
      let i = 0;
      let pauseUntil = 0;
      let int = setInterval(() => {
        if (Date.now() < pauseUntil) {
          return;
        }
        if (textBox.hidden) {
          clearInterval(int);
          return;
        }

        if (i >= txt.length) {
          clearInterval(int);
          return;
        }
        if (txt[i] === "\n") {
          text.innerHTML += "<br>";
          pauseUntil = Date.now() + 250;
        } else {
          if (txt[i] === "." || txt[i] === "?" || txt[i] === "!") {
            pauseUntil = Date.now() + 200;
          }
          if (txt[i] === ",") {
            pauseUntil = Date.now() + 75;
          }
          text.innerHTML += txt[i];
        }
        i++;
      }, 20);
    }

    var photos = await getPhotos();

    async function getPhotos() {
      if (gettingPhotos) {
        return [];
      }
      if (end) {
        return [];
      }
      gettingPhotos = true;

      const images = await fetch("./images/album/pics.json").then((res) =>
        res.json()
      );

      if (images.length < 200) {
        end = true;
      }

      return images;
    }


    function renderPhoto(photo, i) {
      const div = document.createElement("div");
      div.className = `photo-side ${i % 2 == 0 ? "photo-side-left" : "photo-side-right"
        }`;
      div.innerHTML = /*html*/ `
              <div>
                  <div class="thumb-div" data-id="${photo.name}">
                      <img class="thumb" src="./images/album/pics/${photo.name}" 
                        alt="${photo.date}: ${photo.desc}" 
                        title="${photo.date}: ${photo.desc}">
                  </div>
              </div>
              <div>
                  <span class="thumb-text" style="transform:rotate(${(Math.random(2) % 7) - 3.2
        }deg)">
                      ${photo.desc}${photo.desc.length > 0 ? "<br>" : ""
        }
                      ${photo.date}
                  </span>
              </div>
          `;
      return div;
    }

    function renderAlbum() {
      const sides = [
        document.getElementById("left-content"),
        document.getElementById("right-content"),
        document.getElementById("low-left-content"),
        document.getElementById("low-right-content"),
      ];

      sides.forEach((side) => {
        side.innerHTML = "";
      });

      // 6 photos per page
      let index = albumPage * 6;
      let leftSideCount = 0,
        rightSideCount = 0;
      for (let i = index; i < index + 6; i++) {
        const side = i < index + 3;
        const photo = photos[i];
        if (!photo) {
          break;
        }
        if (side) {
          leftSideCount++;
        } else {
          rightSideCount++;
        }

        sides[side ? 0 : 1].appendChild(renderPhoto(photo, i + (side ? 0 : 1)));
      }

      if (leftSideCount === 3) {
        sides[0].style.justifyContent = "space-around";
        sides[0].style.marginTop = "0px";
      } else {
        sides[0].style.justifyContent = "flex-start";
        sides[0].style.marginTop = "10px";
      }
      if (rightSideCount === 3) {
        sides[1].style.justifyContent = "space-around";
        sides[1].style.marginTop = "0px";
      } else {
        sides[1].style.justifyContent = "flex-start";
        sides[1].style.marginTop = "10px";
      }

      let lowLeftCount = 0,
        lowRightCount = 0;
      // low right side is next page
      const lowRight = sides[3];
      for (let i = index + 6 + 3; i < index + 6 + 3 + 3; i++) {
        const photo = photos[i];
        if (!photo) {
          break;
        }
        lowRightCount++;

        lowRight.appendChild(renderPhoto(photo, i + 1));
      }

      // low left side is previous page
      const lowLeft = sides[2];
      for (let i = index - 6; i < index - 3; i++) {
        const photo = photos[i];
        if (!photo) {
          break;
        }
        lowLeftCount++;

        lowLeft.appendChild(renderPhoto(photo, i));
      }

      if (lowLeftCount === 3) {
        lowLeft.style.justifyContent = "space-around";
        lowLeft.style.marginTop = "0px";
      } else {
        lowLeft.style.justifyContent = "flex-start";
        lowLeft.style.marginTop = "10px";
      }
      if (lowRightCount === 3) {
        lowRight.style.justifyContent = "space-around";
        lowRight.style.marginTop = "0px";
      } else {
        lowRight.style.justifyContent = "flex-start";
        lowRight.style.marginTop = "10px";
      }
    }

    function updateHandColor() {
      leftHand.style.filter = "grayscale(" + (albumPage === 0 ? 1 : 0) + ")";
      rightHand.style.filter =
        "grayscale(" + (albumPage * 6 + 6 >= photos.length ? 1 : 0) + ")";
    }

    let animation = false;
    function nextPage() {
      if (animation) {
        return;
      }
      if (albumPage * 6 + 6 >= photos.length) {
        return;
      }
      animation = true;
      albumPage++;
      if (albumPage * 6 + 6 >= photos.length / 2) {
        getPhotos().then((data) => {
          photos.push(...data);
          photos.sort((a, b) => b.date - a.date);
        });
      }
      updateHandColor();

      const leftContent = document.getElementById("left-content");
      const rightContent = document.getElementById("right-content");
      const index = albumPage * 6;

      for (let i = index; i < index + 3; i++) {
        const photo = photos[i];
        if (!photo) {
          break;
        }
        preloadImage(`images/album/pics/${photo.name}`);
      }

      right.style.transform = "rotate3d(0, 1, 0, 180deg)";
      right.style.zIndex = "3";

      setTimeout(() => {
        rightContent.innerHTML = "";
        let imgCount = 0;
        for (let i = index; i < index + 3; i++) {
          const photo = photos[i];
          if (!photo) {
            break;
          }
          imgCount++;
          rightContent.appendChild(renderPhoto(photo, i));
        }
        if (imgCount === 3) {
          rightContent.style.justifyContent = "space-around";
          rightContent.style.marginTop = "0px";
        } else {
          rightContent.style.justifyContent = "flex-start";
          rightContent.style.marginTop = "10px";
        }
        rightContent.style.transform = "rotate3d(0, 1, 0, 180deg)";
        if (!photos[index + selectedImage]) {
          while (selectedImage > 0 && !photos[index + selectedImage]) {
            selectedImage--;
          }
          moveHandPointer(selectedImage);
        }
      }, 500);
      right.addEventListener(
        "transitionend",
        () => {
          leftContent.innerHTML = rightContent.innerHTML;
          rightContent.innerHTML = "";
          right.style.transition = "0s";
          right.style.transform = "rotate3d(0, 1, 0, 0deg)";
          rightContent.style.transform = "rotate3d(0, 1, 0, 0deg)";
          renderAlbum();
          setTimeout(() => {
            right.style = "";
            animation = false;
          }, 20);
        },
        { once: true }
      );
    }

    function prevPage() {
      if (animation) {
        return;
      }
      if (albumPage === 0) {
        return;
      }
      animation = true;
      albumPage--;

      updateHandColor();

      const leftContent = document.getElementById("left-content");
      const rightContent = document.getElementById("right-content");
      const index = albumPage * 6;

      for (let i = index + 3; i < index + 3 + 3; i++) {
        const photo = photos[i];
        if (!photo) {
          break;
        }
        preloadImage(`images/album/pics/${photo.name}`);
      }

      left.style.transform = "rotate3d(0, 1, 0, 180deg)";
      left.style.zIndex = "3";

      setTimeout(() => {
        leftContent.innerHTML = "";
        let imgCount = 0;
        for (let i = index + 3; i < index + 3 + 3; i++) {
          const photo = photos[i];
          if (!photo) {
            break;
          }
          imgCount++;
          leftContent.appendChild(renderPhoto(photo, i + 1));
        }
        if (imgCount === 3) {
          leftContent.style.justifyContent = "space-around";
          leftContent.style.marginTop = "0px";
        } else {
          leftContent.style.justifyContent = "flex-start";
          leftContent.style.marginTop = "10px";
        }
        leftContent.style.transform = "rotate3d(0, 1, 0, 180deg)";
      }, 500);
      left.addEventListener(
        "transitionend",
        () => {
          rightContent.innerHTML = leftContent.innerHTML;
          leftContent.innerHTML = "";
          left.style.transition = "0s";
          left.style.transform = "rotate3d(0, 1, 0, 0deg)";
          leftContent.style.transform = "rotate3d(0, 1, 0, 0deg)";
          renderAlbum();
          setTimeout(() => {
            left.style = "";
            animation = false;
          }, 20);
        },
        {
          once: true,
        }
      );
    }

    function hideAlbum() {
      hands.style.top = "120%";
      hands.style.opacity = "0";
      album.style.top = "120%";
      album.style.opacity = "0";
      albumHidden = true;
    }
    function showAlbum() {
      hands.style.top = "50%";
      hands.style.opacity = "1";
      album.style.top = "50%";
      album.style.opacity = "1";
      document.getElementById("album-cover").style.opacity = "0";
      document.getElementById("album-cover").style.top = "120%";
      albumHidden = false;
    }
    function hidePhoto() {
      photoDiv.style.top = "120%";
      photoDiv.style.opacity = "0";
      photoHidden = true;
    }
    function showPhoto() {
      photoDiv.style.top = "50%";
      photoDiv.style.opacity = "1";
      photoHidden = false;
    }
    function setPhoto(url) {
      photo.src = url;
    }
    function showPhotoHands() {
      photoHands.style.opacity = "1";
      photoHands.style.top = "50%";
    }
    function hidePhotoHands() {
      photoHands.style.opacity = "0";
      photoHands.style.top = "120%";
    }
    function showPhotoDate() {
      photoDate.style.opacity = "1";
    }
    function hidePhotoDate() {
      photoDate.style.opacity = "0";
    }
    function setPhotoDate(date) {
      photoDate.innerText = date;
    }

    function showTextBox() {
      textBox.hidden = false;
      photoDiv.style.top = "40%";
    }
    function hideTextBox() {
      photoDiv.style.top = "50%";
      textBox.hidden = true;
    }

    document.addEventListener("click", (e) => {
      if (text.contentEditable === "true") {
        text.focus();
      }
    });

    rightHand.addEventListener("click", () => {
      if (animation) return;
      nextPage();
    });
    leftHand.addEventListener("click", () => {
      if (animation) return;
      prevPage();
    });
    rightPhotoHand.addEventListener("click", () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
      document.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowRight" }));
    });

    leftPhotoHand.addEventListener("click", () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
      document.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowLeft" }));
    });
    // prettier-ignore
    document.addEventListener("click", (e) => {

      if (e.target.closest(".thumb-div, .grid-view-photo")) {
        let id = e.target.closest(".thumb-div, .grid-view-photo").dataset.id;
        let photoIndex = photos.findIndex((p) => p.name === id);
        if (photoIndex === -1) {
          photoIndex = 0;
        }
        albumPage = Math.floor(photoIndex / 6);
        selectedImage = photoIndex % 6;
        setPhoto(`./images/album/pics/${photos[albumPage * 6 + selectedImage].name}?1`);
        photo.onload = () => {
          photo.alt = `${photos[albumPage * 6 + selectedImage].date}: 
          ${photos[albumPage * 6 + selectedImage].desc}`;
          photo.title = `${photos[albumPage * 6 + selectedImage].date}: 
          ${photos[albumPage * 6 + selectedImage].desc}`;
          hideAlbum();
          showPhoto();
          page = "photo";
          showPhotoHands();
          setPhotoDate(photos[albumPage * 6 + selectedImage].date);
          setTimeout(showPhotoDate, 400);
          photo.onload = null;
        };
        // preload next and previous photos
        if (photos[albumPage * 6 + selectedImage + 1]) {
          preloadImage(
            `./images/album/pics/${photos[albumPage * 6 + selectedImage + 1].name}?1`
          );
        }
        if (photos[albumPage * 6 + selectedImage - 1]) {
          preloadImage(
            `./images/album/pics/${photos[albumPage * 6 + selectedImage - 1].name}?1`
          );
        }
      }
    });

    function preloadImage(src) {
      const img = new Image();
      img.src = src;
    }

    document.addEventListener(
      "mousemove",
      (e) => {
        if (e.target.closest(".thumb-div")) {
          let id = e.target.closest(".thumb-div").dataset.id;
          let photoIndex = photos.findIndex((p) => p.name === id);
          if (photoIndex === -1) {
            photoIndex = 0;
          }
          albumPage = Math.floor(photoIndex / 6);
          selectedImage = photoIndex % 6;
          moveHandPointer(selectedImage);
        }
      },
      { passive: true }
    );


    document.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    document.addEventListener("dragenter", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    updateHandColor();
    renderAlbum();
  };
}
let end, gettingPhotos, changed, albumHidden, photoHidden = false;