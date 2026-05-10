(function () {
  const viewers = document.querySelectorAll("[data-book-viewer]");
  if (!viewers.length || !window.St || !window.St.PageFlip) return;

  viewers.forEach((viewer) => {
    const shell = viewer.querySelector(".book-viewer-shell");
    const sourcePages = Array.from(viewer.querySelectorAll("[data-book-flip-page]"));
    if (!sourcePages.length) return;

    const previousButton = viewer.querySelector("[data-book-prev]");
    const nextButton = viewer.querySelector("[data-book-next]");
    const status = viewer.querySelector("[data-book-status]");
    const bookTitle = viewer.dataset.bookTitle || "Book";
    const pageLabels = sourcePages.map((page, index) => {
      return page.dataset.pageLabel || "Page " + (index + 1);
    });
    const pageFlip = new window.St.PageFlip(shell, {
      width: 560,
      height: 840,
      size: "stretch",
      minWidth: 280,
      maxWidth: 560,
      minHeight: 420,
      maxHeight: 840,
      usePortrait: true,
      autoSize: true,
      maxShadowOpacity: 0.28,
      flippingTime: 900,
      mobileScrollSupport: true,
      swipeDistance: 24,
    });

    function setButtonState() {
      const currentIndex = pageFlip.getCurrentPageIndex();
      const pageCount = pageFlip.getPageCount();

      previousButton.disabled = currentIndex <= 0;
      nextButton.disabled = currentIndex >= pageCount - 1;
    }

    function statusText() {
      const currentIndex = pageFlip.getCurrentPageIndex();
      const pageCount = pageFlip.getPageCount();
      const label = pageLabels[currentIndex] || "Page " + (currentIndex + 1);

      return bookTitle + " • " + label + " • " + (currentIndex + 1) + " of " + pageCount;
    }

    function syncUi() {
      status.textContent = statusText();
      setButtonState();
    }

    previousButton.addEventListener("click", () => pageFlip.flipPrev());
    nextButton.addEventListener("click", () => pageFlip.flipNext());

    shell.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        pageFlip.flipNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pageFlip.flipPrev();
      }
    });

    pageFlip.on("init", syncUi);
    pageFlip.on("flip", syncUi);
    pageFlip.on("changeOrientation", syncUi);
    pageFlip.loadFromHTML(sourcePages);
    window.requestAnimationFrame(syncUi);
  });
})();
