import React from 'react';

const HighlightText = ({ text }) => {
  return (
    <span className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] bg-clip-text font-bold text-transparent">
      {/* gradient to from as well in tailwind css */} {text}
    </span>
  );
};

export default HighlightText;
