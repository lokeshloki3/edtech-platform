import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { FreeMode, Pagination, Autoplay } from 'swiper/modules';
import { useCourseReviews } from '@/hooks/use-course-query';
import Rating from 'react-rating';
import { FaStar } from 'react-icons/fa';

const ReviewSliderHome = () => {
  const { data: reviews = [], isLoading: loading } = useCourseReviews();
  const truncateLength = 150;

  // console.log("Printing Reviews", reviews);

  return (
    <div className="text-white">
      <div className="my-[50px] h-[184px] max-w-(--max-content-tab) lg:max-w-(--max-content)">
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <Swiper
            spaceBetween={25}
            slidesPerView={3}
            loop={true}
            autoplay={{
              delay: 2500, // Time in ms between slides
              disableOnInteraction: false, // Keep autoplay even after user interaction
              pauseOnMouseEnter: true, // Stop autoplay on hover
            }}
            modules={[FreeMode, Pagination, Autoplay]}
            breakpoints={{
              1024: {
                slidesPerView: 3,
              },
            }}
            pagination={{ clickable: true }}
            className="w-full"
          >
            {reviews?.map((review, index) => (
              <SwiperSlide key={index}>
                <div className="bg-global-bg-surface text-global-text-secondary flex h-56 flex-col gap-3 rounded-lg p-3 text-[14px]">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt="User_Image"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <p className="text-global-text-primary font-semibold">{`${review?.user?.firstName} ${review?.user?.lastName}`}</p>
                      <p className="text-global-text-disabled text-[12px] font-medium">
                        {review?.course?.courseName}
                      </p>
                    </div>
                  </div>
                  <p className="text-global-text-secondary font-medium">
                    {review?.review.length > truncateLength
                      ? `${review?.review.slice(0, truncateLength)}...`
                      : `${review?.review}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-global-highlight-text-muted font-semibold">
                      {review.rating.toFixed(1)}
                    </p>
                    <Rating
                      initialRating={review.rating}
                      readonly
                      emptySymbol={<FaStar className="text-white" />}
                      fullSymbol={<FaStar className="text-[#ffd700]" />}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default ReviewSliderHome;
