var express = require("express");
var router = express.Router();
const bcrypt = require('bcryptjs');
const { uuid } = require('uuidv4');
const { blogsDB } = require("../mongo");

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
// createUser(test,123qwe)

// bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash("B4c0/\/", salt, function(err, hash) {
//         // Store hash in your password DB.
//     });
// });
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
        // console.log(match)
        res.json({success:match})
    } catch(e) {
        res.status({message:String(e)})
    }
})

module.exports=router