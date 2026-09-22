import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineDown } from 'react-icons/ai';
import CourseSubSectionAccordion from './CourseSubSectionAccordion';

const CourseAccordionBar = ({ course, isActive, handleActive }) => {
  const contentEl = useRef(null);

  // Accordion State
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isActive?.includes(course._id));
  }, [isActive]);

  const [sectionHeight, setSectionHeight] = useState(0);

  useEffect(() => {
    setSectionHeight(active ? contentEl.current.scrollHeight : 0);
  }, [active]);

  return (
    <div className="border-global-stroke-secondary bg-global-card-surface-2 text-global-text-primary overflow-hidden border border-solid last:mb-0">
      <div>
        <div
          className="flex cursor-pointer items-start justify-between bg-white/20 px-7 py-6 transition-all duration-300"
          onClick={() => {
            handleActive(course._id);
          }}
        >
          <div className="flex items-center gap-2">
            <i className={isActive.includes(course._id) ? 'rotate-180' : 'rotate-0'}>
              <AiOutlineDown />
            </i>
            <p>{course?.sectionName}</p>
          </div>
          <div className="space-x-4">
            <span className="text-global-highlight-text">
              {`${course.subSection.length || 0} lecture(s)`}
            </span>
          </div>
        </div>
      </div>
      <div
        ref={contentEl}
        className="bg-global-bg relative h-0 overflow-hidden transition-[height] duration-[0.35s] ease-[ease]"
        style={{ height: sectionHeight }}
      >
        <div className="flex flex-col gap-2 px-7 py-6 font-semibold">
          {course?.subSection?.map((subSec, index) => {
            return <CourseSubSectionAccordion subSec={subSec} key={index} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseAccordionBar;
