import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BsFillCaretRightFill } from 'react-icons/bs';
import { FaShareSquare } from 'react-icons/fa';
import toast from 'react-hot-toast';
import copy from 'copy-to-clipboard';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import { useAuthStore } from '@/store/auth.store';

const CourseDetailsCard = ({
  course,
  // setConfirmationModal,
  handleBuyCourse,
  handleAddToCart,
}) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart || { cart: [] });

  const { thumbnail: ThumbnailImage, price: CurrentPrice, _id: courseId } = course;

  const isCourseInCart = cart?.some((item) => item._id === courseId);

  const handleShare = () => {
    copy(window.location.href);
    toast.success('Link copied to clipboard');
  };

  return (
    <div>
      <div className="bg-global-card-surface-2 text-global-text-primary flex flex-col gap-4 rounded-md p-4">
        {/* Course Image */}
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />

        <div className="px-4">
          <div className="space-x-3 pb-4 text-3xl font-semibold">Rs. {CurrentPrice}</div>

          {/* if user not logged in then -> user?.accountType false -> Buy Now */}
          <div className="flex flex-col gap-4">
            {/* Show to non-logged in OR student */}
            {(!user || user?.accountType === ACCOUNT_TYPE.STUDENT) && (
              <button
                className="yellowButton"
                onClick={
                  user?.accountType === ACCOUNT_TYPE.STUDENT &&
                  course?.studentsEnrolled.includes(user?._id)
                    ? () => navigate('/dashboard/enrolled-courses')
                    : handleBuyCourse
                }
              >
                {user?.accountType === ACCOUNT_TYPE.STUDENT &&
                course?.studentsEnrolled.includes(user?._id)
                  ? 'Go To Course'
                  : 'Buy Now'}
              </button>
            )}
            {/* Only show Add to Cart / Go to Cart if student + not enrolled */}
            {user?.accountType === ACCOUNT_TYPE.STUDENT &&
              !course?.studentsEnrolled.includes(user?._id) &&
              (isCourseInCart ? (
                <button onClick={() => navigate('/dashboard/cart')} className="blackButton">
                  Go to Cart
                </button>
              ) : (
                <button onClick={handleAddToCart} className="blackButton">
                  Add to Cart
                </button>
              ))}
          </div>
          <p className="text-global-text-secondary pt-6 pb-3 text-center text-sm">
            30-Day Money-Back Guarantee
          </p>

          <p className="my-2 text-xl font-semibold">This Course Includes :</p>
          <div className="text-status-success flex flex-col gap-3 text-sm">
            {course?.instructions?.map((item, index) => (
              <p className="flex gap-2" key={index}>
                <BsFillCaretRightFill />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
        <div className="text-center">
          <button
            className="mc-auto text-global-highlight-text-muted flex cursor-pointer items-center gap-2 py-6"
            onClick={handleShare}
          >
            <FaShareSquare size={15} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsCard;
