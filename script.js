// ==== Initialization ====

// Load notes from localStorage or initialize empty array
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let noteToDeleteId = null;
let searchFilter = "";
let currentFilterTag = "all";
let noteToEditId = null; // Track which note is being edited

// ==== Element References ====

// Note-related DOM elements
const noteContainer = document.getElementById("noteContainer");
const emptyNote = document.getElementById("emptyNote");
const noteform = document.getElementById("noteform");
const noteInput = document.getElementById("noteInput");
const noteContent = document.getElementById("noteContent");

// Modal and button elements
const newNoteModal = document.querySelector(".newnote-modal");
const deleteNoteModal = document.getElementById("deleteNoteModal");
const addBtn = document.getElementById("addBtn");
const closeBtn = document.querySelector(".close-btn");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

// Tag and search UI elements
const tagItems = document.querySelectorAll(".tag-item");
const searchContainer = document.getElementById("searchContainer");
const searchInput = searchContainer.querySelector("input");
const toggleBtn = document.querySelector(".toggle-button");

// ==== UI Interaction Listeners ====

// Animate search bar on focus/blur
searchInput.addEventListener("focus", () => {
  searchContainer.classList.add("active");
});
searchInput.addEventListener("blur", () => {
  searchContainer.classList.remove("active");
});

// Toggle active tag
tagItems.forEach(item => {
  item.addEventListener("click", () => {
    tagItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});

// Theme toggle
toggleBtn.addEventListener("click", toggleTheme);

// Open and close new note modal
addBtn.addEventListener("click", openNewNote);
closeBtn.addEventListener("click", closeAddNote);

// Cancel and confirm delete modal actions
cancelDelete.addEventListener("click", closeDeleteNoteModal);
confirmDelete.addEventListener("click", confirmDeleteNote);

// Handle note form submit
noteform.addEventListener("submit", handleNotes);

// Handle real-time search input
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchFilter = e.target.value.toLowerCase();
  renderNotes(currentFilterTag);
});

// ==== Theme Handling ====

// Load theme preference on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    toggleBtn.classList.add("active", "bxs-sun");
    toggleBtn.classList.remove("bxs-moon");
  } else {
    toggleBtn.classList.remove("active");
    toggleBtn.classList.add("bxs-moon");
    toggleBtn.classList.remove("bxs-sun");
  }
});

// Toggle theme mode and update localStorage
function toggleTheme() {
  toggleBtn.classList.toggle("active");
  if (toggleBtn.classList.contains("bxs-moon")) {
    toggleBtn.classList.remove("bxs-moon");
    toggleBtn.classList.add("bxs-sun");
  } else {
    toggleBtn.classList.remove("bxs-sun");
    toggleBtn.classList.add("bxs-moon");
  }

  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// ==== Modal Handlers ====

// Show new note modal
function openNewNote() {
  newNoteModal.classList.add("show");
}

// Close and reset new note modal
function closeAddNote() {
  newNoteModal.classList.remove("show");
  noteform.reset();
}

// Show delete confirmation modal
function OpenDeleteNoteModal() {
  deleteNoteModal.classList.add("show");
}

// Hide delete confirmation modal
function closeDeleteNoteModal() {
  deleteNoteModal.classList.remove("show");
}

// ==== Note Handling ====

// Save notes to localStorage
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Delete the selected note and update UI
function confirmDeleteNote() {
  if (noteToDeleteId !== null) {
    notes.splice(noteToDeleteId, 1);
    saveNotes();
    renderNotes(currentFilterTag);
    updateEmptyNote();
    closeDeleteNoteModal();
  }
}

// Handle form submission and create new note
function handleNotes(e) {
  e.preventDefault();

  const title = noteInput.value.trim();
  const content = noteContent.value.trim();
  const tag = document.querySelector('input[name="noteTag"]:checked').value;

  if (noteToEditId !== null) {
    // Edit mode
    notes[noteToEditId] = {
      ...notes[noteToEditId],
      title,
      content,
      tag,
      date: new Date().toISOString(), // Update timestamp
    };
    noteToEditId = null; // Reset
  } else {
    // Add mode
    const newNotes = {
      title,
      content,
      tag,
      date: new Date().toISOString(),
    };
    notes.push(newNotes);
  }

  renderNotes(currentFilterTag);
  saveNotes();
  closeAddNote();
  updateEmptyNote();
}


// ==== Note Renderer ====

// Render notes based on tag and search filter
function renderNotes(filterTag = "all") {
  noteContainer.innerHTML = "";

  const filteredNotes = notes.filter(note => {
    const matchesTag = filterTag === "all" || note.tag === filterTag;
    const matchesSearch = note.title.toLowerCase().includes(searchFilter) || 
    note.content.toLowerCase().includes(searchFilter);
    return matchesTag && matchesSearch;
  });

  filteredNotes.forEach((note, index) => {
    const noteCard = document.createElement("div");
    noteCard.className = `note-list ${getTagClass(note.tag)}`;
    noteCard.innerHTML = `
      <div class="note-items">
        <h2 class="note-title">${note.title || "Untitled Note"}</h2>
        <div class="note-actions">
          <button class="edit-note fa-solid fa-pen-to-square" data-id="${index}"></button>
          <button class="delete-note fa-solid fa-trash" data-id="${index}"></button>
        </div>
      </div>
      <p class="note-content">${note.content}</p>
      <div class="note-footer">
        <span class="note-tag ${getTagClass(note.tag)}">
          ${getTagIcon(note.tag)} ${getTagName(note.tag)}
        </span>
        <span class="date">${formatDate(note.date)}</span>
      </div>`;

    // Add animation
    requestAnimationFrame(() => {
      noteCard.classList.add("show");
    });

    noteContainer.appendChild(noteCard);
  });

  // Attach delete events to all delete buttons
  document.querySelectorAll(".delete-note").forEach((btn) => {
    btn.addEventListener("click", function () {
      noteToDeleteId = parseInt(this.getAttribute("data-id"));
      OpenDeleteNoteModal();
    });
  });

  document.querySelectorAll(".edit-note").forEach((btn) => {
    btn.addEventListener("click", function () {
      noteToEditId = parseInt(this.getAttribute("data-id"));
      openEditNoteModal(noteToEditId);
    });
  });

  // Re-attach filter buttons in case DOM was refreshed
  document.querySelectorAll(".tag-item").forEach(item => {
    item.addEventListener("click", () => {
      currentFilterTag = item.getAttribute("data-tag");
      renderNotes(currentFilterTag);
    });
  });

  // Update tag counts
  document.getElementById("tagCountAll").textContent = notes.length;
  document.getElementById("tagCountWork").textContent = notes.filter(n => n.tag === "work").length;
  document.getElementById("tagCountPersonal").textContent = notes.filter(n => n.tag === "personal").length;
  document.getElementById("tagCountReminder").textContent = notes.filter(n => n.tag === "reminder").length;
}

// Edit modal function
function openEditNoteModal(index) {
  const note = notes[index];
  noteInput.value = note.title;
  noteContent.value = note.content;
  document.querySelector(`input[name="noteTag"][value="${note.tag}"]`).checked = true;

  newNoteModal.classList.add("show");
}

// ==== Helper Functions ====

// Return class name based on tag
function getTagClass(tag) {
  return {
    work: "list-work",
    personal: "list-personal",
    reminder: "list-reminder"
  }[tag] || "";
}

// Return icon HTML based on tag
function getTagIcon(tag) {
  return {
    work: '<i class="fa-solid fa-briefcase"></i>',
    personal: '<i class="fa-solid fa-user"></i>',
    reminder: '<i class="fa-solid fa-bell"></i>',
  }[tag] || "";
}

// Return readable tag name
function getTagName(tag) {
  return {
    work: "Work",
    personal: "Personal",
    reminder: "Reminder"
  }[tag] || tag;
}

// Format ISO date string to readable format
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// Show or hide "Empty Note" placeholder
function updateEmptyNote(notesToCheck = notes) {
  emptyNote.style.display = notesToCheck.length === 0 ? "flex" : "none";
}

// ==== Initial Render ====

renderNotes(currentFilterTag);
updateEmptyNote();

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const getStartedScreen = document.getElementById("getStartedScreen");
  const appWrapper = document.getElementById("appWrapper");
  const startBtn = document.getElementById("startBtn");

  setTimeout(() => {
    loader.style.display = "none";
    getStartedScreen.classList.remove("hidden");
  }, 1500);

  startBtn.addEventListener("click", () => {
    getStartedScreen.classList.add("hidden");
    appWrapper.classList.remove("hidden");
  });
});