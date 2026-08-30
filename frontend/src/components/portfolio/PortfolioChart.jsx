import {

LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer

} from "recharts";

export default function PortfolioChart({summary}){

const data=[

{

name:"Portfolio",

value:summary.market_value

}

];

return(

<ResponsiveContainer width="100%" height={300}>

<LineChart data={data}>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<Line

type="monotone"

dataKey="value"

/>

</LineChart>

</ResponsiveContainer>

)

}