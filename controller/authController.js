const userModel = require("../model/userSchema");
const emailValidator = require("email-validator");
const bcrypt = require('bcrypt')


//logic of the code of signup
const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  console.log(name, email, password, confirmPassword);
  

  try {

    // every field is required
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All inputs are required",
      });
    }

    // validate email
    var validEmail = emailValidator.validate(email);
    if (!validEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password don't match",
      });
    }

    const userInfo = userModel(req.body);
    const result = await userInfo.save();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Account already exists",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};




//logic of the code of signin
const signin = async (req,res) => {

// return response with an error message if email of the password is missing
  if(!email || !password){
    return res.status(400).json({
      success: false,
      message: "All inputs are required",
    });
  }


  try {


    // check user exist or not
    const user = await userModel
     .findOne({email})
     .select('+password')

     // if the user is null or the password is incorrect return response with an error message
     if (!user || ! (await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
     }
    
   // assume user is exists and create jwttoken using userSchema method jwtToken()
   const token = user.jwtToken();
   user.password = undefined

   const cookieOptions = {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
 }

 res.cookie("token", token, cookieOptions)
 res.status(200).json({
  success: true,
  data: user
 })

  } catch (error) {
    
    res.status(400).json({
      success: false,
      message: error.message
     })

  }
}

// get user info
const getUser = async (req,res) => {
const userId = req.user.id;

try{
  const user = await userModel.findById(userId)
  return res.status(200).json({
    success: true,
    data: user
  })
} catch (error) {
    
  res.status(400).json({
    success: false,
    message: error.message
   })

}
}





// logic for forgot password
const forgotPassword = async (req, res, next) => {


  const email = req.body.email

  // return response with error message if email is undefined

  if(!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    })
  }


  try {

    // retrieve user using given email
    const user = await userModel.findOne({email})

    // return response with error message user not found 

    if(!user) {
      return res.status(400).json({
        successfalse,
        message: "user not found"
      })
    }

    // generate the token with the userSchema method getForgotPasswordToken()
    const forgotPasswordToken = user.getForgotPasswordToken()

    await user.save()
    return res.status(200).json({
      success: true,
      token : forgotPasswordToken
    })
    
  } catch (error) {
    
    return res.status(400).json({
      success: true,
      message: error.message
    })


  }
}



// logic for reset password

const resetPassword = async (req, res , next) => {

const { token } = req.param
const {password, confirmPassword} = req.body

// return error message if password or confirm password is missing

if(!password || !confirmPassword) {
  return req.status(400).json({
    success: true,
    message: "password and confirm password is required"
  })
}

// return error mesage if passwird and confirm password is not same
if( password !== confirmPassword){
  return res.status(400).json({
    success: true,
    message: "password and confirm password does not match"
  })
}

// Hash the "token" using cryto for retrirving the user from the database using the this hash token as a forgotPasswordToken

const hashToken = crypto.createHash("sha256").update(token).digest("hex")

try{
  const user = await userModel.findOne({
    forgotPasswordToken: hashToken,
    forgotPasswordExpiryDate: {
      $gt: new Date() // forgotPasswordExpiry Date() less than currenet date

    }
  })


  // return message if
  if(!user) {
    return res.status(400).json({
      success: false,
      message: " Invalid Token or token is expired"
    })
  }

  user.password = password;
  await user.save()

  user.forgotPasswordExpiryDate = undefined;
  user.forgotPasswordToken = undefined
  user.password = undefined

  return res.status(200).json({
    success: true,
    data: user
  })
} catch(error){
  return res.status(400).json({
    success: false,
    message: error.message
  })
}


}











//logic for log out
const logout = (req,res) => {

  try {

    const cookieOptions = {
      expires: new Date(),
      httpOnly: true
    }
    
    res.cookie("token", null, cookieOptions)
res.status(200).json({
  success: true,
  message: "Logged out!"
})

  } catch (error) {
    return res.status(400).json({
       success: false,
       message: error.message
      
    })
  }
}



module.exports = {
  signup,
  signin,
  getUser,
  logout
};
