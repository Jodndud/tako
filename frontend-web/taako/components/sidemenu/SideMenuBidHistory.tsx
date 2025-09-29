import {
    Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
  } from "@/components/ui/table"


import { MyBidAuctions } from "@/types/auth"

const formatDate = (time: string | Date) => {
  const date = new Date(time);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");   // 24시간
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
};

export default function SideMenuBidHistory({item}: {item: MyBidAuctions}){
    return(
        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="h-8">입찰시간</TableHead>
              {/* <TableHead className="h-8">닉네임</TableHead> */}
              <TableHead className="h-8 text-right">입찰액(ETH)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {item.bids.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-xs py-2">{item.time ? formatDate(item.time) : "-"}</TableCell>
                {/* <TableCell className="text-xs py-2">{invoice.nickName}</TableCell> */}
                <TableCell className="text-xs py-2 text-right max-w-[100px]">{item.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={2} className="text-right font-light">내 입찰액: <span className="text-green-400 font-medium">{item.myTopBidAmount} ETH</span></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
    )
}