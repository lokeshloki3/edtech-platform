import { useRef, useState } from 'react';
import { AiOutlineCaretDown } from 'react-icons/ai';
import { VscDashboard, VscSignOut } from 'react-icons/vsc';
import { Link, useNavigate } from 'react-router-dom';

import useOnClickOutside from '../../../hooks/useOnClickOutside';
import { useLogout } from '@/hooks/use-auth-query';
import { useAuthStore } from '@/store/auth.store';

export default function ProfileDropdown() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setOpen(false));

  if (!user) return null;

  return (
    <button className="relative cursor-pointer" onClick={() => setOpen(true)}>
      <div className="flex items-center gap-x-1">
        <img
          src={user?.image}
          alt={`profile-${user?.firstName}`}
          className="aspect-square w-[30px] rounded-full object-cover"
        />
        <AiOutlineCaretDown className="text-global-text-secondary text-sm" />
      </div>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="divide-global-card-surface-2 border-global-stroke-primary bg-global-bg-surface absolute top-[118%] right-0 z-[1000] divide-y-[1px] overflow-hidden rounded-md border-[1px]"
          ref={ref}
        >
          <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
            <div className="text-global-text-secondary hover:bg-global-card-surface-2 hover:text-global-text-secondary flex w-full items-center gap-x-1 px-[12px] py-[10px] text-sm">
              <VscDashboard className="text-lg" />
              Dashboard
            </div>
          </Link>
          <div
            onClick={() => {
              logout(undefined, { onSettled: () => navigate('/') });
              setOpen(false);
            }}
            className="text-global-text-secondary hover:bg-global-card-surface-2 hover:text-global-text-secondary flex w-full items-center gap-x-1 px-[12px] py-[10px] text-sm"
          >
            <VscSignOut className="text-lg" />
            Logout
          </div>
        </div>
      )}
    </button>
  );
}
