import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';

import { useFullCourseDetails } from '@/hooks/use-course-query';
import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal';
import VideoDetailsSidebar from '../components/core/ViewCourse/VideoDetailsSidebar';
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from '../slices/viewCourseSlice';

const ViewCourse = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const [reviewModal, setReviewModal] = useState(false);

  const { data: courseData } = useFullCourseDetails(courseId ?? '');

  // The player and its sidebar read the course out of viewCourseSlice, so the
  // query result is pushed there once it lands. That slice is the next thing
  // to migrate; until then this effect is the bridge.
  useEffect(() => {
    if (!courseData) {
      return;
    }

    dispatch(setCourseSectionData(courseData.courseDetails.courseContent));
    dispatch(setEntireCourseData(courseData.courseDetails));
    dispatch(setCompletedLectures(courseData.completedVideos));

    const lectures = courseData.courseDetails.courseContent.reduce(
      (total, section) => total + section.subSection.length,
      0
    );
    dispatch(setTotalNoOfLectures(lectures));
  }, [courseData, dispatch]);

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col gap-4 md:flex-row-reverse md:gap-0">
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  );
};

export default ViewCourse;
