import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactPlayer from 'react-player';
import { FiUploadCloud } from "react-icons/fi"

const Upload = ({ name, label, register, setValue, errors, video = false, viewData = null, editData = null, }) => {

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  );

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      previewFile(file);
      setSelectedFile(file);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: !video
      ? { "image/*": [".jpeg", ".jpg", ".png"] }
      : { "video/*": [".mp4"] },
    onDrop,
  });

  const previewFile = (file) => {
    // console.log(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    }
  }

  useEffect(() => {
    register(name, { required: true })
  }, [register, name]);

  useEffect(() => {
    setValue(name, selectedFile)
  }, [selectedFile, setValue, name]);

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={name} className="text-sm text-global-text-primary">
        {label} {!viewData && <sup className="text-status-error">*</sup>}
      </label>

      <div
        {...getRootProps()}
        className={`${isDragActive ? "bg-global-surface-muted" : "bg-global-card-surface-2"}
          flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-global-stroke-secondary`}
      >
        <input {...getInputProps()} />

        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              <img
                src={previewSource}
                alt='Preview'
                className="h-full w-full rounded-md object-cover"
              />
            ) : (

              <div className="aspect-w-16 aspect-h-9 w-full">
                <ReactPlayer url={previewSource} playsinline controls width="100%" height="100%" />
              </div>)}

            {!viewData && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering dropzone
                  setPreviewSource("");
                  setSelectedFile(null);
                  setValue(name, null);
                }}
                className="mt-3 text-global-text-tertiary underline"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6">
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-global-highlight-text" />
            </div>
            <p className="mt-2 max-w-[200px] text-center text-sm text-global-text-tertiary">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span className="font-semibold text-global-highlight-text">Browse</span> a
              file
            </p>
            <ul className="mt-10 flex list-disc justify-between space-x-12 text-center  text-xs text-global-text-tertiary">
              <li>Aspect ratio 16:9</li>
              <li>Recommended size 1024x576</li>
            </ul>
          </div>
        )}
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-status-error">
          {label} is required
        </span>
      )}
    </div>
  )
}

export default Upload