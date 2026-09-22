import React from 'react';
import HighlightText from '../components/core/HomePage/HighlightText';
import BannerImage1 from '../assets/Images/aboutus1.webp';
import BannerImage2 from '../assets/Images/aboutus2.webp';
import BannerImage3 from '../assets/Images/aboutus3.webp';
import Quote from '../components/core/AboutPage/Quote';
import FoundingStory from '../assets/Images/FoundingStory.png';
import StatsComponent from '../components/core/AboutPage/StatsComponent';
import LearningGrid from '../components/core/AboutPage/LearningGrid';
import ContactFormSection from '../components/core/AboutPage/ContactFormSection';
import Footer from '../components/common/Footer';
import ReviewSliderHome from '../components/common/ReviewSliderHome';

const About = () => {
  return (
    <div>
      <section className="bg-global-card-surface-2">
        <div className="relative mx-auto flex w-11/12 max-w-(--max-content) flex-col justify-between gap-10 text-center text-white">
          <header className="mx-auto py-20 lg:w-[70%]">
            <h1 className="text-3xl font-semibold md:text-4xl">
              Driving Innovation in Online Education for a
              <HighlightText text={'Brighter Future'} />
            </h1>
            <p className="text-global-text-tertiary mx-auto mt-3 text-center text-base font-medium lg:w-[95%]">
              Studysphere is at the forefront of driving innovation in online education. We're
              passionate about creating a brighter future by offering cutting-edge courses,
              leveraging emerging technologies, and nurturing a vibrant learning community.
            </p>
          </header>
          <div className="sm:h-[70px] lg:h-[150px]"></div>
          <div className="absolute bottom-0 left-[50%] grid w-[100%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-3 lg:gap-5">
            <img src={BannerImage1} alt="" />
            <img src={BannerImage2} alt="" />
            <img src={BannerImage3} alt="" />
          </div>
        </div>
      </section>

      <section className="border-global-stroke-primary border-b">
        <div className="text-global-text-disabled mx-auto flex w-11/12 max-w-(--max-content) flex-col justify-between gap-10">
          <div className="h-[100px]"></div>
          <Quote />
        </div>
      </section>

      <section>
        <div className="text-global-text-disabled mx-auto flex w-11/12 max-w-(--max-content) flex-col justify-between gap-10">
          <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
            <div className="my-24 flex flex-col gap-10 lg:w-[50%]">
              <h2 className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-3xl leading-[1.3] font-semibold text-transparent md:text-4xl lg:w-[70%]">
                Our Founding Story
              </h2>
              <p className="text-global-text-tertiary text-base font-medium lg:w-[95%]">
                Our e-learning platform was born out of a shared vision and passion for transforming
                education. It all began with a group of educators, technologists, and lifelong
                learners who recognized the need for accessible, flexible, and high-quality learning
                opportunities in a rapidly evolving digital world.
              </p>
              <p className="text-global-text-tertiary text-base font-medium lg:w-[95%]">
                As experienced educators ourselves, we witnessed firsthand the limitations and
                challenges of traditional education systems. We believed that education should not
                be confined to the walls of a classroom or restricted by geographical boundaries. We
                envisioned a platform that could bridge these gaps and empower individuals from all
                walks of life to unlock their full potential.
              </p>
            </div>
            <div>
              <img src={FoundingStory} alt="" className="shadow-[0_0_20px_0] shadow-[#FC6767]" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-between lg:flex-row lg:gap-10">
            <div className="my-24 flex flex-col gap-10 lg:w-[40%]">
              <h2 className="bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]">
                Our Vision
              </h2>
              <p className="text-global-text-tertiary text-base font-medium lg:w-[95%]">
                With this vision in mind, we set out on a journey to create an e-learning platform
                that would revolutionize the way people learn. Our team of dedicated experts worked
                tirelessly to develop a robust and intuitive platform that combines cutting-edge
                technology with engaging content, fostering a dynamic and interactive learning
                experience.
              </p>
            </div>
            <div className="my-24 flex flex-col gap-10 lg:w-[40%]">
              <h2 className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]">
                Our Mission
              </h2>
              <p className="text-global-text-tertiary text-base font-medium lg:w-[95%]">
                Our mission goes beyond just delivering courses online. We wanted to create a
                vibrant community of learners, where individuals can connect, collaborate, and learn
                from one another. We believe that knowledge thrives in an environment of sharing and
                dialogue, and we foster this spirit of collaboration through forums, live sessions,
                and networking opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <StatsComponent />

      <section className="mx-auto mt-20 flex w-11/12 max-w-(--max-content) flex-col justify-between gap-10 text-white">
        <LearningGrid />
        <ContactFormSection />
      </section>

      <div className="bg-global-bg relative mx-auto my-20 flex w-11/12 max-w-(--max-content) flex-col items-center justify-between gap-8 text-white">
        <h2 className="mt-8 text-center text-4xl font-semibold">Reviews from other learners</h2>
        <ReviewSliderHome />
      </div>
      <Footer />
    </div>
  );
};

export default About;
