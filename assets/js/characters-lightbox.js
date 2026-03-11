(function () {
  const lightbox = document.getElementById("character-lightbox");
  if (!lightbox) return;

  const photoFrame = lightbox.querySelector(".char-lightbox-photo");
  const title = document.getElementById("character-lightbox-title");
  const description = document.getElementById("character-lightbox-description");
  const closeButton = lightbox.querySelector(".char-lightbox-close");
  const backdrop = lightbox.querySelector(".char-lightbox-backdrop");
  const triggers = document.querySelectorAll(".char-photo-button");
  let activeTrigger = null;

  function openLightbox(trigger) {
    const imageSrc = trigger.dataset.charImage;
    const characterName = trigger.dataset.charName;
    const characterDescription = trigger.dataset.charDescription;

    photoFrame.innerHTML = "";
    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = characterName + " character artwork";
    image.className = "char-lightbox-img";
    photoFrame.appendChild(image);

    title.textContent = characterName;
    description.textContent = characterDescription;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    activeTrigger = trigger;
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    photoFrame.innerHTML = "";
    document.body.classList.remove("lightbox-open");
    if (activeTrigger) activeTrigger.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  closeButton.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
})();
