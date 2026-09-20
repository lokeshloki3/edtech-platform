import { MdWavingHand } from 'react-icons/md';
import { Link } from 'react-router-dom';

import { useInstructorCourses } from '@/hooks/use-course-query';
import { useInstructorData } from '@/hooks/use-profile-query';
import { useAuthStore } from '@/store/auth.store';
import InstructorChart from './InstructorDashboard/InstructorChart';

const Instructor = () => {
  const user = useAuthStore((s) => s.user);

  const { data: instructorData = [], isLoading: isLoadingStats } = useInstructorData();
  const { data: courses = [], isLoading: isLoadingCourses } = useInstructorCourses();

  const isLoading = isLoadingStats || isLoadingCourses;

  const totalAmount = instructorData.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0);
  const totalStudents = instructorData.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0);

  return (
    <div>
      <div className="space-y-2">
        <h1 className="text-global-text-primary flex items-center gap-2 text-2xl font-bold">
          Hi {user?.firstName} <MdWavingHand className="text-global-highlight-text-muted" />
        </h1>
        <p className="text-global-text-tertiary font-medium">Let&apos;s start something new</p>
      </div>

      {isLoading ? (
        <div className="spinner" />
      ) : courses.length > 0 ? (
        <div>
          <div className="my-4 flex h-full flex-col gap-2 space-x-4 md:h-[450px] md:flex-row md:gap-0">
            {totalAmount > 0 || totalStudents > 0 ? (
              <InstructorChart courses={instructorData} />
            ) : (
              <div className="bg-global-bg-surface flex-1 rounded-md p-6">
                <p className="text-global-text-primary text-lg font-bold">Visualize</p>
                <p className="text-global-text-secondary mt-4 text-xl font-medium">
                  Not Enough Data To Visualize
                </p>
              </div>
            )}

            <div className="bg-global-bg-surface flex min-w-[250px] flex-col rounded-md p-6">
              <p className="text-global-text-primary text-lg font-bold">Statistics</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-global-text-tertiary text-lg">Total Courses</p>
                  <p className="text-global-text-secondary text-3xl font-semibold">
                    {courses.length}
                  </p>
                </div>
                <div>
                  <p className="text-global-text-tertiary text-lg">Total Students</p>
                  <p className="text-global-text-secondary text-3xl font-semibold">
                    {totalStudents}
                  </p>
                </div>
                <div>
                  <p className="text-global-text-tertiary text-lg">Total Income</p>
                  <p className="text-global-text-secondary text-3xl font-semibold">
                    Rs {totalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-global-bg-surface rounded-md p-6">
            <div className="flex items-center justify-between">
              <p className="text-global-text-primary text-lg font-bold">Your Courses</p>
              <Link to="/dashboard/my-courses">
                <p className="text-global-highlight-text text-xs font-semibold">View All</p>
              </Link>
            </div>

            <div className="my-4 flex flex-col items-start gap-4 space-x-6 md:flex-row md:gap-0">
              {courses.slice(0, 3).map((course) => (
                <div className="w-full md:w-1/3" key={course._id}>
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[201px] w-full rounded-md object-cover"
                  />
                  <div className="mt-3 w-full">
                    <p className="text-global-text-secondary text-sm font-medium">
                      {course.courseName}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-global-text-tertiary text-xs font-medium">
                        {course.studentsEnrolled.length} students
                      </p>
                      <p className="text-global-text-tertiary text-xs font-medium">|</p>
                      <p className="text-global-text-tertiary text-xs font-medium">
                        Rs. {course.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-global-bg-surface mt-20 rounded-md p-6 py-20">
          <p className="text-global-text-primary text-center text-2xl font-bold">
            You have not created any courses yet
          </p>
          <Link to="/dashboard/add-course">
            <p className="text-global-highlight-text mt-1 text-center text-lg font-semibold">
              Create a course
            </p>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Instructor;
