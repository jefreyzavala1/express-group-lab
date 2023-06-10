//containing all the functionality 
require('dotenv').config()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const data = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ _id: data._id })
    if (!user) {
      throw new Error()
    }
    req.user = user
    next()
  } catch (error) {
    res.status(401).send('Not authorized')
  }
}

exports.getUser = async (req, res) => {
    try { // This line starts a try-catch block, indicating that the following code may throw an error and provides a mechanism for handling it.
        const users = await User.find()//  Without await, the code would continue executing immediately after calling User.find(), and the users variable would not be assigned the actual result of the query. Using await ensures that the users variable contains the resolved value of the promise returned by User.find(), which in this case is the retrieved user data.
        res.json(users) // This line sends the retrieved users data as a JSON response. It uses the json() method of the res (response) object to convert the users data into JSON format and send it back to the client.
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// this line stats a try block and incating that the code inside the blick will be executed and 
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body)
    user.isLoggedIn = false
    await user.save()
    const token = await user.generateAuthToken()
    res.json({ user, token})
    
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
// 2. 
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
      res.status(400).send(('Invalid Login Attempt'))
    } else {
      
     //console.log(user)
      token = await user.generateAuthToken()
      res.json({ user, token})
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.updateUser = async (req, res) => {
    try {
        console.log(req.user)
        if (req.user.isLoggedIn) {
            const updates = Object.keys(req.body)
            const user = await User.findOne({ _id: req.params.id })
            if (!user) {
                throw new Error('User not found')
            }
            if (user.isLoggedIn) {
                updates.forEach(update => user[update] = req.body[update])
                await user.save()
                res.json(user)
            } else {
                res.status(401).json({ message: 'Log back in!' })
            }
        } else {
            res.status(401).json({ message: 'Log back in!' })
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

exports.deleteUser = async (req, res) => {
  try {
    if(req.user.isLoggedIn){
    await req.user.deleteOne()
    res.sendStatus(204)
}
    else{
        res.status(401).json({message:'Log back in!'})
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.logoutUser = async (req, res) => {
  try {
    req.user.isLoggedIn = false
    await req.user.save()
    res.json({message:'User successfully logged out!'})
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}