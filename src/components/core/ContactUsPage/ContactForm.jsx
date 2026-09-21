import React from 'react';
import ContactUsForm from './ContactUsForm';

const ContactForm = () => {
  return (
    <div className="border-global-stroke-secondary text-global-text-tertiary flex flex-col gap-3 rounded-xl border p-7 lg:p-14">
      <h1 className="text-global-text-primary text-4xl leading-10 font-semibold">
        Got a Idea? We&apos;ve got the skills. Let&apos;s team up
      </h1>
      <p className="">Tell us more about yourself and what you&apos;re got in mind.</p>

      <div className="mt-7">
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactForm;
