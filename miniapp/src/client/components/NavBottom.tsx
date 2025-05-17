import Link from "next/link";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { usePathname } from "next/navigation";

import { Icon, IconEnum } from "~/client/components/Icons";

const NavBottom = ({
  disableNavigation = false,
}: {
  disableNavigation?: boolean;
}) => {
  const pathname = usePathname();
  const { context } = useMiniKit();

  const navItems = [
    { href: "/", label: "Home", icon: IconEnum.Home },
    { href: "/collection", label: "Collection", icon: IconEnum.Collection },
    { href: "/profile", label: "Profile", icon: IconEnum.Profile },
  ];

  return (
    <nav
      className="pt-1 pb-1 border-t border-slate-500/50"
      style={{
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
      }}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
          zIndex: -1, // Behind content but still visible
        }}
      />

      <ul className="flex justify-around p-2">
        {navItems.map((item) => (
          <li
            key={item.href}
            className={`flex flex-col items-center ${
              pathname === item.href ? "" : "opacity-70"
            }`}
          >
            {disableNavigation ? (
              <div className={`p-2 flex flex-col items-center`}>
                <Icon
                  icon={item.icon}
                  isOutline={pathname !== item.href}
                  color={
                    pathname === item.href
                      ? "text-amber-400/50"
                      : "text-white/50"
                  }
                />
              </div>
            ) : (
              <Link
                href={item.href}
                prefetch={true}
                className={`p-2 flex flex-col items-center`}
              >
                <Icon
                  icon={item.icon}
                  isOutline={pathname !== item.href}
                  color={
                    pathname === item.href ? "text-amber-400" : "text-white"
                  }
                />
                {/* <span className="text-xs pt-1 text-white">{item.label}</span> */}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBottom;
