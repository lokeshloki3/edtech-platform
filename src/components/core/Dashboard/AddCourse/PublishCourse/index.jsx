import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import IconBtn from '../../../../common/IconBtn';
import { useDispatch, useSelector } from 'react-redux';
import { resetCourseState, setStep } from '../../../../../slices/courseSlice';
import { COURSE_STATUS } from '../../../../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useEditCourse } from '@/hooks/use-course-query';

const PublishCourse = () => {
  const { register, handleSubmit, setValue, getValues } = useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { course } = useSelector((state) => state.course);
  const { mutateAsync: editCourse } = useEditCourse();

  useEffect(() => {
    if (course?.status === COURSE_STATUS.PUBLISHED) {
      setValue('public', true);
    }
  }, []);

  const goBack = () => {
    dispatch(setStep(2));
  };

  const onSubmit = () => {
    handleCoursePublish();
  };

  const goToCourses = () => {
    dispatch(resetCourseState());
    navigate('/dashboard/my-courses');
  };

  const handleCoursePublish = async () => {
    // check if form has been updated or not
    if (
      (course?.status === COURSE_STATUS.PUBLISHED && getValues('public') === true) ||
      (course?.status === COURSE_STATUS.DRAFT && getValues('public') === false)
    ) {
      // form has not been updated
      // no need to make api call
      goToCourses();
      return;
    }

    // if updated
    const formData = new FormData();
    formData.append('courseId', course._id);
    const courseStatus = getValues('public') ? COURSE_STATUS.PUBLISHED : COURSE_STATUS.DRAFT;
    formData.append('status', courseStatus);
    setLoading(true);
    try {
      await editCourse(formData);
      goToCourses();
    } catch {
      // the mutation hook has already surfaced the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-global-stroke-primary bg-global-bg-surface mx-0 w-full rounded-md border-[1px] p-6 md:mx-auto">
      <p className="text-global-text-primary text-2xl font-semibold">Publish Settings</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Checkbox */}
        <div className="my-6 mb-8">
          <label htmlFor="public" className="inline-flex items-center text-lg">
            <input
              type="checkbox"
              id="public"
              {...register('public')}
              className="bg-global-surface-muted text-global-text-tertiary focus:ring-richblack-5 h-4 w-4 rounded border-gray-300 focus:ring-2"
            />
            <span className="text-global-text-tertiary ml-2 cursor-pointer">
              Make this course as public
            </span>
          </label>
        </div>

        {/* Next Prev Button */}
        <div className="ml-auto flex max-w-max items-center gap-x-4">
          <button
            disabled={loading}
            type="button"
            onClick={goBack}
            className="bg-button-tertiary-bg-default text-global-text-inverse flex cursor-pointer items-center gap-x-2 rounded-md px-[20px] py-[8px] font-semibold"
          >
            Back
          </button>
          <IconBtn disabled={loading} text="Save Changes" />
        </div>
      </form>
    </div>
  );
};

export default PublishCourse;
