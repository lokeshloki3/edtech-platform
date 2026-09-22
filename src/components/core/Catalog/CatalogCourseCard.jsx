import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../../common/RatingStars';
import GetAvgRating from '../../../utils/avgRating';

const CatalogCourseCard = ({ course, Height, showEnrollment }) => {
  const [avgReviewCount, setAvgReviewCount] = useState(0);

  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews);
    setAvgReviewCount(count);
  }, [course]);

  return (
    <div>
      <Link to={`/courses/${course._id}`}>
        <div>
          <div className="rounded-lg">
            <img
              src={course?.thumbnail}
              alt="Course thumbnail"
              className={`${Height} w-full rounded-xl object-cover`}
            />
          </div>
          <div className="flex flex-col gap-2 px-2 py-3">
            <p className="text-global-text-primary text-xl">{course?.courseName}</p>
            <p className="text-global-text-secondary text-sm">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-global-highlight-text">{avgReviewCount || 0}</span>
              <RatingStars Review_Count={avgReviewCount} />
              <span className="text-global-text-tertiary">
                {course?.ratingAndReviews?.length} Ratings
              </span>
              {showEnrollment && (
                <span className="text-global-text-tertiary">
                  ( {course?.studentsEnrolled?.length} Student(s) Enrolled )
                </span>
              )}
            </div>
            <p className="text-global-text-primary text-xl">Rs. {course?.price}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CatalogCourseCard;
