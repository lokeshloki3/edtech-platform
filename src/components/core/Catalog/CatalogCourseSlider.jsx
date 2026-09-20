import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { FreeMode, Pagination, Autoplay } from "swiper/modules"
import CatalogCourseCard from './CatalogCourseCard'

const CatalogCourseSlider = ({ Courses, delay }) => {
    return (
        <div>
            {Courses?.length ? (
                <Swiper
                    spaceBetween={25}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: delay || 3000, // Time in ms between slides
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
                    className='max-h-[30rem]'
                >
                    {Courses?.map((course, index) => (
                        <SwiperSlide key={index}>
                            <CatalogCourseCard course={course} Height={"h-[250px]"} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <p className='text-xl text-richblack-5'>No Course Found</p>
            )}
        </div>
    )
}

export default CatalogCourseSlider