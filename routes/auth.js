var express = require("express");
var router = express.Router();
const bcrypt = require('bcryptjs');
const { uuid } = require('uuidv4');
const { blogsDB } = require("../mongo");
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

// const passwordHash = 
const createUser = async (username,passwordHash) => {
    try {
    const collection = await blogsDB().collection('users2')
    const user = {
        username:username,
        password:passwordHash,
        uid:uuid()
        }
    const insertUser = await collection.insertOne(user)
    return true
    } catch(e) {
    console.log(e)
    return false
    }
    
}


router.post("/register-user",async function(req,res){
    try {
        const username = req.body.username
        const password = req.body.password
        console.log(req.body)
        const saltRounds = 5
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password,salt)
        const userSaveSuccess = await createUser(username,hash)
        res.json({success:userSaveSuccess})

    }catch(e) {
        res.json({message:String(e)})
    }
})

router.post("/login-user", async function(req,res){
    try {
        const collection = blogsDB().collection('users2')
        const user = await collection.findOne({
          username: req.body.username
        })
        const match = await bcrypt.compare(req.body.password, user.password);
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const data = {
              time: new Date(),
              userId: user.uid // Note: Double check this line of code to be sure that user.uid is coming from your fetched mongo user 
          }
        const token = jwt.sign(data, jwtSecretKey);
        // console.log(match)
        res.json({success:match, token})
    } catch(e) {
        res.status({message:String(e)})
    }
})

router.get("/validate-token", function (req,res) {
    const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    try {
        const token = req.header(tokenHeaderKey)
        console.log(token)
        const verified = jwt.verify(token,jwtSecretKey)
        if(verified) {
            return res.json({success:true})
        } else {
            throw Error("access denied")
        }
    } catch(e) {
        return res.status(401).json({success:false, message:String(e)})
    }
})

module.exports=router