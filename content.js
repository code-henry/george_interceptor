let watchedSrcs = new Set();
let lastSrc = "";
let jojiIndex = 1;
let jojiMode = false;

const CROSSFADE_DURATION = 800;//あとで直してくれ

function injectJojiWithCrossfade(videoURL) {
  const oldJoji = document.getElementById("joji-overlay");
  const baseVideo = document.querySelector("video");
  if (!baseVideo) return;

  baseVideo.pause();
  baseVideo.muted = true;

  const rect = baseVideo.getBoundingClientRect();

  const newJoji = document.createElement("video");
  newJoji.src = videoURL;
  newJoji.autoplay = true;
  newJoji.loop = true;
  newJoji.muted = false;
  newJoji.volume = 1.0;
  newJoji.playsInline = true;
  newJoji.controls = true;

  Object.assign(newJoji.style, {
    position: "absolute",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: "999999",
    objectFit: "cover",
    pointerEvents: "auto",
    opacity: "0",
    transition: "opacity 1.0s ease",
  });

  newJoji.removeAttribute("controls");

  newJoji.addEventListener("click", () => {
    console.log("clicked")
    if (newJoji.paused) {
      newJoji.play();
    } else {
      newJoji.pause();
    }
  });

  document.body.appendChild(newJoji);
  newJoji.getBoundingClientRect(); // reflow

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newJoji.style.opacity = "1";

      // 完全に表示し終わったらoldJojiを消す
      setTimeout(() => {
        if (oldJoji) oldJoji.remove();
        newJoji.id = "joji-overlay";
      }, CROSSFADE_DURATION + 100);
    });
  });
}



setInterval(() => {
  if (jojiMode) return;

  const video = document.querySelector("video");
  if (!video) return;

  const src = video.currentSrc;
  if (!src || src === lastSrc) return;

  lastSrc = src;

  if (!watchedSrcs.has(src)) {
    watchedSrcs.add(src);
    console.log("video detected", src);
  }

  if (watchedSrcs.size >= 5 && !jojiMode) {
    jojiMode = true;
    console.log("JOJI MODE起動");

    document.querySelectorAll("*").forEach(el => {
      if (el.scrollHeight > el.clientHeight) {
        el.style.overflow = "hidden";
      }
    });
    injectJojiWithCrossfade(jojiVideos[0]);
  }
}, 1000);

window.addEventListener("wheel", () => {
  if (!jojiMode) return;

  if (!window._lastJojiScroll || Date.now() - window._lastJojiScroll > 1000) {
    window._lastJojiScroll = Date.now();

    if (jojiIndex < jojiVideos.length) {
      console.log("JOJI change", jojiIndex + 1);
      injectJojiWithCrossfade(jojiVideos[jojiIndex++]);
    } else {
      console.log("No more JOJI");
    }
  }
});
