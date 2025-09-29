import AdminSideMenu
 from "@/components/sidemenu/AdminSideMenu";
export default function RootAdmin({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
    return(
        <div>
            <AdminSideMenu />
            {children}
        </div>
    )
}