const posts = [
  {
    id: 1,
    title: "Calculus exam preparation",
    subject: "Calculus",
    type: "Study session",
    description:
      "Practise limits and derivatives together and discuss difficult tasks.",
    location: "University library",
    capacity: 5
  },
  {
    id: 2,
    title: "Build an ICT project together",
    subject: "ICT",
    type: "Project team",
    description:
      "Find teammates to plan a website and develop your ICT project.",
    location: "Online",
    capacity: 3
  },
  {
    id: 3,
    title: "Linear Algebra practice",
    subject: "Linear Algebra",
    type: "Study session",
    description:
      "Work through matrices, systems of equations and transformations.",
    location: "University library",
    capacity: 4
  },
  {
    id: 4,
    title: "C++ practice partners",
    subject: "Programming",
    type: "Study session",
    description:
      "Practise loops, conditions and functions with other students.",
    location: "Online",
    capacity: 5
  },
  {
    id: 5,
    title: "Create a programming project",
    subject: "Programming",
    type: "Project team",
    description:
      "Form a small team to build a project and improve your coding skills.",
    location: "Online",
    capacity: 3
  },
  {
    id: 6,
    title: "ICT revision group",
    subject: "ICT",
    type: "Study session",
    description:
      "Review networks, cloud services and client–server architecture.",
    location: "Campus",
    capacity: 6
  }
];

const postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("search");
const subjectFilter = document.getElementById("subject") || document.getElementById("subject-filter");
const typeFilter = document.getElementById("type") || document.getElementById("type-filter") || document.getElementById("post-type");
const emptyState = document.getElementById("empty-state");
const status = document.getElementById("status");

// Create text elements safely.
function createTextElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  return element;
}

function showDetails(post) {
  const dialog = document.createElement("dialog");
  dialog.setAttribute("aria-labelledby", "detail-title");

  const title = createTextElement("h2", post.title);
  title.id = "detail-title";

  const closeButton = createTextElement("button", "Close");
  closeButton.type = "button";
  closeButton.addEventListener("click", () => dialog.close());

  dialog.append(
    createTextElement("span", post.subject, "badge"),
    title,
    createTextElement("p", post.description),
    createTextElement("p", `Activity: ${post.type}`),
    createTextElement("p", `Location: ${post.location}`),
    createTextElement("p", `Group capacity: ${post.capacity}`),
    createTextElement(
      "p",
      "Group capacity includes the organizer."
    ),
    closeButton
  );
if (
  post.ownerId &&
  window.studyConnectUserId?.() === post.ownerId
) {
    const editButton = createTextElement("button", "Edit post");
editButton.type = "button";
editButton.style.marginTop = "12px";

editButton.addEventListener("click", () => {
  dialog.close();
  window.studyConnectEditPost(post);
});

dialog.append(editButton);
  const deleteButton = createTextElement("button", "Delete post");
  deleteButton.type = "button";
  deleteButton.style.color = "#b42318";
  deleteButton.style.marginTop = "12px";

  const deleteMessage = createTextElement("p", "");
  deleteMessage.setAttribute("role", "status");

  let deleting = false;
  const applicationsContainer = document.createElement("section");
applicationsContainer.style.marginTop = "16px";

const applicationsButton =
  createTextElement("button", "View applications");

applicationsButton.addEventListener("click", async () => {
  applicationsContainer.replaceChildren();

  try {
    await window.studyConnectManageApplications(
      post,
      applicationsContainer
    );
  } catch (error) {
    console.error(error);
    applicationsContainer.textContent =
      "Could not load applications.";
  }
});

dialog.append(applicationsButton, applicationsContainer);

  dialog.addEventListener("cancel", (event) => {
    if (deleting) event.preventDefault();
  });

  deleteButton.addEventListener("click", async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Delete this post permanently?"
    );

    if (!confirmed) return;

    deleting = true;
    deleteButton.disabled = true;
    closeButton.disabled = true;
    deleteMessage.textContent = "Deleting…";

    try {
      await window.studyConnectDeletePost(post);
      dialog.close();
      document.getElementById("status").textContent =
        "Your post has been deleted.";
    } catch (error) {
      console.error("Deleting post failed:", error);
      deleteMessage.textContent =
        "Could not delete the post. Check your connection and account.";
    } finally {
      deleting = false;
      deleteButton.disabled = false;
      closeButton.disabled = false;
    }
  });

  dialog.append(deleteButton, deleteMessage);
}
if (window.studyConnectUserId?.() !== post.ownerId) {
  const applyButton = createTextElement("button", "Apply to join");
  applyButton.type = "button";
  applyButton.style.marginTop = "12px";
  applyButton.style.background = "#3659db";
  applyButton.style.color = "white";

  const applicationMessage = createTextElement("p", "");
  applicationMessage.setAttribute("role", "status");

  applyButton.addEventListener("click", async () => {
    if (applyButton.disabled) return;

    if (!window.studyConnectUserId?.()) {
      applicationMessage.textContent =
        "Please close this window and log in to apply.";
      return;
    }

    applyButton.disabled = true;
    applicationMessage.textContent = "Sending application…";

    try {
      applicationMessage.textContent =
        await window.studyConnectApply(post);
      applyButton.textContent = "Application submitted";
    } catch (error) {
      console.error("Application failed:", error);
      applicationMessage.textContent =
        "Could not send your application. Check your connection and try again.";
      applyButton.disabled = false;
    }
  });

  dialog.append(applyButton, applicationMessage);
}
  dialog.addEventListener("close", () => dialog.remove());

  document.body.append(dialog);
  dialog.showModal();
}

function renderPosts() {
  const query = searchInput.value.trim().toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const searchableText =
      `${post.title} ${post.subject} ${post.description}`.toLowerCase();

    const matchesSearch = searchableText.includes(query);
    const matchesSubject = 
  !document.getElementById("subject").value || post.subject === document.getElementById("subject").value;
    const matchesType =
      !typeFilter.value || post.type === typeFilter.value;

    const onlyMine = document.getElementById("my-posts-only").checked;
const currentUserId = window.studyConnectUserId?.();

const matchesOwner = !onlyMine ||
  (Boolean(currentUserId) && post.ownerId === currentUserId);

return matchesSearch && matchesSubject && matchesType && matchesOwner;
  });

  postsContainer.replaceChildren();

  filteredPosts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";

    const detailsButton = createTextElement("button", "View details");
    detailsButton.type = "button";
    detailsButton.addEventListener("click", () => showDetails(post));

    card.append(
      createTextElement("span", post.subject, "badge"),
      createTextElement("h3", post.title),
      createTextElement("p", post.description),
      createTextElement("p", post.type, "post-meta"),
      createTextElement("p", post.location, "post-meta"),
      detailsButton
    );

    postsContainer.append(card);
  });

  emptyState.hidden = filteredPosts.length > 0;
  status.textContent =
    `${filteredPosts.length}  ` +
    (filteredPosts.length === 1 ? "post found." : "posts found.");
}

searchInput.addEventListener("input", renderPosts);
subjectFilter.addEventListener("change", renderPosts);
typeFilter.addEventListener("change", renderPosts);



renderPosts();
document.getElementById("my-posts-only")
  .addEventListener("change", renderPosts);