import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import IconBtn from "../../common/IconBtn";
import { useSelector } from 'react-redux';
import { IoIosArrowBack } from "react-icons/io";
import { BsChevronDown } from "react-icons/bs";

const VideoDetailsSidebar = ({ setReviewModal }) => {

  const navigate = useNavigate();
  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse);
  const [activeStatus, setActiveStatus] = useState("");
  const [videoBarActive, setVideoBarActive] = useState("");
  const location = useLocation();
  const { sectionId, subSectionId } = useParams();

  useEffect(() => {
    const setActiveFlags = () => {
      if (!courseSectionData.length) {
        return;
      }

      const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
        (data) => data._id === subSectionId
      )
      const activeSubSectionId = courseSectionData[currentSectionIndex]?.subSection?.[currentSubSectionIndex]?._id;
      // set current section
      setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);
      // set current sub-section
      setVideoBarActive(activeSubSectionId);
    }
    setActiveFlags();
  }, [courseSectionData, courseEntireData, location.pathname])

  return (
    <>
      <div className='flex h-[calc(100vh-3.5rem)] w-full md:w-[320px] md:max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800'>
        {/* For buttons and headings */}
        <div className='flex flex-col items-start justify-between mx-5 gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25'>
          {/* For buttons */}
          <div className='flex w-full items-center justify-between'>
            <div
              onClick={() => {
                navigate("/dashboard/enrolled-courses")
              }}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90 cursor-pointer"
              title='Back'
            >
              <IoIosArrowBack size={30} />
            </div>

            <IconBtn
              text="Add Review"
              onclick={() => setReviewModal(true)}
              customClasses="ml-auto"
            />
          </div>

          {/* For heading and title */}
          <div className='flex flex-col'>
            <p>{courseEntireData?.courseName}</p>
            <p className="text-sm font-semibold text-richblack-500">
              {completedLectures?.length} / {totalNoOfLectures}
            </p>
          </div>
        </div>

        {/* For sections and subsections */}
        <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
          {
            courseSectionData.map((section, index) => (
              <div
                onClick={() => setActiveStatus(section?._id)}
                key={index}
                className='mt-2 cursor-pointer text-sm text-richblack-5'
              >
                {/* Sections */}
                <div className='flex justify-between bg-richblack-600 px-5 py-4'>
                  <div className="w-[65%] font-semibold">
                    {section?.sectionName}
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className="text-[12px] font-medium">
                      {section?.subSection.length} Lesson(s)
                    </span>
                    <span
                      className={`${activeStatus === section?._id
                        ? "rotate-0"
                        : "rotate-180"} transition-all duration-500`}
                    >
                      <BsChevronDown />
                    </span>
                  </div>
                </div>

                {/* Subsections */}
                {
                  activeStatus === section?._id && (
                    <div className="transition-all duration-500 ease-in-out">
                      {
                        section.subSection.map((topic, index) => (
                          <div
                            className={`flex gap-3 px-5 py-2 ${videoBarActive === topic._id
                              ? "bg-yellow-200 text-richblack-900 font-semibold"
                              : "hover:bg-richblack-900"}`}
                            key={index}
                            onClick={() => {
                              navigate(`/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`)
                              setVideoBarActive(topic?._id);
                            }}
                          >
                            <input
                              type='checkbox'
                              checked={completedLectures.includes(topic?._id)}
                              onChange={() => { }}
                            />
                            <span>
                              {topic.title}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  )
                }
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}

export default VideoDetailsSidebar