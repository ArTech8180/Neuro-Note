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

                            <span>
                                📄 ${page.title}
                            </span>

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
   AI SIDEBAR
========================= */

function toggleAI(){

    const aiSidebar =
    document.getElementById(
        "aiSidebar"
    );

    if(aiSidebar){

        aiSidebar.classList.toggle(
            "show"
        );

    }

}

function sendAIMessage(){

    const input =
    document.getElementById(
        "aiInput"
    );

    const messages =
    document.getElementById(
        "aiMessages"
    );

    if(
        !input
        ||
        !messages
        ||
        input.value.trim() === ""
    ) return;

    const userMessage =
    document.createElement(
        "div"
    );

    userMessage.classList.add(
        "ai-message"
    );

    userMessage.innerHTML =
    "🧠 " + input.value;

    messages.appendChild(
        userMessage
    );

    setTimeout(() => {

        const aiReply =
        document.createElement(
            "div"
        );

        aiReply.classList.add(
            "ai-message"
        );

        aiReply.innerHTML =
        generateFakeAIResponse(
            input.value
        );

        messages.appendChild(
            aiReply
        );

        messages.scrollTop =
        messages.scrollHeight;

    }, 500);

    input.value = "";

}

/* =========================
   FAKE AI RESPONSE
========================= */

function generateFakeAIResponse(message){

    message =
    message.toLowerCase();

    if(message.includes("hello")){

        return "Hello 👋";

    }

    if(message.includes("summarize")){

        return "This note discusses important concepts and key ideas.";

    }

    if(message.includes("quiz")){

        return `
        1. What is photosynthesis?
        2. Define gravity.
        `;

    }

    if(message.includes("explain")){

        return "Here is a simplified explanation of the topic.";

    }

    return "AI response generated.";

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
   START APP
========================= */

renderBooks();

console.log(
    "NeuroNote Loaded Successfully"
);
