
"use strict";

const API_URL = "http://localhost:5000/api/blogs";
const AUTH_URL = "http://localhost:5000/api/auth";

console.log("BlogSpace frontend loaded successfully!");

// ==============================
// COMMON HELPERS
// ==============================

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(element, message, type = "") {
    if (!element) return;

    element.textContent = message;
    element.className = type
        ? element.className.split(" ")[0] + " " + type
        : element.className.split(" ")[0];
}

function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text ?? "";

    if (className) {
        element.className = className;
    }

    return element;
}

async function readResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

async function getAllBlogs() {
    const response = await fetch(API_URL);
    const data = await readResponse(response);
    return data.blogs || [];
}

async function getBlogById(id) {
    const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`
    );

    const data = await readResponse(response);
    return data.blog;
}

// ==============================
// REGISTRATION
// ==============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName");
        const email = document.getElementById("registerEmail");
        const password = document.getElementById("registerPassword");
        const confirmPassword = document.getElementById("confirmPassword");

        const nameError = document.getElementById("registerNameError");
        const emailError = document.getElementById("registerEmailError");
        const passwordError = document.getElementById("registerPasswordError");
        const confirmError = document.getElementById("confirmPasswordError");
        const message = document.getElementById("registerMessage");

        [nameError, emailError, passwordError, confirmError].forEach(
            element => {
                if (element) element.textContent = "";
            }
        );

        if (message) message.textContent = "";

        let valid = true;

        if (name.value.trim().length < 2) {
            if (nameError) nameError.textContent = "Enter your full name.";
            valid = false;
        }

        if (!isValidEmail(email.value.trim())) {
            if (emailError) emailError.textContent = "Enter a valid email.";
            valid = false;
        }

        if (password.value.length < 8) {
            if (passwordError) {
                passwordError.textContent =
                    "Password must be at least 8 characters.";
            }
            valid = false;
        }

        if (password.value !== confirmPassword.value) {
            if (confirmError) {
                confirmError.textContent = "Passwords do not match.";
            }
            valid = false;
        }

        if (!valid) return;

        const button = registerForm.querySelector(
            'button[type="submit"]'
        );

        if (button) {
            button.disabled = true;
            button.textContent = "Creating Account...";
        }

        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.value.trim(),
                    email: email.value.trim(),
                    password: password.value
                })
            });

            const data = await readResponse(response);

            if (message) {
                message.textContent =
                    data.message + " Redirecting to login...";
                message.classList.add("success");
            }

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);

        } catch (error) {
            console.error("Registration error:", error);

            if (message) {
                message.textContent = error.message;
                message.classList.add("error");
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Create Account";
            }
        }
    });
}

// ==============================
// LOGIN
// ==============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail");
        const password = document.getElementById("loginPassword");
        const emailError = document.getElementById("loginEmailError");
        const passwordError = document.getElementById("loginPasswordError");
        const message = document.getElementById("loginMessage");

        if (emailError) emailError.textContent = "";
        if (passwordError) passwordError.textContent = "";
        if (message) message.textContent = "";

        let valid = true;

        if (!isValidEmail(email.value.trim())) {
            if (emailError) emailError.textContent = "Enter a valid email.";
            valid = false;
        }

        if (!password.value) {
            if (passwordError) {
                passwordError.textContent = "Password is required.";
            }
            valid = false;
        }

        if (!valid) return;

        const button = loginForm.querySelector('button[type="submit"]');

        if (button) {
            button.disabled = true;
            button.textContent = "Logging in...";
        }

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value
                })
            });

            const data = await readResponse(response);

            sessionStorage.setItem(
                "blogSpaceUser",
                JSON.stringify(data.user)
            );

            if (message) {
                message.textContent = "Login successful! Redirecting...";
                message.classList.add("success");
            }

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);

        } catch (error) {
            console.error("Login error:", error);

            if (message) {
                message.textContent = error.message;
                message.classList.add("error");
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Login";
            }
        }
    });
}

// ==============================
// CREATE AND EDIT BLOG
// ==============================

const createBlogForm = document.getElementById("createBlogForm");

if (createBlogForm) {
    const titleInput = document.getElementById("blogTitle");
    const categoryInput = document.getElementById("blogCategory");
    const imageInput = document.getElementById("blogImage");
    const contentInput = document.getElementById("blogContent");
    const blogMessage = document.getElementById("blogMessage");
    const saveDraftBtn = document.getElementById("saveDraftBtn");

    const params = new URLSearchParams(window.location.search);
    const editBlogId = params.get("edit");

    let loadingFailed = false;

    function showBlogMessage(message, type = "") {
        if (!blogMessage) return;

        blogMessage.textContent = message;
        blogMessage.className = "blog-message";

        if (type) blogMessage.classList.add(type);
    }

    function validateBlog() {
        const title = titleInput.value.trim();
        const category = categoryInput.value;
        const content = contentInput.value.trim();
        const image = imageInput.value.trim();

        if (!title || !category || !content) {
            showBlogMessage(
                "Please fill in the title, category, and content.",
                "error"
            );
            return false;
        }

        if (content.length < 20) {
            showBlogMessage(
                "Blog content must contain at least 20 characters.",
                "error"
            );
            return false;
        }

        if (image) {
            try {
                const url = new URL(image);

                if (!["http:", "https:"].includes(url.protocol)) {
                    throw new Error("Invalid URL");
                }
            } catch {
                showBlogMessage(
                    "Enter a valid image URL or leave it empty.",
                    "error"
                );
                return false;
            }
        }

        return true;
    }

    async function loadBlogForEditing() {
        if (!editBlogId) return;

        showBlogMessage("Loading blog details...");

        try {
            const blog = await getBlogById(editBlogId);

            titleInput.value = blog.title || "";
            categoryInput.value = blog.category || "";
            imageInput.value = blog.image || "";
            contentInput.value = blog.content || "";

            document.title = "Edit Blog | BlogSpace";

            const heading = document.querySelector(
                ".create-blog-heading h1"
            );

            if (heading) heading.textContent = "Edit Your Blog";

            const publishButton = createBlogForm.querySelector(
                'button[type="submit"]'
            );

            if (publishButton) {
                publishButton.textContent = "Update & Publish";
            }

            if (saveDraftBtn) {
                saveDraftBtn.textContent = "Update Draft";
            }

            showBlogMessage("Blog loaded. You can now edit it.", "success");

        } catch (error) {
            loadingFailed = true;
            console.error("Load blog error:", error);
            showBlogMessage(error.message, "error");
        }
    }

    async function saveBlog(status) {
        if (loadingFailed) {
            showBlogMessage(
                "Blog could not be loaded. Return to Dashboard and try again.",
                "error"
            );
            return;
        }

        if (!validateBlog()) return;

        const blogData = {
            title: titleInput.value.trim(),
            category: categoryInput.value,
            image: imageInput.value.trim(),
            content: contentInput.value.trim(),
            status: status
        };

        const buttons = createBlogForm.querySelectorAll("button");

        buttons.forEach(button => {
            button.disabled = true;
        });

        showBlogMessage(
            editBlogId ? "Updating blog..." : "Saving blog..."
        );

        try {
            const response = await fetch(
                editBlogId
                    ? `${API_URL}/${encodeURIComponent(editBlogId)}`
                    : API_URL,
                {
                    method: editBlogId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(blogData)
                }
            );

            const data = await readResponse(response);

            showBlogMessage(
                editBlogId
                    ? "Blog updated successfully!"
                    : status === "published"
                        ? "Blog published successfully!"
                        : "Draft saved successfully!",
                "success"
            );

            createBlogForm.reset();

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 900);

        } catch (error) {
            console.error("Save blog error:", error);
            showBlogMessage(error.message, "error");
        } finally {
            buttons.forEach(button => {
                button.disabled = false;
            });
        }
    }

    createBlogForm.addEventListener("submit", function (event) {
        event.preventDefault();
        saveBlog("published");
    });

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener("click", function () {
            saveBlog("draft");
        });
    }

    loadBlogForEditing();
}

// ==============================
// DASHBOARD: BLOG LIST AND STATS
// ==============================

const dashboardBlogList = document.getElementById("dynamicDashboardBlogs");

if (dashboardBlogList) {
    async function renderDashboardBlogs() {
        dashboardBlogList.replaceChildren();

        try {
            const blogs = await getAllBlogs();

            const totalCount = document.getElementById("totalBlogsCount");
            const publishedCount = document.getElementById("publishedBlogsCount");
            const draftCount = document.getElementById("draftBlogsCount");

            if (totalCount) totalCount.textContent = blogs.length;

            if (publishedCount) {
                publishedCount.textContent = blogs.filter(
                    blog => blog.status === "published"
                ).length;
            }

            if (draftCount) {
                draftCount.textContent = blogs.filter(
                    blog => blog.status === "draft"
                ).length;
            }

            if (blogs.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");

                cell.colSpan = 4;
                cell.textContent = "No blogs yet. Create your first blog!";

                row.appendChild(cell);
                dashboardBlogList.appendChild(row);
                return;
            }

            blogs.forEach(blog => {
                const row = document.createElement("tr");

                row.appendChild(createTextElement("td", blog.title));
                row.appendChild(createTextElement("td", blog.category));

                const statusCell = document.createElement("td");
                const status = createTextElement(
                    "span",
                    blog.status === "published" ? "Published" : "Draft",
                    blog.status === "published"
                        ? "status published"
                        : "status draft"
                );

                statusCell.appendChild(status);
                row.appendChild(statusCell);

                const actionCell = document.createElement("td");

                const editLink = document.createElement("a");
                editLink.href =
                    "create-blog.html?edit=" +
                    encodeURIComponent(blog.id);
                editLink.className = "text-link";
                editLink.textContent = "Edit";

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "delete-blog-btn";
                deleteButton.textContent = "Delete";

                deleteButton.addEventListener("click", async function () {
                    const confirmed = window.confirm(
                        `Are you sure you want to delete "${blog.title}"?`
                    );

                    if (!confirmed) return;

                    deleteButton.disabled = true;

                    try {
                        const response = await fetch(
                            `${API_URL}/${encodeURIComponent(blog.id)}`,
                            { method: "DELETE" }
                        );

                        await readResponse(response);
                        await renderDashboardBlogs();

                    } catch (error) {
                        console.error("Delete blog error:", error);
                        alert(error.message);
                        deleteButton.disabled = false;
                    }
                });

                actionCell.append(editLink, deleteButton);
                row.appendChild(actionCell);
                dashboardBlogList.appendChild(row);
            });

        } catch (error) {
            console.error("Dashboard error:", error);

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.textContent =
                "Unable to load blogs. Check that the backend is running.";

            row.appendChild(cell);
            dashboardBlogList.appendChild(row);
        }
    }

    renderDashboardBlogs();
}

// ==============================
// HOME PAGE: PUBLISHED BLOGS
// ==============================

const homeBlogContainer = document.getElementById("dynamicBlogContainer");

if (homeBlogContainer) {
    async function renderHomeBlogs() {
        homeBlogContainer.replaceChildren();

        try {
            const blogs = await getAllBlogs();

            const publishedBlogs = blogs.filter(
                blog => blog.status === "published"
            );

            if (publishedBlogs.length === 0) {
                homeBlogContainer.appendChild(
                    createTextElement(
                        "p",
                        "No published blogs yet.",
                        "no-blogs-message"
                    )
                );
                return;
            }

            publishedBlogs.forEach(blog => {
                const card = document.createElement("article");
                card.className = "blog-card";

                if (blog.image) {
                    const image = document.createElement("img");
                    image.src = blog.image;
                    image.alt = blog.title;
                    image.className = "blog-card-image";
                    image.loading = "lazy";

                    image.addEventListener("error", () => image.remove());

                    card.appendChild(image);
                }

                card.appendChild(
                    createTextElement("span", blog.category, "blog-category")
                );

                const titleLink = document.createElement("a");
                titleLink.href =
                    "blog-details.html?id=" +
                    encodeURIComponent(blog.id);
                titleLink.className = "blog-title-link";

                titleLink.appendChild(
                    createTextElement("h3", blog.title, "blog-card-title")
                );

                card.appendChild(titleLink);

                const shortContent = blog.content.length > 140
                    ? blog.content.slice(0, 140) + "..."
                    : blog.content;

                card.appendChild(
                    createTextElement("p", shortContent, "blog-card-description")
                );

                card.appendChild(
                    createTextElement(
                        "small",
                        "Published: " + (blog.createdAt || "Unknown date")
                    )
                );

                homeBlogContainer.appendChild(card);
            });

        } catch (error) {
            console.error("Home page error:", error);

            homeBlogContainer.appendChild(
                createTextElement(
                    "p",
                    "Unable to load blogs. Please try again later."
                )
            );
        }
    }

    renderHomeBlogs();
}

// ==============================
// BLOG DETAILS PAGE
// ==============================

const blogDetailsContainer = document.getElementById("blogDetails");

if (blogDetailsContainer) {
    async function renderBlogDetails() {
        blogDetailsContainer.replaceChildren();

        const params = new URLSearchParams(window.location.search);
        const blogId = params.get("id");

        if (!blogId) {
            blogDetailsContainer.appendChild(
                createTextElement("h2", "Blog ID is missing.")
            );
            return;
        }

        try {
            const blog = await getBlogById(blogId);

            if (blog.status !== "published") {
                throw new Error("This blog has not been published.");
            }

            if (blog.image) {
                const image = document.createElement("img");
                image.src = blog.image;
                image.alt = blog.title;
                image.className = "blog-details-image";

                image.addEventListener("error", () => image.remove());

                blogDetailsContainer.appendChild(image);
            }

            blogDetailsContainer.append(
                createTextElement(
                    "span",
                    blog.category,
                    "blog-details-category"
                ),
                createTextElement("h1", blog.title),
                createTextElement(
                    "p",
                    "Published on " + (blog.createdAt || "Unknown date"),
                    "blog-details-meta"
                ),
                createTextElement(
                    "div",
                    blog.content,
                    "blog-details-content"
                )
            );

        } catch (error) {
            console.error("Blog details error:", error);

            const message = document.createElement("div");
            message.className = "blog-not-found";

            message.append(
                createTextElement("h2", "Blog Not Found"),
                createTextElement("p", error.message)
            );

            const link = document.createElement("a");
            link.href = "index.html";
            link.className = "btn";
            link.textContent = "Explore Blogs";

            message.appendChild(link);
            blogDetailsContainer.appendChild(message);
        }
    }

    renderBlogDetails();
}
