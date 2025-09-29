import MypageSideMenu from "@/components/sidemenu/MypageSideMenu";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="default-container flex">
            <MypageSideMenu/>
            <div className="flex-1">
              {children}
            </div>
        </div>
    );
}