document.addEventListener("DOMContentLoaded", () => {

    const wrapper = document.getElementById("map-wrapper");
    if (!wrapper) return;

    const roomId = wrapper.dataset.room;      // аудитория QR
    const roomFloor = wrapper.dataset.floor;
    const floorButtons = document.querySelectorAll(".floor-btn");

    let svgEl = null;
    let selectedRoom = null; // 👈 текущая выбранная аудитория

    // transform state
    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    const MIN_SCALE = 1;
    const MAX_SCALE = 3;

    // drag state
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    /* ============================= */
    /* UTILS */
    /* ============================= */

    function clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    }

    function getLimits() {
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;

        const svgW = svgEl.viewBox.baseVal.width * scale;
        const svgH = svgEl.viewBox.baseVal.height * scale;

        return {
            minX: Math.min(0, w - svgW),
            minY: Math.min(0, h - svgH),
            maxX: 0,
            maxY: 0
        };
    }

    function applyTransform() {
        const { minX, minY, maxX, maxY } = getLimits();
        translateX = clamp(translateX, minX, maxX);
        translateY = clamp(translateY, minY, maxY);

        svgEl.style.transform =
            `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function zoomAt(x, y, delta) {
        const oldScale = scale;
        scale = clamp(scale + delta, MIN_SCALE, MAX_SCALE);

        const rect = wrapper.getBoundingClientRect();
        const px = x - rect.left;
        const py = y - rect.top;

        const factor = scale / oldScale;
        translateX = px - factor * (px - translateX);
        translateY = py - factor * (py - translateY);

        applyTransform();
    }

    /* ============================= */
    /* LOAD FLOOR */
    /* ============================= */

    function loadFloor(floor) {
        fetch(`/static/svg/floor${floor}.svg`)
            .then(r => r.text())
            .then(svgText => {

                wrapper.innerHTML = svgText;
                svgEl = wrapper.querySelector("svg");
                if (!svgEl) return;

                svgEl.style.width = "100%";
                svgEl.style.height = "100%";
                svgEl.style.transformOrigin = "0 0";
                svgEl.style.touchAction = "none";

                scale = 1;
                translateX = 0;
                translateY = 0;
                selectedRoom = null;

                // подсветка аудитории QR
                if (String(floor) === String(roomFloor)) {
                    const target = svgEl.querySelector(
                        `.room[data-room="${roomId}"]`
                    );
                    if (target) target.classList.add("active-room");
                }

                applyTransform();
                attachPanZoom();
                attachRoomClicks();
            });
    }

    /* ============================= */
    /* ROOM CLICK LOGIC */
    /* ============================= */

    function attachRoomClicks() {
        const rooms = svgEl.querySelectorAll(".room");

        rooms.forEach(room => {
            room.addEventListener("click", e => {
                e.stopPropagation();

                const clickedId = room.dataset.room;

                // второй клик по той же аудитории → переход
                if (selectedRoom === room) {
                    window.location.href = `/room/${clickedId}/`;
                    return;
                }

                // первый клик
                rooms.forEach(r => r.classList.remove("glow"));
                room.classList.add("glow");
                selectedRoom = room;
            });
        });
    }

    /* ============================= */
    /* PAN / ZOOM EVENTS */
    /* ============================= */

    function attachPanZoom() {

        svgEl.onmousedown = e => {
            isDragging = true;
            dragStartX = e.clientX - translateX;
            dragStartY = e.clientY - translateY;
        };

        window.onmousemove = e => {
            if (!isDragging) return;
            translateX = e.clientX - dragStartX;
            translateY = e.clientY - dragStartY;
            applyTransform();
        };

        window.onmouseup = () => {
            isDragging = false;
        };

        svgEl.onwheel = e => {
            e.preventDefault();
            zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 0.15 : -0.15);
        };

        let lastDist = null;

        svgEl.ontouchstart = e => {
            if (e.touches.length === 2) {
                lastDist = getTouchDistance(e.touches);
            }
            if (e.touches.length === 1) {
                dragStartX = e.touches[0].clientX - translateX;
                dragStartY = e.touches[0].clientY - translateY;
            }
        };

        svgEl.ontouchmove = e => {
            e.preventDefault();

            if (e.touches.length === 2) {
                const dist = getTouchDistance(e.touches);
                if (lastDist) {
                    zoomAt(
                        (e.touches[0].clientX + e.touches[1].clientX) / 2,
                        (e.touches[0].clientY + e.touches[1].clientY) / 2,
                        (dist - lastDist) * 0.004
                    );
                }
                lastDist = dist;
            }

            if (e.touches.length === 1) {
                translateX = e.touches[0].clientX - dragStartX;
                translateY = e.touches[0].clientY - dragStartY;
                applyTransform();
            }
        };
    }

    function getTouchDistance(t) {
        const dx = t[0].clientX - t[1].clientX;
        const dy = t[0].clientY - t[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /* ============================= */
    /* FLOORS */
    /* ============================= */

    floorButtons.forEach(btn => {
        if (btn.dataset.floor === roomFloor) {
            btn.classList.add("active");
        }

        btn.onclick = () => {
            floorButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadFloor(btn.dataset.floor);
        };
    });

    /* ============================= */
    /* START */
    /* ============================= */

    loadFloor(roomFloor);
});
