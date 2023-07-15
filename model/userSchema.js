const mongoose = require('mongoose')
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { Schema } = mongoose;

const userSchema = new Schema({

name: {
    type: String,
    required: [true, "Username is required"],
    minLength: [5, "Name must be at least 5 char"],
    maxLength: [50, "Name must be less than 50 char"],
    trim: true
},

email: {
    type: String,
    required: [true, "Email is required"],
    unique:[true, "Email is already registered"],
    lowercase:true
},

password: {
   type: String,
   select: false 
},

forgotPasswordToken: {
    type: String
},

forgotPasswordExpiryDate: {
    type: Date
 }


},{
    timestamps: true
})

//predefined function for make sure password is encrypted
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
    return next()
})




//token for password
userSchema.methods = {
     jwtToken() {
          return JWT.sign(
            {id: this._id, email: this.email},
            process.env.SECRET,
            { expiresIn: '24h'}
          )
     },

     // userSchema method for generating and return forgot password
    getForgotPasswordToken() {

        const forgotToken = crypto.randomBytes(20).toString("hex")
        // step1 - save to DB
        this.forgotPasswordToken = crypto
          .createHash("sha256")
          .update(forgotToken)
          .digest("hex")
        
          // forgot password expiry date
         this.forgotPasswordExpiryDate = Date.now() + 20 * 60 * 1000 // 20 min
        
        
         // step2 - return value to user
         return forgotToken
        
            }
        

}

const userModel = mongoose.model('user',userSchema)

module.exports = userModel
 