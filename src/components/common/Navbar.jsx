import React, { useState } from 'react';
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo/Logo-Full-Light.png';
import { NavbarLinks } from '../../data/navbar-links';
import { BsChevronDown } from 'react-icons/bs';
import { AiOutlineMenu, AiOutlineShoppingCart } from 'react-icons/ai';
import { ACCOUNT_TYPE } from '../../utils/constants';
import ProfileDropdown from '../core/Auth/ProfileDropDown';
import { sidebarLinks } from '../../data/dashboard-links';
import { useSelector } from 'react-redux';
import { useLogout } from '@/hooks/use-auth-query';
import { useCourseCategories } from '@/hooks/use-course-query';
import { useAuthStore } from '@/store/auth.store';
import { VscSignOut } from 'react-icons/vsc';
import { RxCross2 } from 'react-icons/rx';

// const subLinks = [
// 	{
// 		title: "Python",
// 		link: "/catalog/python",
// 	},
// 	{
// 		title: "Javascript",
// 		link: "/catalog/javascript",
// 	},
// 	{
// 		title: "Web Development",
// 		link: "/catalog/web-development",
// 	},
// 	{
// 		title: "Android Development",
// 		link: "/catalog/android-development",
// 	},
// ];

const Navbar = () => {
  const isLoggedIn = useAuthStore((s) => s.status === 'authenticated');
  const user = useAuthStore((s) => s.user);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const { data: subLinks = [], isLoading: loading } = useCourseCategories();

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div className="border-b-richblack-700 bg-global-bg-surface fixed top-0 z-500 flex h-14 w-full items-center justify-center border-b-[1px] transition-all duration-200">
      <div className="flex w-11/12 max-w-(--max-content) items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} width={160} height={32} loading="lazy" />
        </Link>
        {/* Navigation Links */}
        <nav className="hidden md:block">
          <ul className="text-global-text-secondary flex gap-x-6">
            {NavbarLinks.map((link, index) => {
              return (
                <li key={index}>
                  {link.title === 'Catalog' ? (
                    <>
                      <div
                        className={`group relative flex cursor-pointer items-center gap-1 ${
                          matchRoute('/catalog/:catalogName')
                            ? 'text-global-highlight-text'
                            : 'text-global-text-secondary'
                        }`}
                      >
                        <p>{link.title}</p>
                        <BsChevronDown />
                        <div className="bg-richblack-5 text-global-text-inverse invisible absolute top-[50%] left-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg p-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[250px]">
                          <div className="bg-richblack-5 absolute top-0 left-[50%] -z-10 h-6 w-6 translate-x-[80%] translate-y-[-45%] rotate-45 rounded select-none"></div>
                          {loading ? (
                            <div className="spinner"></div>
                          ) : subLinks.length > 0 ? (
                            <>
                              {subLinks
                                ?.filter((subLink) => subLink?.courses?.length > 0)
                                ?.map((subLink, index) => (
                                  <Link
                                    to={`/catalog/${subLink.name
                                      .split(' ')
                                      .join('-')
                                      .toLowerCase()}`}
                                    className="hover:bg-richblack-50 rounded-lg bg-transparent py-2 pl-3"
                                    key={index}
                                  >
                                    <p>{subLink.name}</p>
                                  </Link>
                                ))}
                            </>
                          ) : (
                            <p className="text-center">No Courses Found</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link to={link?.path}>
                      <p
                        className={`${matchRoute(link?.path) ? 'text-global-highlight-text' : 'text-global-text-secondary'}`}
                      >
                        {link.title}
                      </p>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Login/SignUp/Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-global-text-secondary text-2xl" />
              {totalItems > 0 && (
                <span className="bg-global-surface-muted text-global-highlight-text-muted absolute -right-2 -bottom-2 grid h-5 w-5 place-content-center overflow-hidden rounded-full text-center text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {!isLoggedIn && (
            <Link to="/login">
              <button className="border-global-stroke-primary bg-global-bg-surface text-global-text-secondary cursor-pointer rounded-[8px] border px-[12px] py-[8px]">
                Log in
              </button>
            </Link>
          )}
          {!isLoggedIn && (
            <Link to="/signup">
              <button className="border-global-stroke-primary bg-global-bg-surface text-global-text-secondary cursor-pointer rounded-[8px] border px-[12px] py-[8px]">
                Sign Up
              </button>
            </Link>
          )}
          {isLoggedIn && <ProfileDropdown />}
        </div>
        <button
          className="text-icon-button-content-default mr-4 cursor-pointer md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <AiOutlineMenu fontSize={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-5000">
          {/* Overlay backdrop */}
          <div className="absolute inset-0" onClick={() => setIsMobileMenuOpen(false)}></div>

          {/* Mobile Menu Panel */}
          <div className="bg-global-bg-surface absolute top-14 left-0 z-5000 flex w-full flex-col gap-4 p-4 md:hidden">
            {/* Close button at top-right */}
            <button
              className="text-global-text-secondary -mb-5 cursor-pointer self-end text-2xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <RxCross2 />
            </button>
            <ul className="text-global-text-secondary flex flex-col gap-y-4">
              {/* Existing NavbarLinks */}
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === 'Catalog' ? (
                    <div className="flex flex-col">
                      <button
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        className="flex items-center gap-1"
                      >
                        <span>{link.title}</span>
                        <span
                          className={`cursor-pointer transition-all duration-500 ${
                            isCatalogOpen ? 'rotate-0' : 'rotate-180'
                          }`}
                        >
                          <BsChevronDown />
                        </span>
                      </button>
                      {isCatalogOpen && (
                        <div className="mt-2 ml-4 flex flex-col gap-2">
                          {loading ? (
                            <div className="spinner"></div>
                          ) : subLinks.length > 0 ? (
                            subLinks.map((subLink, idx) => (
                              <Link
                                key={idx}
                                to={`/catalog/${subLink.name.split(' ').join('-').toLowerCase()}`}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsCatalogOpen(false);
                                }}
                                className="hover:text-global-highlight-text"
                              >
                                {subLink.name}
                              </Link>
                            ))
                          ) : (
                            <p>No Courses Found</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      // className="hover:text-global-highlight-text"
                      className={`hover:text-global-highlight-text ${location.pathname === link.path ? 'text-global-highlight-text' : 'text-global-text-secondary'}`}
                    >
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}

              {/* SidebarLinks filtered by user.accountType */}
              {sidebarLinks.map((link) => {
                if (link.type && user?.accountType !== link.type) {
                  return null;
                }
                return (
                  <li key={link.id}>
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="hover:text-global-highlight-text flex items-center gap-2"
                    >
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Add login/signup/dashboard buttons */}
            <div className="mt-2 flex flex-col gap-2">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="border-global-stroke-primary bg-global-bg-surface text-global-text-secondary w-full rounded border px-4 py-2 text-left">
                      Log in
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="border-global-stroke-primary bg-global-bg-surface text-global-text-secondary w-full rounded border px-4 py-2 text-left">
                      Sign Up
                    </button>
                  </Link>
                </>
              ) : (
                <div
                  onClick={() => {
                    logout(undefined, { onSettled: () => navigate('/') });
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-global-text-secondary hover:text-global-highlight-text flex w-full cursor-pointer items-center gap-1"
                >
                  <VscSignOut className="text-lg" />
                  Logout
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
