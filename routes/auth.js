const express = require('express');
const User = require('../modules/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')


const Token = process.env.JWT_SECRET;


// create User using: Post "/api/auth"
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 4 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 }),
], async (req, res) => {
    // If there any error
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }


    // checking user will exist or not
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({success, error: 'this email is already used' })
        }


const salt = await bcrypt.genSalt(10);
const secPass = await bcrypt.hash(req.body.password , salt)

// create new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        }).catch(err => {
            console.log(err)
            if (req.body.password == '') {
                res.json({ error: 'Please enter a valid password' })
            } else if (req.body.name == '') {
                res.json({ error: 'Enter your Name' })
            } else if (req.body.email == '') {
                res.json({ error: 'Enter your Email' })
            }
        }
        )

        const data = {
            user:{
                id: user.id
            }
        }

        const authToken = jwt.sign(data, Token)
        success= true
        res.json({success,authToken})


    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured")
    }
    login()
})


// routes 2 : login 
const login =()=>{
    
    router.post('/login',[
        body('email', 'Enter a valid Email').isEmail(),
        body('password', "Password can't be blank").exists()
    ],async(req, res)=>{
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() })
        }
    
        const {email, password} = req.body;
        try {
            let user = await User.findOne({email});
            if(!user){
                success = false
                return res.status(400).json({success, error:"this email id can't exists"})
            }
    
            const passCompare = await bcrypt.compare(password, user.password);
            if(!passCompare){
                success = false
                return res.status(400).json({ success ,error:"Your Password is Wrong"})
            }
    
            const data = {
                user:{
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, Token)
            success = true;
            res.json({success, authToken})
    
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error")   
        }
    
    })
}
login()



// route 3: get logged in user detail
router.post('/getuser',fetchuser,async(req, res)=>{
try {
    userId = req.user.id;
    const user = await User.findById(userId).select('-password')
    res.send(user);
} catch (error) {
    console.error(error.message);
            res.status(500).send("Internal Server Error")
}
})


module.exports = router;