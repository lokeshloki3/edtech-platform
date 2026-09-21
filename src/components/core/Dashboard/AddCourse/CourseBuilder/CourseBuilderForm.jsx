import React, { useState } from 'react';
import IconBtn from '../../../../common/IconBtn';
import { useForm } from 'react-hook-form';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { MdNavigateNext } from 'react-icons/md';
import toast from 'react-hot-toast';
import { setStep, setEditCourse, setCourse } from '../../../../../slices/courseSlice';
import { useCreateSection, useUpdateSection } from '@/hooks/use-course-query';
import NestedView from './NestedView';

const CourseBuilderForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [editSectionName, setEditSectionName] = useState(null);
  const { course } = useSelector((state) => state.course);
  const dispatch = useDispatch();
  const { mutateAsync: createSection } = useCreateSection();
  const { mutateAsync: updateSection } = useUpdateSection();

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit();
      return;
    }
    setEditSectionName(sectionId);
    setValue('sectionName', sectionName);
  };

  const cancelEdit = () => {
    setEditSectionName(null);
    setValue('sectionName', '');
  };

  const goToNext = () => {
    if (course.courseContent.length === 0) {
      toast.error('Please add atleast one section');
      return;
    }
    if (course.courseContent.some((section) => section.subSection.length === 0)) {
      toast.error('Please add atleast one lecture in each section');
      return;
    }
    dispatch(setStep(3));
  };

  const goBack = () => {
    dispatch(setStep(1));
    dispatch(setEditCourse(true));
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = editSectionName
        ? await updateSection({
            sectionName: data.sectionName,
            sectionId: editSectionName,
            courseId: course._id,
          })
        : await createSection({
            sectionName: data.sectionName,
            courseId: course._id,
          });

      dispatch(setCourse(result));
      setEditSectionName(null);
      setValue('sectionName', '');
    } catch {
      // the mutation hook has already surfaced the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-global-stroke-primary bg-global-bg-surface mx-0 w-full space-y-8 rounded-md border-[1px] p-6 md:mx-auto">
      <p className="text-global-text-primary text-2xl font-semibold">Course Builder</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="sectionName" className="text-global-text-primary text-sm">
            Section Name <sup className="text-status-error">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register('sectionName', { required: true })}
            className="form-style w-full"
          />
          {errors.sectionName && (
            <span className="text-status-error ml-2 text-xs tracking-wide">
              Section name is required
            </span>
          )}
        </div>

        <div className="flex items-end gap-x-4">
          <IconBtn
            type="submit"
            disabled={loading}
            text={editSectionName ? 'Edit Section Name' : 'Create Section'}
            outline={true}
          >
            <IoAddCircleOutline size={20} className="text-global-highlight-text" />
          </IconBtn>
        </div>
      </form>

      {course.courseContent.length > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}

      {/* Next Prev Button */}
      <div className="flex justify-end gap-x-3">
        <button
          onClick={goBack}
          className="bg-button-tertiary-bg-default text-global-text-inverse flex cursor-pointer items-center gap-x-2 rounded-md px-[20px] py-[8px] font-semibold"
        >
          Back
        </button>

        <IconBtn disabled={loading} text="Next" onclick={goToNext}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </div>
  );
};

export default CourseBuilderForm;
