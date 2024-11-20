import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"



const registerUser = asyncHandler(async (req,res)=>{


  const {fullName,email,username,password} = req.body

  console.log(`email ${email}`);

  if(
    [fullName,email,username,password].some(()=>
    filed?.trim()===""
    )
  ){
    throw new ApiError(400,"All fields are required ")

  }

const existeduser =  User.findOne({
   $or:[{username},{email}]

  })

  if(existeduser){
    throw new ApiError(409,"User with email or username already exists")
  }

  req>files?.avatar[0]?.path
 
})





export {registerUser}