import express from "express"
import * as UserController from "../Controllers/UserController.js"
import * as TrainerController from "../Controllers/TrainerController.js"
import * as CoursesController from "../Controllers/CoursesController.js"
import * as StudentController from "../Controllers/StudentController.js"
// import { isLogin, isLogout } from "../Middlewares/AuthMiddleware.js";
import upload from "../Multer/Multer.js";
const router = express.Router()

// Public routes || Login and Register
router.post("/auth/register", UserController.register)
router.post("/auth/login", UserController.login)
router.post("/auth/logout", UserController.logout)
router.get("/auth/access-token-generate", UserController.tokenGenerate)
router.get("/auth/protected-routes", UserController.protectedRoutes)

// Private routes || Users
router.get("/auth/users", UserController.show)
router.get("/auth/users/:id", UserController.single)
router.put("/auth/users/:id", upload.single("profile_image"), UserController.update)
router.patch("/auth/users/password-change/:id", UserController.passwordChange)
router.patch("/auth/users/role/:id", UserController.changeRole)
router.patch("/auth/users/suspended/:id", UserController.isSuspended)
router.delete("/auth/users/:id", UserController.destroy)

// mongoose id validation
// router.get("/auth/users/:id([0-9a-fA-F]{24})", UserController.single)

// Private routes || Trainer
router.post("/trainer/trainer", upload.single("trainer_image"), TrainerController.store)
router.get("/trainer/trainer", TrainerController.show)
router.get("/trainer/trainer/:id", TrainerController.single)
router.put("/trainer/trainer/:id", upload.single("trainer_image"), TrainerController.update)
router.delete("/trainer/trainer/:id", TrainerController.destroy)

// Private routes || Product
router.post("/courses/courses", CoursesController.store)
router.get("/courses/courses", CoursesController.show)
router.get("/courses/courses/:id", CoursesController.single)
router.put("/courses/courses/:id", CoursesController.update)
router.delete("/courses/courses/:id", CoursesController.destroy)

// Private routes || Student
// router.post("/student/student", upload.array('images', 5), AddToCartController.store)
router.post("/student/student", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 5 }]), StudentController.store)
// router.get("/inventory/product", ProductController.show)
// router.get("/inventory/product/:id", ProductController.single)
// router.put("/inventory/product/:id", ProductController.update)
// router.delete("/inventory/product/:id", ProductController.destroy)


export default router