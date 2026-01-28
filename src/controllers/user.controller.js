import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

    if (fullName || email || password || username === "") {
        throw new apiError(400, "All fields are required");
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User already exists with given email or username");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new apiError(400, "Avatar image is required");
    };

    const newUser = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = User.findById(newUser._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new apiError(500, "User registration failed, please try again");
    };

    return res.status(201).json(
        new apiResponse(201, createdUser, "User registered successfully")
    )



});




export {
    registerUser,
}