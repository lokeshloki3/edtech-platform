import React, { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Upload from '../Upload';
import { useForm } from 'react-hook-form';
import IconBtn from '../../../../common/IconBtn';
import toast from 'react-hot-toast';
import { useCreateSubSection, useUpdateSubSection } from '@/hooks/use-course-query';
import { useDispatch, useSelector } from 'react-redux';
import { setCourse } from '../../../../../slices/courseSlice';

const SubSectionModal = ({ modalData, setModalData, add = false, view = false, edit = false }) => {
  const [loading, setLoading] = useState(false);
  const { mutateAsync: createSubSection } = useCreateSubSection();
  const { mutateAsync: updateSubSection } = useUpdateSubSection();
  const dispatch = useDispatch();
  const { course } = useSelector((state) => state.course);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm();

  useEffect(() => {
    if (view || edit) {
      // console.log("modalData", modalData)
      setValue('lectureTitle', modalData.title);
      setValue('lectureDesc', modalData.description);
      setValue('lectureVideo', modalData.videoUrl);
    }
  }, []);

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues();
    // console.log("changes after editing form values:", currentValues)
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    ) {
      return true;
    }
    return false;
  };

  const onSubmit = async (data) => {
    // console.log(data);
    if (view) {
      return;
    }

    if (edit) {
      if (!isFormUpdated()) {
        toast.error('No changes made to the form');
      } else {
        handleEditSubSection();
      }
      return;
    }

    // handle adding new data not edited
    const formData = new FormData();
    formData.append('sectionId', modalData);
    formData.append('title', data.lectureTitle);
    formData.append('description', data.lectureDesc);
    formData.append('video', data.lectureVideo);
    setLoading(true);
    try {
      const result = await createSubSection(formData);
      // the endpoint answers with the section, so the course is rebuilt
      // around it before it goes back into the slice
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData ? result : section
      );
      dispatch(setCourse({ ...course, courseContent: updatedCourseContent }));
      setModalData(null);
    } catch {
      // the mutation hook has already surfaced the error
    } finally {
      setLoading(false);
    }
  };

  // handle the editing of subsection
  const handleEditSubSection = async () => {
    const currentValues = getValues();
    // console.log("changes after editing form values:", currentValues)
    const formData = new FormData();
    // console.log("Values After Editing form values:", currentValues)
    formData.append('sectionId', modalData.sectionId);
    formData.append('subSectionId', modalData._id);
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append('title', currentValues.lectureTitle);
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append('description', currentValues.lectureDesc);
    }
    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append('video', currentValues.lectureVideo);
    }
    setLoading(true);
    try {
      const result = await updateSubSection(formData);
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      );
      dispatch(setCourse({ ...course, courseContent: updatedCourseContent }));
      setModalData(null);
    } catch {
      // the mutation hook has already surfaced the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white/10 backdrop-blur-sm">
      <div className="border-global-stroke-tertiary bg-global-bg-surface my-10 w-11/12 max-w-[700px] rounded-lg border">
        {/* Modal Header */}
        <div className="bg-global-card-surface-2 flex items-center justify-between rounded-t-lg p-5">
          <p className="text-global-text-primary text-xl font-semibold">
            {view && 'Viewing'} {add && 'Adding'} {edit && 'Editing'} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})} className="cursor-pointer">
            <RxCross2 className="text-global-text-primary text-2xl" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-8 py-10">
          {/* Lecture Video Upload */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />
          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="lectureTitle" className="text-global-text-primary text-sm">
              Lecture Title {!view && <sup className="text-status-error">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register('lectureTitle', { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="text-status-error ml-2 text-xs tracking-wide">
                Lecture title is required
              </span>
            )}
          </div>
          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="lectureDesc" className="text-global-text-primary text-sm">
              Lecture Description {!view && <sup className="text-status-error">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register('lectureDesc', { required: true })}
              className="form-style resize-x-none min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="text-status-error ml-2 text-xs tracking-wide">
                Lecture Description is required
              </span>
            )}
          </div>
          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? 'Loading..' : edit ? 'Save Changes' : 'Save'}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubSectionModal;
