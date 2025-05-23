import JWT from "jsonwebtoken"
import bcrypt from "bcryptjs";
import UserModel from "../Models/UserModel.js";
import createJSONWebToken from "../Utils/JsonWebToken.js";
import { uploadCloudinary } from "../Multer/Cloudinary.js";
import mongoose from "mongoose";


export const register = async (req, res) => {
    try {
        const { first_name, last_name, user_name, email, phone, join_date, password, confirm_password } = req.body

        if (!first_name) {
            return res.json({ first_name: 'field is required' })
        }
        if (!last_name) {
            return res.json({ last_name: 'field is required' })
        }
        if (!user_name) {
            return res.json({ user_name: 'field is required' })
        }
        if (!email) {
            return res.json({ email: 'field is required' })
        }
        if (!phone) {
            return res.json({ phone: 'field is required' })
        }
        if (!join_date) {
            return res.json({ join_date: 'field is required' })
        }
        if (!password) {
            return res.json({ password: 'field is required' })
        }
        if (!confirm_password) {
            return res.json({ confirm_password: 'field is required' })
        }

        // password and confirm password match
        if (password !== confirm_password) {
            return res.json({ massage: "Password and Confirm Password doesn't match" });
        }

        // Check for spaces or uppercase letters in the username
        if (/\s/.test(user_name) || /[A-Z]/.test(user_name)) {
            return res.json({ user_name: 'Username cannot contain spaces or uppercase letters' });
        }

        // existing username, email, phone chack
        const existing = await UserModel.exists({
            $or: [
                { user_name: user_name },
                { email: email },
                { phone: phone }
            ]
        });
        if (existing) {
            return res.json({
                success: false,
                message: "User is already registered please login"
            });
        }

        // store the user value
        const result = await new UserModel({
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + " " + last_name,
            user_name: user_name,
            email: email,
            phone: phone,
            join_date: join_date,
            password: password,
        }).save();

        if (result) {
            return res.json({
                success: true,
                massage: 'User Register Successfully',
                payload: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

// filter by ?search=sabbir&role=user&suspended=true&join_date_from=2024-10-05
export const show = async (req, res) => {
    try {
        const search = req.query.search || "";
        const suspended = req.query.suspended || "";
        const role = req.query.role || "";
        const join_date_from = req.query.join_date_from || "";
        const join_date_to = req.query.join_date_to || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const searchQuery = new RegExp('.*' + search + '.*', 'i');

        // Add search filter
        const dataFilter = {
            isAdmin: { $ne: true }, //If user is admin then it will not show (String)
            // role: { $nin: ["admin", "manager"] }, // If user is admin & manager then it will not show (Array)
            $or: [
                { full_name: { $regex: searchQuery } },
                { user_name: { $regex: searchQuery } },
                { email: { $regex: searchQuery } },
                { phone: { $regex: searchQuery } },
            ]
        }

        // Add role filter
        if (role) {
            dataFilter.role = role;
        }

        // Add suspended filter
        if (suspended !== "") {
            dataFilter.isSuspended = suspended === "true"; // Convert to boolean
        }

        // Add date filter
        if (join_date_from || join_date_to) {
            dataFilter.join_date = {};
            if (join_date_from) {
                dataFilter.join_date.$gte = new Date(join_date_from); // From date
            }
            if (join_date_to) {
                dataFilter.join_date.$lte = new Date(join_date_to); // To date
            }
        }

        // Hide specific fields
        const options = { password: 0, first_name: 0, last_name: 0 };

        const result = await UserModel.find(dataFilter, options)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)

        const count = await UserModel.find(dataFilter).countDocuments();

        // Check not found
        if (result.length === 0) {
            return res.json({ message: "No Data found" });
        } else {
            const formattedResult = result.map(user => {
                const formattedDate = new Intl.DateTimeFormat('en-GB').format(new Date(user.join_date));
                return { ...user._doc, join_date: formattedDate };
            });
            return res.json({
                success: true,
                massage: 'Item Show Successfully',
                pagination: {
                    per_page: limit,
                    current_page: page,
                    total_data: count,
                    total_page: Math.ceil(count / limit),
                    previous: page - 1 > 0 ? page - 1 : null,
                    next: page + 1 <= Math.ceil(count / limit) ? page + 1 : null
                },
                payload: formattedResult,
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const single = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserModel.findById(id).select("-password");

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // Check not found
        if (!result) {
            return res.json({ message: "Data not found" });
        } else {
            return res.json({
                success: true,
                massage: 'Item Show Successfully',
                payload: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const update = async (req, res) => {
    try {
        const { id } = req.params
        const { first_name, last_name, user_name, email, phone, address, profile_image, password, confirm_password } = req.body

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // check user is exist or not
        const findUser = await UserModel.findById(id);
        if (!findUser) {
            return res.json({ massage: "User not found" });
        }

        // image upload
        const image = req.file ? req.file.filename : (profile_image || findUser.profile_image);

        // not an empty string
        if (!first_name || first_name.trim() === "") {
            return res.json({ first_name: "is required and cannot be empty" });
        }

        if (!last_name || last_name.trim() === "") {
            return res.json({ last_name: "is required and cannot be empty" });
        }

        if (!user_name || user_name.trim() === "") {
            return res.json({ user_name: "is required and cannot be empty" });
        }

        if (!email || email.trim() === "") {
            return res.json({ email: "is required and cannot be empty" });
        }

        if (!phone || phone.trim() === "") {
            return res.json({ phone: "is required and cannot be empty" });
        }

        // if (!password || password.trim() === "") {
        //     return res.json({ password: "is required and cannot be empty" });
        // }

        // // password and confirm password mach
        // if (password !== confirm_password) {
        //     return res.json({ massage: "Password and Confirm Password doesn't match" });
        // }

        // existing user name chack
        const exist_user = await UserModel.exists({ user_name: user_name });
        if (exist_user && exist_user._id.toString() !== id) {
            return res.json({ message: 'User Name is already exists' });
        }

        // existing email chack
        const exist_email = await UserModel.exists({ email: email });
        if (exist_email && exist_email._id.toString() !== id) {
            return res.json({ message: 'Email is already exists' });
        }

        // existing phone chack
        const exist_phone = await UserModel.exists({ phone: phone });
        if (exist_phone && exist_phone._id.toString() !== id) {
            return res.json({ message: 'Phone Number already exists' });
        }

        // bcrypt password
        // const salt = await bcrypt.genSalt(10);
        // const bcryptPassword = await bcrypt.hash(password, salt);

        // update
        const result = await UserModel.findByIdAndUpdate(id, {
            first_name: first_name,
            last_name: last_name,
            full_name: first_name + " " + last_name,
            user_name: user_name,
            email: email,
            phone: phone,
            address: address,
            profile_image: image,
            // password: password
        }, { new: true })

        if (result) {
            return res.json({
                success: true,
                massage: 'Item Update Successfully',
                payload: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.params

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        const result = await UserModel.findByIdAndDelete(id);

        // Check not found
        if (!result) {
            return res.json({ message: "Data not found" });
        } else {
            return res.json({
                success: true,
                massage: 'Item Destroy Successfully',
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const login = async (req, res) => {
    try {

        // Check if the user is already logged in
        const accessTokenExists = req.cookies.accessToken;
        const refreshTokenExists = req.cookies.refreshToken;

        if (accessTokenExists || refreshTokenExists) {
            return res.json({
                success: false,
                message: 'User is already logged in.',
            });
        }

        const { user, password } = req.body

        if (!user) {
            return res.json({ user: "Phone or email feild is required" })
        }

        if (!password) {
            return res.json({ password: "Password feild is required" })
        }

        // Find by existing username, email, phone
        const existing = await UserModel.findOne({
            $or: [
                { user_name: user },
                { email: user },
                { phone: user }
            ]
        })
        if (!existing) {
            return res.json({ message: "Invalid credentials please register" })
        }

        // Check password match
        const passwordMatch = await bcrypt.compare(password, existing.password);
        if (!passwordMatch) {
            return res.json({ message: 'Invalid credentials password does not match' });
        }

        // create access token with set the cookie
        const accessToken = createJSONWebToken({ existing }, process.env.JWT_ACCESS_SECRET_KEY, "1h")
        res.cookie('accessToken', accessToken, {
            maxAge: 60 * 60 * 1000, //1 hours
            secure: true,
            httpOnly: true,
            sameSite: 'none'
        })

        // create refresh token with set the cookie
        const refreshToken = createJSONWebToken({ existing }, process.env.JWT_REFRESH_SECRET_KEY, '7d')
        res.cookie('refreshToken', refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 day
            secure: true,
            httpOnly: true,
            sameSite: 'none'
        })

        return res.json({
            success: true,
            massage: 'User Login Successfully',
            payload: {
                first_name: existing.first_name,
                last_name: existing.last_name,
                full_name: existing.first_name + existing.last_name,
                user_name: existing.user_name,
                email: existing.email,
                phone: existing.phone,
                address: existing.address,
                isAdmin: existing.isAdmin,
                isSuspended: existing.isSuspended,
                profile_image: existing.profile_image,
                role: existing.role,
            },
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const logout = async (req, res) => {
    try {
        // chack if user is already login or logout
        const accessTokenExists = req.cookies.accessToken;
        const refreshTokenExists = req.cookies.refreshToken;

        if (!accessTokenExists && !refreshTokenExists) {
            return res.json({
                success: false,
                message: 'User is already logged out.',
            });
        }

        // if user is login than logout
        const access = res.clearCookie('accessToken')
        const refresh = res.clearCookie('refreshToken')

        if (access && refresh) {
            return res.json({
                success: true,
                massage: 'User Logout Successfully',
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const passwordChange = async (req, res) => {
    try {
        const { id } = req.params;
        const { old_password, new_password, confirm_password } = req.body

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // existing user chack
        const existing = await UserModel.findById(id);
        if (!existing) {
            return res.json({ message: "User not found" });
        }

        if (!old_password) {
            return res.json({ old_password: 'field is required' })
        }
        if (!new_password) {
            return res.json({ new_password: 'field is required' })
        }
        if (!confirm_password) {
            return res.json({ confirm_password: 'field is required' })
        }

        // match old password
        const isMatch = await bcrypt.compare(old_password, existing.password);
        if (!isMatch) {
            return res.json({ message: 'Old password is incorrect' });
        }

        // password and confirm password match
        if (new_password !== confirm_password) {
            return res.json({ massage: "New password and Confirm Password doesn't match" });
        }

        // bcrypt password
        // const salt = await bcrypt.genSalt(10);
        // const bcryptPassword = await bcrypt.hash(new_password, salt);

        // update user password
        const result = await UserModel.findByIdAndUpdate(id, { password: new_password }, { new: true })
        if (result) {
            return res.json({
                success: true,
                massage: 'Password change successfully',
                result: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const changeRole = async (req, res) => {
    try {
        const { id } = req.params
        const { role } = req.body

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // existing user chack
        const existing = await UserModel.findById(id);
        if (!existing) {
            return res.json({ message: "User not found" });
        }

        if (!role) {
            return res.json({ role: 'Role is required' })
        }

        if (!['user', 'manager'].includes(role)) {
            return res.json({ role: 'Invalid role' });
        }

        const result = await UserModel.findByIdAndUpdate(id, { role: role }, { new: true });

        if (result) {
            return res.json({
                success: true,
                massage: 'Role Update successfully',
                payload: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const isSuspended = async (req, res) => {
    try {
        const { id } = req.params
        const { isSuspended } = req.body

        // Validate the mongoose id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        // existing user chack
        const existing = await UserModel.findById(id);
        if (!existing) {
            return res.json({ message: "User not found" });
        }

        if (!isSuspended) {
            return res.json({ isSuspended: 'String type-(Boolean) is required' })
        }

        const result = await UserModel.findByIdAndUpdate(id, { isSuspended: isSuspended }, { new: true });

        if (result) {
            return res.json({
                success: true,
                massage: 'Role Update successfully',
                payload: result
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const tokenGenerate = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies?.refreshToken
        if (!oldRefreshToken) {
            return res.json({ message: 'Access denied. No token provided. Please login' });
        }

        const decoded = JWT.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET_KEY)
        if (!decoded) {
            return res.json({ message: 'Invalid token. Please login' });
        }

        const accessToken = createJSONWebToken(decoded.existing, process.env.JWT_ACCESS_SECRET_KEY, "1h")
        res.cookie('accessToken', accessToken, {
            maxAge: 60 * 60 * 1000, //1 hours
            httpOnly: true,
            sameSite: 'none'
        })

        if (accessToken) {
            return res.json({
                success: true,
                massage: 'Access token generated successful',
                payload: accessToken
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}

export const protectedRoutes = async (req, res) => {
    try {
        const accessToken = req.cookies?.accessToken
        if (!accessToken) {
            return res.json({ message: 'Access denied. No token provided. Please login' });
        }
        const decoded = JWT.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY)
        if (!decoded) {
            return res.json({ message: 'Invalid token. Please login' });
        }

        if (decoded) {
            return res.json({
                success: true,
                massage: 'Protected routes successful',
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
}