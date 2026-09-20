import React from 'react'

const IconBtn = ({
    text,
    onclick,
    children,
    disabled,
    outline = false,
    customClasses,
    type,
}) => {
    return (
        <button
            disabled={disabled}
            onClick={onclick}
            className={`flex items-center ${outline
                ? "border border-global-highlight-text bg-transparent"
                : "bg-button-primary-bg-default"}
        cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-global-text-inverse ${customClasses}`}
            type={type}
        >
            {
                children ? (
                    <>
                        <span className={`${outline && "text-global-highlight-text"}`}>{text}</span>
                        {children}
                    </>
                ) : (
                    text
                )
            }
        </button>
    )
}

export default IconBtn