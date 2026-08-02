
console.log("saveAs:", typeof saveAs);
console.log("html2canvas:", typeof html2canvas);
console.log("jsPDF:", typeof window.jspdf);


/* =========================
   ELEMENTS
========================= */



const canvasData = {};

const slashMenu =
document.getElementById("slashMenu");

const menuBtn =
document.getElementById("menuBtn");

const sidebar =
document.getElementById("sidebar");

const booksContainer =
document.getElementById("booksContainer");

const newBookBtn =
document.getElementById("newBookBtn");

const editor =
document.querySelector(".editor");

const settingsBtn =
document.querySelector(".settings-btn");

const themePanel =
document.getElementById("themePanel");

const searchInput =
document.getElementById("searchInput");

const imageInput =
document.getElementById("imageInput");

const contextMenu =
document.getElementById("contextMenu");

const textColorPicker =
document.getElementById("textColorPicker");

const tabsContainer =
document.getElementById("tabsContainer");

const tablePopup =
document.getElementById("tablePopup");

const commandPalette =
document.getElementById("commandPalette");

const commandInput =
document.getElementById("commandInput");

const editorToolbar =
document.querySelector(".editor-toolbar");

const originalEditorToolbarHTML =
editorToolbar.innerHTML;

const pagePopup =
document.getElementById("pagePopup");

const pageNameInput =
document.getElementById("pageNameInput");

const writingPageType =
document.getElementById("writingPageType");

const paintingPageType =
document.getElementById("paintingPageType");

/* =========================
   DATA
========================= */

let books = JSON.parse(
    localStorage.getItem(
        "neuroNoteData"
    )
) || [

    {
        title: "Science Book",

        chapters: [

            {
                title: "Chapter 1",

                pages: [

                    {
                        title: "Page 1",

                        content: `
                            <h1>Welcome to NeuroNote</h1>
                            <p>Start writing your futuristic notes here...</p>
                        `
                    }

                ]
            }

        ]
    }

];

window.books = books;

let currentPage = null;

let openTabs = [];

let saveTimeout;

let pendingPageTarget = null;

let currentPaintingState = null;

/* =========================
   SAVE DATA
========================= */

function saveData(){

    window.books = books;

    localStorage.setItem(
        "neuroNoteData",
        JSON.stringify(books)
    );
}
window.saveData =
saveData;

/* =========================
   TOAST
========================= */

function showToast(message){

    const toast =
    document.createElement("div");

    toast.classList.add("toast");

    toast.innerHTML = message;

    document
    .getElementById("toastContainer")
    .appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

/* =========================
   SAVE STATUS
========================= */

function showSaveStatus(message){

    let status =
    document.getElementById(
        "saveStatus"
    );

    if(!status){

        status =
        document.createElement("div");

        status.id = "saveStatus";

        status.style.position = "fixed";
        status.style.bottom = "20px";
        status.style.right = "20px";
        status.style.padding = "10px 16px";
        status.style.background =
        "rgba(0,0,0,0.8)";
        status.style.color = "white";
        status.style.borderRadius = "12px";
        status.style.fontSize = "14px";
        status.style.zIndex = "9999";

        document.body.appendChild(
            status
        );

    }

    status.innerText = message;

    status.style.opacity = "1";

    clearTimeout(status.hideTimer);

    status.hideTimer = setTimeout(() => {

        status.style.opacity = "0";

    }, 1500);

}

/* =========================
   SETTINGS PANEL
========================= */

settingsBtn.addEventListener(
    "click",
    () => {

        themePanel.classList.toggle(
            "show"
        );

    }
);

document.addEventListener(
    "click",
    (e) => {

        if(
            themePanel &&
            settingsBtn &&
            !themePanel.contains(e.target)
            &&
            !settingsBtn.contains(e.target)
        ){

            themePanel.classList.remove(
                "show"
            );

        }

    }
);

/* =========================
   MOBILE SIDEBAR
========================= */

const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar(){
    sidebar.classList.add("show");
    sidebarOverlay.classList.add("show");
}

function closeSidebar(){
    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("show");
}

menuBtn.addEventListener(
    "click",
    () => {

        if(sidebar.classList.contains("show")){
            closeSidebar();
        } else {
            openSidebar();
        }

    }
);

sidebarOverlay.addEventListener("click", closeSidebar);

/* =========================
   THEME SYSTEM
========================= */

function setTheme(theme){

    document.body.className =
    theme;

    localStorage.setItem(
        "neuro-theme",
        theme
    );

    showToast(
        "🎨 Theme Changed"
    );

}

const savedTheme =
localStorage.getItem(
    "neuro-theme"
) || "dark-theme";

document.body.className =
savedTheme;

document.documentElement.style.setProperty(
    "--selected-text-color",
    textColorPicker.value
);

writingPageType.addEventListener(
    "change",
    () => {

        if(writingPageType.checked){

            paintingPageType.checked =
            false;

        }

    }
);

paintingPageType.addEventListener(
    "change",
    () => {

        if(paintingPageType.checked){

            writingPageType.checked =
            false;

        }

    }
);

/* =========================
   TEXT FORMATTING
========================= */

function formatText(command){

    document.execCommand(
        command,
        false,
        null
    );

}

function addHeading(){

    document.execCommand(
        "formatBlock",
        false,
        "h1"
    );

}

textColorPicker.addEventListener(
    "input",
    () => {

        document.documentElement.style.setProperty(
            "--selected-text-color",
            textColorPicker.value
        );

        document.execCommand(
            "foreColor",
            false,
            textColorPicker.value
        );

    }
);

editorToolbar.addEventListener(
    "input",
    (e) => {

        if(e.target.id !== "textColorPicker") return;

        document.documentElement.style.setProperty(
            "--selected-text-color",
            e.target.value
        );

        document.execCommand(
            "foreColor",
            false,
            e.target.value
        );

    }
);


/* =========================
   HIGHLIGHT TEXT
========================= */

let highlightEnabled = false;

function toggleHighlight(){

    highlightEnabled =
    !highlightEnabled;

    if(highlightEnabled){

        document.execCommand(
            "styleWithCSS",
            false,
            true
        );

        document.execCommand(
            "hiliteColor",
            false,
            "rgba(255, 241, 118, 0.45)"
        );

        showToast(
            "Highlight Enabled"
        );

    }else{

        document.execCommand(
            "removeFormat",
            false,
            null
        );

        showToast(
            "Highlight Disabled"
        );

    }

}

/* =========================
   TEXT SIZE
========================= */

function changeTextSize(size){

    document.execCommand(
        "fontSize",
        false,
        size
    );

}



/* =========================
   INSERT BLOCK
========================= */

function insertBlock(type){

    if(type === "draw"){

        insertDrawBlock();

    }

    else if(type === "heading"){

        const heading =
        document.createElement("h1");

        heading.innerText =
        "Heading";

        editor.appendChild(heading);

    }

    else if(type === "quote"){

        const quote =
        document.createElement("blockquote");

        quote.innerText =
        "Quote here...";

        editor.appendChild(quote);

    }

    else if(type === "code"){

        const pre =
        document.createElement("pre");

        pre.innerText =
        "Code here...";

        editor.appendChild(pre);

    }

    else if(type === "divider"){

        const hr =
        document.createElement("hr");

        editor.appendChild(hr);

    }

    slashMenu.style.display =
    "none";

}

/* =========================
   BOOK RENDER
========================= */

function renderBooks(){

    booksContainer.innerHTML =
    "";

    const searchValue =
    searchInput.value.toLowerCase();

    books.forEach(
    (book, bookIndex) => {

        if(
            !book.title
            .toLowerCase()
            .includes(searchValue)
        ){

            let found = false;

            book.chapters.forEach(chapter => {

                if(
                    chapter.title
                    .toLowerCase()
                    .includes(searchValue)
                ){

                    found = true;

                }

                chapter.pages.forEach(page => {

                    if(
                        page.title
                        .toLowerCase()
                        .includes(searchValue)
                    ){

                        found = true;

                    }

                });

            });

            if(!found) return;

        }

        const bookDiv =
        document.createElement("div");

        bookDiv.classList.add(
            "book"
        );

        let chaptersHTML = "";

        book.chapters.forEach(
        (chapter, chapterIndex) => {

            let pagesHTML = "";

            chapter.pages.forEach(
            (page, pageIndex) => {

                pagesHTML += `

                    <div
                        class="page"
                        id="page-${bookIndex}-${chapterIndex}-${pageIndex}"

                        onclick="openPage(
                            ${bookIndex},
                            ${chapterIndex},
                            ${pageIndex}
                        )">

                        <div class="page-row">

                            <div class="page-title-area">
                                <span> ${page.type === "painting" ? "🎨" : "📄"} ${page.title} </span>
                                <button class="rename-btn" onclick=" event.stopPropagation(); renamePage( ${bookIndex}, ${chapterIndex}, ${pageIndex} ) ">
                                    ✏️
                                </button>
                            </div>

                            <button
                                class="delete-btn"

                                onclick="
                                    event.stopPropagation();

                                    deletePage(
                                        ${bookIndex},
                                        ${chapterIndex},
                                        ${pageIndex}
                                    )
                                ">

                                🗑

                            </button>

                        </div>

                    </div>

                `;

            });

            chaptersHTML += `

                <div class="chapter">

                    <div
                        class="chapter-header"
                        onclick="toggleChapter(this)">

                        <div class="chapter-left">

                            <span> 📂 ${chapter.title} </span>

                            <button class="rename-btn" onclick=" event.stopPropagation(); renameChapter( ${bookIndex}, ${chapterIndex} ) ">
                                ✏️
                            </button>

                        </div>

                        <button
                            class="delete-btn"

                            onclick="
                                event.stopPropagation();

                                deleteChapter(
                                    ${bookIndex},
                                    ${chapterIndex}
                                )
                            ">

                            🗑

                        </button>

                    </div>

                    <div class="pages-container">

                        ${pagesHTML}

                    </div>

                    <button
                        class="add-btn"

                        onclick="addPage(
                            ${bookIndex},
                            ${chapterIndex}
                        )">

                        + Page

                    </button>

                </div>

            `;

        });

        bookDiv.innerHTML = `

            <div class="book-title-row">

                <div class="book-title">

                    <span> 📘 ${book.title} </span>

                    <button class="rename-btn" onclick=" renameBook( ${bookIndex} ) ">
                        ✏️
                    </button>

                </div>

                <button
                    class="delete-btn"

                    onclick="deleteBook(
                        ${bookIndex}
                    )">

                    🗑

                </button>

            </div>

            ${chaptersHTML}

            <button
                class="add-btn"

                onclick="addChapter(
                    ${bookIndex}
                )">

                + Chapter

            </button>

        `;

        booksContainer.appendChild(
            bookDiv
        );

    });

}

window.renderBooks =
renderBooks;

/* =========================
   TABS
========================= */

function renderTabs(){

    tabsContainer.innerHTML =
    "";

    openTabs.forEach(
    (tab, index) => {

        const tabDiv =
        document.createElement("div");

        tabDiv.classList.add(
            "tab"
        );

        if(tab.page === currentPage){

            tabDiv.classList.add(
                "active-tab"
            );

        }

        tabDiv.innerHTML = `

            <span>
                ${tab.page.title}
            </span>

            <span
                class="close-tab"
                onclick="
                    event.stopPropagation();
                    closeTab(${index})
                ">

                ✖

            </span>

        `;

        tabDiv.onclick = () => {

            currentPage =
            tab.page;

            renderCurrentPage();

            renderTabs();

        };

        tabsContainer.appendChild(
            tabDiv
        );

    });

}

function closeTab(index){

    openTabs.splice(index, 1);

    if(openTabs.length > 0){

        currentPage =
        openTabs[
            openTabs.length - 1
        ].page;

        renderCurrentPage();

    }

    else{

        currentPage = null;

        currentPaintingState = null;

        editorToolbar.innerHTML =
        originalEditorToolbarHTML;

        editor.contentEditable =
        true;

        editor.classList.remove(
            "painting-editor"
        );

        editor.innerHTML = "";

    }

    renderTabs();

}

/* =========================
   ADD BOOK
========================= */

newBookBtn.addEventListener(
    "click",
    () => {

        const title =
        prompt(
            "Enter Book Name"
        );

        if(title){

            books.push({

                title: title,

                chapters: []

            });

            saveData();

            if(
                window.saveBooksToCloud
            ){
            
                saveBooksToCloud();
            
            }


            renderBooks();

        }

    }
);

/* =========================
   ADD CHAPTER
========================= */

function addChapter(bookIndex){

    const chapterName =
    prompt(
        "Enter Chapter Name"
    );

    if(chapterName){

        books[bookIndex]
        .chapters.push({

            title: chapterName,

            pages: []

        });
        saveData();

        if(
            window.saveBooksToCloud
        ){

            saveBooksToCloud();

        }

        renderBooks();

    }

}

/* =========================
   ADD PAGE
========================= */

function addPage(
    bookIndex,
    chapterIndex
){

    pendingPageTarget = {
        bookIndex,
        chapterIndex
    };

    pageNameInput.value = "";

    writingPageType.checked = true;

    paintingPageType.checked = false;

    pagePopup.classList.add(
        "show"
    );

    setTimeout(() => {

        pageNameInput.focus();

    }, 50);

}

function closePagePopup(){

    pagePopup.classList.remove(
        "show"
    );

    pendingPageTarget = null;

}

function createPageFromPopup(){

    if(!pendingPageTarget) return;

    const pageName =
    pageNameInput.value.trim();

    if(!pageName){

        showToast(
            "Enter a page name"
        );

        return;

    }

    const isPainting =
    paintingPageType.checked;

    const isWriting =
    writingPageType.checked;

    if(!isPainting && !isWriting){

        showToast(
            "Select a page type"
        );

        return;

    }

    const pageType =
    isPainting
    ?
    "painting"
    :
    "writing";

    books[pendingPageTarget.bookIndex]
    .chapters[pendingPageTarget.chapterIndex]
    .pages.push({

        title: pageName,

        type: pageType,

        content: ""

    });

    saveData();

    if(
        window.saveBooksToCloud
    ){

        saveBooksToCloud();

    }
    renderBooks();

    closePagePopup();

    showToast(
        pageType === "painting"
        ?
        "Painting Page Created"
        :
        "Writing Page Created"
    );

}

/* =========================
   DELETE FUNCTIONS
========================= */

function deleteBook(bookIndex){

    if(confirm(
        "Delete this book?"
    )){

        books.splice(
            bookIndex,
            1
        );

        saveData();

        if(
            window.saveBooksToCloud
        ){

            saveBooksToCloud();

        }

        renderBooks();

        showToast(
            "🗑 Book Deleted"
        );

    }

}

function deleteChapter(
    bookIndex,
    chapterIndex
){

    if(confirm(
        "Delete this chapter?"
    )){

        books[bookIndex]
        .chapters.splice(
            chapterIndex,
            1
        );

        saveData();

        if(
            window.saveBooksToCloud
        ){

            saveBooksToCloud();

        }

        renderBooks();

        showToast(
            "🗑 Chapter Deleted"
        );

    }

}

function deletePage(
    bookIndex,
    chapterIndex,
    pageIndex
){

    if(confirm(
        "Delete this page?"
    )){

        books[bookIndex]
        .chapters[chapterIndex]
        .pages.splice(
            pageIndex,
            1
        );

        saveData();

        if(
            window.saveBooksToCloud
        ){

            saveBooksToCloud();

        }

        renderBooks();

        showToast(
            "🗑 Page Deleted"
        );

    }

}

/* =========================
   OPEN PAGE
========================= */

function openPage(
    bookIndex,
    chapterIndex,
    pageIndex
){

    if(window.innerWidth <= 900) closeSidebar();

    document.querySelectorAll(
        ".page"
    ).forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });

    currentPage =
    books[bookIndex]
    .chapters[chapterIndex]
    .pages[pageIndex];

    const exists =
    openTabs.find(
        tab => tab.page === currentPage
    );

    if(!exists){

        openTabs.push({

            page: currentPage

        });

    }

    renderCurrentPage();

    const activePage =
    document.getElementById(
        `page-${bookIndex}-${chapterIndex}-${pageIndex}`
    );

    if(activePage){

        activePage.classList.add(
            "active-page"
        );

    }

    renderTabs();

}

function renderCurrentPage(){

    if(!currentPage) return;

    if(currentPage.type === "painting"){

        renderPaintingPage(currentPage);

        return;

    }

    renderWritingPage(currentPage);

}

function renderWritingPage(page){

    currentPaintingState = null;

    editorToolbar.innerHTML =
    originalEditorToolbarHTML;

    editor.contentEditable =
    true;

    editor.classList.remove(
        "painting-editor"
    );

    editor.innerHTML =
    page.content ||
    `<h1>${page.title}</h1>`;

}

function renderPaintingPage(page){

    editor.contentEditable =
    false;

    editor.classList.add(
        "painting-editor"
    );

    editorToolbar.innerHTML = `

        <button class="painting-tool-btn active-paint-tool" title="Brush" onclick="setPaintingTool('brush', this)">
            <i class="fa-solid fa-paintbrush"></i>
        </button>

        <button class="painting-tool-btn" title="Marker" onclick="setPaintingTool('marker', this)">
            <i class="fa-solid fa-highlighter"></i>
        </button>

        <button class="painting-tool-btn" title="Eraser" onclick="setPaintingTool('eraser', this)">
            <i class="fa-solid fa-eraser"></i>
        </button>

        <button class="painting-tool-btn" title="Paint Bucket" onclick="setPaintingTool('bucket', this)">
            <i class="fa-solid fa-fill-drip"></i>
        </button>

        <button class="painting-tool-btn" title="Line" onclick="setPaintingTool('line', this)">
            <i class="fa-solid fa-minus"></i>
        </button>

        <button class="painting-tool-btn" title="Rectangle" onclick="setPaintingTool('rect', this)">
            <i class="fa-regular fa-square"></i>
        </button>

        <button class="painting-tool-btn" title="Circle" onclick="setPaintingTool('circle', this)">
            <i class="fa-regular fa-circle"></i>
        </button>

        <button class="painting-tool-btn" title="Hand (Pan)" onclick="setPaintingTool('hand', this)">
            <i class="fa-solid fa-hand"></i>
        </button>

        <label class="painting-size-control" title="Stroke Size">
            <i class="fa-solid fa-sliders"></i>
            <span id="strokePreview" class="stroke-preview"></span>
            <input type="range" min="1" max="60" value="8" oninput="setPaintingStrokeSize(this.value)">
        </label>

        <label class="painting-color-control" title="Paint Color">
            <i class="fa-solid fa-palette"></i>
            <input type="color" value="#7aa2ff" oninput="setPaintingColor(this.value)">
        </label>

    `;

    editor.innerHTML = `

        <div class="painting-page-shell">

            <div class="painting-board">

                <canvas
                    id="paintingCanvas"
                    class="painting-canvas"
                    width="4200"
                    height="3000">
                </canvas>

            </div>

            <div class="painting-zoom-controls">

                <button onclick="changePaintingZoom(-0.1)">
                    -
                </button>

                <span id="paintingZoomLabel">
                    100%
                </span>

                <button onclick="changePaintingZoom(0.1)">
                    +
                </button>

                <button class="clear-canvas-btn" onclick="clearPaintingCanvas()" title="Clear Canvas">
                    🗑 Clear
                </button>

            </div>

        </div>

    `;

    setupPaintingCanvas(page);

}

function setupPaintingCanvas(page){

    const canvas =
    document.getElementById(
        "paintingCanvas"
    );

    const board =
    document.querySelector(
        ".painting-board"
    );

    const ctx =
    canvas.getContext("2d");

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.fillStyle = "#050b14";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    currentPaintingState = {
        page,
        canvas,
        board,
        ctx,
        tool: "brush",
        color: "#7aa2ff",
        backgroundColor: "#050b14",
        strokeSize: 8,
        zoom: 1,
        drawing: false,
        panning: false,
        panStartX: 0,
        panStartY: 0,
        panScrollLeft: 0,
        panScrollTop: 0,
        startX: 0,
        startY: 0,
        snapshot: null,
        saveTimer: null
    };

    if(page.paintData){

        const img =
        new Image();

        img.onload = () => {

            ctx.drawImage(
                img,
                0,
                0
            );

        };

        img.src =
        page.paintData;

    }

    canvas.addEventListener(
        "mousedown",
        startPainting
    );

    canvas.addEventListener(
        "mousemove",
        continuePainting
    );

    document.addEventListener(
        "mouseup",
        stopPainting
    );

    /* ── Touch mirrors for painting canvas ── */
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if(e.touches.length === 2){
            if(!currentPaintingState) return;
            currentPaintingState._pinchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            return;
        }
        startPainting(touchToMouse(e));
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if(e.touches.length === 2){
            if(!currentPaintingState) return;
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const prev = currentPaintingState._pinchDist || dist;
            changePaintingZoom((dist - prev) * 0.003);
            currentPaintingState._pinchDist = dist;
            return;
        }
        continuePainting(touchToMouse(e));
    }, { passive: false });

    canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        stopPainting();
    }, { passive: false });

    board.addEventListener(
        "wheel",
        (e) => {

            e.preventDefault();

            changePaintingZoom(
                e.deltaY < 0 ? 0.08 : -0.08
            );

        },
        { passive:false }
    );

    updatePaintingZoom();

    updateStrokePreview();

    requestAnimationFrame(() => {

        board.scrollLeft =
        (canvas.scrollWidth - board.clientWidth) / 2;

        board.scrollTop =
        (canvas.scrollHeight - board.clientHeight) / 2;

    });

}

/* ── Touch → synthetic mouse event helper ── */
function touchToMouse(e){
    const t = e.touches[0] || e.changedTouches[0];
    return { clientX: t.clientX, clientY: t.clientY };
}

/* ── Flood fill (paint bucket) ── */
function floodFill(ctx, startX, startY, fillColorHex){
    const canvas = ctx.canvas;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;

    function hexToRgb(hex){
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return [r,g,b,255];
    }

    function idx(x,y){ return (y*w+x)*4; }
    function getPixel(x,y){ const i=idx(x,y); return [data[i],data[i+1],data[i+2],data[i+3]]; }
    function colorsMatch(a,b){ return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&a[3]===b[3]; }
    function setPixel(x,y,c){ const i=idx(x,y); data[i]=c[0]; data[i+1]=c[1]; data[i+2]=c[2]; data[i+3]=c[3]; }

    if(startX<0||startX>=w||startY<0||startY>=h) return;

    const target = getPixel(startX, startY);
    const fill   = hexToRgb(fillColorHex);

    if(colorsMatch(target, fill)) return;

    const stack = [[startX, startY]];
    while(stack.length){
        const [x,y] = stack.pop();
        if(x<0||x>=w||y<0||y>=h) continue;
        if(!colorsMatch(getPixel(x,y), target)) continue;
        setPixel(x,y,fill);
        stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    ctx.putImageData(imgData,0,0);
}

function getPaintingPosition(e){

    const state =
    currentPaintingState;

    const rect =
    state.canvas.getBoundingClientRect();

    return {
        x:(e.clientX - rect.left) / state.zoom,
        y:(e.clientY - rect.top) / state.zoom
    };

}

function startPainting(e){

    const state =
    currentPaintingState;

    if(!state) return;

    if(state.tool === "hand"){

        state.panning = true;
        state.panStartX = e.clientX;
        state.panStartY = e.clientY;
        state.panScrollLeft = state.board.scrollLeft;
        state.panScrollTop = state.board.scrollTop;
        return;

    }

    const pos =
    getPaintingPosition(e);

    if(state.tool === "bucket"){

        floodFill(state.ctx, Math.round(pos.x), Math.round(pos.y), state.color);

        schedulePaintingSave();

        return;

    }

    state.drawing = true;
    state.startX = pos.x;
    state.startY = pos.y;

    if(
        state.tool === "line" ||
        state.tool === "rect" ||
        state.tool === "circle"
    ){

        state.snapshot =
        state.ctx.getImageData(
            0,
            0,
            state.canvas.width,
            state.canvas.height
        );

    }
    else{

        state.snapshot = null;

    }

    if(
        state.tool === "brush" ||
        state.tool === "marker" ||
        state.tool === "eraser"
    ){

        state.ctx.beginPath();
        state.ctx.moveTo(
            pos.x,
            pos.y
        );

    }

}

function continuePainting(e){

    const state =
    currentPaintingState;

    if(!state) return;

    if(state.tool === "hand"){

        if(!state.panning) return;

        state.board.style.cursor = "grabbing";

        const dx = e.clientX - state.panStartX;
        const dy = e.clientY - state.panStartY;

        state.board.scrollLeft = state.panScrollLeft - dx;
        state.board.scrollTop  = state.panScrollTop  - dy;

        return;

    }

    if(!state.drawing) return;

    const pos =
    getPaintingPosition(e);

    const ctx =
    state.ctx;

    ctx.lineWidth =
    state.strokeSize;

    ctx.strokeStyle =
    state.tool === "eraser"
    ?
    state.backgroundColor
    :
    state.color;

    ctx.globalCompositeOperation =
    "source-over";

    ctx.globalAlpha =
    state.tool === "marker" ? 0.35 : 1;

    if(
        state.tool === "brush" ||
        state.tool === "marker" ||
        state.tool === "eraser"
    ){

        ctx.lineTo(
            pos.x,
            pos.y
        );

        ctx.stroke();

        return;

    }

    ctx.putImageData(
        state.snapshot,
        0,
        0
    );

    ctx.beginPath();

    if(state.tool === "line"){

        ctx.moveTo(
            state.startX,
            state.startY
        );

        ctx.lineTo(
            pos.x,
            pos.y
        );

    }

    if(state.tool === "rect"){

        ctx.rect(
            state.startX,
            state.startY,
            pos.x - state.startX,
            pos.y - state.startY
        );

    }

    if(state.tool === "circle"){

        const radius =
        Math.hypot(
            pos.x - state.startX,
            pos.y - state.startY
        );

        ctx.arc(
            state.startX,
            state.startY,
            radius,
            0,
            Math.PI * 2
        );

    }

    ctx.stroke();

}

function stopPainting(){

    const state =
    currentPaintingState;

    if(!state) return;

    if(state.panning){

        state.panning = false;
        state.board.style.cursor = "grab";
        return;

    }

    if(!state.drawing) return;

    state.drawing = false;

    state.ctx.globalAlpha = 1;
    state.ctx.globalCompositeOperation =
    "source-over";

    schedulePaintingSave();

}

function schedulePaintingSave(){

    const state =
    currentPaintingState;

    if(!state) return;

    clearTimeout(
        state.saveTimer
    );

    showSaveStatus(
        "Saving..."
    );

    state.saveTimer = setTimeout(() => {

        savePaintingPage();

    }, 550);

}

function savePaintingPage(){

    const state =
    currentPaintingState;

    if(!state) return;

    state.page.paintData =
    state.canvas.toDataURL(
        "image/webp",
        0.68
    );

    state.page.content =
    "<p>Painting page</p>";

    saveData();

    if(
        window.saveBooksToCloud
    ){

        saveBooksToCloud();

    }

    showSaveStatus(
        "Saved"
    );

}

function setPaintingTool(tool, button){

    if(!currentPaintingState) return;

    currentPaintingState.tool =
    tool;

    document
    .querySelectorAll(
        ".painting-tool-btn"
    )
    .forEach(toolButton => {

        toolButton.classList.remove(
            "active-paint-tool"
        );

    });

    if(button){

        button.classList.add(
            "active-paint-tool"
        );

    }

    const board = currentPaintingState.board;
    board.style.cursor = (tool === "hand") ? "grab" : "crosshair";

    updateStrokePreview();

}

function clearPaintingCanvas(){

    const state = currentPaintingState;

    if(!state) return;

    if(!confirm("Clear the entire canvas? This cannot be undone.")) return;

    state.ctx.fillStyle = state.backgroundColor;
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

    schedulePaintingSave();

    showToast("🗑 Canvas Cleared");

}

function setPaintingStrokeSize(size){

    if(!currentPaintingState) return;

    currentPaintingState.strokeSize =
    Number(size);

    updateStrokePreview();

}

function updateStrokePreview(){

    const state =
    currentPaintingState;

    const preview =
    document.getElementById(
        "strokePreview"
    );

    if(!state || !preview) return;

    const size =
    Math.max(
        6,
        Math.min(
            30,
            state.strokeSize
        )
    );

    preview.style.width =
    size + "px";

    preview.style.height =
    size + "px";

    preview.style.background =
    state.tool === "eraser"
    ?
    state.backgroundColor
    :
    state.color;

}

function setPaintingColor(color){

    if(!currentPaintingState) return;

    currentPaintingState.color =
    color;

    updateStrokePreview();

}

function changePaintingZoom(delta){

    if(!currentPaintingState) return;

    currentPaintingState.zoom =
    Math.min(
        2.5,
        Math.max(
            0.34,
            currentPaintingState.zoom + delta
        )
    );

    updatePaintingZoom();

}

function updatePaintingZoom(){

    const state =
    currentPaintingState;

    if(!state) return;

    state.canvas.style.width =
    state.canvas.width * state.zoom + "px";

    state.canvas.style.height =
    state.canvas.height * state.zoom + "px";

    const label =
    document.getElementById(
        "paintingZoomLabel"
    );

    if(label){

        label.innerText =
        Math.round(
            (state.zoom / 0.34) * 100
        ) + "%";

    }

}

/* =========================
   TOGGLE CHAPTER
========================= */

function toggleChapter(element){

    const chapter =
    element.parentElement;

    chapter.classList.toggle(
        "closed"
    );

}

/* =========================
   AUTO SAVE
========================= */

let saveTimer;

editor.addEventListener(

    "input",

    () => {

        if(!currentPage)
        return;

        currentPage.content =
        editor.innerHTML;

        saveData();

        if(
            window.saveBooksToCloud
        ){

            saveBooksToCloud();

        }

        clearTimeout(
            saveTimer
        );

        saveTimer =
        setTimeout(

            () => {

                saveBooksToCloud();

            },

            2000

        );

    }

);

/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    () => {

        renderBooks();

    }
);

/* =========================
   IMAGE PICKER
========================= */

function openImagePicker(){

    imageInput.click();

}

imageInput.addEventListener(
    "change",
    (e) => {

        const file =
        e.target.files[0];

        if(!file) return;

        const reader =
        new FileReader();

        reader.onload =
        function(event){

            insertImage(
                event.target.result
            );

        };

        reader.readAsDataURL(file);

    }
);

function insertImage(src){

    const block =
    document.createElement("div");

    block.classList.add(
        "image-block"
    );

    block.contentEditable =
    false;

    block.innerHTML = `

        <div class="image-wrapper image-drag-surface">

            <img src="${src}">

            <button
                class="image-delete-btn"
                title="Delete Image"
                aria-label="Delete Image"
                onmousedown="event.stopPropagation()"
                onclick="deleteImage(this)">

                <i class="fa-solid fa-trash"></i>

            </button>

            <button
                class="resize-handle image-resize-btn"
                title="Resize Image"
                aria-label="Resize Image">

                <i class="fa-solid fa-up-right-and-down-left-from-center"></i>

            </button>

        </div>

    `;

    editor.appendChild(block);

    enableDragging(block);

    enableImageResize(block);

}

function enableImageResize(block){

    const handle =
    block.querySelector(
        ".resize-handle"
    );

    const wrapper =
    block.querySelector(
        ".image-wrapper"
    );

    let resizing = false;

    function imgResizeStart(e){ e.preventDefault(); e.stopPropagation(); resizing = true; }
    function imgResizeMove(cx){
        if(!resizing) return;
        const rect = wrapper.getBoundingClientRect();
        wrapper.style.width = cx - rect.left + "px";
    }
    function imgResizeEnd(){ resizing = false; }

    handle.addEventListener("mousedown", imgResizeStart);
    document.addEventListener("mousemove", (e) => imgResizeMove(e.clientX));
    document.addEventListener("mouseup", imgResizeEnd);

    handle.addEventListener("touchstart", imgResizeStart, { passive: false });
    document.addEventListener("touchmove", (e) => {
        if(!resizing) return;
        e.preventDefault();
        imgResizeMove(e.touches[0].clientX);
    }, { passive: false });
    document.addEventListener("touchend", imgResizeEnd);

}

function deleteImage(button){

    const block =
    button.closest(
        ".image-block"
    );

    if(block){

        block.remove();

    }

}

/* =========================
   INSERT DRAW BLOCK
========================= */

function insertDrawBlock(){

    const canvasId =
    "canvas-" + Date.now();

    const block =
    document.createElement("div");

    block.classList.add(
        "draw-block"
    );

    block.contentEditable =
    false;

    block.innerHTML = `

        <div class="draw-tools">

            <div
                class="drag-handle draw-drag-handle"
                title="Drag Canvas"
                aria-label="Drag Canvas">

                <i class="fa-solid fa-grip-vertical"></i>

            </div>

            <button
                class="draw-tool-btn draw-tool-selected"
                title="Pen"
                aria-label="Pen"
                onclick="setTool('${canvasId}','pen', this)">

                <i class="fa-solid fa-pen-nib"></i>

            </button>

            <button
                class="draw-tool-btn"
                title="Eraser"
                aria-label="Eraser"
                onclick="setTool('${canvasId}','eraser', this)">

                <i class="fa-solid fa-eraser"></i>

            </button>

            <button
                class="draw-tool-btn"
                title="Line"
                aria-label="Line"
                onclick="setTool('${canvasId}','line', this)">

                <i class="fa-solid fa-minus"></i>

            </button>

            <button
                class="draw-tool-btn"
                title="Rectangle"
                aria-label="Rectangle"
                onclick="setTool('${canvasId}','rect', this)">

                <i class="fa-regular fa-square"></i>

            </button>

            <button
                class="draw-tool-btn"
                title="Circle"
                aria-label="Circle"
                onclick="setTool('${canvasId}','circle', this)">

                <i class="fa-regular fa-circle"></i>

            </button>

            <input
                class="draw-color-picker"
                type="color"
                value="#ffffff"
                title="Brush Color"
                aria-label="Brush Color"
                oninput="setColor('${canvasId}', this.value)"
            >

            <button
                title="Clear Canvas"
                aria-label="Clear Canvas"
                onclick="clearBlockCanvas('${canvasId}')">

                <i class="fa-solid fa-rotate-left"></i>

            </button>

            <button
                class="draw-delete-btn"
                title="Delete Canvas"
                aria-label="Delete Canvas"
                onclick="deleteDrawBlock(this)">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        <div class="canvas-wrapper">

            <canvas
                id="${canvasId}"
                class="draw-canvas">
            </canvas>

            <div class="resize-handle"></div>

        </div>

    `;

    editor.appendChild(block);

    setTimeout(() => {

        setupCanvas(canvasId);

        enableDragging(block);

        enableResize(block);

    }, 50);

}

/* =========================
   SETUP CANVAS
========================= */

function setupCanvas(canvasId){

    const canvas =
    document.getElementById(canvasId);

    const ctx =
    canvas.getContext("2d");

    function resizeCanvas(){

        const rect =
        canvas.getBoundingClientRect();

        let imageData;

        try{

            imageData =
            ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }

        catch{

            imageData = null;

        }

        canvas.width =
        rect.width;

        canvas.height =
        rect.height;

        if(imageData){

            ctx.putImageData(
                imageData,
                0,
                0
            );

        }

    }

    resizeCanvas();

    canvasData[canvasId] = {

        tool: "pen",
        color: "#ffffff"

    };

    let drawing = false;

    let startX = 0;
    let startY = 0;

    let snapshot = null;

    function getMousePos(e){

        const rect =
        canvas.getBoundingClientRect();

        const scaleX =
        canvas.width / rect.width;

        const scaleY =
        canvas.height / rect.height;

        return {

            x:
            (e.clientX - rect.left) * scaleX,

            y:
            (e.clientY - rect.top) * scaleY

        };

    }

    canvas.addEventListener(
        "mousedown",
        (e) => {

            drawing = true;

            const pos =
            getMousePos(e);

            startX = pos.x;
            startY = pos.y;

            snapshot =
            ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            const tool =
            canvasData[canvasId].tool;

            if(
                tool === "pen"
                ||
                tool === "eraser"
            ){

                ctx.beginPath();

                ctx.moveTo(
                    startX,
                    startY
                );

            }

        }
    );

    canvas.addEventListener(
        "mousemove",
        (e) => {

            if(!drawing) return;

            const tool =
            canvasData[canvasId].tool;

            const color =
            canvasData[canvasId].color;

            const pos =
            getMousePos(e);

            ctx.strokeStyle = color;

            ctx.lineWidth = 3;

            ctx.lineCap = "round";

            if(tool === "pen"){

                ctx.lineTo(
                    pos.x,
                    pos.y
                );

                ctx.stroke();

            }

            else if(tool === "eraser"){

                ctx.clearRect(
                    pos.x - 10,
                    pos.y - 10,
                    20,
                    20
                );

            }

            else{

                ctx.putImageData(
                    snapshot,
                    0,
                    0
                );

                if(tool === "line"){

                    ctx.beginPath();

                    ctx.moveTo(
                        startX,
                        startY
                    );

                    ctx.lineTo(
                        pos.x,
                        pos.y
                    );

                    ctx.stroke();

                }

                if(tool === "rect"){

                    ctx.strokeRect(
                        startX,
                        startY,
                        pos.x - startX,
                        pos.y - startY
                    );

                }

                if(tool === "circle"){

                    const radius =
                    Math.sqrt(
                        Math.pow(
                            pos.x - startX,
                            2
                        ) +
                        Math.pow(
                            pos.y - startY,
                            2
                        )
                    );

                    ctx.beginPath();

                    ctx.arc(
                        startX,
                        startY,
                        radius,
                        0,
                        Math.PI * 2
                    );

                    ctx.stroke();

                }

            }

        }
    );

    function stopDrawing(){

        drawing = false;

    }

    canvas.addEventListener(
        "mouseup",
        stopDrawing
    );

    canvas.addEventListener(
        "mouseleave",
        stopDrawing
    );

    /* ── Touch mirrors for draw-block canvas ── */
    function getTouchPos(te){
        const t = te.touches[0] || te.changedTouches[0];
        const r = canvas.getBoundingClientRect();
        return { clientX: t.clientX, clientY: t.clientY,
                 target: canvas, _rect: r };
    }
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        canvas.dispatchEvent(new MouseEvent("mousedown", getTouchPos(e)));
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        canvas.dispatchEvent(new MouseEvent("mousemove", getTouchPos(e)));
    }, { passive: false });
    canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        stopDrawing();
    }, { passive: false });

    window.addEventListener(
        "resize",
        resizeCanvas
    );

}

/* =========================
   TOOL SETTINGS
========================= */

function setTool(canvasId, tool, button){

    canvasData[canvasId].tool =
    tool;

    if(button){

        const tools =
        button.closest(
            ".draw-tools"
        );

        if(tools){

            tools
            .querySelectorAll(
                ".draw-tool-btn"
            )
            .forEach(toolButton => {

                toolButton.classList.remove(
                    "draw-tool-selected"
                );

            });

        }

        button.classList.add(
            "draw-tool-selected"
        );

    }

}

function setColor(canvasId, color){

    canvasData[canvasId].color =
    color;

}

/* =========================
   CLEAR CANVAS
========================= */

function clearBlockCanvas(canvasId){

    const canvas =
    document.getElementById(canvasId);

    const ctx =
    canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}

/* =========================
   DELETE DRAW BLOCK
========================= */

function deleteDrawBlock(button){

    const block =
    button.closest(".draw-block");

    if(block){

        block.remove();

    }

}

/* =========================
   DRAG SYSTEM
========================= */

function enableDragging(element){

    const handle =
    element.querySelector(
        ".image-drag-surface, .drag-handle"
    );

    let dragging = false;

    let currentX = 0;
    let currentY = 0;

    let startX = 0;
    let startY = 0;

    function dragStart(cx, cy){
        dragging = true;
        startX = cx - currentX;
        startY = cy - currentY;
    }
    function dragMove(cx, cy){
        if(!dragging) return;
        currentX = cx - startX;
        currentY = cy - startY;
        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
    function dragEnd(){ dragging = false; }

    handle.addEventListener("mousedown", (e) => dragStart(e.clientX, e.clientY));
    document.addEventListener("mousemove", (e) => dragMove(e.clientX, e.clientY));
    document.addEventListener("mouseup", dragEnd);

    handle.addEventListener("touchstart", (e) => {
        e.preventDefault();
        dragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    document.addEventListener("touchmove", (e) => {
        if(!dragging) return;
        e.preventDefault();
        dragMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    document.addEventListener("touchend", dragEnd);

}

/* =========================
   RESIZE SYSTEM
========================= */

function enableResize(block){

    const handle =
    block.querySelector(
        ".resize-handle"
    );

    const wrapper =
    block.querySelector(
        ".canvas-wrapper"
    );

    const canvas =
    block.querySelector(
        ".draw-canvas"
    );

    const ctx =
    canvas.getContext("2d");

    let resizing = false;

    function canvasResizeStart(e){ e.preventDefault(); e.stopPropagation(); resizing = true; }
    function canvasResizeEnd(){ resizing = false; }

    handle.addEventListener("mousedown", canvasResizeStart);
    handle.addEventListener("touchstart", canvasResizeStart, { passive: false });
    document.addEventListener("touchend", canvasResizeEnd);

    document.addEventListener(
        "mousemove",
        (e) => {

            if(!resizing) return;

            const rect =
            wrapper.getBoundingClientRect();

            let width =
            e.clientX - rect.left;

            let height =
            e.clientY - rect.top;

            width = Math.max(
                width,
                180
            );

            height = Math.max(
                height,
                120
            );

            let imageData;

            try{

                imageData =
                ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }

            catch{

                imageData = null;

            }

            wrapper.style.width =
            width + "px";

            wrapper.style.height =
            height + "px";

            canvas.width = width;

            canvas.height = height;

            if(imageData){

                ctx.putImageData(
                    imageData,
                    0,
                    0
                );

            }

        }
    );

    document.addEventListener(
        "mouseup",
        () => {

            resizing = false;

        }
    );

    document.addEventListener("touchmove", (e) => {
        if(!resizing) return;
        e.preventDefault();
        const t = e.touches[0];
        const rect = wrapper.getBoundingClientRect();
        let width  = Math.max(t.clientX - rect.left, 180);
        let height = Math.max(t.clientY - rect.top,  120);
        let imageData;
        try{ imageData = ctx.getImageData(0,0,canvas.width,canvas.height); }catch{ imageData=null; }
        wrapper.style.width  = width  + "px";
        wrapper.style.height = height + "px";
        canvas.width  = width;
        canvas.height = height;
        if(imageData) ctx.putImageData(imageData, 0, 0);
    }, { passive: false });

}

/* =========================
   TABLE SYSTEM
========================= */

function openTablePopup(){

    tablePopup.classList.add(
        "show"
    );

}

function closeTablePopup(){

    tablePopup.classList.remove(
        "show"
    );

}

function createTable(){

    const rows =
    parseInt(
        document.getElementById(
            "rowsInput"
        ).value
    );

    const cols =
    parseInt(
        document.getElementById(
            "colsInput"
        ).value
    );

    const wrapper =
    document.createElement("div");

    wrapper.classList.add(
        "table-wrapper"
    );

    let html = `

        <button
            class="remove-table-btn"
            onclick="removeTable(this)">

            Remove Table

        </button>

        <table>

    `;

    for(let i = 0; i < rows; i++){

        html += "<tr>";

        for(let j = 0; j < cols; j++){

            html += `
                <td contenteditable="true">
                    Cell
                </td>
            `;

        }

        html += "</tr>";

    }

    html += "</table>";

    wrapper.innerHTML = html;

    editor.appendChild(wrapper);

    closeTablePopup();

}

function removeTable(button){

    const wrapper =
    button.closest(
        ".table-wrapper"
    );

    if(wrapper){

        wrapper.remove();

    }

}

/* =========================
   SLASH MENU
========================= */

editor.addEventListener(
    "keyup",
    (e) => {

        if(e.key === "/"){

            slashMenu.style.display =
            "block";

            slashMenu.style.left =
            e.pageX + "px";

            slashMenu.style.top =
            e.pageY + "px";

        }

    }
);

/* =========================
   /DRAW DETECTION
========================= */

editor.addEventListener(
    "input",
    () => {

        const text =
        editor.innerText;

        if(text.includes("/draw")){

            editor.innerHTML =
            editor.innerHTML.replace(
                "/draw",
                ""
            );

            insertDrawBlock();

        }

    }
);

/* =========================
   RIGHT CLICK MENU
========================= */

editor.addEventListener(
    "contextmenu",
    (e) => {

        e.preventDefault();

        contextMenu.style.display =
        "block";

        contextMenu.style.left =
        e.pageX + "px";

        contextMenu.style.top =
        e.pageY + "px";

    }
);

document.addEventListener(
    "click",
    (e) => {

        if(
            contextMenu &&
            !contextMenu.contains(e.target)
        ){

            contextMenu.style.display =
            "none";

        }

    }
);

/* =========================
   COPY CUT PASTE
========================= */

async function copyText(){

    const selectedText =
    window.getSelection().toString();

    if(selectedText){

        await navigator.clipboard.writeText(
            selectedText
        );

    }

}

async function cutText(){

    const selection =
    window.getSelection();

    const selectedText =
    selection.toString();

    if(selectedText){

        await navigator.clipboard.writeText(
            selectedText
        );

        document.execCommand("delete");

    }

}

async function pasteText(){

    const text =
    await navigator.clipboard.readText();

    document.execCommand(
        "insertText",
        false,
        text
    );

}

/* =========================
   COMMAND PALETTE
========================= */

document.addEventListener(
    "keydown",
    (e) => {

        if(
            e.ctrlKey
            &&
            e.key.toLowerCase() === "k"
        ){

            e.preventDefault();

            commandPalette.classList.add(
                "show"
            );

            commandInput.focus();

        }

        if(
            e.ctrlKey
            &&
            e.key.toLowerCase() === "s"
        ){

            e.preventDefault();

            saveData();

            if(
                window.saveBooksToCloud
            ){

                saveBooksToCloud();

            }
            showToast(
                "💾 Saved"
            );

        }

    }
);

function runCommand(command){

    commandPalette.classList.remove(
        "show"
    );

    if(command === "new-book"){

        newBookBtn.click();

    }

    if(command === "new-chapter"){

        if(books.length > 0){

            addChapter(0);

        }

    }

    if(command === "new-page"){

        if(
            books.length > 0
            &&
            books[0].chapters.length > 0
        ){

            addPage(0,0);

        }

    }

    if(command === "insert-draw"){

        insertDrawBlock();

    }

    if(command === "dark-theme"){

        setTheme("dark-theme");

    }

    if(command === "light-theme"){

        setTheme("light-theme");

    }

}

/* =========================
   OPEN AI CHAT
========================= */

function toggleAI(){

    if(!aiMode){

        showToast(
            "Enable AI Mode"
        );

        return;

    }

    document
    .getElementById(
        "aiSidebar"
    )
    .classList.toggle(
        "show"
    );

}

/* =========================
   GEMINI AI CHAT
========================= */

const GEMINI_API_KEY =
"";

async function sendAIMessage(){

    if(!aiMode){

        showToast(
            "Enable AI Mode"
        );

        return;

    }

    const input =
    document.getElementById(
        "aiInput"
    );

    const messages =
    document.getElementById(
        "aiMessages"
    );

    const userText =
    input.value.trim();

    if(userText === "") return;

    /* USER MESSAGE */

    const userMessage =
    document.createElement("div");

    userMessage.classList.add(
        "ai-message"
    );

    userMessage.innerHTML =
    "🧠 " + userText;

    messages.appendChild(
        userMessage
    );

    input.value = "";

    messages.scrollTop =
    messages.scrollHeight;

    /* LOADING MESSAGE */

    const loading =
    document.createElement("div");

    loading.classList.add(
        "ai-message"
    );

    loading.innerHTML =
    "Thinking...";

    messages.appendChild(
        loading
    );

    try{
        let activePageContext = "";
        if (currentPage && currentPage.type !== "painting") {
            activePageContext = editor.innerText;
        }

        const response =
        await fetch(
            `${BACKEND_URL}/api/ai/chat`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    prompt: userText,
                    context: activePageContext
                })
            }
        );

        const data =
        await response.json();

        loading.remove();

        let aiText = data.reply || "No response from AI.";

        if(
            aiText.includes("quota")
            ||
            aiText.includes("Quota")
        ){

            aiText = `
            🚀 Free AI limit reached.

            Upgrade to NeuroNote AI+
            for unlimited smart features.

            Subscription:
            ₹30/month
            `;

            showSubscriptionPopup();

        }

        const aiReply =
        document.createElement("div");

        aiReply.classList.add(
            "ai-message"
        );

        aiReply.innerHTML =
        "🤖 " + aiText;

        messages.appendChild(
            aiReply
        );

        messages.scrollTop =
        messages.scrollHeight;

    }

    catch(error){

        loading.innerHTML =
        "AI Error";

        console.error(error);

    }

}

/* =========================
   HELP PANEL
========================= */

function openHelpPanel(){

    const helpPanel =
    document.getElementById(
        "helpPanel"
    );

    if(helpPanel){

        helpPanel.classList.add(
            "show"
        );

    }

}

function closeHelpPanel(){

    const helpPanel =
    document.getElementById(
        "helpPanel"
    );

    if(helpPanel){

        helpPanel.classList.remove(
            "show"
        );

    }

}

/* =========================
   THEME DROPDOWN
========================= */

function toggleThemeDropdown(){

    const dropdown =
    document.getElementById(
        "themeDropdownContent"
    );

    if(dropdown){

        dropdown.classList.toggle(
            "show"
        );

    }

}

/* =========================
   SELECT BOOK
========================= */

function selectBook(){

    if(books.length === 0){

        alert("No books available.");

        return null;

    }

    const bookNames =
    books.map(
        (b, i) => `${i + 1}. ${b.title}`
    ).join("\n");

    const choice = prompt(
        "Select Book Number:\n\n" + bookNames
    );

    if(choice === null){

        return null;

    }

    const index =
    parseInt(choice) - 1;

    if(
        index < 0 ||
        index >= books.length
    ){

        alert("Invalid selection.");

        return null;

    }

    return books[index];

}


/* =========================
   GET FULL BOOK CONTENT
========================= */

function getBookText(book){

    let text = "";

    text += book.title + "\n\n";

    book.chapters.forEach(chapter => {

        text +=
        "====================\n";

        text +=
        chapter.title + "\n";

        text +=
        "====================\n\n";

        chapter.pages.forEach(page => {

            text +=
            "--- " +
            page.title +
            " ---\n\n";

            const tempDiv =
            document.createElement("div");

            tempDiv.innerHTML =
            page.content;

            text +=
            tempDiv.innerText +
            "\n\n";

        });

    });

    return text;

}



/* =========================
   EXPORT MENU
========================= */

function toggleExportMenu(){

    const menu =
    document.getElementById(
        "exportMenu"
    );

    menu.classList.toggle(
        "show"
    );

}

/* =========================
   EXPORT DOCX
========================= */

function exportBookNN(){

    const book = selectBook();

    if(!book) return;

    const jsonStr = JSON.stringify(book, null, 2);

    const blob = new Blob(
        [jsonStr],
        { type: "application/json" }
    );

    saveAs(
        blob,
        `${book.title}.nn`
    );

    showToast("📘 NeuroNote Book Exported");

}

async function exportBookPDF(){

    const book = selectBook();

    if(!book) return;

    const exportDiv =
    document.createElement("div");

    exportDiv.style.padding = "40px";
    exportDiv.style.background = "white";
    exportDiv.style.color = "black";

    exportDiv.innerHTML =
    `<h1>${book.title}</h1>`;

    book.chapters.forEach(chapter => {

        exportDiv.innerHTML +=
        `<h2>${chapter.title}</h2>`;

        chapter.pages.forEach(page => {

            exportDiv.innerHTML +=
            `<h3>${page.title}</h3>`;

            exportDiv.innerHTML +=
            page.content;

        });

    });

    document.body.appendChild(exportDiv);

    const canvas =
    await html2canvas(exportDiv);

    const imgData =
    canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;

    const pdf =
    new jsPDF();

    pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        210,
        297
    );

    pdf.save(`${book.title}.pdf`);

    exportDiv.remove();

    showToast("📕 PDF Exported");

}

/* =========================
   IMPORT MENU
========================= */

function toggleImportMenu(){

    document
    .getElementById("importMenu")
    .classList.toggle("show");

}

/* =========================
   CLOSE EXPORT & IMPORT MENUS
========================= */

document.addEventListener(
    "click",
    (e) => {

        /* EXPORT MENU */

        const exportMenu =
        document.getElementById(
            "exportMenu"
        );

        const exportButton =
        document.querySelector(
            ".export-main-btn"
        );

        if(
            exportMenu &&
            exportButton &&
            !exportMenu.contains(e.target)
            &&
            !exportButton.contains(e.target)
        ){

            exportMenu.classList.remove(
                "show"
            );

        }

        /* IMPORT MENU */

        const importMenu =
        document.getElementById(
            "importMenu"
        );

        const importButton =
        document.querySelector(
            ".import-main-btn"
        );

        if(
            importMenu &&
            importButton &&
            !importMenu.contains(e.target)
            &&
            !importButton.contains(e.target)
        ){

            importMenu.classList.remove(
                "show"
            );

        }

    }
);


/* =========================
   IMPORT TXT
========================= */

function importNN(){

    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".nn";

    input.onchange = e => {

        const file = e.target.files[0];

        if(!file) return;

        const reader = new FileReader();

        reader.onload = function(event){

            try {

                const bookData = JSON.parse(event.target.result);

                if(!bookData.title || !Array.isArray(bookData.chapters)){

                    throw new Error("Invalid .nn file: Missing title or chapters.");

                }

                books.push(bookData);

                saveData();

                if(
                    window.saveBooksToCloud
                ){

                    saveBooksToCloud();

                }

                renderBooks();

                showToast("✅ NeuroNote Book Imported");

                if(window.isLoggedIn && window.isLoggedIn()){

                    window.triggerSync();

                }

            } catch(err) {

                console.error(err);

                showToast("❌ Invalid .nn file format");

            }

        };

        reader.readAsText(file);

    };

    input.click();

}

/* =========================
   IMPORT PDF
========================= */

async function importPDF(){

    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".pdf";

    input.onchange = async e => {

        const file = e.target.files[0];

        if(!file) return;

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";

        for(let i = 1; i <= pdf.numPages; i++){

            const page = await pdf.getPage(i);

            const textContent = await page.getTextContent();

            const text = textContent.items
                .map(item => item.str)
                .join(" ");

            fullText += text + "\n\n";

        }

        editor.innerText = fullText;

        showToast("PDF Imported");

    };

    input.click();

}

/* =========================
   RENAME PAGE
========================= */

function renameBook(bookIndex){

    const newName =
    prompt(
        "Enter New Book Name"
    );

    if(!newName) return;

    books[bookIndex]
    .title = newName;

    saveData();

    if(
        window.saveBooksToCloud
    ){

        saveBooksToCloud();

    }

    renderBooks();

    showToast(
        "✏️ Book Renamed"
    );

}

function renameChapter(
    bookIndex,
    chapterIndex
){

    const newName =
    prompt(
        "Enter New Chapter Name"
    );

    if(!newName) return;

    books[bookIndex]
    .chapters[chapterIndex]
    .title = newName;

    saveData();

    if(
        window.saveBooksToCloud
    ){

        saveBooksToCloud();

    }

    renderBooks();

    showToast(
        "✏️ Chapter Renamed"
    );

}

function renamePage(
    bookIndex,
    chapterIndex,
    pageIndex
){

    const newName =
    prompt(
        "Enter New Page Name"
    );

    if(!newName) return;

    books[bookIndex]
    .chapters[chapterIndex]
    .pages[pageIndex]
    .title = newName;

    saveData();

    if(
        window.saveBooksToCloud
    ){

        saveBooksToCloud();

    }

    renderBooks();

    showToast(
        "✏️ Page Renamed"
    );

}

/* =========================
   AI MODE SYSTEM
========================= */

let aiMode = localStorage.getItem(
    "neuro-ai-mode"
) === "true";

/* LOAD SAVED MODE */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const toggle =
        document.getElementById(
            "aiModeToggle"
        );

        if(toggle){

            toggle.checked =
            aiMode;

        }

    }
);

/* TOGGLE AI MODE */

function toggleAIMode(){

    aiMode =
    document.getElementById(
        "aiModeToggle"
    ).checked;

    localStorage.setItem(
        "neuro-ai-mode",
        aiMode
    );

    showToast(

        aiMode

        ?

        "🧠 AI Mode Enabled"

        :

        "❌ AI Mode Disabled"

    );

}

function showSubscriptionPopup(){

    const popup =
    document.createElement("div");

    popup.className =
    "subscription-popup";

    popup.innerHTML = `

        <div class="subscription-box">

            <h2>
                NeuroNote AI+
            </h2>

            <p>
                Unlock premium AI features
                and unlimited requests.
            </p>

            <h3>
                ₹30 / month
            </h3>

            <button onclick="startSubscription()">
                Subscribe Now
            </button>

            <button onclick="this.parentElement.parentElement.remove()">
                Maybe Later
            </button>

        </div>

    `;

    document.body.appendChild(
        popup
    );

}

/* =========================
    PROFILE MENU
========================= */

function toggleProfileMenu(event){

    event.stopPropagation();

    const profileMenu =
    document.getElementById(
        "profileMenu"
    );

    profileMenu.classList.toggle(
        "show"
    );
    
    document.addEventListener(

        "click",
    
        () => {
    
            const profileMenu =
            document.getElementById(
                "profileMenu"
            );
    
            if(profileMenu){
    
                profileMenu.classList.remove(
                    "show"
                );
    
            }
    
        }
    
    );

}

window.toggleProfileMenu =
toggleProfileMenu;

/* =========================
   START APP
========================= */

renderBooks();

console.log(
    "NeuroNote Loaded Successfully"
);
