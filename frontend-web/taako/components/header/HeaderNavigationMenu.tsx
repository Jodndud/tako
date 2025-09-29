"use client";

import * as React from "react";
import Link from "next/link";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { useUnreadCount } from "@/hooks/useNotifications";
import { ChevronDown } from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore";
import UserSideMenu from "../sidemenu/UserSideMenu";
import { useMajorCategories } from "@/hooks/useMajorCategories";

export default function HeaderNavigationMenu() {
	const { majorCategories } = useMajorCategories();

	const token = useAuthStore((state) => state.token);
	const isLoggedIn = !!token;

	return (
		<NavigationMenu className="gap-7">
			<NavigationMenuItem className="list-none">
				<NavigationMenuLink asChild>
					<Link href="/notice" className="hover:text-[#f2b90c]">
						공지사항
					</Link>
				</NavigationMenuLink>
			</NavigationMenuItem>
			<NavigationMenuItem className="list-none">
				<NavigationMenuTrigger className="hover:text-[#f2b90c] cursor-pointer flex items-center">
					TCG카드
					<ChevronDown className="w-4 transition-transform duration-300 group-hover:rotate-180" />
				</NavigationMenuTrigger>
				<NavigationMenuContent>
					<ul className="grid grid-cols-1 w-[200px] p-2 gap-2">
						{majorCategories.map((component) => (
							<Link key={component.id} title={component.name} href={`/category/${component.id}`} className="flex justify-center items-center py-4 rounded-sm hover:bg-[#f2b90c]/20">
								{component.name}
							</Link>
						))}
					</ul>
				</NavigationMenuContent>
			</NavigationMenuItem>
			<NavigationMenuItem className="list-none">
				<NavigationMenuLink asChild>
					<Link href="/search" className="hover:text-[#f2b90c]">
						전체경매
					</Link>
				</NavigationMenuLink>
			</NavigationMenuItem>
			{/* <NavigationMenuItem className="list-none">
				<NavigationMenuLink asChild>
					<Link href="#" className="hover:text-[#f2b90c]">
						미니게임
					</Link>
				</NavigationMenuLink>
			</NavigationMenuItem> */}
			{!isLoggedIn ? (
				<NavigationMenuItem className="list-none">
					<NavigationMenuLink asChild>
						<Link href="/login" className="hover:text-[#f2b90c]">
							로그인
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
			) : (
				<>
					<NavigationMenuItem className="list-none">
						<NavigationMenuLink asChild>
							<Link href="/notification" className="flex items-center gap-1 hover:text-[#f2b90c]">
								알림
								<UnreadBadge />
							</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem className="list-none">
						{/* 회원 sheet */}
						<UserSideMenu />
					</NavigationMenuItem>
				</>
			)}
		</NavigationMenu>
	);
}

function UnreadBadge() {
	const { data, isLoading, isError } = useUnreadCount(20000);

	if (isLoading) return <Badge className="h-4 min-w-4 rounded-full px-1 bg-gray-300 text-[10px]">...</Badge>;
	if (isError) return <Badge className="h-4 min-w-4 rounded-full px-1 bg-red-500">!</Badge>;
	if (!data || data === 0) return null;
	const display = data > 99 ? "99+" : data;
	return <Badge className="h-4 min-w-4 rounded-full px-1 bg-[#f2b90c] text-[10px]">{display}</Badge>;
}
