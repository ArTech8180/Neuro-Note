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

            showToast(
                "💾 Saved"
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

    const img =
    document.createElement("img");

    img.src = src;

    img.classList.add(
        "note-image"
    );

    editor.appendChild(img);

    const spacer =
    document.createElement("p");

    spacer.innerHTML = "<br>";

    editor.appendChild(spacer);

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

    let tableHTML =
    "<table>";

    for(let i = 0; i < rows; i++){

        tableHTML += "<tr>";

        for(let j = 0; j < cols; j++){

            tableHTML += `
                <td contenteditable="true">
                    Cell
                </td>
            `;

        }

        tableHTML += "</tr>";

    }

    tableHTML += "</table>";

    editor.innerHTML +=
    tableHTML;

    closeTablePopup();

}


/* =========================
   EXPORT SYSTEM
========================= */

function getBookText(book){

    let text = "";

    text += book.title + "\n\n";

    book.chapters.forEach(chapter => {

        text +=
        chapter.title + "\n\n";

        chapter.pages.forEach(page => {

            const temp =
            document.createElement("div");

            temp.innerHTML =
            page.content;

            text +=
            page.title + "\n";

            text +=
            temp.innerText + "\n\n";

        });

    });

    return text;

}

function selectBook(){

    if(books.length === 0){

        alert(
            "No books available."
        );

        return null;

    }

    const names =
    books.map(
        (b, i) =>
        `${i+1}. ${b.title}`
    ).join("\n");

    const choice =
    prompt(
        "Select Book:\n\n" + names
    );

    const index =
    parseInt(choice) - 1;

    if(
        index < 0
        ||
        index >= books.length
    ){

        alert(
            "Invalid Selection"
        );

        return null;

    }

    return books[index];

}

/* TXT */

function exportBookTXT(){

    const book =
    selectBook();

    if(!book) return;

    const text =
    getBookText(book);

    const blob =
    new Blob(
        [text],
        {
            type: "text/plain"
        }
    );

    saveAs(
        blob,
        `${book.title}.txt`
    );

}

/* PDF */

async function exportBookPDF(){

    const book =
    selectBook();

    if(!book) return;

    const exportDiv =
    document.createElement("div");

    exportDiv.style.padding =
    "40px";

    exportDiv.style.background =
    "white";

    exportDiv.style.color =
    "black";

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

    document.body.appendChild(
        exportDiv
    );

    const canvas =
    await html2canvas(exportDiv);

    const imgData =
    canvas.toDataURL("image/png");

    const { jsPDF } =
    window.jspdf;

    const pdf =
    new jsPDF();

    pdf.addImage(
        imgData,
        "PNG",
        10,
        10,
        190,
        0
    );

    pdf.save(
        `${book.title}.pdf`
    );

    exportDiv.remove();

}

/* DOCX */

async function exportBookDOCX(){

    const book =
    selectBook();

    if(!book) return;

    const text =
    getBookText(book);

    const doc =
    new docx.Document({

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

document.addEventListener(
    "click",
    (e) => {

        const menu =
        document.getElementById(
            "exportMenu"
        );

        const button =
        document.querySelector(
            ".export-main-btn"
        );

        if(
            menu &&
            button &&
            !menu.contains(e.target)
            &&
            !button.contains(e.target)
        ){

            menu.classList.remove(
                "show"
            );

        }

    }
);

/* =========================
   AI SIDEBAR
========================= */

function toggleAI(){

    document
    .getElementById(
        "aiSidebar"
    )
    .classList.toggle(
        "show"
    );

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
        input.value.trim() === ""
    ) return;

    const userMessage =
    document.createElement("div");

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
        document.createElement("div");

        aiReply.classList.add(
            "ai-message"
        );

        aiReply.innerHTML =
        "AI response generated.";

        messages.appendChild(
            aiReply
        );

        messages.scrollTop =
        messages.scrollHeight;

    }, 500);

    input.value = "";

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

    if(command === "toggle-ai"){

        toggleAI();

    }

    if(command === "dark-theme"){

        setTheme("dark-theme");

    }

    if(command === "light-theme"){

        setTheme("light-theme");

    }

}

/* =========================
   HELP PANEL
========================= */

function openHelpPanel(){

    document
    .getElementById("helpPanel")
    .classList.add("show");

}

function closeHelpPanel(){

    document
    .getElementById("helpPanel")
    .classList.remove("show");

}

/* =========================
   THEME DROPDOWN
========================= */

function toggleThemeDropdown(){

    document
    .getElementById(
        "themeDropdownContent"
    )
    .classList.toggle(
        "show"
    );

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
                onchange="setColor('${canvasId}', this.value)"
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

    setupCanvas(canvasId);

    enableDragging(block);

    enableResize(block);

}

/* =========================
   SETUP CANVAS
========================= */

function setupCanvas(canvasId){

    const canvas =
    document.getElementById(canvasId);

    const ctx =
    canvas.getContext("2d");

    canvas.width = 700;
    canvas.height = 400;

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

        return {

            x: e.clientX - rect.left,
            y: e.clientY - rect.top

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

            ctx.beginPath();

            ctx.moveTo(
                startX,
                startY
            );

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

    canvas.addEventListener(
        "mouseup",
        () => {

            drawing = false;

        }
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

    let resizing = false;

    handle.addEventListener(
        "mousedown",
        (e) => {

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

            const width =
            e.clientX - rect.left;

            const height =
            e.clientY - rect.top;

            wrapper.style.width =
            width + "px";

            wrapper.style.height =
            height + "px";

            canvas.width = width;
            canvas.height = height;

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
   START APP
========================= */

renderBooks();

console.log(
    "NeuroNote Loaded Successfully"
);
