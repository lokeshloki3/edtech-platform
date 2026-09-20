import { VscAdd } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';

import { useInstructorCourses } from '@/hooks/use-course-query';
import IconBtn from '../../common/IconBtn';
import CoursesTable from './InstructorCourses/CoursesTable';

const MyCourses = () => {
  const navigate = useNavigate();
  const { data: courses = [], isLoading } = useInstructorCourses();

  return (
    <div>
      <div className="mb-14 flex items-center justify-between">
        <h1 className="text-global-text-primary text-3xl font-medium">My Courses</h1>
        <IconBtn text="Add Course" onclick={() => navigate('/dashboard/add-course')}>
          <VscAdd />
        </IconBtn>
      </div>

      {isLoading ? (
        <div className="grid min-h-[calc(100vh-20rem)] place-items-center">
          <div className="spinner" />
        </div>
      ) : (
        <CoursesTable courses={courses} />
      )}
    </div>
  );
};

export default MyCourses;
