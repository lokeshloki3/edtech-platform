import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart } from '../../../../slices/cartSlice';
// import ReactStars from "react-rating-stars-component";
import { FaStar } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Rating from 'react-rating';
import GetAvgRating from '../../../../utils/avgRating';

const RenderCartCourses = () => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-1 flex-col">
      {cart.map((course, index) => (
        <div
          key={index}
          className={`flex w-full flex-wrap items-start justify-between gap-6 ${index !== cart.length - 1 && 'border-b-richblack-400 border-b pb-6'} ${index !== 0 && 'mt-6'}`}
        >
          <div className="flex flex-1 flex-col gap-4 xl:flex-row">
            <img
              src={course?.thumbnail}
              alt={course?.courseName}
              className="h-[148px] w-[220px] rounded-lg object-cover"
            />
            <div className="flex flex-col space-y-1">
              <p className="text-global-text-primary text-lg font-medium">{course?.courseName}</p>
              <p className="text-global-text-tertiary text-sm">{course?.category?.name}</p>

              <div className="flex items-center gap-2">
                <span className="text-global-highlight-text">
                  {GetAvgRating(course?.ratingAndReviews)}
                </span>
                <Rating
                  initialRating={GetAvgRating(course?.ratingAndReviews)}
                  readonly
                  emptySymbol={<FaStar className="text-white" />}
                  fullSymbol={<FaStar className="text-[#ffd700]" />}
                />

                <span className="text-global-text-tertiary">
                  {course?.ratingAndReviews?.length} Ratings
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={() => dispatch(removeFromCart(course._id))}
              className="border-global-stroke-secondary bg-global-card-surface-2 text-status-error flex cursor-pointer items-center gap-x-1 rounded-md border px-[12px] py-3"
            >
              <RiDeleteBin6Line />
              <span>Remove</span>
            </button>

            <p className="text-global-highlight-text-muted mb-6 text-3xl font-medium">
              Rs {course?.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RenderCartCourses;
