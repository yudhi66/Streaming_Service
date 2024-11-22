import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from  "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"



const generateAccessAndRefreshTokens= async(userId)=>{

  try {

   const user =await User.findById(userId)

   const accessToken =   user.generateAccessToken()
   const refreshToken =  user.generateRefreshToken()

  user.refreshToken=refreshToken;
  await  user.save({validateBeforeSave:false})

  return {accessToken,refreshToken}

  } catch (error) {
      throw new ApiError(500 ,"Something went wrong while generation refresh and access token")
  }
}




const registerUser = asyncHandler(async (req,res)=>{


  const {fullName,email,username,password} = req.body

  console.log(`email ${email}`);

  if(
    [fullName,email,username,password].some((field)=>
    field?.trim()===""
    )
  ){
    throw new ApiError(400,"All fields are required ")

  }

const existeduser = await User.findOne({
   $or:[{username},{email}]

  })

  if(existeduser){
    throw new ApiError(409,"User with email or username already exists")
  }

  console.log(req.files);
  

 const avatarLocalPath=    req.files?.avatar[0]?.path
 // const coverImageLocalPath=  req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
     coverImageLocalPath=req.files.coverImage[0].path
  }
 console.log(coverImageLocalPath);

 if(!avatarLocalPath){
  throw new ApiError(400,"Avatar file is required")
 }

 const avatar = await uploadOnCloudinary(avatarLocalPath); 
  const coverImage =await uploadOnCloudinary(coverImageLocalPath);
  console.log(coverImage);
  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }

 const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
  })

 const createdUser = await User.findById(user._id).select(
   "-password -refreshToken"
 )


  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering a user")
  }


  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully")
  )

})

const loginUser =asyncHandler(async (req,res)=>{

  const {email,username,password}=req.body

  if(!username && !email){
    throw new ApiError(400,"username or email is required")
  }

  const user =await       User.findOne({
    $or:[{username},{email}]
  })
 if(!user){
  throw new ApiError(404,"user does not exist")
 }

 
  const isPasswordValid= await user.isPasswordCorrect(password)
 if(!isPasswordValid){
  throw new ApiError(401,"Password is incorrect")
 }
  
 const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)
 

 const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
 const options={
  httpOnly:true,
  secure:true
 }

 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
  new ApiResponse(
     200,
     {
      user: loggedInUser,accessToken,refreshToken   

     },
     "User logged In Successfully"
    )
 )  

})

const logoutUser =asyncHandler(async(req,res)=>{
  User.findById

})





export {registerUser}