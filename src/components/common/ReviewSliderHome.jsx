import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { FreeMode, Pagination, Autoplay } from "swiper/modules"
import { apiConnector } from '../../services/apiConnector'
import { ratingsEndpoints } from '../../services/apis'
import Rating from 'react-rating';
import { FaStar } from "react-icons/fa";

const ReviewSliderHome = () => {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const truncateLength = 150;

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const { data } = await apiConnector("GET", ratingsEndpoints.REVIEWS_DETAILS_API);
        // console.log("Logging response in rating", data);

        if (data?.success) {
          setReviews(data?.data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  // console.log("Printing Reviews", reviews);

  return (
    <div className='text-white'>
      <div className='my-[50px] h-[184px] max-w-(--max-content-tab) lg:max-w-(--max-content)'>
        {loading ? (
          <div className='spinner'></div>
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
              }
            }}
            pagination={{ clickable: true }}
            className='w-full'
          >
            {reviews?.map((review, index) => (
              <SwiperSlide key={index}>
                <div className='flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25 rounded-lg h-56'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt='User_Image'
                      className='h-9 w-9 rounded-full object-cover'
                    />
                    <div className='flex flex-col'>
                      <h1 className='font-semibold text-richblack-5'>{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                      <h2 className='text-[12px] font-medium text-richblack-500'>
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>
                  <p className="font-medium text-richblack-25">
                    {review?.review.length > truncateLength
                      ? `${review?.review.slice(0, truncateLength)}...`
                      : `${review?.review}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-yellow-100">
                      {review.rating.toFixed(1)}
                    </h3>
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
  )
}

export default ReviewSliderHome