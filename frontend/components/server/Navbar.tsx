"use server";
import logoutAction from "@/app/actions/logout";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { getJwtTokenWithClaims } from "@/util/session";
import Link from "next/link";
import LogoutSubmitButton from "../client/LogoutSubmitButton";

export async function Navbar() {
  const { token, claims } = await getJwtTokenWithClaims();
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
            {token ? (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <form action={logoutAction}>
                      <LogoutSubmitButton />
                    </form>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <div className={`p-4 text-lg font-medium`}>
                    User: {claims?.email}
                  </div>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuLink
                asChild
                className={`${navigationMenuTriggerStyle()} p-4 text-lg`}
              >
                <Link href="/auth">Login</Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
