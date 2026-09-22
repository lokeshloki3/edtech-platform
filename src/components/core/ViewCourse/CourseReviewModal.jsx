import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
// import ReactStars from "react-rating-stars-component";
import IconBtn from '../../common/IconBtn';
import { useCreateRating } from '@/hooks/use-course-query';
import { useAuthStore } from '@/store/auth.store';
import Rating from 'react-rating';
import { FaStar } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';

const CourseReviewModal = ({ setReviewModal }) => {
  const user = useAuthStore((s) => s.user);
  const { courseEntireData } = useSelector((state) => state.viewCourse);
  const { mutate: submitRating, isPending } = useCreateRating();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue('courseExperience', '');
    setValue('courseRating', 0);
  }, []);

  const onSubmit = (data) => {
    submitRating(
      {
        courseId: courseEntireData?._id,
        rating: Number(data.courseRating),
        review: data.courseExperience,
      },
      { onSuccess: () => setReviewModal(false) }
    );
  };

  const ratingChanged = (newRating) => {
    setValue('courseRating', newRating);
  };

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white/10 backdrop-blur-sm">
      <div className="border-global-stroke-tertiary bg-global-bg-surface my-10 w-11/12 max-w-[700px] rounded-lg border">
        {/* Modal header */}
        <div className="bg-global-card-surface-2 flex items-center justify-between rounded-t-lg p-5">
          <p className="text-global-text-primary text-xl font-semibold">Add Review</p>
          <button onClick={() => setReviewModal(false)}>
            <RxCross2 className="text-global-text-primary cursor-pointer text-2xl" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <img
              src={user?.image}
              alt={user?.firstName + 'profile'}
              className="aspect-square w-[50px] rounded-full object-cover"
            />
            <div>
              <p className="text-global-text-primary font-semibold">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-global-text-primary text-sm">Posting Publicly</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col items-center">
            <Rating
              initialRating={0}
              onChange={ratingChanged}
              emptySymbol={<FaStar className="text-white" />}
              fullSymbol={<FaStar className="text-[#ffd700]" />}
            />

            <div className="flex w-11/12 flex-col space-y-2">
              <label htmlFor="courseExperience" className="text-global-text-primary text-sm">
                Add Your Experience <sup className="text-status-error">*</sup>
              </label>
              <textarea
                id="courseExperience"
                placeholder="Add Your Experience here"
                {...register('courseExperience', { required: true })}
                className="form-style resize-x-none min-h-[130px] w-full"
              />
              {errors.courseExperience && (
                <span className="text-status-error ml-2 text-xs tracking-wide">
                  Please add your experience
                </span>
              )}
            </div>

            {/* Cancel and Save buttons */}
            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              <button
                onClick={() => setReviewModal(false)}
                className="bg-button-tertiary-bg-default text-global-text-inverse flex cursor-pointer items-center gap-x-2 rounded-md px-[20px] py-[8px] font-semibold"
              >
                Cancel
              </button>
              <IconBtn disabled={isPending} text={isPending ? 'Saving...' : 'Save'} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseReviewModal;
