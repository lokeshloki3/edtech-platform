import ProgressBar from '@ramonak/react-progress-bar';
import { useNavigate } from 'react-router-dom';

import { useEnrolledCourses } from '@/hooks/use-profile-query';

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const { data: enrolledCourses, isLoading } = useEnrolledCourses();

  return (
    <div>
      <div className="text-global-text-secondary text-3xl">Enrolled Courses</div>

      {isLoading ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner" />
        </div>
      ) : !enrolledCourses?.length ? (
        <p className="text-global-text-primary grid h-[10vh] w-full place-content-center">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="text-global-text-primary my-8">
          <div className="bg-global-surface-muted flex rounded-t-lg">
            <p className="w-[45%] px-5 py-3">Courses Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>

          {enrolledCourses.map((course, index, arr) => (
            <div
              key={course._id}
              className={`border-global-stroke-primary flex items-center border ${
                index === arr.length - 1 ? 'rounded-b-lg' : 'rounded-none'
              }`}
            >
              <div
                className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() =>
                  navigate(
                    `/view-course/${course._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                  )
                }
              >
                <img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-global-text-tertiary text-sm">
                    {course.courseDescription.length > 50
                      ? `${course.courseDescription.slice(0, 50)}...`
                      : course.courseDescription}
                  </p>
                </div>
              </div>

              <div className="w-1/4 px-2 py-3">{course.totalDuration}</div>

              <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                <p>Progress: {course.progressPercentage || 0}%</p>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
