import React from 'react';
import { useSelector } from 'react-redux';
import { FaCheck } from 'react-icons/fa';
import CourseInformationForm from './CourseInformation/CourseInformationForm';
import CourseBuilderForm from './CourseBuilder/CourseBuilderForm';
import PublishCourse from './PublishCourse';

const RenderSteps = () => {
  const { step } = useSelector((state) => state.course);

  const steps = [
    {
      id: 1,
      title: 'Course Information',
    },
    {
      id: 2,
      title: 'Course Builder',
    },
    {
      id: 3,
      title: 'Publish',
    },
  ];

  return (
    <>
      <div className="relative mb-2 flex w-full justify-center">
        {steps.map((item) => (
          <React.Fragment key={item.id}>
            <div className="flex flex-col items-center">
              <button
                className={`grid aspect-square w-[34px] cursor-default place-items-center rounded-full border-[1px] ${
                  step === item.id
                    ? 'border-global-highlight-text bg-global-highlight-surface text-global-highlight-text'
                    : 'border-global-stroke-primary bg-global-bg-surface text-global-text-tertiary'
                } ${step > item.id && 'bg-button-primary-bg-default text-global-highlight-text'}} `}
              >
                {step > item.id ? (
                  <FaCheck className="text-global-text-inverse font-bold" />
                ) : (
                  item.id
                )}
              </button>
            </div>

            {item.id !== steps.length && (
              <>
                <div
                  className={`h-[calc(34px/2)] w-[25%] border-b-2 border-dashed md:w-[33%] ${step > item.id ? 'border-global-highlight-text' : 'border-global-stroke-secondary'}`}
                ></div>
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="relative mb-16 flex w-full justify-between select-none">
        {steps.map((item) => (
          <div key={item.id}>
            <div className="flex min-w-[100px] flex-col items-center gap-y-2 md:min-w-[130px]">
              <p
                className={`text-sm ${step >= item.id ? 'text-global-text-primary' : 'text-global-text-disabled'}`}
              >
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </>
  );
};

export default RenderSteps;
