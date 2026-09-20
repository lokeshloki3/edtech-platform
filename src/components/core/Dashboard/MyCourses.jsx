import React, { useEffect, useState } from 'react'
import IconBtn from '../../common/IconBtn'
import { VscAdd } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'
import { fetchInstructorCourses } from '../../../services/operations/courseDetailsAPI'
import { useSelector } from 'react-redux'
import CoursesTable from './InstructorCourses/CoursesTable'
import toast from 'react-hot-toast'

const MyCourses = () => {

    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // const fetchCourses = async () => {
        //     const result = await fetchInstructorCourses(token);
        //     if (result) {
        //         setCourses(result);
        //     }
        //     // console.log("My courses with added total duration", result);
        // }
        const fetchCourses = async () => {
            const toastId = toast.loading("Loading...");
            try {
                const result = await fetchInstructorCourses(token);
                if (result) {
                    setCourses(result);
                    toast.success("Courses loaded", { id: toastId });
                } else {
                    toast.error("Failed to load courses", { id: toastId });
                }
            } catch (error) {
                toast.error("An error occurred while loading courses", { id: toastId });
            } finally {
                toast.dismiss(toastId);
            }
        };

        fetchCourses();
    }, [])

    return (
        <div>
            <div className='mb-14 flex items-center justify-between'>
                <h1 className='text-3xl font-medium text-richblack-5'>My Courses</h1>
                <IconBtn
                    text="Add Course"
                    onclick={() => navigate("/dashboard/add-course")}
                >
                    <VscAdd />
                </IconBtn>
            </div>
            {courses && <CoursesTable courses={courses} setCourses={setCourses} />}
        </div>
    )
}

export default MyCourses