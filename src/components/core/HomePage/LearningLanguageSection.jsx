import React from 'react';
import HighlightText from './HighlightText';
import know_your_progress from '../../../assets/Images/Know_your_progress.png';
import compare_with_others from '../../../assets/Images/Compare_with_others.png';
import plan_your_lessons from '../../../assets/Images/Plan_your_lessons.png';
import CTAButton from '../HomePage/Button';

const LearningLanguageSection = () => {
  return (
    <div className="mt-[130px] mb-32">
      <div className="flex flex-col items-center gap-5">
        <h2 className="text-center text-3xl font-semibold md:text-4xl">
          Your swiss knife from
          <HighlightText text={'learning any language'} />
        </h2>
        <div className="text-global-text-disabled mx-auto w-full text-center text-base font-medium md:w-[70%]">
          Using spin making learning multiple languages easy. with 20+ languages realistic
          voice-over, progress tracking, custom schedule and more.
        </div>
        <div className="mt-5 hidden items-center justify-center md:flex">
          <img
            src={know_your_progress}
            alt="know_your_progressImage"
            className="-mr-32 object-contain"
          />
          <img
            src={compare_with_others}
            alt="compare_with_othersImage"
            className="object-contain"
          />
          <img
            src={plan_your_lessons}
            alt="plan_your_lessonsImage"
            className="-ml-36 object-contain"
          />
        </div>
        <div className="w-fit">
          <CTAButton active={true} linkto={'/signup'}>
            <div>Learn more</div>
          </CTAButton>
        </div>
      </div>
    </div>
  );
};

export default LearningLanguageSection;
