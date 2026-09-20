import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AiFillPlayCircle } from "react-icons/ai";
import IconBtn from "../../common/IconBtn";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';

const VideoDetails = () => {

  const { courseId, sectionId, subSectionId } = useParams();
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse);
  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const location = useLocation();
  const playerRef = useRef(null); // to change DOM in real time
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [previewSource, setPreviewSource] = useState("");
  const currentSection = courseSectionData.find(section => section._id === sectionId); // For Video description

  useEffect(() => {
    const setVideoSpecificDetails = async () => {
      if (!courseSectionData.length) {
        return;
      }
      if (!courseId && !sectionId && !subSectionId) {
        navigate("/dashboard/enrolled-courses");
      }

      else {
        // assume all 3 fields present
        const filteredData = courseSectionData.filter(
          (section) => section._id === sectionId
        )

        const filteredVideoData = filteredData?.[0].subSection.filter(
          (data) => data._id === subSectionId
        )

        setVideoData(filteredVideoData[0]);
        setPreviewSource(courseEntireData.thumbnail);
        setVideoEnded(false);
      }
    }
    setVideoSpecificDetails();
  }, [courseSectionData, courseEntireData, location.pathname])

  const isFirstVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )

    if (currentSectionIndex === 0 && currentSubSectionIndex === 0) {
      return true;
    }
    else {
      return false;
    }
  }

  const isLastVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )

    if (currentSectionIndex === courseSectionData.length - 1 &&
      currentSubSectionIndex === noOfSubSections - 1) {
      return true;
    }
    else {
      return false;
    }
  }

  const goToPrevVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )

    if (currentSubSectionIndex !== 0) {
      // same section, prev video
      const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex - 1]._id;
      // navigate to this video
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
    }
    else {
      // prev(different) section, last video
      const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
      const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
      const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id;
      // navigate to this video
      navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)
    }
  }

  const goToNextVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    const noOfSubSection = courseSectionData[currentSectionIndex].subSection.length;

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )

    if (currentSubSectionIndex !== noOfSubSection - 1) {
      // same section, next video
      const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex + 1]._id;
      // navigate to this video
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    }
    else {
      // (next)different section, first video
      const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
      const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }

  const handleLectureCompletion = async () => {
    setLoading(true);
    // Course Progress
    const response = await markLectureAsComplete({ courseId: courseId, subSectionId: subSectionId }, token);
    // state update
    if (response) {
      dispatch(updateCompletedLectures(subSectionId));
    }
    setLoading(false);
  }

  // console.log('Video Ended State:', videoEnded);
  console.log('Video Data:', videoData);

  return (
    <div className='flex flex-col gap-5 text-white'>
      {
        !videoData ? (
          < img
            src={previewSource}
            alt="Preview"
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <div className='relative w-full mt-4 md:mt-0'>
            <ReactPlayer
              ref={playerRef}
              url={videoData?.videoUrl}
              playsinline
              controls
              playing={playing}
              onEnded={() => {
                setVideoEnded(true);
                setPlaying(false);
              }}
              width="100%"
              height="100%"
            />

            {videoEnded && (
              <div className="absolute inset-0 z-[100] grid place-content-center bg-black/70">
                {!completedLectures.includes(subSectionId) && (
                  <IconBtn
                    disabled={loading}
                    onclick={() => handleLectureCompletion()}
                    text={!loading ? 'Mark As Completed' : 'Loading...'}
                    customClasses="text-xl max-w-max px-4 mx-auto"
                  />
                )}

                <IconBtn
                  disabled={loading}
                  onclick={() => {
                    if (playerRef?.current) {
                      playerRef.current?.seekTo(0);
                      setPlaying(true);
                      setVideoEnded(false); // Reset videoEnded for rewatch
                    }
                  }}
                  text="Rewatch"
                  customClasses="text-xl max-w-max px-4 mx-auto mt-4"
                />

                <div className='mt-5 flex min-w-[250px] justify-center gap-x-4 text-xl'>
                  {!isFirstVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToPrevVideo}
                      className="blackButton"
                    >
                      Prev
                    </button>
                  )}

                  {!isLastVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToNextVideo}
                      className="blackButton"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      }
      <div className='flex items-center gap-x-4'>
        <AiFillPlayCircle size={30} className='mt-1' />
        <div className='flex flex-col md:flex-row'>
          <p className='text-base md:text-3xl font-semibold'>{currentSection?.sectionName} -</p>
          <p className='text-base md:text-3xl font-semibold'>{videoData?.title}</p>
        </div>
      </div>
      <p className='pt-2 pb-6'>{videoData?.description}</p>
    </div>
  )
}

export default VideoDetails