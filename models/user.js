require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    isLoggedIn:Boolean
})


userSchema.pre('save', async function(next){ 
  if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password,8)
  }
next() //calls the next thing
})

userSchema.methods.generateAuthToken = async function(){
    this.isLoggedIn = true
      await this.save()
    const token = jwt.sign({_id:this._id},process.env.SECRET)
    this.token = token
    return token
}


const User = mongoose.model('User',userSchema)
module.exports = User;


