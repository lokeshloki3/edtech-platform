import React, { useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { RxDropdownMenu } from 'react-icons/rx';
import { useDispatch, useSelector } from 'react-redux';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { AiFillCaretDown } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';
import ConfirmationModal from '../../../../common/ConfirmationModal';
import { useDeleteSection, useDeleteSubSection } from '@/hooks/use-course-query';
import { setCourse } from '../../../../../slices/courseSlice';
import SubSectionModal from './SubSectionModal';

const NestedView = ({ handleChangeEditSectionName }) => {
  const { course } = useSelector((state) => state.course);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const { mutate: deleteSection } = useDeleteSection();
  const { mutate: deleteSubSection } = useDeleteSubSection();
  const dispatch = useDispatch();
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);
  const [addSubSection, setAddSubSection] = useState(null);

  const handleDeleleSection = (sectionId) => {
    deleteSection(
      { sectionId, courseId: course._id },
      {
        onSuccess: (result) => dispatch(setCourse(result)),
        onSettled: () => setConfirmationModal(null),
      }
    );
  };

  const handleDeleteSubSection = (subSectionId, sectionId) => {
    deleteSubSection(
      { subSectionId, sectionId },
      {
        onSuccess: (result) => {
          // deleteSubSection answers with the section, not the course, so the
          // course is rebuilt around it before it goes back into the slice.
          const updatedCourseContent = course.courseContent.map((section) =>
            section._id === sectionId ? result : section
          );
          dispatch(setCourse({ ...course, courseContent: updatedCourseContent }));
        },
        onSettled: () => setConfirmationModal(null),
      }
    );
  };

  return (
    <>
      <div className="bg-global-card-surface-2 rounded-lg p-6 px-8">
        {/* Section Dropdown */}
        {course?.courseContent?.map((section) => (
          <details key={section._id} open>
            {/* Section Dropdown Content  */}
            {/* open attribute on <details> tag makes the section expanded by default */}
            <summary className="border-b-richblack-600 flex items-center justify-between border-b-2 py-2">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-global-text-secondary text-2xl" />
                <p className="text-global-text-secondary font-semibold">{section.sectionName}</p>
              </div>

              <div className="flex items-center gap-x-3">
                <button
                  onClick={() => handleChangeEditSectionName(section._id, section.sectionName)}
                >
                  <MdEdit className="text-global-text-tertiary cursor-pointer text-xl" />
                </button>

                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: 'Delete this Section?',
                      text2: 'All the lectures in this section will be deleted',
                      btn1Text: 'Delete',
                      btn2Text: 'Cancel',
                      btn1Handler: () => handleDeleleSection(section._id),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                >
                  <RiDeleteBin6Line className="text-global-text-tertiary cursor-pointer text-xl" />
                </button>

                <span className="text-global-text-tertiary font-medium">|</span>
                <AiFillCaretDown className="text-global-text-tertiary cursor-pointer text-xl" />
              </div>
            </summary>

            <div className="px-6 pb-4">
              {/* Render All Sub Sections within a Section */}
              {section.subSection.map((data) => (
                <div
                  key={data?._id}
                  onClick={() => setViewSubSection(data)}
                  className="border-b-richblack-600 flex cursor-pointer items-center justify-between gap-x-3 border-b-2 py-2"
                >
                  <div className="flex items-center gap-x-3 py-2">
                    <RxDropdownMenu className="text-global-text-secondary text-2xl" />
                    <p className="text-global-text-secondary font-semibold">{data.title}</p>
                  </div>

                  {/* To stop behaviour of parent div onClick */}
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-x-3">
                    <button onClick={() => setEditSubSection({ ...data, sectionId: section._id })}>
                      <MdEdit className="text-global-text-tertiary cursor-pointer text-xl" />
                    </button>

                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: 'Delete this Sub-Section?',
                          text2: 'This lecture will be deleted',
                          btn1Text: 'Delete',
                          btn2Text: 'Cancel',
                          btn1Handler: () => handleDeleteSubSection(data._id, section._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                    >
                      <RiDeleteBin6Line className="text-global-text-tertiary cursor-pointer text-xl" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Lecture to Section or Sub Section*/}
              <button
                onClick={() => setAddSubSection(section._id)}
                className="text-global-highlight-text mt-3 flex cursor-pointer items-center gap-x-1"
              >
                <FaPlus className="text-lg" />
                <p>Add Lecture</p>
              </button>
            </div>
          </details>
        ))}
      </div>

      {/* Modal Display */}
      {addSubSection ? (
        <SubSectionModal modalData={addSubSection} setModalData={setAddSubSection} add={true} />
      ) : viewSubSection ? (
        <SubSectionModal modalData={viewSubSection} setModalData={setViewSubSection} view={true} />
      ) : editSubSection ? (
        <SubSectionModal modalData={editSubSection} setModalData={setEditSubSection} edit={true} />
      ) : (
        <></>
      )}
      {/* Confirmation Modal */}
      {confirmationModal ? <ConfirmationModal modalData={confirmationModal} /> : <></>}
    </>
  );
};

export default NestedView;
