import React from 'react'
import * as Icons from "react-icons/vsc"
import { useDispatch } from 'react-redux'
import { matchPath, NavLink, useLocation } from 'react-router-dom'

const SidebarLink = ({ link, iconName }) => {
    const Icon = Icons[iconName]
    const dispatch = useDispatch();
    const location = useLocation();

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname)
    }

    return (
        <NavLink
            to={link.path}
            // onClick={() => dispatch(resetCourseState())}
            className={`relative px-8 py-2 text-sm font-medium ${matchRoute(link.path)
                ? "bg-global-highlight-surface text-global-highlight-text"
                : "bg-opacity-0 text-global-text-tertiary"
                } transition-all duration-200`}
        >
            <span
                className={`absolute left-0 top-0 h-full w-[0.15rem] bg-button-primary-bg-default 
                ${matchRoute(link.path) ? "opacity-100" : "opacity-0"}`}
            ></span>
            <div className='flex items-center gap-x-2'>
                <Icon className="text-lg" />
                <span>{link.name}</span>
            </div>
        </NavLink>
    )
}

export default SidebarLink