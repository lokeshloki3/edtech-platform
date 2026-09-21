import React from 'react';
import RenderSteps from './RenderSteps';

const AddCourse = () => {
  return (
    <>
      <div className="flex w-full items-start gap-x-6 overflow-x-hidden md:overflow-x-visible">
        <div className="flex flex-1 flex-col">
          <h1 className="text-global-text-primary mb-14 text-3xl font-medium">Add Course</h1>
          <div className="flex-1">
            <RenderSteps />
          </div>
        </div>

        {/* Course Upload Tips */}
        <div className="border-global-stroke-primary bg-global-bg-surface sticky top-10 hidden max-w-[400px] flex-1 rounded-md border-[1px] p-6 lg:block">
          <p className="text-global-text-primary mb-8 text-lg">⚡ Course Upload Tips</p>
          <ul className="text-global-text-primary ml-5 list-item list-disc space-y-4 text-xs">
            <li>Set the Course Price option or make it free.</li>
            <li>Standard size for the course thumbnail is 1024x576.</li>
            <li>Video section controls the course overview video.</li>
            <li>Course Builder is where you create & organize a course.</li>
            <li>
              Add Topics in the Course Builder section to create lessons, quizzes, and assignments.
            </li>
            <li>
              Information from the Additional Data section shows up on the course single page.
            </li>
            <li>Make Announcements to notify any important</li>
            <li>Notes to all enrolled students at once.</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AddCourse;
