import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import { HiClock } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { Table, Tbody, Td, Th, Thead, Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useDeleteCourse } from '@/hooks/use-course-query';
import { formatDate } from '@/lib/utils';
import type { InstructorCourse } from '@/types/course.types';
import ConfirmationModal, { type ModalData } from '../../../common/ConfirmationModal';

const TRUNCATE_LENGTH = 200;

const CoursesTable = ({ courses }: { courses: InstructorCourse[] }) => {
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState<ModalData | null>(null);
  const { mutate: removeCourse, isPending } = useDeleteCourse();

  // The list refetches itself through the mutation's invalidation, so the
  // parent no longer has to pass a setter down to keep it in sync.
  const handleCourseDelete = (courseId: string) => {
    removeCourse(courseId, {
      onSettled: () => setConfirmationModal(null),
    });
  };

  return (
    <div>
      <Table className="border-global-stroke-primary rounded-xl border">
        <Thead>
          <Tr className="border-b-global-stroke-primary grid grid-cols-[1fr_120px_100px_100px] rounded-t-md border-b px-6 py-2">
            <Th className="text-global-text-secondary flex-1 text-left text-sm font-medium uppercase">
              Courses
            </Th>
            <Th className="text-global-text-secondary text-left text-sm font-medium uppercase">
              Duration
            </Th>
            <Th className="text-global-text-secondary text-left text-sm font-medium uppercase">
              Price
            </Th>
            <Th className="text-global-text-secondary text-left text-sm font-medium uppercase">
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {courses.length === 0 ? (
            <Tr>
              <Td className="text-global-text-secondary py-10 text-center text-2xl font-medium">
                No courses found
              </Td>
            </Tr>
          ) : (
            courses.map((course) => (
              <Tr
                key={course._id}
                className="border-global-stroke-primary grid grid-cols-[1fr_120px_100px_100px] border-b px-6 py-8"
              >
                <Td className="flex flex-1 gap-x-4">
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[148px] w-[220px] rounded-lg object-cover"
                  />
                  <div className="flex flex-col justify-between">
                    <p className="text-global-text-primary text-lg font-medium">
                      {course.courseName}
                    </p>
                    <p className="text-global-text-tertiary text-xs">
                      {course.courseDescription.length > TRUNCATE_LENGTH
                        ? course.courseDescription.slice(0, TRUNCATE_LENGTH) + '...'
                        : course.courseDescription}
                    </p>
                    <p className="text-[12px] text-white">
                      Created: {formatDate(course.createdAt)}
                    </p>
                    {course.status === 'Draft' ? (
                      <p className="bg-global-card-surface-2 text-status-error flex w-fit flex-row items-center gap-2 rounded-full px-2 py-[2px] text-[12px] font-medium">
                        <HiClock size={14} />
                        Drafted
                      </p>
                    ) : (
                      <div className="bg-global-card-surface-2 text-global-highlight-text-muted flex w-fit flex-row items-center gap-2 rounded-full px-2 py-[2px] text-[12px] font-medium">
                        <div className="bg-global-highlight-surface-strong text-global-text-inverse flex h-3 w-3 items-center justify-center rounded-full">
                          <FaCheck size={8} />
                        </div>
                        Published
                      </div>
                    )}
                  </div>
                </Td>

                <Td className="text-global-text-secondary text-sm font-medium">
                  {course.totalDuration}
                </Td>
                <Td className="text-global-text-secondary text-sm font-medium">
                  Rs {course.price}
                </Td>
                <Td className="text-global-text-secondary text-sm font-medium">
                  <button
                    disabled={isPending}
                    onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                    title="Edit"
                    className="hover:text-status-success cursor-pointer px-2 transition-all duration-200 hover:scale-110"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      setConfirmationModal({
                        text1: 'Do you want to delete this course?',
                        text2: 'All the data related to this course will be deleted',
                        btn1Text: isPending ? 'Loading...' : 'Delete',
                        btn2Text: 'Cancel',
                        btn1Handler: () => handleCourseDelete(course._id),
                        btn2Handler: () => setConfirmationModal(null),
                      });
                    }}
                    title="Delete"
                    className="hover:text-status-error cursor-pointer px-1 transition-all duration-200 hover:scale-110"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default CoursesTable;
