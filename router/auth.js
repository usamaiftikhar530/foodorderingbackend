const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");

require("../db/conn");
const User = require('../model/userSchema');

// router.get("/",function (req, res){
//     console.log("Inside / means Home");
//     res.send("Home Page");
// });

//----------------Register Using Async Await---------------------//
router.post("/api/register",async function(req,res){
    const {name, email, password, cpassword} = req.body;
    
    if(!name || !email || !password || !cpassword){
        return res.status(422).json({ error: "Plz Filled Form Correctly!"});
    }

    try {
        const userExist = await User.findOne({email: email});
        if (userExist){
            return res.status(422).json({ error: "Email Already Exist"});
        } else if (password != cpassword){
            return res.status(422).json({ error: "Password are not Matching"});
        } else {
            const user = new User({name, email, password, cpassword});
            await user.save();
            res.status(201).json({message: "User Registered Successfuly"});
        }
    } catch (err) {
        console.log(err);
    }
});

//----------------------Signin------------------------//
router.post("/api/signin",async function (req,res){
    try{
        console.log("Inside /api/signin");
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({error: "Fill the Data"});
        }

        const userLogin = await User.findOne({email:email});

        if (userLogin){
            const isMatch = await bcrypt.compare(password,userLogin.password);

            const token = await userLogin.generateAuthToken();
            res.cookie("jwtoken",token,{
                expires: new Date(Date.now() + 25892000000),
                httpOnly:true,
            });

            if(!isMatch){
               res.status(400).json({error: "Invalid Credentials"});
            } else{
               console.log(userLogin);
               res.json({error: "User Sign in Successfuly"});
            }
        } else {
            res.status(400).json({error: "Invalid Credentials"});
        }

    } catch (err){
        console.log(err);
    }
})

//---------------------- Contact Form ------------------------//
router.post("/api/contact",authenticate,async function (req, res){
    try {
        const {name, email, message} = req.body;
        if(!name || !email || !message){
            return res.json({error: "Fill Contact Form Correctly"});
        }

        const userContact = await User.findOne({_id: req.userID});
        if(userContact){
            const userMessage = await userContact.addMessage(message);
            await userContact.save();
            res.status(201).json({message: "User Message Added Successfuly"});
        }

    } catch (err) {
        console.log(err);
    }
});


// ---------------------- About -------------------------//
router.get("/api/about",authenticate,function (req, res){
    res.send(req.rootUser);
});

// ---------------------- Get Data -------------------------//
router.get("/api/getdata",authenticate,function (req, res){
    res.send(req.rootUser);
});

// ---------------------- Log Out -------------------------//
router.get("/api/logout",function (req, res){
    res.clearCookie('jwtoken', {path:'/'});
    res.status(200).send("User Logout");
});

//---------------------- Cart ------------------------//
router.get("/api/cart",authenticate,function (req,res){
    res.send(req.rootUser);
});

//---------------Add Product in Cart-------------------//
router.post("/api/cart",authenticate,async function (req,res){
    try{
        const {productName} = req.body;
        if(!productName){
            return res.status(422).json({ error: "Product Name is Empty"});
        }
        
        const userContact = await User.findOne({_id: req.userID});
        if(userContact){
            const userProduct = await userContact.addProduct(productName);
            await userContact.save();
            res.status(201).json({message: "User Product Added Successfuly"});
        }
    } catch (error){
        console.log(error);
    }
});

//--------------Delete Product in Cart--------------//
router.delete("/api/cart",authenticate, async function (req,res){
    try {
        const {productName} = req.body;
        if(!productName){
            return res.status(422).json({ error: "Product Name is Empty"});
        }

        const userContact = await User.findOne({_id: req.userID});
        if(userContact){
            const delProduct = await userContact.deleteProduct(productName);
            await userContact.save();
            res.status(201).json({message: "Product Deleted Successfuly"});
        }
        
    } catch (error) {
        console.log(error);
    }
})











//------------------Register Using Promises-------------------//
// router.post("/register",function(req,res){
//     const {name, email, password, cpassword} = req.body;
    
//     if(!name || !email || !password || !cpassword){
//         return res.status(422).json({ error: "Plz Filled Form Correctly!"});
//     }

//     User.findOne({email: email})
//         .then((userExist) => {
//             if(userExist){
//                 return res.status(422).json({ error: "Email Already Exist"});
//             }

//             const user = new User({name, email, password, cpassword});

//             user.save().then(() => {
//                 res.status(201).json({message: "User Registered Successfuly"});
//             }).catch(() => {
//                 res.status(500).json({error: "Failed To Registered"});
//             })
//         }).catch((err) =>{
//             console.log(err);
//         })
// });

module.exports = router;