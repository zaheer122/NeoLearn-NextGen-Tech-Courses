import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { createCourse,  createLecture,  editCourse,  editLecture,  enrollCourse,  getCourseById,  getCourseLecture,  getCreatorCourses, getDashboardStats, getPublishedCourse, removeLecture, togglePublishedCourse } from "../controllers/course.controller.js"
import { singleUpload } from "../middleware/multer.js"

const router = express.Router()
router.route("/").post(isAuthenticated, createCourse)
router.route("/published-courses").get(getPublishedCourse)
router.route("/creator-courses").get(isAuthenticated,getCreatorCourses)
router.route("/dashboard-stats").get(isAuthenticated, getDashboardStats)
router.route("/:courseId").put(isAuthenticated, singleUpload, editCourse)
// router.route("/:courseId").put(isAuthenticated, editCourse)
router.route("/:courseId").get(isAuthenticated,getCourseById)
router.route("/:courseId/toggle-publish").patch(isAuthenticated, togglePublishedCourse)
router.route("/:courseId/enroll").post(isAuthenticated, enrollCourse)
router.route("/:courseId/lecture").post(isAuthenticated, singleUpload, createLecture)
router.route("/:courseId/lecture").get(isAuthenticated,  getCourseLecture)
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, singleUpload, editLecture)
router.route("/lecture/:lectureId").delete(isAuthenticated,  removeLecture)

export default router;