


const Post = require('../models/Post');

const createPost = async (req, res) => {

    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title required" });
        }

        const imageUrl = req.file ? req.file.path : null; // Cloudinary gives us .path as the secure URL

        const newPost = await Post.create({
            user: req.userId,
            title,
            description,
            image: imageUrl,

        });

        res.status(201).json({
            message: "post created ",
            post: newPost,
        });
    } catch (error) {

        console.error('Create post error ', error);
        return res.status(500).json({ message: "internal server error " });

    }
}

module.exports = { createPost }
