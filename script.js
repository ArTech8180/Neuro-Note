console.log("DOCX:", typeof docx);
console.log("saveAs:", typeof saveAs);
console.log("html2canvas:", typeof html2canvas);
console.log("jsPDF:", typeof window.jspdf);
console.log("Mammoth:", typeof mammoth);
console.log(mammoth);




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

let currentPage = null;

let openTabs = [];

let saveTimeout;

/* =========================
   SAVE DATA
========================= */

function saveData(){

    localStorage.setItem(
        "neuroNoteData",
        JSON.stringify(books)
    );

}

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

menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "show"
        );

    }
);

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

        document.execCommand(
            "foreColor",
            false,
            textColorPicker.value
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
                                <span> 📄 ${page.title} </span>
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

                            📂 ${chapter.title}

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

                    📘 ${book.title}

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

            editor.innerHTML =
            currentPage.content;

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

        editor.innerHTML =
        currentPage.content;

    }

    else{

        currentPage = null;

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

    const pageName =
    prompt(
        "Enter Page Name"
    );

    if(pageName){

        books[bookIndex]
        .chapters[chapterIndex]
        .pages.push({

            title: pageName,

            content: ""

        });

        saveData();

        renderBooks();

    }

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

    editor.innerHTML =
    currentPage.content ||
    `<h1>${currentPage.title}</h1>`;

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

editor.addEventListener(
    "input",
    () => {

        if(!currentPage) return;

        currentPage.content =
        editor.innerHTML;

        clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {

            saveData();

            showSaveStatus(
                "Saved"
            );

        }, 1000);

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

        <div class="image-tools">

            <div class="drag-handle">
                ⠿ Drag
            </div>

            <button
                onclick="deleteImage(this)">

                Delete

            </button>

        </div>

        <div class="image-wrapper">

            <img src="${src}">

            <div class="resize-handle"></div>

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

    handle.addEventListener(
        "mousedown",
        () => {

            resizing = true;

        }
    );

    document.addEventListener(
        "mousemove",
        (e) => {

            if(!resizing) return;

            const rect =
            wrapper.getBoundingClientRect();

            wrapper.style.width =
            e.clientX - rect.left + "px";

        }
    );

    document.addEventListener(
        "mouseup",
        () => {

            resizing = false;

        }
    );

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

            <div class="drag-handle">
                ⠿ Drag
            </div>

            <button onclick="setTool('${canvasId}','pen')">
                Pen
            </button>

            <button onclick="setTool('${canvasId}','eraser')">
                Eraser
            </button>

            <button onclick="setTool('${canvasId}','line')">
                Line
            </button>

            <button onclick="setTool('${canvasId}','rect')">
                Rectangle
            </button>

            <button onclick="setTool('${canvasId}','circle')">
                Circle
            </button>

            <input
                type="color"
                value="#ffffff"
                oninput="setColor('${canvasId}', this.value)"
            >

            <button onclick="clearBlockCanvas('${canvasId}')">
                Clear
            </button>

            <button onclick="deleteDrawBlock(this)">
                Delete
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

    window.addEventListener(
        "resize",
        resizeCanvas
    );

}

/* =========================
   TOOL SETTINGS
========================= */

function setTool(canvasId, tool){

    canvasData[canvasId].tool =
    tool;

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
        ".drag-handle"
    );

    let dragging = false;

    let currentX = 0;
    let currentY = 0;

    let startX = 0;
    let startY = 0;

    handle.addEventListener(
        "mousedown",
        (e) => {

            dragging = true;

            startX =
            e.clientX - currentX;

            startY =
            e.clientY - currentY;

        }
    );

    document.addEventListener(
        "mousemove",
        (e) => {

            if(!dragging) return;

            currentX =
            e.clientX - startX;

            currentY =
            e.clientY - startY;

            element.style.transform =
            `translate(${currentX}px, ${currentY}px)`;

        }
    );

    document.addEventListener(
        "mouseup",
        () => {

            dragging = false;

        }
    );

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

    handle.addEventListener(
        "mousedown",
        (e) => {

            e.preventDefault();

            e.stopPropagation();

            resizing = true;

        }
    );

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
                300
            );

            height = Math.max(
                height,
                200
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

        const response =
        await fetch(

            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,

            {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    contents:[

                        {
                            parts:[
                                {
                                    text:userText
                                }
                            ]
                        }

                    ]

                })

            }

        );

        const data =
        await response.json();

        loading.remove();

    let aiText = "";

    if(
        data.candidates
        &&
        data.candidates.length > 0
    ){

        aiText =

        data.candidates[0]
        .content.parts[0]
        .text;

    }
    else if(data.error){

        aiText =
        "❌ " + data.error.message;

    }
    else{

        aiText =
        "No response from AI.";

    }

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

async function exportBookDOCX(){

    const book = selectBook();

    if(!book) return;

    const text = getBookText(book);

    const doc = new docx.Document({

        sections: [
            {
                properties: {},
                children: [

                    new docx.Paragraph({
                        text: text
                    })

                ]
            }
        ]

    });

    const blob =
    await docx.Packer.toBlob(doc);

    saveAs(
        blob,
        `${book.title}.docx`
    );

    showToast("📘 DOCX Exported");

}

function exportBookTXT(){

    const book = selectBook();

    if(!book) return;

    const text = getBookText(book);

    const blob = new Blob(
        [text],
        { type: "text/plain" }
    );

    saveAs(
        blob,
        `${book.title}.txt`
    );

    showToast("📄 TXT Exported");

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

function importTXT(){

    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".txt";

    input.onchange = e => {

        const file = e.target.files[0];

        if(!file) return;

        const reader = new FileReader();

        reader.onload = function(event){

            editor.innerText = event.target.result;

            showToast("TXT Imported");

        };

        reader.readAsText(file);

    };

    input.click();

}

/* =========================
   IMPORT DOCX
========================= */

async function importDOCX(){

    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".docx";

    input.onchange = async e => {

        const file = e.target.files[0];

        if(!file) return;

        const arrayBuffer = await file.arrayBuffer();

        mammoth.extractRawText({ arrayBuffer })
        .then(result => {

            editor.innerText = result.value;

            showToast("DOCX Imported");

        })
        .catch(err => {

            console.error(err);

            showToast("DOCX Import Failed");

        });

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
   START APP
========================= */

renderBooks();

console.log(
    "NeuroNote Loaded Successfully"
);

