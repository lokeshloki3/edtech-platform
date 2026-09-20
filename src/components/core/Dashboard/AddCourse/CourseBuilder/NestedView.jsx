import React, { useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { RxDropdownMenu } from "react-icons/rx";
import { useDispatch, useSelector } from 'react-redux';
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiFillCaretDown } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import ConfirmationModal from "../../../../common/ConfirmationModal";
import { deleteSection, deleteSubSection } from '../../../../../services/operations/courseDetailsAPI';
import { setCourse } from '../../../../../slices/courseSlice';
import SubSectionModal from './SubSectionModal';

const NestedView = ({ handleChangeEditSectionName }) => {

  const { course } = useSelector((state) => state.course);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);
  const [addSubSection, setAddSubSection] = useState(null);

  const handleDeleleSection = async (sectionId) => {
    const result = await deleteSection({
      sectionId,
      courseId: course._id,
      token,
    })

    if (result) {
      dispatch(setCourse(result));
    }
    setConfirmationModal(null);
  }

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    const result = await deleteSubSection({ subSectionId, sectionId, token });

    if (result) {
      // update the structure of course as we cannot render course directly when subSection changes
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(updatedCourse));
    }
    setConfirmationModal(null);
  }

  return (
    <>
      <div className='rounded-lg bg-richblack-700 p-6 px-8'>
        {/* Section Dropdown */}
        {
          course?.courseContent?.map((section) => (
            <details key={section._id} open>
              {/* Section Dropdown Content  */}
              {/* open attribute on <details> tag makes the section expanded by default */}
              <summary className="flex items-center justify-between border-b-2 border-b-richblack-600 py-2">
                <div className='flex items-center gap-x-3'>
                  <RxDropdownMenu className="text-2xl text-richblack-50" />
                  <p className='font-semibold text-richblack-50'>
                    {section.sectionName}
                  </p>
                </div>

                <div className='flex items-center gap-x-3'>
                  <button
                    onClick={() =>
                      handleChangeEditSectionName(
                        section._id,
                        section.sectionName
                      )}
                  >
                    <MdEdit className="text-xl text-richblack-300 cursor-pointer" />
                  </button>

                  <button
                    onClick={() =>
                      setConfirmationModal({
                        text1: "Delete this Section?",
                        text2: "All the lectures in this section will be deleted",
                        btn1Text: "Delete",
                        btn2Text: "Cancel",
                        btn1Handler: () => handleDeleleSection(section._id),
                        btn2Handler: () => setConfirmationModal(null),
                      })}
                  >
                    <RiDeleteBin6Line className="text-xl text-richblack-300 cursor-pointer" />
                  </button>

                  <span className="font-medium text-richblack-300">|</span>
                  <AiFillCaretDown className="text-xl text-richblack-300 cursor-pointer" />
                </div>
              </summary>

              <div className='px-6 pb-4'>
                {/* Render All Sub Sections within a Section */}
                {
                  section.subSection.map((data) => (
                    <div
                      key={data?._id}
                      onClick={() => setViewSubSection(data)}
                      className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                    >
                      <div className='flex items-center gap-x-3 py-2'>
                        <RxDropdownMenu className="text-2xl text-richblack-50" />
                        <p className='font-semibold text-richblack-50'>
                          {data.title}
                        </p>
                      </div>

                      {/* To stop behaviour of parent div onClick */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className='flex items-center gap-x-3'
                      >
                        <button
                          onClick={() =>
                            setEditSubSection({ ...data, sectionId: section._id })
                          }
                        >
                          <MdEdit className="text-xl text-richblack-300 cursor-pointer" />
                        </button>

                        <button
                          onClick={() =>
                            setConfirmationModal({
                              text1: "Delete this Sub-Section?",
                              text2: "This lecture will be deleted",
                              btn1Text: "Delete",
                              btn2Text: "Cancel",
                              btn1Handler: () =>
                                handleDeleteSubSection(data._id, section._id),
                              btn2Handler: () => setConfirmationModal(null),
                            })
                          }
                        >
                          <RiDeleteBin6Line className="text-xl text-richblack-300 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  ))
                }

                {/* Add New Lecture to Section or Sub Section*/}
                <button
                  onClick={() => setAddSubSection(section._id)}
                  className="mt-3 flex items-center gap-x-1 text-yellow-50 cursor-pointer"
                >
                  <FaPlus className='text-lg' />
                  <p>Add Lecture</p>
                </button>
              </div>
            </details>
          ))
        }
      </div>

      {/* Modal Display */}
      {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      ) : viewSubSection ? (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : editSubSection ? (
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      ) : (
        <></>
      )}
      {/* Confirmation Modal */}
      {confirmationModal ? (
        <ConfirmationModal modalData={confirmationModal} />
      ) : (
        <></>
      )}
    </>
  )
}

export default NestedView