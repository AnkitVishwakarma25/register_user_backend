module.exports = (req, res, next) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required !"
        })
    }

    if (password.length < 6)
        return res.status(400).json({ message: "password must be 6 characters" })


    next();

}

