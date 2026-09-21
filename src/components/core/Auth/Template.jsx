import React from 'react';
import frameImg from '../../../assets/Images/frame.png';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuthStore } from '@/store/auth.store';

const Template = ({ title, description1, description2, image, formType }) => {
  const loading = useAuthStore((s) => s.status) === 'pending';

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mx-auto flex w-11/12 max-w-(--max-content) justify-between gap-x-12 py-12 md:flex-row md:gap-x-12 md:gap-y-0">
          <div className="mx-auto w-11/12 max-w-[450px] md:mx-0">
            <h1 className="text-global-text-primary text-[1.8725rem] leading-[2.375rem] font-semibold">
              {title}
            </h1>
            <p className="mt-4 text-[1.125rem] leading-[1.625rem]">
              <span className="text-global-text-secondary">{description1}</span>
              <br />
              <span className="font-edu-sa text-status-info font-bold italic">{description2}</span>
            </p>
            {formType === 'signup' ? <SignupForm /> : <LoginForm />}
          </div>

          <div className="relative mx-auto hidden w-11/12 max-w-[450px] md:mx-0 md:block">
            <img src={frameImg} alt="Pattern" width={558} height={504} loading="lazy" />
            <img
              src={image}
              alt="Students"
              width={558}
              height={504}
              loading="lazy"
              className="absolute -top-4 right-4 z-10"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Template;
