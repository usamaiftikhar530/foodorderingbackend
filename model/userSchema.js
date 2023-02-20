const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    cpassword: {
        type:String,
        required:true
    },
    messages: [
        {
            message:{
                type: String,
                required: true
            }
        }
    ],
    products: [
        {
            product:{
                type: String
            }
        }
    ],
    tokens: [
        {
            token: {
                type:String,
                required:true
            }
        }
    ]
})


//Password Hashing
userSchema.pre('save',async function (next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12);
        this.cpassword = await bcrypt.hash(this.cpassword,12);
    }
    next();
})


//Generating Token
userSchema.methods.generateAuthToken = async function(){
    try {
        let token = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
        
    } catch (err) {
        console.log(err);
    }
}

// Store The Message
userSchema.methods.addMessage = async function(message){
    try {
        this.messages = this.messages.concat({message});
        await this.save();
        return this.messages;
    } catch (err) {
        console.log(err);
    }
}

//Store The Product
userSchema.methods.addProduct = async function(productName){
    try {
        this.products = this.products.concat({product: productName});
        await this.save();
        return this.products;
    } catch (error) {
        console.log(error);
    }
}

//Delete The Product
userSchema.methods.deleteProduct = async function(productName){
    try {
        this.products = this.products.filter(function (item){
            return item.product !== productName;
        })
        
        await this.save();
        return this.products;
    } catch (error) {
        console.log(error);
    }
}



const User = mongoose.model('USER',userSchema);
module.exports = User;

