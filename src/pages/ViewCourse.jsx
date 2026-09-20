import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import { useDispatch, useSelector } from 'react-redux';
import { setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from '../slices/viewCourseSlice';
import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal';
import VideoDetailsSidebar from '../components/core/ViewCourse/VideoDetailsSidebar';

const ViewCourse = () => {

    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [reviewModal, setReviewModal] = useState(false);

    useEffect(() => {
        const setCourseSpecificDetails = async () => {
            const courseData = await getFullDetailsOfCourse(courseId, token);
            dispatch(setCourseSectionData(courseData.courseDetails.courseContent));
            dispatch(setEntireCourseData(courseData.courseDetails));
            dispatch(setCompletedLectures(courseData.completedVideos));
            let lectures = 0;
            courseData?.courseDetails?.courseContent?.forEach((sec) => {
                lectures += sec.subSection.length
            })
            dispatch(setTotalNoOfLectures(lectures));
        }
        setCourseSpecificDetails();
    }, [])

    return (
        <>
            <div className='relative flex flex-col md:flex-row-reverse gap-4 md:gap-0 min-h-[calc(100vh-3.5rem)]'>
                <div className='h-[calc(100vh-3.5rem)] flex-1 overflow-auto'>
                    <div className='mx-6'>
                        <Outlet />
                    </div>
                </div>
                <VideoDetailsSidebar setReviewModal={setReviewModal} />
            </div>
            {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
        </>
    )
}

export default ViewCourse