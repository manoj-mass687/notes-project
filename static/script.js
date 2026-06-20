let editingId = null;
let currentNote = null;

let pinnedNotes =
JSON.parse(
localStorage.getItem("pinnedNotes")
) || [];

window.onload = () => {

    loadNotes();

    const draft =
    localStorage.getItem("draft");

    if(draft){

        document.getElementById(
        "content"
        ).value = draft;
    }

    updateCharacterCount();
};

/* =====================
   AUTO SAVE DRAFT
===================== */

document.addEventListener("input",()=>{

    const content =
    document.getElementById(
    "content"
    );

    if(content){

        localStorage.setItem(
        "draft",
        content.value
        );

        updateCharacterCount();
    }
});

/* =====================
   ADD / UPDATE NOTE
===================== */

function addNote(){

    const title =
    document.getElementById(
    "title"
    ).value.trim();

    const content =
    document.getElementById(
    "content"
    ).value.trim();

    if(!title || !content){

        alert(
        "Please fill all fields"
        );

        return;
    }

    const url = editingId

    ? `/update_note/${editingId}`

    : "/add_note";

    const method = editingId

    ? "PUT"

    : "POST";

    fetch(url,{

        method:method,

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            title:title,
            content:content

        })

    })
    .then(res=>res.json())

    .then(()=>{

        editingId = null;

        clearFields();

        loadNotes();
    });
}

/* =====================
   LOAD NOTES
===================== */

function loadNotes(){

    fetch("/notes")

    .then(res=>res.json())

    .then(data=>{

        const notesDiv =
        document.getElementById(
        "notes"
        );

        notesDiv.innerHTML = "";

        let totalChars = 0;

        data.sort((a,b)=>{

            const aPinned =
            pinnedNotes.includes(a.id);

            const bPinned =
            pinnedNotes.includes(b.id);

            return bPinned - aPinned;
        });

        data.forEach(note=>{

            totalChars +=
            note.content.length;

            const pinned =
            pinnedNotes.includes(
            note.id
            );

            const card =
            document.createElement(
            "div"
            );

            card.className =
            "note";

            card.innerHTML = `

                <div class="note-title">

                    ${pinned ? "📌 " : ""}

                    ${escapeHtml(
                    note.title
                    )}

                </div>

            `;

            card.onclick = ()=>{

                openModal(note);
            };

            notesDiv.appendChild(card);
        });

        updateStats(

            data.length,

            pinnedNotes.length,

            totalChars
        );
    });
}

/* =====================
   OPEN MODAL
===================== */

function openModal(note){

    currentNote = note;

    document
    .getElementById(
    "modalTitle"
    ).innerText =
    note.title;

    document.getElementById("modalContent").style.overflowY = "auto";
    document.getElementById("modalContent").style.overflowX = "hidden";
    document.getElementById("modalContent").style.padding = "25px";

    document.getElementById("modalContent").innerText =
    note.content;

    const pinned =
    pinnedNotes.includes(
    note.id
    );

    document
    .getElementById(
    "modalActions"
    ).innerHTML = `

        <button
        class="edit-btn"
        onclick="editFromModal()">
        Edit
        </button>

        <button
        class="delete-btn"
        onclick="deleteNote(${note.id})">
        Delete
        </button>

        <button
        class="pin-btn"
        onclick="togglePin(${note.id})">
        ${pinned ? "Unpin" : "Pin"}
        </button>

        <button
        class="copy-btn"
        onclick="copyNote(
        ${JSON.stringify(note.content)}
        )">
        Copy
        </button>

    `;

    document
    .getElementById(
    "noteModal"
    ).style.display =
    "block";
}

/* =====================
   CLOSE MODAL
===================== */

function closeModal(){

    document.getElementById("noteModal").style.display = "none";

    document.getElementById("modalContent").style.overflowY = "auto";
    document.getElementById("modalContent").style.overflowX = "hidden";
    document.getElementById("modalContent").style.padding = "25px";
}

/* =====================
   EDIT NOTE IN MODAL
===================== */

function editFromModal(){

    if(!currentNote) return;

    document.getElementById("modalTitle").innerHTML = `
        <input
            id="editTitle"
            type="text"
            value="${currentNote.title}"
            style="
                width:100%;
                padding:12px;
                border:none;
                border-radius:12px;
                font-size:24px;
                font-weight:700;
                outline:none;
                background:white;
            ">
    `;

    document.getElementById("modalContent").style.overflowY = "hidden";
    document.getElementById("modalContent").style.overflowX = "hidden";
    document.getElementById("modalContent").style.padding = "0";

document.getElementById("modalContent").innerHTML = `
    <textarea
    id="editContent"
    style="
        width:100%;
        height:calc(100vh - 320px);
        min-height:0;
        border:none;
        resize:none;
        outline:none;
        background:transparent;
        font-size:17px;
        line-height:1.8;
        overflow-y:auto;
        overflow-x:hidden;
        box-sizing:border-box;
        font-family:'Inter',sans-serif;
        color:#475569;
    "
>${currentNote.content}</textarea>
`;

    document.getElementById("modalActions").innerHTML = `
        <button
        class="edit-btn"
        onclick="saveModalEdit()">
        Save
        </button>

        <button
        class="delete-btn"
        onclick="openModal(currentNote)">
        Cancel
        </button>
    `;
}

function saveModalEdit(){

    const title =
    document.getElementById(
    "editTitle"
    ).value.trim();

    const content =
    document.getElementById(
    "editContent"
    ).value.trim();

    if(!title || !content){

        alert("Please fill all fields");
        return;
    }

    fetch(`/update_note/${currentNote.id}`,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            title:title,
            content:content
        })

    })
    .then(res=>res.json())

    .then(()=>{

    currentNote.title = title;
    currentNote.content = content;

    document.getElementById("modalContent").style.overflowY = "auto";
    document.getElementById("modalContent").style.overflowX = "hidden";
    document.getElementById("modalContent").style.padding = "25px";

    closeModal();

    loadNotes();

})
    .catch(error=>{

        console.error(error);

        alert("Failed to save note");

    });
}
/* =====================
   DELETE NOTE
===================== */

function deleteNote(id){

    if(!confirm(
    "Delete this note?"
    )) return;

    fetch(

    `/delete_note/${id}`,

    {

        method:"DELETE"

    })

    .then(res=>res.json())

    .then(()=>{

        closeModal();

        loadNotes();

    });
}

/* =====================
   PIN NOTE
===================== */

function togglePin(id){

    if(
    pinnedNotes.includes(id)
    ){

        pinnedNotes =

        pinnedNotes.filter(

        item =>
        item !== id

        );

    }else{

        pinnedNotes.push(id);
    }

    localStorage.setItem(

        "pinnedNotes",

        JSON.stringify(
        pinnedNotes
        )
    );

    closeModal();

    loadNotes();
}

/* =====================
   COPY NOTE
===================== */

function copyNote(content){

    navigator.clipboard
    .writeText(content)

    .then(()=>{

        alert(
        "Copied Successfully!"
        );
    });
}

/* =====================
   SEARCH
===================== */

function searchNotes(){

    const value =

    document
    .getElementById(
    "search"
    )
    .value
    .toLowerCase();

    document
    .querySelectorAll(
    ".note"
    )

    .forEach(note=>{

        note.style.display =

        note.innerText
        .toLowerCase()
        .includes(value)

        ? "flex"

        : "none";
    });
}

/* =====================
   STATS
===================== */

function updateStats(
total,
pinned,
chars
){

    document
    .getElementById(
    "stats"
    ).innerHTML = `

        <div class="stat-card">
            <h2>${total}</h2>
            <p>📝 Total Notes</p>
        </div>

        <div class="stat-card">
            <h2>${pinned}</h2>
            <p>📌 Pinned Notes</p>
        </div>

        <div class="stat-card">
            <h2>${chars}</h2>
            <p>🔤 Characters</p>
        </div>

    `;
}

/* =====================
   CHARACTER COUNT
===================== */

function updateCharacterCount(){

    const content =

    document
    .getElementById(
    "content"
    );

    const counter =

    document
    .getElementById(
    "charCount"
    );

    if(
    content &&
    counter
    ){

        counter.innerText =

        `Characters: ${content.value.length}`;
    }
}

/* =====================
   CLEAR FIELDS
===================== */

function clearFields(){

    document
    .getElementById(
    "title"
    ).value = "";

    document
    .getElementById(
    "content"
    ).value = "";

    localStorage.removeItem(
    "draft"
    );

    updateCharacterCount();
}

/* =====================
   ESCAPE HTML
===================== */

function escapeHtml(text){

    const div =
    document.createElement(
    "div"
    );

    div.textContent =
    text;

    return div.innerHTML;
}

/* =====================
   CLOSE ON OUTSIDE CLICK
===================== */

window.onclick = function(event){

    const modal =
    document.getElementById(
    "noteModal"
    );

    if(
    event.target === modal
    ){

        closeModal();
    }
}