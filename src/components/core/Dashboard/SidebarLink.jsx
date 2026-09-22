import React from 'react';
import * as Icons from 'react-icons/vsc';
import { matchPath, NavLink, useLocation } from 'react-router-dom';

const SidebarLink = ({ link, iconName }) => {
  const Icon = Icons[iconName];
  const location = useLocation();

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <NavLink
      to={link.path}
      // onClick={() => dispatch(resetCourseState())}
      className={`relative px-8 py-2 text-sm font-medium ${
        matchRoute(link.path)
          ? 'bg-global-highlight-surface text-global-highlight-text'
          : 'bg-opacity-0 text-global-text-tertiary'
      } transition-all duration-200`}
    >
      <span
        className={`bg-button-primary-bg-default absolute top-0 left-0 h-full w-[0.15rem] ${matchRoute(link.path) ? 'opacity-100' : 'opacity-0'}`}
      ></span>
      <div className="flex items-center gap-x-2">
        <Icon className="text-lg" />
        <span>{link.name}</span>
      </div>
    </NavLink>
  );
};

export default SidebarLink;
