import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getInstructorData } from '../../../services/operations/profileAPI';
import { fetchInstructorCourses } from '../../../services/operations/courseDetailsAPI';
import { Link } from 'react-router-dom';
import { MdWavingHand } from "react-icons/md";
import InstructorChart from "./InstructorDashboard/InstructorChart";

const Instructor = () => {

  const { user } = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const [instructorData, setInstructorData] = useState(null);

  useEffect(() => {
    const getCourseDataWithStats = async () => {
      setLoading(true);
      const instructorApiData = await getInstructorData(token);
      const result = await fetchInstructorCourses(token);

      // console.log("Instructor API Data", instructorApiData);
      // console.log("Instructor Courses Data", result);

      if (instructorApiData.length) {
        setInstructorData(instructorApiData);
      }

      if (result) {
        setCourses(result);
      }
      setLoading(false);
    }
    getCourseDataWithStats();
  }, [])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0);
  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0);

  return (
    <div>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold text-global-text-primary flex items-center gap-2'>
          Hi {user?.firstName} <MdWavingHand className='text-global-highlight-text-muted' />
        </h1>
        <p className="font-medium text-global-text-tertiary">
          Let's start something new
        </p>
      </div>

      {loading ? (
        <div className='spinner'></div>
      ) : courses.length > 0 ? (
        <div>
          <div className='my-4 flex flex-col md:flex-row gap-2 md:gap-0 h-full md:h-[450px] space-x-4'>
            {/* Render chart /graph */}
            {totalAmount > 0 || totalStudents > 0 ? (
              <InstructorChart courses={instructorData} />
            ) : (
              <div className="flex-1 rounded-md bg-global-bg-surface p-6">
                <p className="text-lg font-bold text-global-text-primary">Visualize</p>
                <p className="mt-4 text-xl font-medium text-global-text-secondary">
                  Not Enough Data To Visualize
                </p>
              </div>
            )}
            {/* Total Statistics */}
            <div className='flex min-w-[250px] flex-col rounded-md bg-global-bg-surface p-6'>
              <p className='text-lg font-bold text-global-text-primary'>Statistics</p>
              <div className='mt-4 space-y-4'>
                <div>
                  <p className='text-lg text-global-text-tertiary'>Total Courses</p>
                  <p className='text-3xl font-semibold text-global-text-secondary'>{courses.length}</p>
                </div>
                <div>
                  <p className='text-lg text-global-text-tertiary'>Total Students</p>
                  <p className='text-3xl font-semibold text-global-text-secondary'>{totalStudents}</p>
                </div>
                <div>
                  <p className='text-lg text-global-text-tertiary'>Total Income</p>
                  <p className='text-3xl font-semibold text-global-text-secondary'>Rs {totalAmount}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='rounded-md bg-global-bg-surface p-6'>
            {/* Render 3 Courses */}
            <div className='flex items-center justify-between'>
              <p className='text-lg font-bold text-global-text-primary'>Your Courses</p>
              <Link to="/dashboard/my-courses">
                <p className='text-xs font-semibold text-global-highlight-text'>View All</p>
              </Link>
            </div>
            <div className='my-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start space-x-6'>
              {courses.slice(0, 3).map((course) => (
                <div className='w-full md:w-1/3' key={course._id}>
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className='h-[201px] w-full rounded-md object-cover'
                  />
                  <div className="mt-3 w-full">
                    <p className="text-sm font-medium text-global-text-secondary">
                      {course.courseName}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-xs font-medium text-global-text-tertiary">
                        {course.studentsEnrolled.length} students
                      </p>
                      <p className="text-xs font-medium text-global-text-tertiary">
                        |
                      </p>
                      <p className="text-xs font-medium text-global-text-tertiary">
                        Rs. {course.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-20 rounded-md bg-global-bg-surface p-6 py-20">
          <p className="text-center text-2xl font-bold text-global-text-primary">
            You have not created any courses yet
          </p>
          <Link to="/dashboard/add-course">
            <p className="mt-1 text-center text-lg font-semibold text-global-highlight-text">
              Create a course
            </p>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Instructor