import React from 'react';
import ContactUsForm from '../ContactUsPage/ContactUsForm';

const ContactFormSection = () => {
  return (
    <div className="mx-auto">
      <h2 className="text-center text-4xl font-semibold">Get in Touch</h2>
      <p className="text-global-text-tertiary mt-3 text-center">
        We&apos;d love to here for you, Please fill out this form.
      </p>
      <div className="mx-auto mt-12">
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactFormSection;
