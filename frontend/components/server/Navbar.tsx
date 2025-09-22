"use server";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LogoutNavbarButton from "../client/LogoutNavbarButton";
import { logoutAction } from "@/app/actions/auth";

export async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex items-start justify-center border-b mb-4 py-2 md:p-3 lg:p-4">
      <div>
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-2 md:gap-6 lg:gap-8 text-lg">
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={`${navigationMenuTriggerStyle()} p-4 text-lg font-medium`}
              >
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {session ? (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <form action={logoutAction}>
                      <LogoutNavbarButton />
                    </form>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <div className={`p-4 text-lg font-medium`}>
                    User: {session.user?.email}
                  </div>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuLink
                asChild
                className={`${navigationMenuTriggerStyle()} p-4 text-lg`}
              >
                <Link href="/">Login</Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
