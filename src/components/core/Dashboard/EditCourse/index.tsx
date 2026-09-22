import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useFullCourseDetails } from '@/hooks/use-course-query';
import { useAppDispatch, useAppSelector } from '@/reducer/hooks';
import RenderSteps from '../AddCourse/RenderSteps';
import { setCourse, setEditCourse } from '../../../../slices/courseSlice';

const EditCourse = () => {
  const { courseId } = useParams();
  const dispatch = useAppDispatch();
  const { course } = useAppSelector((state) => state.course);

  const { data, isLoading } = useFullCourseDetails(courseId ?? '');

  // RenderSteps and its children edit the course through courseSlice, so the
  // fetched course is seeded there once it arrives.
  useEffect(() => {
    if (!data?.courseDetails) {
      return;
    }

    dispatch(setEditCourse(true));
    dispatch(setCourse(data.courseDetails));
  }, [data, dispatch]);

  if (isLoading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-global-text-primary mb-14 text-3xl font-medium">Edit Course</h1>
      <div className="mx-auto max-w-[600px] overflow-x-hidden md:overflow-x-visible">
        {course ? (
          <RenderSteps />
        ) : (
          <p className="text-global-text-secondary mt-14 text-center text-3xl font-semibold">
            Course not found
          </p>
        )}
      </div>
    </div>
  );
};

export default EditCourse;
