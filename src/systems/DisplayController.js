// Owns canvas sizing and fullscreen state/lifecycle. Reports snap-step changes
// to CameraController but has no other knowledge of game state.
export class DisplayController {
    constructor(canvas, cameraController) {
        this.canvas = canvas;
        this.cameraController = cameraController;
        this.isFullscreen = false;
    }

    resizeCanvasToFit() {
        const viewportW = window.innerWidth;

        let cssW, cssH, snapStep;

        if (viewportW >= 1920) {
            cssW = 1920;
            cssH = 1080;
            snapStep = 1;
        } else if (viewportW >= 1440) {
            cssW = 1440;
            cssH = 810;
            snapStep = 4; // 4 × 0.75 = 3 px CSS → integer
        } else if (viewportW >= 960) {
            cssW = 960;
            cssH = 540;
            snapStep = 2; // 2 × 0.5 = 1 px CSS → integer
        } else if (viewportW >= 480) {
            cssW = 480;
            cssH = 270;
            snapStep = 4; // 4 × 0.25 = 1 px CSS → integer
        } else {
            cssW = viewportW;
            cssH = Math.round(viewportW * (1080 / 1920));
            snapStep = 4;
        }

        this.cameraController.setSnapStep(snapStep);
        this.canvas.style.width = cssW + "px";
        this.canvas.style.height = cssH + "px";
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement
                .requestFullscreen()
                .then(() => {
                    this.isFullscreen = true;
                    this.canvas.classList.add("fullscreen");
                    this.resizeCanvasToFit();
                    navigator.keyboard?.lock?.(["Escape"]).catch(() => {});
                })
                .catch(() => {});
        } else {
            navigator.keyboard?.unlock?.();
            document
                .exitFullscreen()
                .then(() => {
                    this.isFullscreen = false;
                    this.canvas.classList.remove("fullscreen");
                    this.resizeCanvasToFit();
                })
                .catch(() => {});
        }
    }

    attach() {
        this.resizeHandler = () => this.resizeCanvasToFit();
        this.fullscreenChangeHandler = () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.canvas.classList.toggle("fullscreen", this.isFullscreen);
            this.resizeCanvasToFit();
            if (!this.isFullscreen) {
                navigator.keyboard?.unlock?.();
            }
        };
        window.addEventListener("resize", this.resizeHandler);
        document.addEventListener("fullscreenchange", this.fullscreenChangeHandler);
    }

    detach() {
        window.removeEventListener("resize", this.resizeHandler);
        document.removeEventListener("fullscreenchange", this.fullscreenChangeHandler);
    }
}
