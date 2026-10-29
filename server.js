
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory storage
const users = [];
const blogs = [];

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Codomax Blog App Backend is running!"
    });
});

// ==============================
// USER REGISTRATION API
// ==============================
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = users.find(
            user => user.email === normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        };

        users.push(newUser);

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// ==============================
// USER LOGIN API
// ==============================
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = users.find(
            item => item.email === normalizedEmail
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

// ==============================
// GET ALL BLOGS
// ==============================
app.get("/api/blogs", (req, res) => {
    res.status(200).json({
        success: true,
        blogs: blogs
    });
});

// ==============================
// GET ONE BLOG
// ==============================
app.get("/api/blogs/:id", (req, res) => {
    const blog = blogs.find(
        item => String(item.id) === String(req.params.id)
    );

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found."
        });
    }

    return res.status(200).json({
        success: true,
        blog: blog
    });
});

// ==============================
// CREATE BLOG
// ==============================
app.post("/api/blogs", (req, res) => {
    try {
        const { title, category, image, content, status } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof category !== "string" ||
            !category.trim() ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, category and content are required."
            });
        }

        if (content.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Blog content must contain at least 20 characters."
            });
        }

        const blogStatus = status || "draft";

        if (!["draft", "published"].includes(blogStatus)) {
            return res.status(400).json({
                success: false,
                message: "Status must be draft or published."
            });
        }

        const newBlog = {
            id: Date.now().toString(),
            title: title.trim(),
            category: category.trim(),
            image: typeof image === "string" ? image.trim() : "",
            content: content.trim(),
            status: blogStatus,
            createdAt: new Date().toISOString()
        };

        blogs.unshift(newBlog);

        return res.status(201).json({
            success: true,
            message: "Blog created successfully!",
            blog: newBlog
        });
    } catch (error) {
        console.error("Create blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create blog."
        });
    }
});

// ==============================
// UPDATE BLOG
// ==============================
app.put("/api/blogs/:id", (req, res) => {
    try {
        const blogIndex = blogs.findIndex(
            item => String(item.id) === String(req.params.id)
        );

        if (blogIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        const { title, category, image, content, status } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof category !== "string" ||
            !category.trim() ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, category and content are required."
            });
        }

        if (content.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Blog content must contain at least 20 characters."
            });
        }

        if (!["draft", "published"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be draft or published."
            });
        }

        const oldBlog = blogs[blogIndex];

        blogs[blogIndex] = {
            ...oldBlog,
            title: title.trim(),
            category: category.trim(),
            image: typeof image === "string"
                ? image.trim()
                : oldBlog.image,
            content: content.trim(),
            status: status
        };

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully!",
            blog: blogs[blogIndex]
        });
    } catch (error) {
        console.error("Update blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update blog."
        });
    }
});

// ==============================
// DELETE BLOG
// ==============================
app.delete("/api/blogs/:id", (req, res) => {
    const blogIndex = blogs.findIndex(
        item => String(item.id) === String(req.params.id)
    );

    if (blogIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Blog not found."
        });
    }

    blogs.splice(blogIndex, 1);

    return res.status(200).json({
        success: true,
        message: "Blog deleted successfully!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
