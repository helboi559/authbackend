# authbackend

### Approach 1

* Part 1 - Server
  * First, we will create an express server and hook it up to our mongo database.
  * Second, we will install the encryption node module bcrypt.
    * bcrypt gives us access to password generation and authentication funcionality for logging users in to our application.
  * Third, we will implement the user creation route using the bcrypt salt/hash functions to take our new users password and encrypt it before saving it to the database.
  * Fourth, we will implement the user login route to authenticate our user with the bcrypt compare function.
  * Fifth, we will create a put route for editing user permissions (this is the sort of thing that would only be reserved for admins) so that we may grant administrator status to our users.
  * Sixth, we will create a simple route that returns a JSON success object, but only after the user has authenticated and is authorized to view the resource.

### Requirements (Back-End - Boilerplate)

* Create a new github repo called authbackend, clone the repo to your computer and add the link to populi. Note: when you create this repository, you must add a README, and a node .gitignore template.

* Initialize the repo with express-generator.
  * npx express-generator .
* Create a new file ./.env and add the following environment variable to it
  * PORT=4000
  * Note: This will change the server port to 4000 on startup
* [Optional] Install nodemon on the server and add the custom dev command in the package.json
  * npm i nodemon
  * "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www"
  }
* Install the CORS package by running "npm i cors" in ./
  * npm i cors
* Add the followng code, after the line var app = express();, to app.js:
  * //enable cors
  const cors = require("cors");
  app.use(cors());
  app.options("*", cors());
* Install mongodb and dotenv
  * npm i mongodb dotenv
* Add your Mongo Atlas connection string to the ./.env file
  * MONGO_URI=mongodb+srv://<myusername>:<mypassword>@<mycluster>.mongodb.net/?retryWrites=true&w=majority
    * Note: You will need to replace <myusername>, <mypassword>, and <mycluster> with the values for your URI string.
  * Add the default blog name to the .env file
    * MONGO_DATABASE=blog
* Create a new file ./mongo.js and add the following code to it:
  * const { MongoClient } = require("mongodb");
    require("dotenv").config();

    let db;

    async function mongoConnect() {
      const uri = process.env.MONGO_URI;
      const client = new MongoClient(uri);
      try {
        await client.connect();
        db = await client.db(process.env.MONGO_DATABASE);
        console.log("db connected");
      } catch (error) {
        console.error(error)
      }
    }
    function blogsDB() {
      return db;
    }
    module.exports = {
      mongoConnect,
      blogsDB,
    };
* Add the following code, after the line var app = express();, to app.js:
  * var { mongoConnect } = require('./mongo.js');
    mongoConnect();

### Requirements (Back-End - User-Creation)

* Second, we will install the encryption node module bcryptjs.
  * bcryptjs gives us access to password generation and authentication funcionality for logging users in to our application.
* Third, we will implement the user creation route using the bcrypt salt/hash functions to take our new users password and encrypt it before saving it to the database.

* In the root ./, install bcryptjs and uuidv4
  * npm i bcryptjs 
  * npm i uuidv4
  * Note: 
    * Here are the bcrypt docs: https://www.npmjs.com/package/bcryptjs
    * Here are the uuidv4 docs: https://github.com/thenativeweb/uuidv4#readme
* In app.js add the following code:
  * var authRouter = require('./routes/auth');
  * app.use('/auth', authRouter);
* Create a new file ./routes/auth.js and implement the following in it:
  * Add these lines of code to the top of the file:
    * var express = require("express");
      var router = express.Router();
      const bcrypt = require('bcryptjs');
      const { uuid } = require('uuidv4');
      const { blogsDB } = require("../mongo");
  * Add this line to the bottom of the file:
    * module.exports = router
  * Write a new async(!) function in the global scope called createUser. Implement the following in createUser:
    * Add two params to the function definition: username and passwordHash
      * const createUser = async (username, passwordHash) => {}
    * Add this line of code to connect to the users collection:
      * const collection = await blogsDB().collection("users")
      * Note: You do not have to create the users collection in mongodb before saving to it. Mongo will automatically create the users collection upon insert of a new document.
    * Implement mongodb functionality to insert() the user into the collection:
      * const user = {
          username: username, 
          password: passwordHash,
          uid: uuid() // uid stands for User ID. This will be a unique string that we will can to identify our user
        }
    * Add a try catch block within your code to return true if the save was successful and false if it was not:
      * try {
        // Save user functionality
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
  * Create a new async(!) POST route "/auth/register-user" and implement the following:
    The user's username and password will come from the req.body in this request
      * const username = req.body.username
      * const password = req.body.password
    * Add these lines to generate a salted hash of your users password and save the new user to the database
      * const saltRounds = 5; // In a real application, this number would be somewhere between 5 and 10
        let userSaveSuccess = false;
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password, salt)
        const userSaveSuccess = await createUser(username, hash);
    * Respond at the end of the route with a json success object
      * res.json({success: userSaveSuccess})
  * Create a new async POST route "/auth/login-user" and implement the following:
    * Add mongodb code to fetch a user from the database where the username matches the incoming username from req.body
      * const user = await collection.findOne({
          username: req.body.username
        })
    * Add the following code to check the users stored password with the req.body password:
      * const match = await bcrypt.compare(req.body.password, user.password);
    * Implement functionality at the end of the route to respond a json object. If the passwords match, then the object should have "success": true; if the passwords do not match, the object should have "success": false.
  
### Approach - Part 2A: Persistent Login

* First, we will add persist login functionality with JSON Web Tokens
* Second, we will create a new react app for our front-end
* Third, we will create some basic pages including the registration and login page
* Fourth, we will implement the auth flow functionality

### Requirements (Back-End - JWT Implementation)

* First, we will add persist login functionality with JSON Web Tokens

* In the server, implement the following:
  * In the root ./, install jsonwebtoken
    * npm i jsonwebtoken
  * in ./.env, add the following environment variables:
    * JWT_SECRET_KEY = CodeImmersives2022
    * TOKEN_HEADER_KEY = ci_token_header_key
  * In ./routes/auth.js, implement the following:
    * Add these three lines of code to the top of the file:
      * const dotenv = require('dotenv');
        const jwt = require('jsonwebtoken');
        dotenv.config();
    * In the "/auth/login-user" route, implement the following:
      * Add these lines of code AFTER you fetch the user from the database and authenticate their username/password credentials using bcrypt:
        * const jwtSecretKey = process.env.JWT_SECRET_KEY;
          const data = {
              time: new Date(),
              userId: user.uid // Note: Double check this line of code to be sure that user.uid is coming from your fetched mongo user 
          }
          const token = jwt.sign(data, jwtSecretKey);
      * At the end of the route, update the res.json method to send the token with the response along with the success message
        * res.json({success: true, token})
    * Add a new GET route "/auth/validate-token" and implement the following:
      * Add these lines of code to the route:
        * const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
          const jwtSecretKey = process.env.JWT_SECRET_KEY;
  
          try {
            const token = req.header(tokenHeaderKey);
      
            const verified = jwt.verify(token, jwtSecretKey);
            if(verified){
                return res.json({success: true});
            }else{
                // Access Denied
                throw Error("Access Denied")
            }
          } catch (error) {
            // Access Denied
            return res.status(401).json({success: false, message: String(error)});
          }