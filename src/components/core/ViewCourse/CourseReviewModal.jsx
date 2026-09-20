import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
// import ReactStars from "react-rating-stars-component";
import IconBtn from '../../common/IconBtn';
import { createRating } from '../../../services/operations/courseDetailsAPI';
import Rating from 'react-rating';
import { FaStar } from 'react-icons/fa';
import { RxCross2 } from "react-icons/rx";

const CourseReviewModal = ({ setReviewModal }) => {

  const { user } = useSelector((state) => state.profile);
  const { courseEntireData } = useSelector((state) => state.viewCourse);
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue("courseExperience", "");
    setValue("courseRating", 0);
  }, [])

  const onSubmit = async (data) => {
    await createRating(
      {
        courseId: courseEntireData._id,
        rating: data.courseRating,
        review: data.courseExperience,
      },
      token
    );
    setReviewModal(false);
  }

  const ratingChanged = (newRating) => {
    setValue("courseRating", newRating);
  }

  return (
    <div className='fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white/10 backdrop-blur-sm'>
      <div className='my-10 w-11/12 max-w-[700px] rounded-lg border border-global-stroke-tertiary bg-global-bg-surface'>
        {/* Modal header */}
        <div className='flex items-center justify-between rounded-t-lg bg-global-card-surface-2 p-5'>
          <p className='text-xl font-semibold text-global-text-primary'>Add Review</p>
          <button
            onClick={() => setReviewModal(false)}
          >
            <RxCross2 className="text-2xl text-global-text-primary cursor-pointer" />
          </button>
        </div>

        {/* Modal body */}
        <div className='p-6'>
          <div className='flex items-center justify-center gap-x-4'>
            <img
              src={user?.image}
              alt={user?.firstName + "profile"}
              className='aspect-square w-[50px] rounded-full object-cover'
            />
            <div>
              <p className="font-semibold text-global-text-primary">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-global-text-primary">Posting Publicly</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='mt-6 flex flex-col items-center'
          >
            {/* <ReactStars
              count={5}
              onChange={ratingChanged}
              size={24}
              activeColor="#ffd700"
            /> */}
            <Rating
              initialRating={0}
              onChange={ratingChanged}
              emptySymbol={<FaStar className="text-white" />}
              fullSymbol={<FaStar className="text-[#ffd700]" />}
            />

            <div className='flex w-11/12 flex-col space-y-2'>
              <label htmlFor='courseExperience' className='text-sm text-global-text-primary'>
                Add Your Experience <sup className="text-status-error">*</sup>
              </label>
              <textarea
                id='courseExperience'
                placeholder='Add Your Experience here'
                {...register("courseExperience", { required: true })}
                className='form-style resize-x-none min-h-[130px] w-full'
              />
              {
                errors.courseExperience && (
                  <span className="ml-2 text-xs tracking-wide text-status-error">
                    Please add your experience
                  </span>
                )
              }
            </div>

            {/* Cancel and Save buttons */}
            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              <button
                onClick={() => setReviewModal(false)}
                className="flex cursor-pointer items-center gap-x-2 rounded-md bg-button-tertiary-bg-default py-[8px] px-[20px] font-semibold text-global-text-inverse"
              >
                Cancel
              </button>
              <IconBtn
                text="Save"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CourseReviewModal